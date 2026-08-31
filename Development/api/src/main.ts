import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // e.id registers one callback URL, so every route sits under a stable prefix.
  app.setGlobalPrefix('api/v1');

  // Di VPS, nginx yang memegang TLS. Tanpa ini Express mengira koneksinya http
  // dan cookie sesi terbit tanpa flag Secure.
  app.set('trust proxy', 1);
  app.use(cookieParser());

  // Tidak ada endpoint yang butuh body besar; unggahan berkas ditangani frontend.
  app.useBodyParser('json', { limit: '256kb' });

  // Produksi: hanya origin frontend yang terdaftar. Dev: port Next berpindah
  // setiap sesi, jadi localhost mana pun diterima daripada mematikan CORS.
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.APP_URL ?? 'http://localhost:3000')
        : /^http:\/\/localhost:\d+$/,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();
