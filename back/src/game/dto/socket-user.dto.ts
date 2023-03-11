
export class SocketUser {
	prismaId: number;
	login: string;
	socketId: string;
	roomName: string;
	state: string; // 'player1' | 'player2' | 'spectator'
	up: number;
	down: number;
}