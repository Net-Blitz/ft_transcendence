import { Injectable, UseFilters } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameDto, GameState, UpdateGameDto } from './dto';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {}

	async getGames(state: string | undefined = undefined) {
		if (state) {
			return this.prisma.game.findMany({
				where: {
					state: state.toUpperCase() as GameState,
				}
			});
		}
		else
			return this.prisma.game.findMany();
	}

	async getGame(gameId: number) {
		return this.prisma.game.findUnique({
			where: {
				id: gameId,
			}
		});
	}
	
	async createGame(dto: CreateGameDto) {
		return await this.prisma.game.create({
			data: {
				user1Id: dto.player1,
				user2Id: dto.player2,
			}
		});
	}

	async sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	};

	async connectToGame(userLogin: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				login: userLogin,
			}
		});
		if (!user)
			return ;
		const game = await this.prisma.game.findFirst({
			where: {
				state: "CREATING",
				OR: [
					{ user1Id: user.id },
					{ user2Id: user.id },
				]
			}
		});
		if (!game)
			return ;
		return game ;
	}

//	async startGame(gameId: number) {
//		return this.prisma.game.update({
//			where: {
//				id: gameId,
//			},
//			data: {
//				state: 'PLAYING',
//			}
//		});
//	}

//	async endGame(gameId: number) {
//		const game = await this.prisma.game.findUnique({
//			where: {
//				id: gameId,
//			}
//		});

//		if (!game || game.state !== "PLAYING") //gerer proprement les doubles deco
//			return 	;

//		if (game.score1 > game.score2)
//		{
//			await this.prisma.user.update({
//				where: { id: game.user1Id },
//				data: { wins: { increment: 1 } }
//			});
		
//			await this.prisma.user.update({
//				where: { id: game.user2Id },
//				data: { losses: { increment: 1 } }
//			});
//		}
//		else if (game.score1 < game.score2)
//		{
//			await this.prisma.user.update({
//				where: { id: game.user1Id },
//				data: { losses: { increment: 1 } }
//			});
		
//			await this.prisma.user.update({
//				where: { id: game.user2Id },
//				data: { wins: { increment: 1 } }
//			});
//		}

//		return this.prisma.game.update({
//			where: {
//				id: gameId,
//			},
//			data: {
//				state: 'ENDED',
//			}
//		});
//	}

//	async updateGame(gameId: number, dto: UpdateGameDto) {
//		const game = await this.prisma.game.findUnique({
//			where: {
//				id: gameId,
//			}
//		});

//		if (!game || game.state !== "PLAYING")
//			return 	;
//		return this.prisma.game.update({
//			where: {
//				id: gameId,
//			},
//			data: {
//				score1: dto.score1,
//				score2: dto.score2,
//			}
//		});
//	}
}
