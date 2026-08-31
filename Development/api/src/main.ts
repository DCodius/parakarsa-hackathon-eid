import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // e.id registers one callback URL, so every route sits under a stable prefix.
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());

  // The browser only ever calls this API from the frontend origin.
  app.enableCors({
    origin: process.env.APP_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
