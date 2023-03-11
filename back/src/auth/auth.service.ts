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

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwt: JwtService,
		private config: ConfigService
	) {}

	async getUserCheat(req: Request, res: Response, username: string) {
		const user =  await this.prisma.user.findUnique({
			where: { username },
		});
		if (user) {
			return await this.signToken(req, res, user);
		}
		return user;
	}
	//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImxvZ2luIjoiamVhbiIsImlhdCI6MTY3ODQ2NDQ5MiwiZXhwIjoxNjc4NDcxNjkyfQ.gK4NF2HcjxMvgf9KOj_H3TU2R8vyzEwCVxqRYij_nP4

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
			code ,
		};
		console.log(payload)
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
			console.log(error)
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
			throw new ForbiddenException("prisma error");
		}
	}

	async signToken(
		@Req() req: Request,
		@Res() res: Response,
		user: UserDto
	): Promise<{ access_token: string }> {
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
			//console.log("cookie: " + req.cookies.jwt);
		} catch (error) {
			console.log(error);
		}
		//console.log(token)
		return { access_token: token };
	}

	async setup2fa(@Req() req: Request, @Res() res: Response) {
		try {
			const secret = authenticator.generateSecret();
			console.log("🚀 ~ secret:", secret);

			const jwt = req.cookies.jwt;
			const login = JSON.parse(atob(jwt.split(".")[1])).login;

			const otpAuthUrl = authenticator.keyuri(
				login,
				"Pong League",
				secret
			);
			const qrCode = await QRCode.toDataURL(otpAuthUrl);

			await this.prisma.user.update({
				where: {
					login: login,
				},
				data: {
					twoFactor: true,
					secret: secret,
				},
			});
			return res.status(200).json({ otpAuthUrl, qrCode });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ message: "error" });
		}
	}

	async verify2fa(@Req() req: Request, @Res() res: Response, code: string) {
		const jwt = req.cookies.jwt;
		const login = JSON.parse(atob(jwt.split(".")[1])).login;
		const user = await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});

		if (!user || !user.twoFactor || !user.secret) {
			return res.status(400).json({
				message:
					"La double authentification n'est pas activée pour cet utilisateur",
			});
		}

		console.log("🚀 ~ user.secret:", user.secret);
		console.log("🚀 ~ token:", code);

		const verified = authenticator.verify({
			secret: user.secret,
			token: code,
		});

		console.log("🚀 ~ verified:", verified);

		if (verified) {
			return res.status(200).json({
				message:
					"La double authentification a été vérifiée avec succès",
			});
		} else {
			return res
				.status(400)
				.json({ message: "Le code de vérification est incorrect" });
		}
	}

	async remove2fa(@Req() req: Request, @Res() res: Response) {
		const jwt = req.cookies.jwt;
		const login = JSON.parse(atob(jwt.split(".")[1])).login;
		await this.prisma.user.update({
			where: {
				login: login,
			},
			data: {
				twoFactor: false,
				secret: null,
			},
		});
		return res.status(200).json({ message: "2fa removed" });
	}
}
