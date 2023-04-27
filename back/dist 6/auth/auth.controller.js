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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt = require("jsonwebtoken");
const decorator_1 = require("./decorator");
const cookie_dto_1 = require("./decorator/cookie.dto");
const config_1 = require("@nestjs/config");
const platform_express_1 = require("@nestjs/platform-express");
let AuthController = class AuthController {
    constructor(authService, config) {
        this.authService = authService;
        this.config = config;
    }
    async auth42Callback(res, code) {
        await this.authService.Auth42Callback(res, code);
        return;
    }
    async verify(req, res) {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).send("Unauthorized: No token provided");
            return { valid: false };
        }
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            res.status(200).send("OK");
            return { valid: true };
        }
        catch (err) {
            res.status(401).send("Unauthorized: Invalid token");
            return { valid: false };
        }
    }
    async setup2fa(res, user) {
        return await this.authService.setup2fa(res, user);
    }
    async verify2fa(user, res, key) {
        return await this.authService.verify2fa(user, res, key);
    }
    async verify2falogin(res, login, key) {
        return await this.authService.verify2falogin(res, login, key);
    }
    async remove2fa(res, cookie) {
        return await this.authService.remove2fa(res, cookie);
    }
    async getUserCheat(req, res, username) {
        console.log("username: " + username);
        return await this.authService.getUserCheat(res, username);
    }
    async createUser(res, username, file) {
        return await this.authService.adminCreateUser(res, username, file);
    }
};
__decorate([
    (0, common_1.Get)("callback"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "auth42Callback", null);
__decorate([
    (0, common_1.Get)("verify"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)("2fa/setup"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, decorator_1.GetUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setup2fa", null);
__decorate([
    (0, common_1.Post)("2fa/verify"),
    __param(0, (0, decorator_1.GetUser)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Body)("inputKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2fa", null);
__decorate([
    (0, common_1.Post)("2fa/verifylogin"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)("login")),
    __param(2, (0, common_1.Body)("inputKey")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2falogin", null);
__decorate([
    (0, common_1.Delete)("2fa/disable"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, decorator_1.GetCookie)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, cookie_dto_1.CookieDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "remove2fa", null);
__decorate([
    (0, common_1.Get)(":username"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)("username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserCheat", null);
__decorate([
    (0, common_1.Post)("admin/create"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file")),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)("username")),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "createUser", null);
AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map