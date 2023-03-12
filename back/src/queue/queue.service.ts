import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddQueueDto, QueueObject } from './dto';

@Injectable()
export class QueueService {
	constructor(private queue: QueueObject[], private prisma: PrismaService) {}

	async getQueue() {
		return this.queue;
	}

	getUserInQueue(userLogin: string) {
		return this.queue.find((queuer) => queuer.login === userLogin);
	}

	async addToQueue(userLogin: string, dto: AddQueueDto) {
		const user = await this.prisma.user.findUnique({
			where: {
				login: userLogin,
			}
		});
		if (!user || user.state !== "ONLINE")
			return ;

		if (!this.getUserInQueue(userLogin))
			this.queue.push({id:user.id, login: userLogin,
				mode: dto.mode,elo: user.elo,
				bonus1: (dto.bonus1 == undefined) ? false : true,
				bonus2: (dto.bonus2 == undefined) ? false : true,
				});
		return await this.prisma.user.update({
			where: {
				login: userLogin,
			},
			data: {
				state: "SEARCHING",
			}
		});
	}

	async removeFromQueue(userLogin: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				login: userLogin,
			}
		});
		console.log(this.queue)
		if (!user || user.state !== "SEARCHING")
			return ;
		
		if (this.getUserInQueue(userLogin))
			this.queue.splice(this.queue.indexOf(this.getUserInQueue(userLogin)), 1);
		return await this.prisma.user.update({
			where: {
				login: userLogin,
			},
			data: {
				state: "ONLINE",
			}
		});
	}
	
	async match(userLogin: string) {
		const user = await this.prisma.user.findUnique({
			where: {
				login: userLogin,
			}
		});
		console.log(user)
		if (!user || user.state !== "SEARCHING")
			return ;

		if (!this.getUserInQueue(userLogin))
			return  ;
		//Algo to find a good opponent
		const opponent = this.queue.find((queuer) => queuer.login !== userLogin);
		console.log("oponent: ", opponent)
		if (!opponent)
			return ;

		this.queue.splice(this.queue.indexOf(this.getUserInQueue(userLogin)), 1);
		this.queue.splice(this.queue.indexOf(this.getUserInQueue(userLogin)), 1);
		console.log(this.queue)
		await this.prisma.user.updateMany({
			where: {
				login: {
					in: [userLogin, opponent.login],
				}
			},
			data: {
				state: "PLAYING",
			}
		});
		console.log(user)
		return {player1: user.id, player2: opponent.id}
	}
}
