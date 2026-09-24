import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  ParseUUIDPipe,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { HealthService } from "./health.service";
import { LockDto, MedicalDto, CareDto } from "./health.dto";
@Controller("health")
export class HealthController {
  constructor(private health: HealthService) {}
  @Post("horses/:id/lock") @Roles("VETERINARIAN") lock(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: LockDto,
    @Req() req,
  ) {
    return this.health.lockHorse(id, req.user.id, data.reason);
  }
  @Post("horses/:id/release-lock") @Roles("VETERINARIAN") release(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: LockDto,
    @Req() req,
  ) {
    return this.health.releaseLock(id, req.user.id, data.reason);
  }
  @Post("records") @Roles("VETERINARIAN") record(
    @Body() data: MedicalDto,
    @Req() req,
  ) {
    return this.health.record(data, req.user);
  }
  @Post("care") @Roles("VETERINARIAN") care(@Body() data: CareDto, @Req() req) {
    return this.health.care(data, req.user);
  }
  @Get("due") @Roles("VETERINARIAN", "CLUB_MANAGER", "HORSE_OWNER") due(
    @Req() req,
  ) {
    return this.health.due(req.user);
  }
  @Post("care/:id/complete") @Roles("VETERINARIAN") complete(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.health.completeCare(id, req.user);
  }
}
