import { Controller, Get, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { RacingService } from "./racing.service";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Racing & Awards (Flow 5)")
@Controller("racing")
@Roles("HEAD_TRAINER", "CLUB_MANAGER")
export class RacingController {
  constructor(private readonly racingService: RacingService) {}

  @Get("entries")
  @ApiOperation({ summary: "Lấy danh sách ngựa đăng ký giải đua" })
  getRaceEntries() {
    return this.racingService.getRaceEntries();
  }

  @Post("entries")
  @Roles("HEAD_TRAINER")
  @ApiOperation({ summary: "Đăng ký chiến mã tham gia giải đua" })
  registerHorseForRace(@Body() body: any) {
    return this.racingService.registerHorseForRace(body);
  }
}
