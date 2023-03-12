import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { GetUser } from 'src/auth/decorator';

@Controller("games")
export class GameController {
	constructor(private gameService: GameService) {}
	
	@Get("connect")
	async connectToGame(@GetUser("login") userLogin: string) {
		return this.gameService.connectToGame(userLogin);
	}

	@Get(":id")
	async getGame(@Param("id", ParseIntPipe) gameId: number) {
		return this.gameService.getGame(gameId);
	}

	@Get("all/:state")
	async getAllPlayingGames(@Param("state") state: string) {
		return this.gameService.getGames(state);
	}

	@Get()
	async getGames() {
		return this.gameService.getGames();
	}
}
