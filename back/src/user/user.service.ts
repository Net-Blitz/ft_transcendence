import { Body, Inject, Injectable, Param, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Response } from "express";
import { UpdateUserDto } from "./dto";
import { GetUser } from "src/auth/decorator";
import { FileService } from "src/file/file.service";
import * as fs from "fs";
import * as path from "path";
import { ConfigService } from "@nestjs/config";
import { v4 as uuidv4 } from "uuid";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		@Inject(AuthService) private authService: AuthService,
		private fileservice: FileService,
		private config: ConfigService
	) {}

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

	async GetAllPseudo() {
		const res = await this.prisma.user.findMany({
			select: {
				username: true,
			},
		});
		return res;
	}

	async ConfigUser(
		@GetUser() user: any,
		@Res() res: Response,
		file: any,
		text: string
	) {
		if ((await this.fileservice.checkFile(file)) === false)
			return res.status(400).json({ message: "Bad file" });
		const extension = path.extname(file.originalname);
		const filepath: string = path.join(
			"public",
			"uploads",
			user.id + "-" + uuidv4() + extension
		);
		try {
			await fs.promises.writeFile(filepath, file.buffer);
		} catch (error) {
			console.log(error);
			return res.status(400).json({ message: "Write File error" });
		}
		if (!user) {
			return res.status(404).json({ message: `User not found` });
		}
		if (text) user.username = text;
		if (file) user.avatar = filepath;
		user.config = true;
		const updatedUser = await this.prisma.user.update({
			where: {
				login: user.login,
			},
			data: user,
		});
		console.log(user);
		return res.status(200).json(updatedUser);
	}

	async UpdateUserConfig(
		@GetUser() user: any,
		@Res() res: Response,
		file: any,
		text: string
	) {
		if ((await this.fileservice.checkFile(file)) === false)
			return res.status(400).json({ message: "Bad file" });
		try {
			await fs.promises.unlink(user.avatar);
		} catch (error) {
			return res.status(400).json({ message: "Delete File error" });
		}
		const extension = path.extname(file.originalname);
		const filepath: string = path.join(
			"public",
			"uploads",
			user.id + "-" + uuidv4() + extension
		);
		try {
			await fs.promises.writeFile(filepath, file.buffer);
		} catch (error) {
			return res.status(400).json({ message: "Write File error" });
		}
		if (!user) {
			return res.status(404).json({ message: `User not found` });
		}
		if (text) user.username = text;
		if (file) user.avatar = filepath;
		user.config = true;
		const updatedUser = await this.prisma.user.update({
			where: {
				login: user.login,
			},
			data: user,
		});
		return res.status(200).json(updatedUser);
	}
}
