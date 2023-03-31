import { ForbiddenException, Injectable, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { PrismaService } from "src/prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import axios from "axios";
import { UserDto } from "./dto";
import { authenticator } from "otplib";
import * as QRCode from "qrcode";
import { GetCookie, GetUser } from "./decorator";
import { CookieDto } from "./decorator/cookie.dto";

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService
	) {}

	async getUserCheat(req: Request, res: Response, username: string) {
		const user = await this.prisma.user.findUnique({
			where: { username },
		});
		if (user) {
			return await this.signToken(req, res, user);
		}
		return user;
	}

	async Auth42Callback(
		@Req() req: Request,
		@Res() res: Response,
		code: string
	) {
		const payload = {
			grant_type: "authorization_code",
			client_id: this.config.get("CLIENT_ID"),
			client_secret: this.config.get("CLIENT_SECRET"),
			redirect_uri: this.config.get("REDIRECT_URI"),
			code,
		};
		try {
			await axios({
				method: "post",
				url: "https://api.intra.42.fr/oauth/token",
				data: JSON.stringify(payload),
				headers: { "Content-Type": "application/json" },
			}).then((response) => {
				return this.getUserInfo(req, res, response.data.access_token);
			});
		} catch (error) {
			console.log(error);
			throw new ForbiddenException("callback error");
		}
	}

	async getUserInfo(
		@Req() req: Request,
		@Res() res: Response,
		token: string
	) {
		//console.log("token: " + token);
		try {
			await axios({
				method: "get",
				url: "https://api.intra.42.fr/v2/me",
				headers: {
					Authorization: "Bearer " + token,
				},
			}).then((response) => {
				const user = new UserDto();
				user.login = response.data.login;
				user.avatar = response.data.image.link;
				return this.createUser(req, res, user);
			});
		} catch (error) {
			throw new ForbiddenException("callback error");
		}
	}

	async createUser(@Req() req: Request, @Res() res: Response, user: UserDto) {
		//console.log("User: " + user.login);
		try {
			const existingUser = await this.prisma.user.findUnique({
				where: {
					login: user.login,
				},
			});
			if (existingUser && existingUser.twoFactor === true) {
				return res.redirect(
					"http://" +
						this.config.get("HOST_T") +
						":" +
						this.config.get("PORT_GLOBAL") +
						"/login/2fa?login=" +
						user.login
				);
				// return res.redirect("http://localhost:8080/login/2fa?login=" + user.login)
			}
			if (existingUser) {
				return this.signToken(req, res, existingUser);
			}
			const createdUser = await this.prisma.user.create({
				data: {
					login: user.login,
					avatar: user.avatar,
					username: user.login,
				},
			});
			return this.signToken(req, res, createdUser);
		} catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === "P2002") {
					const existingUser = await this.prisma.user.findUnique({
						where: {
							login: user.login,
						},
					});
					return this.signToken(req, res, existingUser);
				}
			}
			//console.log(error);
			throw new ForbiddenException("prisma error");
		}
	}

	async signToken(@Req() req: Request, @Res() res: Response, user: UserDto) {
		const payload = { sub: user.id, login: user.login };
		const secret = this.config.get("JWT_SECRET");
		const token = this.jwt.sign(payload, { expiresIn: "120min", secret });
		console.log("jwt: " + token);
		try {
			res.cookie("jwt", token, {
				httpOnly: true,
				secure: false,
				sameSite: "lax",
			});
		} catch (error) {
			throw new ForbiddenException("Sign token error");
		}
		//return res.redirect("http://localhost:8080");

		// temporary token generator for testing
		const payload2 = { sub: 2, login: "Ubuntu" };
		const token2 = this.jwt.sign(payload2, { expiresIn: "480min", secret });
		console.log("Ubuntu token: " + token2);

		const payload3 = { sub: 3, login: "Fedora" };
		const token3 = this.jwt.sign(payload3, { expiresIn: "120min", secret });
		console.log("Fedora token: " + token3);

		return { access_token: token };
	}

	async setup2fa(
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		if (!user || user.twoFactor) {
			return res.status(400).json({
				message: "2FA already setup",
			});
		}
		try {
			const secret = authenticator.generateSecret();
			//console.log("🚀 ~ secret:", secret);

			const otpAuthUrl = authenticator.keyuri(
				user.login,
				"NetBlitz",
				secret
			);
			const qrCode = await QRCode.toDataURL(otpAuthUrl);

			await this.prisma.user.update({
				where: {
					login: user.login,
				},
				data: {
					twoFactor: true,
					secret: secret,
				},
			});
			return res.status(200).json({ otpAuthUrl, qrCode });
		} catch (error) {
			throw new ForbiddenException("2FA setup error");
		}
	}

	async verify2fa(@Req() req: Request, @Res() res: Response, code: string) {
		const login = req.query.login;

		if (!login) {
			return res.status(400).json({
				message: "NO LOGIN",
			});
		}

		const user = await this.prisma.user.findUnique({
			where: {
				login: login as string,
			},
		});

		const verified = authenticator.verify({
			secret: user.secret,
			token: code,
		});

		if (verified) {
			const token = await this.signToken(req, res, user);
			return res.status(200).json(token);
		} else {
			return res.status(400).json({ message: "UNVALID" });
		}
	}

	async verify2fa_test(
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any,
		code: string
	) {
		if (!user || !user.twoFactor || !user.secret) {
			return res.status(400).json({
				message: "NO 2FA",
			});
		}

		const verified = authenticator.verify({
			secret: user.secret,
			token: code,
		});

		if (verified) {
			return res.status(200).json({ message: "OK" });
		} else {
			return res.status(400).json({ message: "UNVALID" });
		}
	}

	async remove2fa(
		@Req() req: Request,
		@Res() res: Response,
		@GetCookie() cookie: CookieDto
	) {
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
}
