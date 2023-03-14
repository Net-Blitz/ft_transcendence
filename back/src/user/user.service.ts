import { Body, Inject, Injectable, Param, Req, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Request, Response } from "express";
import { UpdateUserDto } from "./dto";
import { AuthService } from "src/auth/auth.service";
import { create } from "domain";

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

	async GetAllUser(@Req() req: Request, @Res() res: Response) {
		const users = await this.prisma.user.findMany();
		return res.status(200).json(users);
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

	async AddFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.getUser(req);
		const friend = await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		if (!friend) {
			return res.status(404).json({ message: "Friend not found" });
		}

		try {
			await this.prisma.friendsRelation.create({
				data: {
					friendId: friend.id,
					friendwithId: user.id,
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "Friend already added" });
		}

		return res.status(200).json({ message: "Friend added" });
	}

	async RemoveFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response
	) {
		const user = await this.getUser(req);
		const friend = await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		if (!friend) {
			return res.status(404).json({ message: "Friend not found" });
		}

		try {
			await this.prisma.friendsRelation.delete({
				where: {
					friendId_friendwithId: {
						friendId: friend.id,
						friendwithId: user.id,
					},
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "Friend not found" });
		}

		return res.status(200).json({ message: "Friend removed" });
	}

	async GetFriends(@Req() req: Request, @Res() res: Response) {
		const user = await this.getUser(req);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const friends = await this.prisma.user.findUnique({
			where: {
				login: user.login,
			},
			include: {
				friendwith: true,
			},
		});

		const friendsList = [];
		for (let i = 0; i < friends.friendwith.length; i++) {
			const friend = await this.prisma.user.findUnique({
				where: {
					id: friends.friendwith[i].friendId,
				},
			});
			friendsList[i] = friend;
		}

		return res.status(200).json(friendsList);
	}
}
