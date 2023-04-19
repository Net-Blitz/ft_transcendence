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
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("users")
export class UserController {
	constructor(private userService: UserService) {}

	@Get("me")
	GetUser(@Req() req: Request) {
		return this.userService.getUser(req);
	}

	@Get("login/:login")
	async GetUserByLogin(
		@Param("login") username: string,
		@Res() res: Response
	) {
		return this.userService.GetUserByLogin(username, res);
	}

	@Get("username/:username")
	async GetUserByUsername(
		@Param("username") username: string,
		@Res() res: Response
	) {
		return this.userService.GetUserByUsername(username, res);
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
