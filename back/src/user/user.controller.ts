import { Body, Controller, Get, Param, Put, Res } from "@nestjs/common";
import { UserService } from "./user.service";
import { Response } from "express";
import { UpdateUserDto } from "./dto";
import { GetUser } from "src/auth/decorator";

@Controller("users")
export class UserController {
	constructor(private userService: UserService) {}

	@Get("me")
	async GetUser(@Res() res: Response, @GetUser() user: any) {
		return res.status(200).json(user);
	}

	@Get("login/:login")
	async GetUserByLogin(@Param("login") login: string, @Res() res: Response) {
		return await this.userService.GetUserByLogin(login, res);
	}

	@Get("username/:username")
	async GetUserByUsername(
		@Param("username") username: string,
		@Res() res: Response
	) {
		return await this.userService.GetUserByUsername(username, res);
	}

	@Get("login")
	async GetAllUser(@Res() res: Response) {
		return await this.userService.GetAllUser(res);
	}

	@Put("update")
	async UpdateUser(
		@Res() res: Response,
		@GetUser() user: any,
		@Body("updateUser") updateUserDto: UpdateUserDto
	) {
		console.log("UpdateUser: " + updateUserDto.username);
		return await this.userService.UpdateUser(res, user, updateUserDto);
	}

	@Get("logout")
	Logout(@Res() res: Response) {
		return this.userService.Logout(res);
	}
}
