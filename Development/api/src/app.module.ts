import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller.js';
import { EidService } from './eid/eid.service.js';
import { IssuanceController } from './issuance/issuance.controller.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController, IssuanceController],
  providers: [EidService],
})
export class AppModule {}
