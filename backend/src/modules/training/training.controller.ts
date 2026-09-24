import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Query,
  ParseUUIDPipe,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { TrainingService } from "./training.service";
import {
  PlanDto,
  SessionDto,
  CompleteDto,
  CalendarQuery,
} from "./training.dto";
@Controller("training")
export class TrainingController {
  constructor(private training: TrainingService) {}
  @Get("calendar") calendar(@Query() query: CalendarQuery, @Req() req) {
    return this.training.calendar(query.from, query.to, req.user);
  }
  @Get("overview") overview(@Req() req) {
    return this.training.overview(req.user);
  }
  @Post("plans") @Roles("HEAD_TRAINER") create(
    @Body() data: PlanDto,
    @Req() req,
  ) {
    return this.training.createPlan(data, req.user);
  }
  @Get("horses/:id/plans") plans(
    @Param("id", ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    return this.training.findPlansByHorse(id, req.user);
  }
  @Post("plans/:id/sessions") @Roles("HEAD_TRAINER") schedule(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: SessionDto,
    @Req() req,
  ) {
    return this.training.schedule(id, data, req.user);
  }
  @Post("sessions/:id/complete") @Roles("HEAD_TRAINER") complete(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: CompleteDto,
    @Req() req,
  ) {
    return this.training.complete(id, data, req.user);
  }
}
