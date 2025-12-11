/**
 * 루트 애플리케이션 모듈
 */

import { Module } from '@nestjs/common';
import { RoomsModule } from './rooms/rooms.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    RoomsModule,
    GameModule,
  ],
})
export class AppModule {}
