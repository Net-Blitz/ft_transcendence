import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
	Req,
	Res,
	UseInterceptors,
	UploadedFile,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Response } from "express";
import { UpdateUserDto } from "./dto";
import { GetUser } from "src/auth/decorator";
import { FileInterceptor } from "@nestjs/platform-express";

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
	Logout(@Req() req: Request, @Res() res: Response) {
		return this.userService.Logout(req, res);
	}

	@Get("/all/pseudo")
	async GetAllPseudo() {
		return this.userService.GetAllPseudo();
	}

	@Post("config")
	@UseInterceptors(FileInterceptor("file"))
	async ConfigUser(
		@Req() req: Request,
		@Res() res: Response,
		@UploadedFile() file,
		@Body("username") text: string
	) {
		this.userService.ConfigUser(req, res, file, text);
	}

	@Post("updateconfig")
	@UseInterceptors(FileInterceptor("file"))
	async UpdateUserConfig(
		@Req() req: Request,
		@Res() res: Response,
		@UploadedFile() file,
		@Body("username") text: string
	) {
		this.userService.UpdateUserConfig(req, res, file, text);
	}
}
