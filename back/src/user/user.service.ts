import { Body, Inject, Injectable, Param, Req, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		@Inject(AuthService) private authService: AuthService
	) {}

	async getUser(@Req() req: Request) {
		const jwt = req.cookies.jwt;
		const login = JSON.parse(atob(jwt.split(".")[1])).login;
		return await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});
	}

	async GetUserByLogin(
		@Param("username") username: string,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.prisma.user.findUnique({
			where: {
				username,
			},
		});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json(user);
	}
	
	async UpdateUser(
		@Req() req: Request,
		@Res() res: Response,
		@Body() updateUserDto: UpdateUserDto
	) {
		console.log(updateUserDto);
		const user = await this.getUser(req);
		if (!user) {
			return res.status(404).json({ message: `User not found` });
		}

		if (updateUserDto.username) user.username = updateUserDto.username;
		if (updateUserDto.avatar) user.avatar = updateUserDto.avatar;

		const updatedUser = await this.prisma.user.update({
			where: {
				login: user.login,
			},
			data: user,
		});
		return res.status(200).json(updatedUser);
	}

	Logout(@Req() req: Request, @Res() res: Response) {
		res.clearCookie("jwt", { httpOnly: true });
		return res.status(200).json({ message: "Logged out" });
	}

	async GetAllPseudo() {
		const res = await this.prisma.user.findMany({
			select: {
				username: true,
			},
		});
		return (res);
	}
}
