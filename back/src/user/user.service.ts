import { Body, Inject, Injectable, Param, Req, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto";
import { AuthService } from "src/auth/auth.service";
import { GetUser } from "src/auth/decorator";

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		@Inject(AuthService) private authService: AuthService
	) {}

	async getUser(userLogin: string) {
		return await this.prisma.user.findUnique({
			where: {
				login: userLogin,
			},
		});
	}

	async GetUserByLogin(
		@Param("username") username: string,
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
		@GetUser("id") userLogin: string,
		@Res() res: Response,
		@Body() updateUserDto: UpdateUserDto
	) {
		console.log(updateUserDto);
		const user = await this.getUser(userLogin);
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

	Logout(@Res() res: Response) {
		res.clearCookie("jwt", { httpOnly: true });
		return res.status(200).json({ message: "Logged out" });
	}

	async createRandomUser(@Body() body: any) {
		const user = await this.prisma.user.create({
			data: {
				login: body.login,
				username: body.username,
			},
		});
		return  user;
	}
}
