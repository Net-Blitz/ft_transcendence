import { Injectable, Param, Res } from "@nestjs/common";
import { Response } from "express";
import { GetUser } from "src/auth/decorator";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class ChatService {
	constructor(private prisma: PrismaService) {}

	async CreateChannel(
		@Param("channel") channel: string,
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
		try {
			await this.prisma.channel.create({
				data: {
					name: channel,
					state: "PUBLIC",
					ownerId: user.id,
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
}
