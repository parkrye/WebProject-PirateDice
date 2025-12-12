/**
 * NestJS 애플리케이션 진입점
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  const allowedOrigins = [
    process.env.FRONTEND_URL ?? 'http://localhost:3000',
    'https://pirate-dice-game.web.app',
    'https://personal-project-park.web.app',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // origin이 없는 경우 (같은 origin 요청) 허용
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  // API 경로 프리픽스
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🎲 Pirate Dice Backend is running on: http://localhost:${port}`);
}

bootstrap();
