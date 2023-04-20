import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { GameService } from 'src/game/game.service';

@Module({
  providers: [QueueService, Array, GameService],
  controllers: [QueueController]
})
export class QueueModule {}
