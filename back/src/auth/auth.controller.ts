import {
	Body,
	Controller,
	Delete,
	Get,
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

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Get("callback")
	async auth42Callback(
		@Req() req: Request,
		@Res() res: Response,
		@Query("code") code: string
	) {
		//console.log("code: " + code);
		await this.authService.Auth42Callback(req, res, code);
		return res.redirect("http://localhost:8081");
	}

	@Get("verify")
	async verify(@Req() req: Request, @Res() res: Response) {
		const token = req.cookies.jwt;
		//console.log("token2: " + token);
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
	async setup2fa(
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
		return await this.authService.setup2fa(req, res, user);
	}

	@Post("2fa/verify")
	async verify2fa(
		@Req() req: Request,
		@Res() res: Response,
		@Body("verificationCode") code: string
	) {
		return await this.authService.verify2fa(req, res, code);
	}

	@Post("2fa/verify_test")
	async verify2fa_test(
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any,
		@Body("verificationCode") code: string
	) {
		return await this.authService.verify2fa_test(req, res, user, code);
	}

	@Delete("2fa/disable")
	async remove2fa(
		@Req() req: Request,
		@Res() res: Response,
		@GetCookie() cookie: CookieDto
	) {
		return await this.authService.remove2fa(req, res, cookie);
	}
}
