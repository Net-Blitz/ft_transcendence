import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessageDto } from "./dto";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
@WebSocketGateway(3334, { cors: "*" })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(private readonly prisma: PrismaService) {}
	@WebSocketServer() server: Server;

	private connectedClients: Map<
		string,
		{ channel: string; username: string }
	> = new Map();

	private DMs: Map<string, Socket> = new Map();

	async handleConnection(client: Socket) {
		console.log("Client connected: " + client);
	}

	async handleDisconnect(client: Socket) {
		const connectedClient = this.connectedClients.get(client.id);
		if (connectedClient) {
			const { channel, username } = connectedClient;
			console.log("Client disconnected: ", username, " from ", channel);
			this.connectedClients.delete(client.id);
			this.server.to(channel).emit("chat", {
				username: "Server",
				content: `${username} has left the channel`,
				channel: channel,
			});

			try {
				const channelExists = await this.prisma.channel.findUnique({
					where: {
						name: channel,
					},
				});

				const userExists = await this.prisma.user.findUnique({
					where: {
						username: username,
					},
				});

				await this.prisma.chatUsers.deleteMany({
					where: {
						A: channelExists.id,
						B: userExists.id,
					},
				});
			} catch (e) {}
		}
		if (this.DMs.get(client.id)) {
			this.DMs.delete(client.id);
		}
	}

	@SubscribeMessage("join")
	async handleJoinChannel(
		client: Socket,
		data: { channel: string; username: string }
	) {
		const { channel, username } = data;
		this.connectedClients.set(client.id, { channel, username });
		client.join(channel);

		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			await this.prisma.chatUsers.create({
				data: {
					A: channelExists.id,
					B: userExists.id,
				},
			});
			this.server.to(channel).emit("chat", {
				username: "Server",
				content: `${username} has joinned the channel`,
				channel: channel,
			});
		} catch (e) {}
	}

	@SubscribeMessage("chat")
	async handleMessage(client: Socket, message: MessageDto) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;

		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			const userInChannel = await this.prisma.chatUsers.findMany({
				where: {
					A: channelExists.id,
					B: userExists.id,
				},
			});

			if (userInChannel.length === 0) {
				console.log(userExists.username + " is not in channel");
				return;
			}

			const mutedUser = this.prisma.mute.findMany({
				where: {
					A: channelExists.id,
					B: userExists.id,
				},
			});

			if ((await mutedUser).length > 0) {
				console.log(userExists.username + " is muted");
				return;
			}
			console.log(channel, ": ", username, ": ", message.content);
			this.server.to(channel).emit("chat", message);
		} catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage("ConnectedDM")
	async handleConnectedDM(client: Socket, data: any) {
		this.DMs.set(data.id, client);
	}

	@SubscribeMessage("DM")
	async handleDM(client: Socket, message: any) {
		try {
			const { sender, receiver, DMid, content } = message;

			const [senderUser, recipientUser, DM] = await Promise.all([
				this.prisma.user.findUnique({
					where: {
						id: sender,
					},
				}),
				this.prisma.user.findUnique({
					where: {
						id: receiver,
					},
				}),
				this.prisma.directMessage.findUnique({
					where: {
						id: DMid,
					},
				}),
			]);

			if (!senderUser || !recipientUser) {
				throw new Error("Invalid sender or receiver");
			}

			if (!DM) {
				throw new Error("Invalid DM");
			}

			if (
				DM.senderId !== senderUser.id &&
				DM.senderId !== recipientUser.id
			) {
				throw new Error("Invalid DM");
			}

			await this.prisma.message.create({
				data: {
					userId: senderUser.id,
					message: content,
					directMessageId: DM.id,
				},
			});

			const userSocket = this.DMs.get(message.receiver);
			if (userSocket) {
				this.server.to(userSocket.id).emit("DM", {
					content,
					sender,
					receiver,
					DMid,
					avatar: "http://localhost:3333/" + senderUser.avatar,
					createdAt: new Date(),
				});
			}
		} catch (e) {
			console.error(e);
		}
	}

	@SubscribeMessage("ToKick")
	async handleKick(
		client: Socket,
		data: { username: string; channel: string; login: string }
	) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;
		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const admins = await this.prisma.admin.findMany({
				where: {
					A: channelExists.id,
				},
				include: {
					User: true,
				},
			});

			let isAdmin = admins.some(
				(admin) => admin.User.username === username
			);

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			if (userExists.id === channelExists.ownerId) {
				isAdmin = true;
			}

			const kickedUser = await this.prisma.user.findUnique({
				where: {
					username: data.login,
				},
			});

			if (isAdmin) {
				console.log(
					username + " kicked " + data.login + " from " + channel
				);
				await this.prisma.chatUsers.deleteMany({
					where: {
						A: channelExists.id,
						B: kickedUser.id,
					},
				});
				this.server
					.to(channel)
					.emit("kick", { username: data.login, channel: channel });
			}
		} catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage("ToBan")
	async handleBan(
		client: Socket,
		data: { username: string; channel: string; login: string }
	) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;
		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const admins = await this.prisma.admin.findMany({
				where: {
					A: channelExists.id,
				},
				include: {
					User: true,
				},
			});

			let isAdmin = admins.some(
				(admin) => admin.User.username === username
			);

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: data.login,
				},
			});

			const user = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			if (user.id === channelExists.ownerId) {
				isAdmin = true;
			}

			await this.prisma.ban.create({
				data: {
					A: channelExists.id,
					B: userExists.id,
				},
			});
			console.log("isAdmin: ", isAdmin);
			if (isAdmin) {
				console.log(
					username + " banned " + data.login + " from " + channel
				);
				this.server
					.to(channel)
					.emit("ban", { username: data.login, channel: channel });
			}
		} catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage("ToUnban")
	async handleUnban(
		client: Socket,
		data: { username: string; channel: string; login: string }
	) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;
		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const admins = await this.prisma.admin.findMany({
				where: {
					A: channelExists.id,
				},
				include: {
					User: true,
				},
			});

			let isAdmin = admins.some(
				(admin) => admin.User.username === username
			);

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: data.login,
				},
			});

			const user = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			if (user.id === channelExists.ownerId) {
				isAdmin = true;
			}

			if (isAdmin) {
				console.log(
					username + " unbanned " + data.login + " from " + channel
				);
				await this.prisma.ban.deleteMany({
					where: {
						A: channelExists.id,
						B: userExists.id,
					},
				});
			}
		} catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage("ToMute")
	async handleMute(
		client: Socket,
		data: { username: string; channel: string; login: string }
	) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;
		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const admins = await this.prisma.admin.findMany({
				where: {
					A: channelExists.id,
				},
				include: {
					User: true,
				},
			});

			let isAdmin = admins.some(
				(admin) => admin.User.username === username
			);

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: data.login,
				},
			});

			const user = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			if (user.id === channelExists.ownerId) {
				isAdmin = true;
			}

			await this.prisma.mute.create({
				data: {
					A: channelExists.id,
					B: userExists.id,
				},
			});
			console.log("isAdmin: ", isAdmin);
			if (isAdmin) {
				console.log(
					username + " muted " + data.login + " from " + channel
				);
				this.server
					.to(channel)
					.emit("mute", { username: data.login, channel: channel });
			}
		} catch (e) {
			console.log(e);
		}
	}

	@SubscribeMessage("ToUnmute")
	async handleUnmute(
		client: Socket,
		data: { username: string; channel: string; login: string }
	) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;
		try {
			const channelExists = await this.prisma.channel.findUnique({
				where: {
					name: channel,
				},
			});

			const admins = await this.prisma.admin.findMany({
				where: {
					A: channelExists.id,
				},
				include: {
					User: true,
				},
			});

			let isAdmin = admins.some(
				(admin) => admin.User.username === username
			);

			const userExists = await this.prisma.user.findUnique({
				where: {
					username: data.login,
				},
			});

			const user = await this.prisma.user.findUnique({
				where: {
					username: username,
				},
			});

			if (user.id === channelExists.ownerId) {
				isAdmin = true;
			}

			if (isAdmin) {
				console.log(
					username + " unmuted " + data.login + " from " + channel
				);
				await this.prisma.mute.deleteMany({
					where: {
						A: channelExists.id,
						B: userExists.id,
					},
				});
			}
		} catch (e) {
			console.log(e);
		}
	}
}
