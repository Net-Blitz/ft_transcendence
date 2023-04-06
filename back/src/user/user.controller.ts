import { Body, Controller, Get, Param, Put, Req, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto";

@Controller("users")
export class UserController {
	constructor(private userService: UserService) {}

	@Get("me")
	GetUser(@Req() req: Request) {
		return this.userService.getUser(req);
	}

	@Get("login/:username")
	async GetUserByLogin(
		@Param("username") username: string,
		@Req() req: Request,
		@Res() res: Response
	) {
		return this.userService.GetUserByLogin(username, req, res);
	}

	@Put("update")
	async UpdateUser(
		@Req() req: Request,
		@Res() res: Response,
		@Body() updateUserDto: UpdateUserDto
	) {
		return this.userService.UpdateUser(req, res, updateUserDto);
	}

	@Get("logout")
	Logout(@Req() req: Request, @Res() res: Response) {
		return this.userService.Logout(req, res);
	}

	@Get("/all/pseudo")
	async GetAllPseudo(@Res() res: Response) {
		return (res);
	}

}
