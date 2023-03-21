
const GameRatio = 0.5;

export class Rooms {
	
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
	player_width: number;
	constructor() {
		
		this.ball_x = 0.5;
		this.ball_y = 0.5;
		this.ball_speed_x = 0.0045 * GameRatio;
		this.ball_speed_y = 0.0045;
		this.ball_size = 0.05;
		this.ball_direction = this.getRandomDirection();
		
		this.player1_x = 0.006;
		this.player1_y = 0.5;
		this.player1_size = 0.3;
		this.player1_score = 0;
		
		this.player2_x = 0.994;
		this.player2_y = 0.5;
		this.player2_size = 0.3;
		this.player2_score = 0;
		
		this.player_width = 0.015;
		this.player_speed = 0.0125;
	}
	
	resetBall() {
		this.ball_x = 0.5;
		this.ball_y = 0.5;
		this.ball_direction = this.getRandomDirection();
		this.ball_speed_x = 0.0045 * GameRatio;
		this.ball_speed_y = 0.0045;
		
		this.player1_size = 0.3;
		this.player2_size = 0.3;
		this.ball_size = 0.05;
	}
	
	getRandomDirection() {
		const range = 0.70;
		let first = (Math.random() * range - range / 2) * Math.PI;
		let second = Math.random() * range - range / 2;
		second = (second + (1 - (range / 2)) * Math.sign(second)) * Math.PI ;
		return Math.random() > 0.5 ? first : second;
	}
	
	accelerate() {
		this.ball_speed_x *= 1.1;
		this.ball_speed_y *= 1.1;
	}
}