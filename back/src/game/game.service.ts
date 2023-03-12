import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameDto, GameState } from './dto';

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
}
