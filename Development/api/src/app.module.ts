import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountsService } from './accounts/accounts.service.js';
import { AuthController } from './auth/auth.controller.js';
import { ConsentController } from './consent/consent.controller.js';
import { ConsentService } from './consent/consent.service.js';
import { DatabaseService } from './db/database.service.js';
import { EidService } from './eid/eid.service.js';
import { HealthController } from './health.controller.js';
import { IssuanceController } from './issuance/issuance.controller.js';
import { VerifierController } from './verifier/verifier.controller.js';
import { VerifierService } from './verifier/verifier.service.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AuthController, IssuanceController, VerifierController, ConsentController, HealthController],
  providers: [DatabaseService, AccountsService, ConsentService, EidService, VerifierService],
})
export class AppModule {}
