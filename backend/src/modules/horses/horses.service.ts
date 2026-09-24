import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { Role } from "@prisma/client";
import { HorseDto, AdmissionDto } from "./horses.dto";
export type Actor = { id: string; role: Role };
export function ownerScope(user: Actor) {
  return user.role === "HORSE_OWNER" ? { ownerId: user.id } : {};
}
@Injectable()
export class HorsesService {
  constructor(private prisma: PrismaService) {}
  async findAll(user: Actor) {
    return this.prisma.horse.findMany({
      where: ownerScope(user),
      include: { stall: true, owner: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
  async findOne(id: string, user: Actor) {
    const horse = await this.prisma.horse.findFirst({
      where: { id, ...ownerScope(user) },
      include: {
        stall: true,
        owner: { select: { id: true, fullName: true } },
        medicalRecords: {
          include: { injuries: true, vet: { select: { fullName: true } } },
          orderBy: { createdAt: "desc" },
        },
        trainingPlans: {
          include: {
            sessions: {
              include: { trialRun: true },
              orderBy: { sessionDate: "desc" },
            },
          },
          orderBy: { startDate: "desc" },
        },
        careSchedules: { orderBy: { scheduledDate: "asc" } },
        raceEntries: { include: { result: true } },
      },
    });
    if (!horse) throw new NotFoundException("Horse not found");
    return horse;
  }
  async create(data: HorseDto, user: Actor) {
    const ownerId = user.role === "HORSE_OWNER" ? user.id : data.ownerId;
    const stallId = user.role === "HORSE_OWNER" ? undefined : data.stallId;
    if (new Date(data.dateOfBirth) > new Date())
      throw new BadRequestException("Birth date cannot be in the future");
    if (
      ownerId &&
      !(await this.prisma.user.findFirst({
        where: { id: ownerId, role: "HORSE_OWNER", isLocked: false },
      }))
    )
      throw new BadRequestException("Select an active horse owner");
    return this.prisma.$transaction(async (tx) => {
      const horse = await tx.horse.create({
        data: {
          ...data,
          ownerId,
          stallId,
          dateOfBirth: new Date(data.dateOfBirth),
          intakeStatus: user.role === "CLUB_MANAGER" ? "ADMITTED" : "PENDING",
        },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "HORSE_CREATED",
          entityType: "Horse",
          entityId: horse.id,
        },
      });
      return horse;
    });
  }
  async update(id: string, data: HorseDto, user: Actor) {
    await this.findOne(id, user);
    if (user.role !== "CLUB_MANAGER") throw new ForbiddenException();
    if (new Date(data.dateOfBirth) > new Date())
      throw new BadRequestException("Birth date cannot be in the future");
    if (
      data.ownerId &&
      !(await this.prisma.user.findFirst({
        where: { id: data.ownerId, role: "HORSE_OWNER", isLocked: false },
      }))
    )
      throw new BadRequestException("Select an active horse owner");
    return this.prisma.$transaction(async (tx) => {
      const horse = await tx.horse.update({
        where: { id },
        data: { ...data, dateOfBirth: new Date(data.dateOfBirth) },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "HORSE_UPDATED",
          entityType: "Horse",
          entityId: id,
        },
      });
      return horse;
    });
  }
  async admit(id: string, data: AdmissionDto, user: Actor) {
    if (
      !(await this.prisma.user.findFirst({
        where: { id: data.ownerId, role: "HORSE_OWNER", isLocked: false },
      }))
    )
      throw new BadRequestException("Select an active owner");
    return this.prisma.$transaction(async (tx) => {
      const horse = await tx.horse.update({ where: { id }, data });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "HORSE_" + data.intakeStatus,
          entityType: "Horse",
          entityId: id,
        },
      });
      return horse;
    });
  }
}
