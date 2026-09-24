import { Controller, Get, Post, Body, Req } from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { StallDto, IncidentDto } from "./stables.dto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { StablesService } from "./stables.service";

@ApiTags("Stables & Facilities (Flow 4)")
@Controller("stables")
@Roles("CLUB_MANAGER", "GROOM", "VETERINARIAN", "HEAD_TRAINER")
export class StablesController {
  constructor(
    private readonly stablesService: StablesService,
    private prisma: PrismaService,
  ) {}
  @Post("stalls") @Roles("CLUB_MANAGER") createStall(@Body() data: StallDto) {
    return this.prisma.stall.create({ data });
  }

  @Get("stalls")
  @ApiOperation({ summary: "Lấy sơ đồ phân bổ vị trí chuồng trại" })
  getStalls() {
    return this.stablesService.getStalls();
  }

  @Post("incidents")
  @Roles("GROOM")
  @ApiOperation({ summary: "Groom báo cáo sự cố chuồng trại kèm ảnh" })
  reportIncident(@Body() body: IncidentDto, @Req() req) {
    return this.stablesService.reportIncident({
      ...body,
      groomId: req.user.id,
    });
  }
}
