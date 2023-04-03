import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { QueueObject, QueueState, GameMatched } from "./dto";
import { QueueService } from "./queue.service";



@WebSocketGateway({namespace:"queue", cors: {origin: "*"}})
export class QueueGateway {

	@WebSocketServer()
	server: Server;

	queue1v1: QueueObject[]
	queue2v2: QueueObject[]
	gameMatched: GameMatched[]

	constructor(private prisma: PrismaService) {
		this.queue1v1 = [];
		this.queue2v2 = [];
		this.gameMatched = [];
		this.runQueue();
	}
	
	async sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	checkQueue() {

		console.log ("Queue 1v1: ", this.queue1v1);
		if (this.queue1v1.length >= 2)
		{
			const player1 = this.queue1v1.shift();
			const player2 = this.queue1v1.shift();
			this.gameMatched.push({player1, player2, time: Date.now()});
			this.server.to(player1.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(player2.socketId).emit("GamePopUpSetup", {message: "show"});
		}
	}

	checkOneDeclined(match : GameMatched) {
		if (match.player1.state === QueueState.Declined || match.player2.state === QueueState.Declined)
		{
			if (match.player1.state === QueueState.Searching || match.player1.state === QueueState.Accepted)
			{
				match.player1.state = QueueState.Waiting;
				this.queue1v1.push(match.player1);
				this.server.to(match.player1.socketId).emit("GamePopUpResponse", {message: "KO", reason: "OtherDeclined"});
			}
			else
				this.server.to(match.player1.socketId).emit("GamePopUpResponse", {message: "KO"});
			if (match.player2.state === QueueState.Searching || match.player2.state === QueueState.Accepted)
			{
				match.player1.state = QueueState.Waiting;
				this.queue1v1.push(match.player2);
				this.server.to(match.player2.socketId).emit("GamePopUpResponse", {message: "KO", reason: "OtherDeclined"});
			}
			else
				this.server.to(match.player2.socketId).emit("GamePopUpResponse", {message: "KO"});
			return (true);
		}
		return (false);
	}

	async checkTwoAccepted(match : GameMatched) {
		if (match.player1.state === QueueState.Accepted && match.player2.state === QueueState.Accepted)
		{
			await this.prisma.user.updateMany({
				where: {login: {in: [match.player1.login, match.player2.login],}}, 
				data: {state: "PLAYING",}});
			
			await this.prisma.game.create({
				data: {user1Id: match.player1.id, user2Id: match.player2.id,}
			});

			const game = await this.prisma.game.findFirst({
				where: {
					state: "CREATING",
					AND: [{ user1Id: match.player1.id }, { user2Id: match.player2.id }]}
				});

			this.server.to(match.player1.socketId).emit("GamePopUpResponse", {message: "OK", login: match.player1.login, opponent: match.player1.login, gameId: game.id});
			this.server.to(match.player2.socketId).emit("GamePopUpResponse", {message: "OK", login: match.player2.login, opponent: match.player1.login, gameId: game.id});
			return (true);
		}
		return (false);
	}

	checkTimeOut(match : GameMatched) {
		if (Date.now() - match.time > 20500)
		{
			if (match.player1.state === QueueState.Accepted)
			{
				match.player1.state = QueueState.Searching;
				this.queue1v1.push(match.player1);
				this.server.to(match.player1.socketId).emit("GamePopUpResponse", {message: "KO", reason: "OtherDeclined"});
			}
			else
				this.server.to(match.player1.socketId).emit("GamePopUpResponse", {message: "KO"});
			if (match.player2.state === QueueState.Accepted)
			{
				match.player2.state = QueueState.Searching;
				this.queue1v1.push(match.player2);
				this.server.to(match.player2.socketId).emit("GamePopUpResponse", {message: "KO", reason: "OtherDeclined"});
			}
			else
				this.server.to(match.player2.socketId).emit("GamePopUpResponse", {message: "KO"});

			return (true);
		}
		return (false);
	}

	async checkMatch() {
		let match: GameMatched;

		for (let i = 0; i < this.gameMatched.length; i++)
		{
			match = this.gameMatched[i];
			if (this.checkOneDeclined(match) || await this.checkTwoAccepted(match) || this.checkTimeOut(match))
			{
				this.gameMatched.splice(i, 1);
				break ;
			}
		}
	}

	async runQueue() {
		while (1)
		{
			this.checkQueue();
			
			await this.checkMatch();

			await this.sleep(3000);
		}
	}


	async addUserToQueue(userParam: any, client: Socket) {
		const prismaUser = await this.prisma.user.findFirst({where: {login: userParam.login}});
		if (!prismaUser)
			return client.emit("close");
		const user = this.queue1v1.find((queuer) => queuer.login === userParam.login);
		if (user)
		{
			user.socketId = client.id;
			user.mode = userParam.mode;
			user.bonus1 = (userParam.bonus1 === undefined) ? false : true;
			user.bonus2 = (userParam.bonus2 === undefined) ? false : true;
			user.timeData = Date.now();
			user.state = QueueState.Searching;
		}
		else
		{
			this.queue1v1.push({
			id: prismaUser.id,
			login: userParam.login,
			socketId: client.id,
			mode: userParam.mode, elo: prismaUser.elo,
			bonus1: (userParam.bonus1 === undefined) ? false : true,
			bonus2: (userParam.bonus2 === undefined) ? false : true,
			timeData: Date.now(),
			state : QueueState.Searching,
			});
		}
	}

	handleConnection(client: Socket) { 
		console.log("Queue Server Connection", client.id);
		
		return ;
	} 

	handleDisconnect(client: Socket) {

		console.log(client.id);

		console.log("Queue Server Disconnection");
		return ;
	}

	@SubscribeMessage("ConnectToQueue")
	connectToQueue(@ConnectedSocket() client: Socket, @MessageBody() userParam: any) {
		console.log(userParam)
		if (userParam && userParam.login === undefined || userParam.mode === undefined)
			return ;
		
		this.addUserToQueue(userParam, client);
		
		console.log("ConnectToQueue: ", client.id)
	}

	@SubscribeMessage("DisconnectFromQueue")
	disconnectFromQueue(@ConnectedSocket() client: Socket) {
		const user = this.queue1v1.find((queuer) => queuer.socketId === client.id);
		if (!user)
			return ;
		this.queue1v1 = this.queue1v1.filter((queuer) => queuer.socketId !== client.id);


		console.log("DisconnectFromQueue: ", client.id)
	}

	@SubscribeMessage("AcceptGame")
	acceptGame(@ConnectedSocket() client: Socket) {
		const gameMatch = this.gameMatched.find((queuer) => (queuer.player1.socketId === client.id || queuer.player2.socketId === client.id));
		if (!gameMatch)
			return ;
		
		if (gameMatch.player1.socketId === client.id && gameMatch.player1.state === QueueState.Searching)
			gameMatch.player1.state = QueueState.Accepted;

		if (gameMatch.player2.socketId === client.id && gameMatch.player2.state === QueueState.Searching)
			gameMatch.player2.state = QueueState.Accepted;
	}

	@SubscribeMessage("DeclineGame")
	declineGame(@ConnectedSocket() client: Socket) {
		const gameMatch = this.gameMatched.find((match) => (match.player1.socketId === client.id || match.player2.socketId === client.id));

		if (!gameMatch)
			return ;

		if (gameMatch.player1.socketId === client.id && gameMatch.player1.state === QueueState.Searching)
			gameMatch.player1.state = QueueState.Declined;

		if (gameMatch.player2.socketId === client.id && gameMatch.player2.state === QueueState.Searching)
			gameMatch.player2.state = QueueState.Declined;
	}
}