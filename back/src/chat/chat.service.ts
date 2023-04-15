import { Body, Injectable, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { GetUser } from "src/auth/decorator";
import { PrismaService } from "src/prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { ChannelState } from "@prisma/client";

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async CreateChannel(
		@Param("channel") channel: string,
		state: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (channelExists) {
			return res.status(400).json({ message: "Channel already exists" });
		}
		if (state !== "PUBLIC" && state !== "PRIVATE")
			return res.status(400).json({ message: "Invalid state" });
		try {
			await this.prisma.channel.create({
				data: {
					name: channel,
					state: state as ChannelState,
					ownerId: user.id,
				},
			});
		} catch (e) {
			console.log({ e });
			return res.status(400).json({ message: "Channel already exists" });
		}
		return res.status(200).json({ message: "Channel created" });
	}

	async CreateProtectedChannel(
		@Param("channel") channel: string,
		password: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (channelExists) {
			return res.status(400).json({ message: "Channel already exists" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			await this.prisma.channel.create({
				data: {
					name: channel,
					state: "PROTECTED",
					ownerId: user.id,
					hash: hashedPassword,
				},
			});
		} catch (e) {
			console.log({ e });
			return res.status(400).json({ message: "Channel already exists" });
		}
		return res.status(200).json({ message: "Channel created" });
	}

	async JoinChannel(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (channelExists.state !== "PUBLIC")
			return res.status(400).json({ message: "Invalid state" });
		const bans = await this.prisma.ban.findMany({
			where: {
				A: channelExists.id,
				B: user.id,
			},
		});
		if (bans.length > 0) {
			return res.status(400).json({ message: "You are banned" });
		}
		try {
			await this.prisma.chatUsers.create({
				data: {
					A: channelExists.id,
					B: user.id,
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "Channel already joined" });
		}
		return res.status(200).json({ message: "Channel joined" });
	}

	async JoinProtectedChannel(
		@Param("channel") channel: string,
		@Body("password") password: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (channelExists.state !== "PROTECTED")
			return res.status(400).json({ message: "Invalid state" });
		const bans = await this.prisma.ban.findMany({
			where: {
				A: channelExists.id,
				B: user.id,
			},
		});
		if (bans.length > 0) {
			return res.status(400).json({ message: "You are banned" });
		}
		const match = await bcrypt.compare(password, channelExists.hash);
		if (!match) {
			return res.status(400).json({ message: "Wrong password" });
		}
		try {
			await this.prisma.chatUsers.create({
				data: {
					A: channelExists.id,
					B: user.id,
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "Channel already joined" });
		}
		return res.status(200).json({ message: "Channel joined" });
	}

	async JoinPrivateChannel(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (channelExists.state !== "PRIVATE") {
			return res.status(400).json({ message: "Invalid state" });
		}
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const bans = await this.prisma.ban.findMany({
			where: {
				A: channelExists.id,
				B: user.id,
			},
		});
		if (bans.length > 0) {
			return res.status(400).json({ message: "You are banned" });
		}

		if (channelExists.ownerId === user.id) {
			try {
				await this.prisma.chatUsers.create({
					data: {
						A: channelExists.id,
						B: user.id,
					},
				});
			} catch (e) {
				return res
					.status(400)
					.json({ message: "Channel already joined" });
			}
			return res.status(200).json({ message: "Channel joined" });
		}

		try {
			const invite = await this.prisma.inviteChannel.findUnique({
				where: {
					A_B: {
						A: channelExists.id,
						B: user.id,
					},
				},
			});
			if (!invite) {
				return res.status(404).json({ message: "Invite not found" });
			}
			await this.prisma.chatUsers.create({
				data: {
					A: channelExists.id,
					B: user.id,
				},
			});
			await this.prisma.inviteChannel.delete({
				where: {
					A_B: {
						A: channelExists.id,
						B: user.id,
					},
				},
			});
		} catch (e) {
			console.log({ e });
			return res.status(400).json({ message: "Channel already joined" });
		}
		return res.status(200).json({ message: "Channel joined" });
	}

	async InviteToChannel(
		@Param("channel") channel: string,
		@Body("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (channelExists.state !== "PRIVATE")
			return res.status(400).json({ message: "Channel is not private" });
		if (!login)
			return res.status(400).json({ message: "Login is required" });

		const InvitedUser = await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});
		if (!InvitedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		if (InvitedUser.id === user.id) {
			return res
				.status(400)
				.json({ message: "You can't invite yourself" });
		}
		if (user.id !== channelExists.ownerId) {
			return res.status(400).json({ message: "You are not owner" });
		}
		try {
			await this.prisma.inviteChannel.create({
				data: {
					A: channelExists.id,
					B: InvitedUser.id,
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "User already invited" });
		}
		return res.status(200).json({ message: "User invited" });
	}

	async DeclineInvite(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		try {
			await this.prisma.inviteChannel.delete({
				where: {
					A_B: {
						A: channelExists.id,
						B: user.id,
					},
				},
			});
		} catch (e) {
			return res.status(404).json({ message: "Invite not found" });
		}
		return res.status(200).json({ message: "Invite declined" });
	}

	async GetInvites(@Res() res: Response, @GetUser() user: any) {
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const invites = await this.prisma.inviteChannel.findMany({
			where: {
				B: user.id,
			},
			include: {
				channels: true,
			},
		});
		if (!invites) {
			return res.status(404).json({ message: "Invites not found" });
		}
		return res.status(200).json(invites);
	}

	async AddAdminUser(
		@Param("channel") channel: string,
		@Body("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (!login)
			return res.status(400).json({ message: "Login is required" });

		const PromotedUser = await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});
		if (!PromotedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		if (user.id !== channelExists.ownerId) {
			return res.status(400).json({ message: "You are not owner" });
		}
		try {
			await this.prisma.admin.create({
				data: {
					A: channelExists.id,
					B: PromotedUser.id,
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "User already admin" });
		}
		return res
			.status(200)
			.json({ message: "User has been successfully promoted" });
	}

	async RemoveAdminUser(
		@Param("channel") channel: string,
		@Body("login") login: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		if (!login)
			return res.status(400).json({ message: "Login is required" });

		const DemotedUser = await this.prisma.user.findUnique({
			where: {
				login: login,
			},
		});
		if (!DemotedUser) {
			return res.status(404).json({ message: "User not found" });
		}
		if (user.id !== channelExists.ownerId) {
			return res.status(400).json({ message: "You are not owner" });
		}
		try {
			await this.prisma.admin.delete({
				where: {
					A_B: {
						A: channelExists.id,
						B: DemotedUser.id,
					},
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "User is not admin" });
		}
		return res
			.status(200)
			.json({ message: "User has been successfully demoted" });
	}

	async GetAdmins(@Param("channel") channel: string, @Res() res: Response) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		const admins = await this.prisma.admin.findMany({
			where: {
				A: channelExists.id,
			},
			include: {
				User: true,
			},
		});
		if (!admins) {
			return res.status(404).json({ message: "Admins not found" });
		}
		return res.status(200).json(admins);
	}

	async LeaveChannel(
		@Param("channel") channel: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		try {
			await this.prisma.chatUsers.deleteMany({
				where: {
					A: channelExists.id,
					B: user.id,
				},
			});
		} catch (e) {
			return res.status(400).json({ message: "Channel already left" });
		}
		return res.status(200).json({ message: "Channel left" });
	}

	async getChannels(@Res() res: Response) {
		const channels = await this.prisma.channel.findMany();
		return res.status(200).json(channels);
	}

	async getChannel(@Param("channel") channel: string, @Res() res: Response) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		const users = await this.prisma.chatUsers.findMany({
			where: {
				A: channelExists.id,
			},
			select: {
				B: true,
			},
		});
		const usersIds = users.map((user) => user.B);
		const usersInfo = await this.prisma.user.findMany({
			where: {
				id: {
					in: usersIds,
				},
			},
		});

		const admin = await this.prisma.admin.findMany({
			where: {
				A: channelExists.id,
			},
		});

		const NewUsers: any = usersInfo;

		NewUsers.forEach((user: any) => {
			user["role"] = "user";
			if (user.id === channelExists.ownerId) {
				user["role"] = "owner";
			} else if (admin.find((admin) => admin.B === user.id)) {
				user["role"] = "admin";
			}
		});

		return res
			.status(200)
			.json({ channel: channelExists, users: NewUsers });
	}

	async getBan(@Param("username") username: string, @Res() res: Response) {
		const userExists = await this.prisma.user.findUnique({
			where: {
				login: username,
			},
		});
		if (!userExists) {
			return res.status(404).json({ message: "User not found" });
		}
		const ban = await this.prisma.ban.findMany({
			where: {
				B: userExists.id,
			},
		});
		if (!ban) {
			return res.status(404).json({ message: "Ban not found" });
		}
		const channels = await this.prisma.channel.findMany({
			where: {
				id: {
					in: ban.map((ban) => ban.A),
				},
			},
			select: {
				name: true,
			},
		});
		return res.status(200).json(channels);
	}

	async getBans(@Param("channel") channel: string, @Res() res: Response) {
		const channelExists = await this.prisma.channel.findUnique({
			where: {
				name: channel,
			},
		});
		if (!channelExists) {
			return res.status(404).json({ message: "Channel not found" });
		}
		const ban = await this.prisma.ban.findMany({
			where: {
				A: channelExists.id,
			},
		});
		if (!ban) {
			return res.status(404).json({ message: "Ban not found" });
		}
		const users = await this.prisma.user.findMany({
			where: {
				id: {
					in: ban.map((ban) => ban.B),
				},
			},
		});
		return res.status(200).json(users);
	}

	async getDMs(@Res() res: Response, @GetUser() user: any) {
		try {
			const DMs = await this.prisma.directMessage.findMany({
				where: {
					OR: [
						{
							senderId: user.id,
						},
						{
							receiverId: user.id,
						},
					],
				},
			});
			if (!DMs) {
				return res.status(404).json({ message: "DMs not found" });
			}

			const sender = await this.prisma.user.findMany({
				where: {
					id: {
						in: DMs.map((DM) => DM.senderId),
					},
				},
			});

			const receiver = await this.prisma.user.findMany({
				where: {
					id: {
						in: DMs.map((DM) => DM.receiverId),
					},
				},
			});

			DMs.forEach((DM) => {
				DM["sender"] = sender.find((user) => user.id === DM.senderId);
				DM["receiver"] = receiver.find(
					(user) => user.id === DM.receiverId
				);
			});

			return res.status(200).json(DMs);
		} catch (e) {
			return res.status(404).json({ message: "DMs not found" });
		}
	}

	async CreateDM(
		@Body("username") username: string,
		@Res() res: Response,
		@GetUser() user: any
	) {
		try {
			const userExists = await this.prisma.user.findUnique({
				where: {
					login: username,
				},
			});
			if (!userExists) {
				return res.status(404).json({ message: "User not found" });
			}

			const dm = await this.prisma.directMessage.findFirst({
				where: {
					OR: [
						{
							AND: [
								{
									senderId: user.id,
								},
								{
									receiverId: userExists.id,
								},
							],
						},
						{
							AND: [
								{
									senderId: userExists.id,
								},
								{
									receiverId: user.id,
								},
							],
						},
					],
				},
			});
			if (dm) {
				return res.status(404).json({ message: "DM already exist" });
			}

			const DM = await this.prisma.directMessage.create({
				data: {
					senderId: user.id,
					receiverId: userExists.id,
				},
			});
			return res.status(200).json(DM);
		} catch (e) {
			return res.status(404).json({ message: "DM already exist" });
		}
	}
}
