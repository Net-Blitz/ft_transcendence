import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { QueueObject } from "./dto";
import { QueueService } from "./queue.service";

@WebSocketGateway({namespace:"queue", cors: {origin: "*"}})
export class QueueGateway {

	@WebSocketServer()
	server: Server;
	
	constructor(private prisma: PrismaService, private queueService: QueueService) {
		this.runQueue();
	}
	
	async sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async runQueue() {
		while (1)
		{
			console.log ("Queue 1v1: ", this.queueService.queue1v1);
			if (this.queueService.queue1v1.length >= 2)
			{
				const player1 = this.queueService.queue1v1.shift();
				const player2 = this.queueService.queue1v1.shift();
				await this.prisma.user.updateMany({
					where: {login: {in: [player1.login, player2.login],}}, 
					data: {state: "PLAYING",}});
				
				await this.prisma.game.create({
					data: {user1Id: player1.id, user2Id: player2.id,}
				});

				const game = await this.prisma.game.findFirst({
					where: {
						state: "CREATING",
						AND: [{ user1Id: player1.id }, { user2Id: player2.id }]}
					});
				this.server.to(player1.socketId).emit("gameFound", {opponent: player2.login, gameId: game.id});
				this.server.to(player2.socketId).emit("gameFound", {opponent: player1.login, gameId: game.id});
			}
			else
			{
				if (this.server)
					this.server.emit("queue1v1", "Waiting for opponent");
			}

			await this.sleep(5000);
		}
	}


	handleConnection(client: Socket) { 
		const cookies = client.handshake.headers.cookie;
		const token = cookies.split("jwt=")[1].split(";")[0];
		const userCookie = JSON.parse(atob(token.split(".")[1]));
 
		const user = this.queueService.getUserInQueue(userCookie.login);
		if (user)
		{
			if (user.socketId !== client.id && user.socketId !== undefined)
				this.server.to(user.socketId).emit("close");
			user.socketId = client.id;
		}
		console.log("Socket connected: ", client.id);
	} 

	handleDisconnect(client: Socket) {
		console.log("Socket disconnected: ", client.id);
		return ;
	}
}