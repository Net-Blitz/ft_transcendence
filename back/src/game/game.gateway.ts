import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { SocketUser } from "./dto";
import * as jwt from 'jsonwebtoken'
import { Game } from "@prisma/client";

function getRandomDirection() {
	const range = 0.70;
	let first = (Math.random() * range - range / 2) * Math.PI;
	let second = Math.random() * range - range / 2;
	second = (second + (1 - (range / 2)) * Math.sign(second)) * Math.PI ;
	return Math.random() > 0.5 ? first : second;
}

const GameRatio = 0.5;
class Rooms {
	
	ball_x: number;
	ball_y: number;
	ball_speed_x: number;
	ball_speed_y: number;
	ball_size: number;
	ball_direction: number;
	player1_x: number;
	player1_y: number;
	player1_size: number;
	player1_score: number;
	player2_x: number;
	player2_y: number;
	player2_size: number;
	player2_score: number;
	player_speed: number;
	constructor() {

		this.ball_x = 0.5;
		this.ball_y = 0.5;
		this.ball_speed_x = 0.012 * GameRatio;
		this.ball_speed_y = 0.012;
		this.ball_size = 0.05;
		this.ball_direction = getRandomDirection();
		
		this.player1_x = 0.006;
		this.player1_y = 0.5;
		this.player1_size = 0.3;
		this.player1_score = 0;
		
		this.player2_x = 0.994;
		this.player2_y = 0.5;
		this.player2_size = 0.3;
		this.player2_score = 0;
		
		this.player_speed = 0.05;
	}

	resetBall() {
		this.ball_x = 0.5;
		this.ball_y = 0.5;
		this.ball_direction = getRandomDirection();
		this.ball_speed_x = 0.012 * GameRatio;
		this.ball_speed_y = 0.012;
		this.ball_size = 0.05;
	}
}

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
	
	private async moveBall(gameState: Rooms, room: number) {
		gameState.ball_x += gameState.ball_speed_x * Math.cos(gameState.ball_direction) ;
		gameState.ball_y += gameState.ball_speed_y * Math.sin(gameState.ball_direction);
		if (gameState.ball_y < 0 || gameState.ball_y > 1) {
			gameState.ball_direction = -gameState.ball_direction;
			if (gameState.ball_y < 0)
				gameState.ball_y = -gameState.ball_y;
			else
				gameState.ball_y = 2 - gameState.ball_y;
		}
		if (gameState.ball_x < 0 || gameState.ball_x > 1) {
			if (gameState.ball_x < 0)
				gameState.player2_score++;
			else
				gameState.player1_score++;
			gameState.resetBall();
			await this.prisma.game.update({
				where: {
					id: room
				},
				data: {
					score1: gameState.player1_score,
					score2: gameState.player2_score
				}
			})
			//this.server.to("game-" + room).emit("scoreUpdate", {player1_score: gameState.player1_score, player2_score: gameState.player2_score});
		}
	}
	
	private checkEnd(gameState: Rooms) {
		if ((gameState.player1_score >= 10 || gameState.player2_score >= 10) && Math.abs(gameState.player1_score - gameState.player2_score) >= 2)
			return true
		return false
	}

	private movePlayer(gameState: Rooms, room: number) {
		const player1 = this.ConnectedSockets.find((socket) => socket.roomName === "game-" + room && socket.state === "player1");
		const player2 = this.ConnectedSockets.find((socket) => socket.roomName === "game-" + room && socket.state === "player2");

		if (player1) {
			if (player1.up == 1) {
				gameState.player1_y -= gameState.player_speed;
				if (gameState.player1_y < 0)
					gameState.player1_y = 0;
			}
			if (player1.down == 1) {
				gameState.player1_y += gameState.player_speed;
				if (gameState.player1_y > 1)
					gameState.player1_y = 1;
			}
		}
		if (player2) {
			if (player2.up == 1) {
				gameState.player2_y -= gameState.player_speed;
				if (gameState.player2_y < 0)
					gameState.player2_y = 0;
			}
			if (player2.down == 1) {
				gameState.player2_y += gameState.player_speed;
				if (gameState.player2_y > 1)
					gameState.player2_y = 1;
			}
		}
	}

	async startGame(room: number, game: Game) {
		let gameState = new Rooms();
		let end = false;

		while (this.ConnectedSockets.findIndex((socket) => socket.roomName === "game-" + room && socket.state === "player1") === -1 ||
				this.ConnectedSockets.findIndex((socket) => socket.roomName === "game-" + room && socket.state === "player2") === -1) {
			await this.sleep(1000);
		}
		await this.prisma.game.update({
			where: { id: room },
			data: { score1: 0, score2: 0, state: "PLAYING"}
		})
		//faire une animation parce que c'est jolie

		while (end === false) {
			this.movePlayer(gameState, room);
			await this.moveBall(gameState, room);
			this.server.to("game-" + room).emit("gameState", gameState);
			end = this.checkEnd(gameState);
			if (end === true)
				break;
			await this.sleep(20)
		}
		await this.prisma.game.update({
			where: { id: room },
			data: { state: "ENDED"}
		})

		//set win/loss/stats
		await this.prisma.user.update({
			where: { id: game.user1Id },
			data: { state: "ONLINE"}
		})
		
		await this.prisma.user.update({
			where: { id: game.user2Id },
			data: { state: "ONLINE"}
		})
		//disconnect all socket to the room associated and navigate to the end page
		this.server.to("game-" + room).emit("endGame", {player1_score: gameState.player1_score, player2_score: gameState.player2_score});
	}

	private async checkAndSave(client: Socket) { //I don'know how to redirect the user if request doesnt match
		const cookies = client.handshake.headers.cookie; //maybe trhow an error
		const token = cookies.split("jwt=")[1].split(";")[0];
		const userCookie = JSON.parse(atob(token.split(".")[1]));
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err)
				return ;
		});

		if (!client.handshake.query || !client.handshake.query.room)
			return ;
		const query = client.handshake.query.room;
		const room = parseInt(query[0])

		const user = await this.prisma.user.findUnique({where: {login: userCookie.login}
		});

		if (!user)
			return;

		const game = await this.prisma.game.findUnique({where: {id: room}});

		if (!game || game.state == "ENDED")
			return;

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
			client.leave(sockUser.roomName);
			this.server.to(sockUser.socketId).emit("close");
			this.server.socketsLeave(sockUser.socketId);
			this.ConnectedSockets.splice(this.ConnectedSockets.findIndex(x => x.login === user.login), 1);
		}
		
		this.ConnectedSockets.push({
			prismaId: user.id,
			socketId: client.id,
			login: userCookie.login,
			roomName: "game-" + room,
			state: state,
			up: 0,
			down: 0
		});
		client.join("game-" + room);
		if (this.GamePlaying.findIndex(x => x === room) === -1)
		{
			this.GamePlaying.push(room);
			this.startGame(room, game);
		}
		return "OK";
	}

	async handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
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
		console.log(`Client disconnected: ${client.id}`);
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
