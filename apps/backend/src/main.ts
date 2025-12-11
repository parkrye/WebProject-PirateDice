/**
 * NestJS 애플리케이션 진입점
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // API 경로 프리픽스
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🎲 Pirate Dice Backend is running on: http://localhost:${port}`);
}

bootstrap();
