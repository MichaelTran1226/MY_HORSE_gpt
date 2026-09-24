import { Module } from "@nestjs/common";
import { StatusController } from "./status.controller";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { HorsesModule } from "./modules/horses/horses.module";
import { TrainingModule } from "./modules/training/training.module";
import { HealthModule } from "./modules/health/health.module";
import { StablesModule } from "./modules/stables/stables.module";
import { AuditLogModule } from "./modules/audit-log/audit-log.module";

@Module({
  controllers: [StatusController],
  imports: [
    PrismaModule,
    AuditLogModule,
    AuthModule,
    AccountsModule,
    HorsesModule,
    TrainingModule,
    HealthModule,
    StablesModule,
  ],
})
export class AppModule {}
