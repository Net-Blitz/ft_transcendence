"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("axios");
const dto_1 = require("./dto");
const otplib_1 = require("otplib");
const QRCode = require("qrcode");
const decorator_1 = require("./decorator");
const cookie_dto_1 = require("./decorator/cookie.dto");
const uuid_1 = require("uuid");
const fs = require("fs");
const path = require("path");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async Auth42Callback(res, code) {
        const payload = {
            grant_type: "authorization_code",
            client_id: this.config.get("CLIENT_ID"),
            client_secret: this.config.get("CLIENT_SECRET"),
            redirect_uri: this.config.get("REDIRECT_URI"),
            code,
        };
        try {
            await (0, axios_1.default)({
                method: "post",
                url: "https://api.intra.42.fr/oauth/token",
                data: JSON.stringify(payload),
                headers: { "Content-Type": "application/json" },
            }).then((response) => {
                return this.getUserInfo(res, response.data.access_token);
            });
        }
        catch (error) {
            throw new common_1.ForbiddenException("callback error");
        }
    }
    async getUserInfo(res, token) {
        try {
            await (0, axios_1.default)({
                method: "get",
                url: "https://api.intra.42.fr/v2/me",
                headers: {
                    Authorization: "Bearer " + token,
                },
            }).then((response) => {
                const user = new dto_1.UserDto();
                user.login = response.data.login;
                user.avatar = response.data.image.link;
                return this.createUser(res, user);
            });
        }
        catch (error) {
            throw new common_1.ForbiddenException("callback error");
        }
    }
    async createUser(res, user) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    login: user.login,
                },
            });
            if (existingUser && existingUser.twoFactor === true) {
                return res.redirect("http://" +
                    this.config.get("HOST_T") +
                    ":" +
                    this.config.get("PORT_GLOBAL") +
                    "/login/2fa?login=" +
                    user.login);
            }
            if (existingUser) {
                this.signToken(res, existingUser);
                if (existingUser.config)
                    return res.redirect("http://" +
                        this.config.get("HOST_T") +
                        ":" +
                        this.config.get("PORT_GLOBAL"));
                return res.redirect("http://" +
                    this.config.get("HOST_T") +
                    ":" +
                    this.config.get("PORT_GLOBAL") +
                    "/login/config");
            }
            const createdUser = await this.prisma.user.create({
                data: {
                    login: user.login,
                    username: user.login,
                },
            });
            this.signToken(res, createdUser);
            return res.redirect("http://" +
                this.config.get("HOST_T") +
                ":" +
                this.config.get("PORT_GLOBAL") +
                "/login/config");
        }
        catch (error) {
            throw new common_1.ForbiddenException("prisma error");
        }
    }
    async signToken(res, user) {
        const payload = { sub: user.id, login: user.login };
        const secret = this.config.get("JWT_SECRET");
        const token = this.jwt.sign(payload, { secret });
        console.log(user.login + ": " + token);
        try {
            res.cookie("jwt", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
            });
        }
        catch (error) {
            throw new common_1.ForbiddenException("Sign token error");
        }
        return { access_token: token };
    }
    async setup2fa(res, user) {
        if (!user || user.twoFactor) {
            return res.status(400).json({
                message: "2FA already setup",
            });
        }
        try {
            const secret = otplib_1.authenticator.generateSecret();
            const otpAuthUrl = otplib_1.authenticator.keyuri(user.login, "NetBlitz", secret);
            const qrCode = await QRCode.toDataURL(otpAuthUrl);
            await this.prisma.user.update({
                where: {
                    login: user.login,
                },
                data: {
                    secret: secret,
                },
            });
            return res.status(200).json({ otpAuthUrl, qrCode, secret });
        }
        catch (error) {
            throw new common_1.ForbiddenException("2FA setup error");
        }
    }
    async verify2fa(res, user, code) {
        const verified = otplib_1.authenticator.verify({
            secret: user.secret,
            token: code,
        });
        if (verified) {
            const token = await this.signToken(res, user);
            if (user.twoFactor === false) {
                await this.prisma.user.update({
                    where: {
                        login: user.login,
                    },
                    data: {
                        twoFactor: true,
                    },
                });
            }
            return res.status(200).json(token);
        }
        else {
            return res.status(400).json({ message: "UNVALID" });
        }
    }
    async verify2falogin(res, login, key) {
        const user = await this.prisma.user.findUnique({
            where: {
                login: login,
            },
        });
        if (!user) {
            return res.status(400).json({ message: "UNVALID" });
        }
        const verified = otplib_1.authenticator.verify({
            secret: user.secret,
            token: key,
        });
        if (verified) {
            const token = await this.signToken(res, user);
            return res.status(200).json(token);
        }
        else {
            return res.status(400).json({ message: "UNVALID" });
        }
    }
    async remove2fa(res, cookie) {
        await this.prisma.user.update({
            where: {
                login: cookie.login,
            },
            data: {
                twoFactor: false,
                secret: null,
            },
        });
        return res.status(200).json({ message: "OK" });
    }
    async getUserCheat(res, username) {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });
        if (user) {
            return await this.signToken(res, user);
        }
        return user;
    }
    async adminCreateUser(res, username, file) {
        try {
            const createdUser = await this.prisma.user.create({
                data: {
                    login: username,
                    username: username,
                },
            });
            const extension = path.extname(file.originalname);
            const filepath = path.join("public", "uploads", createdUser.id + "-" + (0, uuid_1.v4)() + extension);
            console.log(filepath);
            try {
                await fs.promises.writeFile(filepath, file.buffer);
            }
            catch (error) {
                console.log(error);
                return res.status(400).json({ message: "Write File error" });
            }
            await this.prisma.user.update({
                where: {
                    login: username,
                },
                data: {
                    avatar: filepath,
                },
            });
            this.signToken(res, createdUser);
            return res.status(200).json({ message: "OK" });
        }
        catch (error) {
            console.log(error);
        }
    }
};
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "Auth42Callback", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "getUserInfo", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UserDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "createUser", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UserDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "signToken", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __param(1, (0, decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "setup2fa", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __param(1, (0, decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "verify2fa", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "verify2falogin", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __param(1, (0, decorator_1.GetCookie)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cookie_dto_1.CookieDto]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "remove2fa", null);
__decorate([
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AuthService.prototype, "adminCreateUser", null);
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map