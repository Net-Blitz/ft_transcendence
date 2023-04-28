import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameDto, GameState, GameMode } from './dto';

@Injectable()
export class GameService {
	constructor(private prisma: PrismaService) {
				this.initAchievements();
	}

	async initAchievements() {
		const achievements: {title: string, description: string, image: string, id: number}[] = [
				{title: "Ace", description: "Win a game without letting your opponents score a single point", image: "public/achievements/bottts-1682683777746.svg", id: 1},
				{title: "Brave", description: "Win a game with 20pts or more", image: "public/achievements/bottts-1682683831025.svg", id: 2},
				{title: "Lucky", description: "Win a game with 1pt or less", image: "public/achievements/bottts-1682683864276.svg", id: 3},
				{title: "Beginner", description: "Win a game", image: "public/achievements/bottts-1682683889878.svg", id: 4},
				{title: "Experienced", description: "Win 10 games", image: "public/achievements/bottts-1682683937087.svg", id: 5},
				{title: "Veteran", description: "Reach Level 20", image: "public/achievements/bottts-1682684012756.svg", id: 6}];
		for (const achievement of achievements)
		{
			try
			{
				await this.prisma.achievements.upsert({
					where: {id: achievement.id || 0},
					update: {
						...achievement,
					},
					create: {
						...achievement,
					}
				}) 
			}
			catch (e)
			{
				// console.log(e);
			}
		}  
	}

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
				user3Id: dto.player3,
				user4Id: dto.player4,
				mode: dto.mode,

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