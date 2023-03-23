import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { SocketUser } from "./dto";
import * as jwt from 'jsonwebtoken'
import { Game, User } from "@prisma/client";
import { GameRoom } from "./class";

@WebSocketGateway({namespace:"game", cors: {origin: "*"}})
export class GameGateway {
	constructor(private prisma: PrismaService) {}
	
	@WebSocketServer()
	server: Server;
	
	ConnectedSockets: SocketUser[] = [];
	GamePlaying = [];

	async sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	private getPlayerSocket(room: number) {
		const player1 = this.ConnectedSockets.find((socket) =>
				socket.roomName === "game-" + room
				&& socket.state === "player1");
		const player2 = this.ConnectedSockets.find((socket) =>
			socket.roomName === "game-" + room &&
			socket.state === "player2");
		return ({player1, player2})
	}

	private async moveBall(gameRoom: GameRoom, room: number) {

		let increment_x = gameRoom.ball.speed_x * Math.cos(gameRoom.ball.direction);
		let increment_y = gameRoom.ball.speed_y * Math.sin(gameRoom.ball.direction);
		
		gameRoom.checkBallBounce(increment_x);
		
		gameRoom.incrementBallY(increment_y);

		if (gameRoom.checkBallScore()) {
			await this.prisma.game.update({
				where: { id: room },
				data: { score1: gameRoom.player1.score, score2: gameRoom.player2.score }
			})
		}
	}

	private movePlayer(gameRoom: GameRoom, room: number) {
		let players = this.getPlayerSocket(room);

		gameRoom.updatePlayerPosition(players.player1);
		gameRoom.updatePlayerPosition(players.player2);
	}

	private async waitingPlayerConnection(room: number) {
		while (this.ConnectedSockets.findIndex((socket) => socket.roomName === "game-" + room && socket.state === "player1") === -1 ||
				this.ConnectedSockets.findIndex((socket) => socket.roomName === "game-" + room && socket.state === "player2") === -1) {
				//console.log(this.ConnectedSockets);	
				await this.sleep(1000); // can add a timeout here --> if timeout, delete the game or make cancel state
		}
		await this.prisma.game.update({
			where: { id: room },
			data: { score1: 0, score2: 0, state: "PLAYING"}
		})
		//faire une animation parce que c'est jolie // probablement du front enfaite
	}

	private async gameRun(gameRoom: GameRoom, room: number) {
		while (true) {
			this.movePlayer(gameRoom, room);
			await this.moveBall(gameRoom, room);
			this.server.to("game-" + room).emit("gameState", gameRoom.getGameRoomInfo());
			if (gameRoom.checkEndGame())
				break;
			await this.sleep(5)
		}
	}

	private async gameEnd(gameRoom: GameRoom, room: number) {
		await this.prisma.game.update({
			where: { id: room },
			data: { state: "ENDED"}
		})

		const game = await this.prisma.game.findUnique({where: {id: room}});	
		if (!game)
			return (false);
	
		//set win/loss/stats
		if (gameRoom.player1.score > gameRoom.player2.score)
		{
			await this.prisma.user.update({
				where: { id: game.user1Id },
				data: { state: "ONLINE", wins: { increment: 1 } }})
			await this.prisma.user.update({
				where: { id: game.user2Id },
				data: { state: "ONLINE", losses: { increment: 1 } }})
		}
		else
		{
			await this.prisma.user.update({
				where: { id: game.user2Id },
				data: { state: "ONLINE",wins: { increment: 1 } }})
			await this.prisma.user.update({
				where: { id: game.user1Id },
				data: { state: "ONLINE", losses: { increment: 1 } }})
		}
		
		this.GamePlaying.splice(this.GamePlaying.indexOf(room), 1);
		//disconnect all socket to the room associated and navigate to the end page
		this.server.to("game-" + room).emit("close", {player1_score: gameRoom.player1.score, player2_score: gameRoom.player2.score});
		//jE PENSE QU'IL FAUDRAIT AUSSI DELETE ROOM
		

	}

	async gameLoop(room: number) {
		let gameRoom = new GameRoom(room);

		await this.waitingPlayerConnection(room);

		await this.gameRun(gameRoom, room);

		await this.gameEnd(gameRoom, room);
	}

	private async checkUserConnection(client: Socket) {
	
		const cookies = client.handshake.headers.cookie;
		const token = cookies.split("jwt=")[1].split(";")[0];
		const userCookie = JSON.parse(atob(token.split(".")[1]));
	//	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { if (err) return (null); });

		if (!client.handshake.query || !client.handshake.query.room)
			return (null);
		
		const user = await this.prisma.user.findUnique({where: {login: userCookie.login}});
		if (!user)
			return (null);
		const room = parseInt(client.handshake.query.room.toString());	
		
		const game = await this.prisma.game.findUnique({where: {id: room}});	
		if (!game || game.state == "ENDED")
			return (null);
		return ({login: userCookie.login, user, game, room})
	}

	private setupUserSocket(client: Socket, user: User, game: Game, userLogin: string, room: number) {
		let state : string;

		if (game.user1Id == user.id)
		state = "player1";
		else if (game.user2Id == user.id)
			state = "player2";	
		else
			state = "spectator";

		const sockUser : SocketUser = this.ConnectedSockets.find(x => x.login === user.login);

		if (sockUser != null)
		{
			if (sockUser.roomName !== "game-" + room)
			{
				this.server.to(sockUser.socketId).emit("close");
				sockUser.roomName = "game-" + room;
				sockUser.state = state;
				sockUser.up = 0;
				sockUser.down = 0;
				sockUser.socketId = client.id;
				client.join("game-" + room);
			}
		}
		else
		{
			this.ConnectedSockets.push({
				prismaId: user.id,
				socketId: client.id,
				login: userLogin,
				roomName: "game-" + room,
				state: state,
				up: 0,
				down: 0
			});
			client.join("game-" + room);
		}
	}


	private async checkAndSave(client: Socket) {

		let userCheck = await this.checkUserConnection(client);
		
		if (userCheck === null)
		{
			client.emit("BadConnection"); 
			return (false);
		}
		
		this.setupUserSocket(client, userCheck.user, userCheck.game, userCheck.login, userCheck.room);
		
		if (userCheck.game.state === "CREATING")// || userCheck.game.state === "PLAYING")
			client.emit("gameState", {
				ball_x: 0.5,
				ball_y: 0.5,
				ball_size: 0.05,
				
				player1_x: 0.006,
				player1_y: 0.5,
				player1_size: 0.3,
				player1_score: 0,
	
				player2_x: 0.994,
				player2_y: 0.5,
				player2_size: 0.3,
				player2_score: 0,
			});
		if (this.GamePlaying.findIndex(x => x === userCheck.room) === -1)
		{
			this.GamePlaying.push(userCheck.room);
			this.gameLoop(userCheck.room);
		}
		return (true);
	}
 
	async handleConnection(client: Socket) { 
		return await this.checkAndSave(client)
	}

	handleDisconnect(client: Socket) {
		const sockUser : SocketUser = this.ConnectedSockets.find(x => x.socketId === client.id);
		if (sockUser != null)
		{
			client.leave(sockUser.roomName);
			this.server.to(sockUser.socketId).emit("close");
			this.ConnectedSockets.splice(this.ConnectedSockets.findIndex(x => x.socketId === client.id), 1);
		}
		return ;
	}

	@SubscribeMessage("keyPress")
	HandleKeyPress(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		const sockUser : SocketUser = this.ConnectedSockets.find(x => x.socketId === client.id);
		if (sockUser != null)
		{
			if (data === "UP") {
				sockUser.up = 1;
				if (sockUser.down === 1)
					sockUser.down = 2;
			}
			else if (data === "DOWN") {
				sockUser.down = 1;
				if (sockUser.up === 1)
					sockUser.up = 2;
			}
		}
	}

	@SubscribeMessage("keyRelease")
	HandleKeyRelease(@MessageBody() data: string, @ConnectedSocket() client: Socket) {
		const sockUser : SocketUser = this.ConnectedSockets.find(x => x.socketId === client.id);
		if (sockUser != null)
		{
			if (data === "UP") {
				sockUser.up = 0;
				if (sockUser.down === 2)
					sockUser.down = 1;
			}
			else if (data === "DOWN") {
				sockUser.down = 0;
				if (sockUser.up === 2)
					sockUser.up = 1;
			}
		}
	}
}
