import { Injectable, Param, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { GetUser } from "src/auth/decorator";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class FriendService {
	constructor(private prisma: PrismaService) {}

	async AddFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
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
		if (user.id === friend.id) {
			return res.status(400).json({ message: "You can't add yourself" });
		}
		try {
			await this.prisma.friendsRelation.create({
				data: {
					friendId: user.id,
					friendwithId: friend.id,
				},
			});
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
		@Res() res: Response,
		@GetUser() user: any
	) {
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
						friendId: user.id,
						friendwithId: friend.id,
					},
				},
			});
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

	async AcceptFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
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
			await this.prisma.friendsRelation.update({
				where: {
					friendId_friendwithId: {
						friendId: user.id,
						friendwithId: friend.id,
					},
				},
				data: {
					status: "ACCEPTED",
				},
			});
			await this.prisma.friendsRelation.update({
				where: {
					friendId_friendwithId: {
						friendId: friend.id,
						friendwithId: user.id,
					},
				},
				data: {
					status: "ACCEPTED",
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "Friend not found" });
		}

		return res.status(200).json({ message: "Friend accepted" });
	}

	async DeclineFriend(
		@Param("login") login: string,
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
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
						friendId: user.id,
						friendwithId: friend.id,
					},
				},
			});
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

		return res.status(200).json({ message: "Friend rejected" });
	}

	async GetFriends(
		@Req() req: Request,
		@Res() res: Response,
		@GetUser() user: any
	) {
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
		const pendingList = [];
		let j = 0;
		let k = 0;
		for (let i = 0; i < friends.friendwith.length; i++) {
			const friend = await this.prisma.user.findUnique({
				where: {
					id: friends.friendwith[i].friendId,
				},
			});
			if (friends.friendwith[i].status === "ACCEPTED") {
				friendsList[j] = friend;
				j++;
			} else if (friends.friendwith[i].status === "PENDING") {
				pendingList[k] = friend;
				k++;
			}
		}
		return res.status(200).json({ friendsList, pendingList });
	}
}
