import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { GetCookie } from "src/auth/decorator";
import { AddQueueDto } from "./dto";
import { GameService } from "src/game/game.service";

@Controller("queue")
export class QueueController {
	constructor(private queueService: QueueService, private game: GameService) {}

	@Get("all")
	async getQueue() {
		return this.queueService.getQueue();
	}

	@Post("add")
	async addToQueue(@GetCookie("login") userLogin: string, @Body() dto: AddQueueDto) {
		console.log(userLogin)
		return this.queueService.addToQueue(userLogin, dto);
	}

	@Delete("remove")
	async removeFromQueue(@GetCookie("login") userLogin: string) {
		return this.queueService.removeFromQueue(userLogin);
	}

	@Get("match") /* Temp route */
	async match(@GetCookie("login") userLogin: string) {
		const match = await this.queueService.match(userLogin);
		if (match)
		{
			console.log("match: ", match)
			return await this.game.createGame(match);
		}
		return null;
	}

}
