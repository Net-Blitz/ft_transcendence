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
}
