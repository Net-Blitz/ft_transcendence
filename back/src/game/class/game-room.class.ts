import { SocketUser } from "../dto";

const GameRatio = 0.5;

export class PlayerBar {
	x: number;
	y: number;
	size: number;
	speed: number;
	width: number;
	score: number;
	
	constructor(x: number, y: number, size: number, speed: number, width: number) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.speed = speed;
		this.width = width;
		this.score = 0;
	}
}

export class Ball {
	x: number;
	y: number;
	speed_x: number;
	speed_y: number;
	size: number;
	direction: number;

	constructor(x: number, y: number, speed_x: number, speed_y: number,
				size: number, direction: number) {
		this.x = x;
		this.y = y;
		this.speed_x = speed_x;
		this.speed_y = speed_y;
		this.size = size;
		this.direction = direction;
	}
}

export class GameRoom {
	
	ball: Ball;
	player1: PlayerBar;
	player2: PlayerBar;

	constructor(private roomNumber : number) {
		this.ball = new Ball(0.5, 0.5, 0.0045 * GameRatio, 0.0045, 0.03, this.getRandomDirection());
		this.player1 = new PlayerBar(0.006, 0.5, 0.2, 0.0125, 0.015);
		this.player2 = new PlayerBar(0.994, 0.5, 0.2, 0.0125, 0.015);
	}
	
	getGameRoomInfo() {
		return ({
			ball_x: this.ball.x,
			ball_y: this.ball.y,
			ball_size: this.ball.size,
			
			player1_x: this.player1.x,
			player1_y: this.player1.y,
			player1_size: this.player1.size,
			player1_score: this.player1.score,

			player2_x: this.player2.x,
			player2_y: this.player2.y,
			player2_size: this.player2.size,
			player2_score: this.player2.score,
		})
	}

	reset() {
		this.ball.x = 0.5;
		this.ball.y = 0.5;
		this.ball.direction = this.getRandomDirection();
		this.ball.speed_x = 0.0045 * GameRatio;
		this.ball.speed_y = 0.0045;
		
		this.player1.size = 0.2;
		this.player2.size = 0.2;
		this.ball.size = 0.03;
	}
	
	getRandomDirection() {
		const range = 0.70;
		let first = (Math.random() * range - range / 2) * Math.PI;
		let second = Math.random() * range - range / 2;
		second = (second + (1 - (range / 2)) * Math.sign(second)) * Math.PI ;
		return Math.random() > 0.5 ? first : second;
	}
	
	accelerate() {
		this.ball.speed_x *= 1.05;
		this.ball.speed_y *= 1.05;
	}

	updatePlayerPosition(player: SocketUser) {
		if (player) {
			let p = (player.state === "player1" ? this.player1 : this.player2);
			if (player.up === 1) {
				p.y -= p.speed;
				if (p.y < 0)
					p.y = 0;
			}
			if (player.down === 1) {
				p.y += p.speed;
				if (p.y > 1)
					p.y = 1;
			}
		}
	}

	incrementBallY(increment_y: number) {
		this.ball.y += increment_y;

		if (this.ball.y < 0 || this.ball.y > 1) {
			this.ball.direction = -this.ball.direction;
			if (this.ball.y < 0)
				this.ball.y = -this.ball.y;
			else
				this.ball.y = 2 - this.ball.y;
		}
	}

	private getY(x: number, y: number, direction: number, x2: number) {
		return y + (x2 - x) * Math.tan(direction);
	}

	private getBallDirectionBounceRight(y: number,) {
		let percent = (y - this.player1.y) / this.player1.size;

		this.accelerate();
		return ((Math.PI / 3) * percent);
	}
	
	private getBallDirectionBounceLeft(y: number) {
		let percent = (y - this.player2.y) / this.player2.size;
		
		this.accelerate();
		return (Math.PI - (Math.PI / 3) * percent)
	}


	checkBallBounce(increment_x: number) {
		let y 		: number;
		let ballY	: number;
		let playerY	: number;
		const ballMarge = 0.05;

		if (this.ball.direction > Math.PI / 2 || this.ball.direction < -Math.PI / 2) {
			if (this.ball.x > this.player1.x + this.player1.width
				&& this.ball.x + increment_x <= this.player1.x + this.player1.width) {
					
					y = this.getY(this.ball.x, this.ball.y, this.ball.direction, this.player1.x + this.player1.width);
					ballY = this.ball.y - (this.ball.size * (this.ball.y - 0.5));
					playerY = this.player1.y - (this.player1.size * (this.player1.y - 0.5));
					
					if ((ballY + ballMarge > playerY - this.player1.size / 2
							&& ballY + ballMarge < playerY + this.player1.size / 2) 
						|| (ballY - ballMarge > playerY - this.player1.size / 2
							&& ballY - ballMarge < playerY + this.player1.size / 2) ) {
						
						this.ball.direction = this.getBallDirectionBounceRight(y);
						increment_x = Math.abs(increment_x) - Math.abs(this.ball.x - this.player1.x - this.player1.width);
				}
			}
		}
		else if (this.ball.direction < Math.PI / 2 && this.ball.direction > -Math.PI / 2) {
			if (this.ball.x < this.player2.x - this.player2.width
				&& this.ball.x + increment_x >= this.player2.x - this.player2.width) {
				
					y = this.getY(this.ball.x, this.ball.y, this.ball.direction, this.player2.x - this.player2.width);
					ballY = this.ball.y - (this.ball.size * (this.ball.y - 0.5));
					playerY = this.player2.y - (this.player2.size * (this.player2.y - 0.5));
				
					if ((ballY + ballMarge > playerY - this.player2.size / 2
							&& ballY + ballMarge < playerY + this.player2.size / 2) 
						|| (ballY - ballMarge > playerY - this.player2.size / 2
							&& ballY - ballMarge < playerY + this.player2.size / 2)) {
						
						this.ball.direction = this.getBallDirectionBounceLeft(y);
						increment_x = (Math.abs(increment_x) - Math.abs(this.ball.x - this.player2.x + this.player2.width));
				}
			}
		}
		this.ball.x += increment_x;
	}

	checkBallScore() {
		if ((this.ball.x < 0 && (this.ball.direction > Math.PI / 2 || this.ball.direction < -Math.PI / 2))
			|| (this.ball.x > 1 && (this.ball.direction < Math.PI / 2 && this.ball.direction > -Math.PI / 2)))
		{
			if (this.ball.x < 0)
				this.player2.score++;
			else if (this.ball.x > 1)
				this.player1.score++;
			this.reset();
			return (true);
		}
		return (false);
	}

	checkEndGame() {
		if ((this.player1.score >= 10 || this.player2.score >= 10) && Math.abs(this.player1.score - this.player2.score) >= 2)
			return {state: true, mode: "normal"} /* TEMP */ //return true;
		return {state: false, mode: "none"}
	} 
}