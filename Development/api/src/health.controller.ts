import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './db/database.service.js';

/** Dipakai nginx/uptime monitor: hidup berarti proses jalan DAN database terbaca. */
@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  check() {
    this.database.db.prepare('SELECT 1').get();
    return { status: 'ok', at: new Date().toISOString() };
  }
}
