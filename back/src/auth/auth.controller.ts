import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Query,
	Req,
	Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { GetCookie, GetUser } from "./decorator";
import { CookieDto } from "./decorator/cookie.dto";
import { ConfigService } from "@nestjs/config";

@Controller("auth")
export class AuthController {
	constructor(
		private authService: AuthService,
		private config: ConfigService
	) {}

	@Get("callback")
	async auth42Callback(
		@Req() req: Request,
		@Res() res: Response,
		@Query("code") code: string
	) {
		await this.authService.Auth42Callback(req, res, code);
		return;
	}

	@Get("verify")
	async verify(@Req() req: Request, @Res() res: Response) {
		const token = req.cookies.jwt;
		if (!token) {
			res.status(401).send("Unauthorized: No token provided");
			return { valid: false };
		}
		try {
			jwt.verify(token, process.env.JWT_SECRET);
			res.status(200).send("OK");
			return { valid: true };
		} catch (err) {
			res.status(401).send("Unauthorized: Invalid token");
			return { valid: false };
		}
	}

	@Post("2fa/setup")
	async setup2fa(@Res() res: Response, @GetUser() user: any) {
		return await this.authService.setup2fa(res, user);
	}

	@Post("2fa/verify")
	async verify2fa(
		@GetUser() user: any,
		@Res() res: Response,
		@Body("inputKey") key: string
	) {
		return await this.authService.verify2fa(user, res, key);
	}

	@Post("2fa/verifylogin")
	async verify2falogin(
		@Res() res: Response,
		@Body("login") login: string,
		@Body("inputKey") key: string
	) {
		return await this.authService.verify2falogin(res, login, key);
	}

	@Delete("2fa/disable")
	async remove2fa(@Res() res: Response, @GetCookie() cookie: CookieDto) {
		return await this.authService.remove2fa(res, cookie);
	}

	@Get(":username") /*Temp*/ async getUserCheat(
		@Req() req: Request,
		@Res() res: Response,
		@Param("username") username: string
	) {
		return await this.authService.getUserCheat(req, res, username);
	}
}
