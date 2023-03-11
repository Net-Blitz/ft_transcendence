import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { CookieDto } from "./cookie.dto";

export const GetUser = createParamDecorator(
	(data: string | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest();
		const jwt = request.cookies.jwt;
		const userCookie = JSON.parse(atob(jwt.split(".")[1]));// as CookieDto;

		if (data) {
			return userCookie[data];
		}
		return userCookie;
	},
);