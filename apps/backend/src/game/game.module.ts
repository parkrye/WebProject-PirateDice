/**
 * 게임 WebSocket 모듈
 */

import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { RoomsModule } from '../rooms/rooms.module';

@Module({
  imports: [RoomsModule],
  providers: [GameGateway],
})
export class GameModule {}
