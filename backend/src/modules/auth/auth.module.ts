import { Global, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { SessionGuard } from "../../common/guards/session.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
@Global()
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
