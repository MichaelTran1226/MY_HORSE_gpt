import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/guards/session.guard";
import { PrismaService } from "./common/prisma/prisma.service";
@Controller("status")
export class StatusController {
  constructor(private prisma: PrismaService) {}
  @Public() @Get() async status() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok" };
  }
}
