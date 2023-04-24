import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";
import { QueueObject, QueueState, GameMatched, QueueGroup } from "./dto";
import * as jwt from "jsonwebtoken";

import { QueueService } from "./queue.service";

@WebSocketGateway({namespace:"queue", cors: {origin: "*"}})
export class QueueGateway {

	@WebSocketServer()
	server: Server;

	groups: QueueGroup[];
	queue1v1: QueueGroup[]
	queue2v2: QueueGroup[]
	queueFFA: QueueGroup[]
	gameMatched: GameMatched[]

	constructor(private prisma: PrismaService) {
		this.queue1v1 = [];
		this.queue2v2 = [];
		this.queueFFA = [];
		this.gameMatched = [];
		this.groups = [];
		this.runQueue();
	}
	
	async sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	checkQueue() {
		if (this.queue1v1.length >= 2)
		{
			const group1 = this.queue1v1.shift();
			const group2 = this.queue1v1.shift();
			this.gameMatched.push({group1, group2, group3: null, group4: null, time: Date.now()});
			this.server.to(group1.player1.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group2.player1.socketId).emit("GamePopUpSetup", {message: "show"});
		}
	}

	oneGroupDeclined(group: QueueGroup) {
		if (!group)
			return (false);
		if ((group.player1 && group.player1.state === QueueState.Declined)
			|| (group.player2 && group.player2.state === QueueState.Declined)
			|| (group.player3 && group.player3.state === QueueState.Declined)
			|| (group.player4 && group.player4.state === QueueState.Declined))
			return (true);
		return (false);
	}

	getAllPlayers(match: GameMatched) {
		const players = [];
		for (const group of [match.group1, match.group2, match.group3, match.group4])
		{
			if (group)
			{
				for (const player of [group.player1, group.player2, group.player3, group.player4])
				{
					if (player)
						players.push(player);
				}
			}
		}
		return (players);
	}

	checkOneDeclined(match : GameMatched) {
		if (this.oneGroupDeclined(match.group1) || this.oneGroupDeclined(match.group2) || this.oneGroupDeclined(match.group3) || this.oneGroupDeclined(match.group4))
		{
			for (const group of [match.group1, match.group2, match.group3, match.group4])
			{
				if (group)
				{
					if (!this.oneGroupDeclined(group))
					{
						console.log("group accepted")
						this.queue1v1.push(group);
					}
					else
					{
						console.log("group declined")
						this.groups.push(group);
					}
					for (const player of [group.player1, group.player2, group.player3, group.player4])
					{
						if (player && this.oneGroupDeclined(group))
						{
							player.state = QueueState.Searching;
							this.server.to(player.socketId).emit("GamePopUpResponse", {message: "KO"});
						}
						if (player && !this.oneGroupDeclined(group))
						{
							player.state = QueueState.Searching;
							this.server.to(player.socketId).emit("GamePopUpResponse", {message: "KO", reason: "OtherDeclined"});
						}
					}

				}
			}
			return (true);
		}
		return (false); 
	}
 
	oneGroupAccepted(group: QueueGroup) { 
		if (!group)
			return (true);
		if ((!group.player1 || group.player1.state === QueueState.Accepted)
			&& (!group.player2 || group.player2.state === QueueState.Accepted)
			&& (!group.player3 || group.player3.state === QueueState.Accepted)
			&& (!group.player4 || group.player4.state === QueueState.Accepted))
			return (true);
		
		return (false);
	}


	async checkAllAccepted(match : GameMatched) {
		if (this.oneGroupAccepted(match.group1) && this.oneGroupAccepted(match.group2) && this.oneGroupAccepted(match.group3) && this.oneGroupAccepted(match.group4))
		{
			const players = this.getAllPlayers(match);
			await this.prisma.user.updateMany({
				where: {login: {in: players.map(player => player.login)}}, 
				data: {state: "PLAYING"}});
			
			await this.prisma.game.create({ 
				data: {user1Id: players[0].id, user2Id: players[1].id,}
			});

			const game = await this.prisma.game.findFirst({ 
				where: {
					state: "CREATING",
					AND: [{ user1Id: players[0].id }, { user2Id: players[1].id }]}
				});

			this.server.to(players[0].socketId).emit("GamePopUpResponse", {message: "OK", login: players[0].login, opponent: players[0].login, gameId: game.id});
			this.server.to(players[1].socketId).emit("GamePopUpResponse", {message: "OK", login: players[1].login, opponent: players[0].login, gameId: game.id});
			players[0].state = QueueState.Searching;
			players[1].state = QueueState.Searching;
			if (match.group1)
				this.groups.push(match.group1);
			if (match.group2)
				this.groups.push(match.group2);
			if (match.group3)
				this.groups.push(match.group3);
			if (match.group4)
				this.groups.push(match.group4);
			return (true);
		}
		return (false);
	}

	oneGroupWaiting(group: QueueGroup) {
		if (!group)
			return (false);
		if ((group.player1 && group.player1.state === QueueState.Searching)
			|| (group.player2 && group.player2.state === QueueState.Searching)
			|| (group.player3 && group.player3.state === QueueState.Searching)
			|| (group.player4 && group.player4.state === QueueState.Searching))
			return (true);
		return (false);
	}

	async checkTimeOut(match : GameMatched) {
		if (Date.now() - match.time > 20500)
		{
			for (const group of [match.group1, match.group2, match.group3, match.group4])
			{
				if (this.oneGroupWaiting(group))
				{
					for (const player of [group.player1, group.player2, group.player3, group.player4])
					{
						if (player)
						{
							player.state = QueueState.Searching;
							await this.prisma.user.update({where: {login: player.login}, data: {state: "ONLINE"}});
							this.server.to(player.socketId).emit("GamePopUpResponse", {message: "KO", reason: "TimeOut"});
						}
					}
					this.groups.push(group);
				}
				else if (group)
				{
					for (const player of [group.player1, group.player2, group.player3, group.player4])
					{
						if (player)
						{
							player.state = QueueState.Searching;
							this.server.to(player.socketId).emit("GamePopUpResponse", {message: "KO", reason: "OtherDeclined"});
						}
					}
					this.queue1v1.push(group);
				}
			}
			return (true);
		}
		return (false);
	}

	async checkMatch() {
		let match: GameMatched;

		for (let i = 0; i < this.gameMatched.length; i++)
		{
			match = this.gameMatched[i];
			if (this.checkOneDeclined(match) || await this.checkAllAccepted(match) || await this.checkTimeOut(match))
			{
				this.gameMatched.splice(i, 1);
				break ;
			}
		}
	}

	async runQueue() {
		while (1)
		{
			// console.log("This is the queue: ", this.queue1v1);
			console.log("===Groups====")
			for (const group of this.groups)
				console.log (group.player1.login, (!group.player2 || group.player2.login), (!group.player3 || group.player3.login), (!group.player4 || group.player4.login)) 
			console.log("=============");
			this.checkQueue();
			
			await this.checkMatch();

			await this.sleep(3000);
		}
	}


	//async addUserToQueue(userParam: any, client: Socket) {
	//	const prismaUser = await this.prisma.user.findFirst({where: {login: userParam.login}});
	//	if (!prismaUser)
	//		return client.emit("close");
	//	const user = this.queue1v1.find((queuer) => queuer.login === userParam.login);
	//	if (user)
	//	{
	//		if (user.socketId !== client.id)
	//		{
	//			user.socketId = client.id;
	//			user.mode = userParam.mode;
	//			user.bonus1 = (userParam.bonus1 === undefined) ? false : true;
	//			user.bonus2 = (userParam.bonus2 === undefined) ? false : true;
	//			user.timeData = Date.now();
	//			user.state = QueueState.Searching;
	//		}
	//	}
	//	else
	//	{
	//	this.queue1v1.push({
	//		id: prismaUser.id,
	//		login: userParam.login,
	//		socketId: client.id,
	//		mode: userParam.mode,
	//		avatar: prismaUser.avatar,
	//		elo: prismaUser.elo,
	//		bonus1: (userParam.bonus1 === undefined) ? false : true,
	//		bonus2: (userParam.bonus2 === undefined) ? false : true,
	//		timeData: Date.now(),
	//		state : QueueState.Searching,
	//		});
	//	}
	//}

	findInQueue(socketId: string) {
		for (const queuer of this.queue1v1)
		{
			if (queuer.player1.socketId === socketId)
				return (queuer.player1);
		}
		return (null);
	}

	findMyGroup(socketId: string) {
		for (const queuer of this.queue1v1)
		{
			if (queuer.player1.socketId === socketId || (queuer.player2 && queuer.player2.socketId === socketId) || (queuer.player3 && queuer.player3.socketId === socketId) || (queuer.player4 && queuer.player4.socketId === socketId))
				return (queuer);
		}
		return (null);
	}


	groupCount(group: QueueGroup) {
		let count = 0;
		if (group.player1)
			count++;
		if (group.player2)
			count++;
		if (group.player3)
			count++;
		if (group.player4)
			count++;
		return (count);
	}

	add1v1GroupToQueue(group: QueueGroup, groupParam: any) {
		if (this.groupCount(group) === 1)
		{
			group.timeData = Date.now();
			group.mode = groupParam.mode;
			this.queue1v1.push(group)
			this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== group.player1.socketId);
		}
		else if (this.groupCount(group) === 2)
		{
			this.gameMatched.push({group1: group, group2: null, group3: null, group4: null, time: Date.now()});
			this.server.to(group.player1.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player2.socketId).emit("GamePopUpSetup", {message: "show"});
			this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== group.player1.socketId);
		}
		else
			return (false);
		return (true);
	}

	add2v2GroupToQueue(group: QueueGroup, groupParam: any) {
		if (this.groupCount(group) === 1 || this.groupCount(group) === 2)
		{
			group.timeData = Date.now();
			group.mode = groupParam.mode;
			this.queue2v2.push(group);
			this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== group.player1.socketId);
		}
		else if (this.groupCount(group) === 4)
		{
			this.server.to(group.player1.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player2.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player3.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player4.socketId).emit("GamePopUpSetup", {message: "show"});
			this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== group.player1.socketId);

		}
		else 
			return (false);
	}

	addFFAGroupToQueue(group: QueueGroup, groupParam: any) {
		if (this.groupCount(group) === 1 || this.groupCount(group) === 2 || this.groupCount(group) === 3)
		{
			group.timeData = Date.now();
			group.mode = groupParam.mode;
			this.queueFFA.push(group);
			this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== group.player1.socketId);
		}
		else if (this.groupCount(group) === 4)
		{
			this.gameMatched.push({group1: group, group2: null, group3: null, group4: null, time: Date.now()});
			this.server.to(group.player1.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player2.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player3.socketId).emit("GamePopUpSetup", {message: "show"});
			this.server.to(group.player4.socketId).emit("GamePopUpSetup", {message: "show"});
			this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== group.player1.socketId);
		}
		else
			return (false);
	}

	addGroupToQueue(group: QueueGroup, groupParam: any) {
		if (groupParam.mode === "1v1")
			return (this.add1v1GroupToQueue(group, groupParam));
		if (groupParam.mode === "2v2")
			return (this.add2v2GroupToQueue(group, groupParam));
		if (groupParam.mode === "FFA")
			return (this.addFFAGroupToQueue(group, groupParam));
		return (false);
			
	}

	leaveGroup(client: Socket, login: string) {
		let me: QueueObject;
		
		for (const group of this.groups)
		{
			if (group.player1.socketId === client.id || (login && group.player1.login === login))
			{
				me = group.player1;
				this.server.to(group.player1.socketId).emit("closeGroup");
				if (group.player2)
				{
					this.recreateGroup(group.player2);
					this.server.to(group.player2.socketId).emit("closeGroup");
				}
				if (group.player3)
				{
					this.recreateGroup(group.player3);
					this.server.to(group.player3.socketId).emit("closeGroup");
				}
				if (group.player4)
				{
					this.recreateGroup(group.player4);
					this.server.to(group.player4.socketId).emit("closeGroup");
				}
				if (login)
					this.groups = this.groups.filter((groupe) => groupe.player1.login !== login);
				else
					this.groups = this.groups.filter((groupe) => groupe.player1.socketId !== client.id);
				
				return me;
			}
			if (group.player2 && ((group.player2.socketId === client.id) || (login && group.player2.login === login)))
			{
				me = group.player2;
				group.player2 = group.player3;
				group.player3 = group.player4;
				group.player4 = null;
			}
			else if (group.player3 && ((group.player3.socketId === client.id) || (login && group.player3.login === login)))
			{
				me = group.player3;
				group.player3 = group.player4;
				group.player4 = null;
			}
			else if (group.player3 && ((group.player3.socketId === client.id) || (login && group.player3.login === login)))
			{
				me = group.player4; 
				group.player4 = null;
			}	
			else
				continue ;
			this.server.to(group.player1.socketId).emit("leaveGroup", {group: group});
			if (group.player2)
				this.server.to(group.player2.socketId).emit("leaveGroup", {group: group});
			if (group.player3)
				this.server.to(group.player3.socketId).emit("leaveGroup", {group: group});
			if (group.player4)
				this.server.to(group.player4.socketId).emit("leaveGroup", {group: group}); 
			
			console.log("me: ", me);
			return me;
		}
	}

	async joinGroup(client: Socket, me: QueueObject, groupParam: any) {
		for (const group of this.groups)
		{
			if (group.player1.login === groupParam.groupLogin)
			{
				if (group.player2 === null)
					group.player2 = me;
				else if (group.player3 === null)
					group.player3 = me;
				else if (group.player4 === null)
					group.player4 = me;
				else
					return client.emit("groupFull");

				this.server.to(group.player1.socketId).emit("JoinGroupResponse", {message: "OK", group: group});
				if (group.player2)
					this.server.to(group.player2.socketId).emit("JoinGroupResponse", {message: "OK", group: group});
				if (group.player3)
					this.server.to(group.player3.socketId).emit("JoinGroupResponse", {message: "OK", group: group});
				if (group.player4)
					this.server.to(group.player4.socketId).emit("JoinGroupResponse", {message: "OK", group: group});
				break ;
			}
		}
	}

	recreateGroup(group: QueueObject) {
		this.groups.push( {player1: group, player2: null, player3: null, player4: null, mode: null, map: null, timeData: null});
	}

	async createGroup(login: string, client: Socket) {
		const prismaUser = await this.prisma.user.findFirst({where: {login: login}});
		if (!prismaUser)
			return client.emit("close");
		this.leaveGroup(client, login);
		this.groups.push( {player1:{
			id: prismaUser.id,
			login: login,
			socketId: client.id,
			avatar: prismaUser.avatar,
			elo: prismaUser.elo,
			state : QueueState.Searching,
			}, player2: null, player3: null, player4: null, mode: null, map: null, timeData: null});
	}

	async handleConnection(client: Socket) { 
		console.log("Queue Server Connection", client.id);
		const cookie = client.handshake.headers.cookie;
		if (!cookie)
			return ;
		const parsedCookie = cookie.split("; ").find((cook) => cook.startsWith("jwt=")).replace("jwt=", "");
		const decoded: any = jwt.verify(parsedCookie, process.env.JWT_SECRET);
		this.createGroup(decoded.login, client);
		return ;
	} 
 
	async handleDisconnect(client: Socket) { 
		console.log("Queue Server Disconnection", client.id);
		this.leaveGroup(client, undefined);
		const user = this.findInQueue(client.id);
		if (!user)
			return ;
		this.queue1v1 = this.queue1v1.filter((queuer) => queuer.player1.socketId !== client.id);
		await this.prisma.user.update({where: {login: user.login},
			data: {state: "ONLINE"}});
		return ;
	}

	@SubscribeMessage("ConnectToQueue")
	async connectToQueue(@ConnectedSocket() client: Socket, @MessageBody() groupParam: any) {
		const groupUser = this.groups.find((group) => group.player1.socketId === client.id);
		if (!groupUser)
			return ;
		
		let ret = this.addGroupToQueue(groupUser, groupParam);
		if (!ret)
			return client.emit("notPossible");

		await this.prisma.user.update({
			where: {login: groupUser.player1.login},
			data: {state: "SEARCHING"}
		});
		if (groupUser.player2)
			await this.prisma.user.update({
				where: {login: groupUser.player2.login},
				data: {state: "SEARCHING"}
			});
		if (groupUser.player3)
			await this.prisma.user.update({
				where: {login: groupUser.player3.login},
				data: {state: "SEARCHING"}
			});
		if (groupUser.player4)
			await this.prisma.user.update({
				where: {login: groupUser.player4.login},
				data: {state: "SEARCHING"}
			});

		//const user = this.queue1v1.find((queuer) => queuer.socketId === client.id);
		//if (!user)
		//	return ;
		this.server.to(groupUser.player1.socketId).emit("ConnectToQueueResponse", {message: "OK", user: groupUser});
		if (groupUser.player2)
			this.server.to(groupUser.player2.socketId).emit("ConnectToQueueResponse", {message: "OK", user: groupUser});
		if (groupUser.player3)
			this.server.to(groupUser.player3.socketId).emit("ConnectToQueueResponse", {message: "OK", user: groupUser});
		if (groupUser.player4)
			this.server.to(groupUser.player4.socketId).emit("ConnectToQueueResponse", {message: "OK", user: groupUser});
	}

	@SubscribeMessage("DisconnectFromQueue")
	async disconnectFromQueue(@ConnectedSocket() client: Socket) {
		const group = this.findMyGroup(client.id);
		if (!group)
			return ;

		this.queue1v1 = this.queue1v1.filter((queuer) => queuer.player1.socketId !== group.player1.socketId);
		
		this.groups.push(group);

		await this.prisma.user.update({
			where: {login: group.player1.login},
			data: {state: "ONLINE"}
		});
		if (group.player2)
			await this.prisma.user.update({
				where: {login: group.player2.login},
				data: {state: "ONLINE"}
			});
		if (group.player3)
			await this.prisma.user.update({
				where: {login: group.player3.login},
				data: {state: "ONLINE"}
			});
		if (group.player4)
			await this.prisma.user.update({
				where: {login: group.player4.login},
				data: {state: "ONLINE"}
			});
		
		client.emit("DisconnectFromQueueResponse", {message: "OK"});
	}

	@SubscribeMessage("LeaveGroup")
	async handleLeaveGroup(@ConnectedSocket() client: Socket) {
		const me: QueueObject = this.leaveGroup(client, undefined);
		this.createGroup(me.login, client);
	}

	@SubscribeMessage("JoinGroup")
	async handleJoinGroup(@ConnectedSocket() client: Socket, @MessageBody() groupParam: any) {
		const groupLeader = await this.prisma.user.findUnique({where: {login: groupParam.groupLogin}});
		if (!groupLeader)
			return ;
		if (groupLeader.state !== "ONLINE")
			return ;
		const me: QueueObject = this.leaveGroup(client, undefined);
		if (me.login === groupParam.groupLogin)
			this.recreateGroup(me);
		else
			this.joinGroup(client, me, groupParam);
	}

	@SubscribeMessage("AcceptGame")
	acceptGame(@ConnectedSocket() client: Socket) {
		let groups = [];
		for (const gameMatch of this.gameMatched) {
			groups.push(gameMatch.group1);
			if (gameMatch.group2)
				groups.push(gameMatch.group2);
			if (gameMatch.group3)
				groups.push(gameMatch.group3);
			if (gameMatch.group4)
				groups.push(gameMatch.group4);
			for (const group of groups) {
				if (group.player1 && group.player1.socketId === client.id && group.player1.state === QueueState.Searching)
					group.player1.state = QueueState.Accepted;
				if (group.player2 && group.player2.socketId === client.id && group.player2.state === QueueState.Searching)
					group.player2.state = QueueState.Accepted;
				if (group.player3 && group.player3.socketId === client.id && group.player3.state === QueueState.Searching)
					group.player3.state = QueueState.Accepted;
				if (group.player4 && group.player4.socketId === client.id && group.player4.state === QueueState.Searching)
					group.player4.state = QueueState.Accepted;
			}
		}
	}
 
	@SubscribeMessage("DeclineGame")
	async declineGame(@ConnectedSocket() client: Socket) {
		let groups = [];
		for (const gameMatch of this.gameMatched) {
			groups.push(gameMatch.group1);
			if (gameMatch.group2)
				groups.push(gameMatch.group2);
			if (gameMatch.group3)
				groups.push(gameMatch.group3);
			if (gameMatch.group4)
				groups.push(gameMatch.group4);
			for (const group of groups) {
				if (group.player1 && group.player1.socketId === client.id && group.player1.state === QueueState.Searching)
				{
					group.player1.state = QueueState.Declined;
					await this.prisma.user.update({
						where: {login: group.player1.login},
						data: {state: "ONLINE"}
					});
				}
				if (group.player2 && group.player2.socketId === client.id && group.player2.state === QueueState.Searching)
				{
					group.player2.state = QueueState.Declined;
					await this.prisma.user.update({
						where: {login: group.player2.login},
						data: {state: "ONLINE"}
					});
				}	
				if (group.player3 && group.player3.socketId === client.id && group.player3.state === QueueState.Searching)
				{
					group.player3.state = QueueState.Declined;
					await this.prisma.user.update({
						where: {login: group.player3.login},
						data: {state: "ONLINE"}
					});
				}	
				if (group.player4 && group.player4.socketId === client.id && group.player4.state === QueueState.Searching)
				{
					group.player4.state = QueueState.Declined;
					await this.prisma.user.update({
						where: {login: group.player4.login},
						data: {state: "ONLINE"}
					});
				}	
			}
		}
	}

	@SubscribeMessage("Timer")
	timer(@ConnectedSocket() client: Socket) {

		const group = this.findMyGroup(client.id);
		if (!group)
			return ;
		client.emit("TimerResponse", {message: (Date.now() - group.timeData) / 1000});
	}

	@SubscribeMessage("ChatWithGroup")
	chatWithGroup(@ConnectedSocket() client: Socket, @MessageBody() message: any) {
		const group = this.findMyGroup(client.id);
		if (!group)
			return ;
		group.player1 && this.server.to(group.player1.socketId).emit("GetNewMessage", {message: message.message, login: message.login});
		group.player2 && this.server.to(group.player2.socketId).emit("GetNewMessage", {message: message.message, login: message.login});
		group.player3 && this.server.to(group.player3.socketId).emit("GetNewMessage", {message: message.message, login: message.login});
		group.player4 && this.server.to(group.player4.socketId).emit("GetNewMessage", {message: message.message, login: message.login});
	} 

	@SubscribeMessage("imInQueue")
	async imInQueue(@ConnectedSocket() client: Socket) {
		const user = this.findInQueue(client.id);
		if (!user)
		{
			const cookie = client.handshake.headers.cookie;
			if (!cookie)
				return ;
			const parsedCookie = cookie.split("; ").find((cook) => cook.startsWith("jwt=")).replace("jwt=", "");
			const decoded: any = jwt.verify(parsedCookie, process.env.JWT_SECRET);
			await this.prisma.user.update({
				where: {login: decoded.login},
				data: {state: "ONLINE"}
			});
			client.emit("imInQueueResponse", {in: false});
			return ;
		}
		
		client.emit("imInQueueResponse", {player1: {elo: user.elo, login: user.login, avatar: user.avatar}, in: true});
	}
}