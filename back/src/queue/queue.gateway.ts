import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { QueueObject } from "./dto";
import { QueueService } from "./queue.service";

@WebSocketGateway({namespace:"queue", cors: {origin: "*"}})
export class QueueGateway {

	@WebSocketServer()
	server: Server;

	queue1v1: QueueObject[]
	queue2v2: QueueObject[]

	constructor(private prisma: PrismaService) {
		this.queue1v1 = [];
		this.queue2v2 = [];
		this.runQueue();
	}
	
	async sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async runQueue() {
		while (1)
		{
			console.log ("Queue 1v1: ", this.queue1v1);
			if (this.queue1v1.length >= 2)
			{
				const player1 = this.queue1v1.shift();
				const player2 = this.queue1v1.shift();
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


	async addUserToQueue(userParam: any, client: Socket) {
		const prismaUser = await this.prisma.user.findFirst({where: {login: userParam.login}});
		if (!prismaUser)
			return client.emit("close");
		const user = this.queue1v1.find((queuer) => queuer.login === userParam.login);
		if (user)
		{
			this.server.to(user.socketId).emit("close");
			user.socketId = client.id;
			user.mode = userParam.mode;
			user.bonus1 = (userParam.bonus1 == undefined) ? false : true;
			user.bonus2 = (userParam.bonus2 == undefined) ? false : true;
			user.timeData = Date.now();
		}
		else
		{
			this.queue1v1.push({
			id: prismaUser.id,
			login: userParam.login,
			socketId: client.id,
			mode: userParam.mode,
			elo: prismaUser.elo, 
			bonus1: (userParam.bonus1 == undefined) ? false : true,
			bonus2: (userParam.bonus2 == undefined) ? false : true,
			timeData: Date.now()
			});
		}
	}

	handleConnection(client: Socket) { 
		const userParam = client.handshake.auth;
 
		if (userParam.login == undefined || userParam.mode == undefined)
			return client.emit("redirect", "/");

		this.addUserToQueue(userParam, client);

		console.log("connected: ", client.id);
		return ;
	} 

	handleDisconnect(client: Socket) {
		const user = this.queue1v1.find((queuer) => queuer.socketId === client.id);
		if (!user)
			return ;
		this.queue1v1 = this.queue1v1.filter((queuer) => queuer.socketId !== client.id);
		return ;
	}
}