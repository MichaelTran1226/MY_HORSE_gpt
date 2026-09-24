import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  ParseUUIDPipe,
  BadRequestException,
} from "@nestjs/common";
import { Roles } from "../../common/decorators/roles.decorator";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AccountDto, AccountLockDto } from "./accounts.dto";
import { publicUser } from "../auth/auth.service";
import * as bcrypt from "bcrypt";
@Controller("accounts")
export class AccountsController {
  constructor(private prisma: PrismaService) {}
  @Get("staff") @Roles("CLUB_MANAGER", "HEAD_TRAINER") staff() {
    return this.prisma.user.findMany({
      where: { role: { not: "HORSE_OWNER" } },
      select: publicUser,
      orderBy: { fullName: "asc" },
    });
  }
  @Get() @Roles("CLUB_MANAGER") list() {
    return this.prisma.user.findMany({
      select: { ...publicUser, isLocked: true, emailVerified: true },
      orderBy: { fullName: "asc" },
    });
  }
  @Post() @Roles("CLUB_MANAGER") async create(
    @Body() data: AccountDto,
    @Req() req,
  ) {
    if (Buffer.byteLength(data.password) > 72)
      throw new BadRequestException("Password must be at most 72 UTF-8 bytes");
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          fullName: data.fullName.trim(),
          role: data.role,
          passwordHash: await bcrypt.hash(data.password, 12),
          emailVerified: true,
        },
        select: publicUser,
      });
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: "ACCOUNT_CREATED",
          entityType: "User",
          entityId: user.id,
        },
      });
      return user;
    });
  }
  @Patch(":id") @Roles("CLUB_MANAGER") async lock(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() data: AccountLockDto,
    @Req() req,
  ) {
    if (id === req.user.id)
      throw new BadRequestException("You cannot lock your own account");
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data,
        select: { ...publicUser, isLocked: true },
      });
      if (data.isLocked) await tx.session.deleteMany({ where: { userId: id } });
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: data.isLocked ? "ACCOUNT_LOCKED" : "ACCOUNT_UNLOCKED",
          entityType: "User",
          entityId: id,
        },
      });
      return user;
    });
  }
  @Get("audit") @Roles("CLUB_MANAGER") audit() {
    return this.prisma.auditLog.findMany({
      take: 100,
      orderBy: { timestamp: "desc" },
      include: { user: { select: publicUser } },
    });
  }
}
