import { Body, Injectable, Param, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Response } from "express";
import { UpdateUserDto } from "./dto";
import { GetUser } from "src/auth/decorator";

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	async GetUserByLogin(@Param("login") login: string, @Res() res: Response) {
		const user = await this.prisma.user.findUnique({
			where: {
				login,
			},
		});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		return res.status(200).json(user);
	}

	async GetUserByUsername(
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

	async GetAllUser(@Res() res: Response) {
		const users = await this.prisma.user.findMany();
		return res.status(200).json(users);
	}

	async UpdateUser(
		@Res() res: Response,
		@GetUser() user: any,
		@Body("updateUser") updateUserDto: UpdateUserDto
	) {
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
}
