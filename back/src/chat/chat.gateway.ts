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

	handleConnection(client: Socket) {
		//console.log("Client connected: ", client.id);
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
		} catch (e) {}
	}

	@SubscribeMessage("chat")
	handleMessage(client: Socket, message: MessageDto) {
		const connectedClient = this.connectedClients.get(client.id);
		if (!connectedClient) {
			return;
		}
		const { channel, username } = connectedClient;
		console.log(channel, ": ", username, ": ", message.content);
		this.server.to(channel).emit("chat", message);
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

			if (isAdmin) {
				console.log(
					username + " kicked " + data.login + " from " + channel
				);
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
					.emit("kick", { username: data.login, channel: channel });
			}
		} catch (e) {
			console.log(e);
		}
	}
}
