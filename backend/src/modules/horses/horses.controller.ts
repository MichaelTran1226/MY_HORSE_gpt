import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  ParseUUIDPipe,
} from "@nestjs/common";
import { HorsesService } from "./horses.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { HorseDto, AdmissionDto } from "./horses.dto";
@Controller("horses")
export class HorsesController {
  constructor(private horses: HorsesService) {}
  @Get() list(@Req() req) {
    return this.horses.findAll(req.user);
  }
  @Get(":id") one(@Param("id", ParseUUIDPipe) id: string, @Req() req) {
    return this.horses.findOne(id, req.user);
  }
  @Post() @Roles("CLUB_MANAGER", "HORSE_OWNER") create(
    @Body() data: HorseDto,
    @Req() req,
  ) {
    return this.horses.create(data, req.user);
  }
  @Patch(":id") @Roles("CLUB_MANAGER") update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: HorseDto,
    @Req() req,
  ) {
    return this.horses.update(id, data, req.user);
  }
  @Post(":id/admission") @Roles("CLUB_MANAGER") admit(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: AdmissionDto,
    @Req() req,
  ) {
    return this.horses.admit(id, data, req.user);
  }
}
