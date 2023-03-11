import { Body, Controller, Get, Param, Post, Put, Req, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto";
import { GetUser } from "src/auth/decorator";

@Controller("users")
export class UserController {
	constructor(private userService: UserService) {}

	@Get("me")
	GetUser(@GetUser("login") userLogin: string) {
		return this.userService.getUser(userLogin);
	}

	@Get("login/:username")
	async GetUserByLogin(
		@Param("username") username: string,
		@Res() res: Response
	) {
		return this.userService.GetUserByLogin(username, res);
	}

	@Put("update")
	async UpdateUser(
		@GetUser("login") userLogin: string,
		@Res() res: Response,
		@Body() updateUserDto: UpdateUserDto
	) {
		return this.userService.UpdateUser(userLogin, res, updateUserDto);
	}

	@Get("logout")
	Logout(@Res() res: Response) {
		return this.userService.Logout(res);
	}

	@Post("create") /* Temp */
	createRandomUser(@Body() body: any) {
		return this.userService.createRandomUser(body);
	}
}
