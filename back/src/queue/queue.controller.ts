import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { GetUser } from "src/auth/decorator";
import { AddQueueDto } from "./dto";
import { GameService } from "src/game/game.service";

@Controller("queues")
export class QueueController {
	constructor(private queueService: QueueService, private game: GameService) {}

	@Get("all")
	async getQueue() {
		return this.queueService.getQueue();
	}

	@Post("add")
	async addToQueue(@GetUser("login") userLogin: string, @Body() dto: AddQueueDto) {
		return this.queueService.addToQueue(userLogin, dto);
	}

	@Delete("remove")
	async removeFromQueue(@GetUser("login") userLogin: string) {
		return this.queueService.removeFromQueue(userLogin);
	}

	@Get("match") /* Temp route */
	async match(@GetUser("login") userLogin: string) {
		const match = await this.queueService.match(userLogin);
		if (match)
		{
			console.log("match: ", match)
			return await this.game.createGame(match);
		}
		return null;
	}

}
