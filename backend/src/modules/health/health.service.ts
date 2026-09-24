import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { HealthStatus } from "@prisma/client";
import { lockHorseRow } from "../training/training.service";
import { Actor, ownerScope } from "../horses/horses.service";
import { MedicalDto, CareDto } from "./health.dto";
@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}
  async isHorseLocked(id: string) {
    const horse = await this.prisma.horse.findUnique({ where: { id } });
    if (!horse) throw new NotFoundException("Horse not found");
    return horse.isTrainingLocked || horse.healthStatus !== HealthStatus.FIT;
  }
  async lockHorse(id: string, vetId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      await lockHorseRow(tx, id);
      const horse = await tx.horse.update({
        where: { id },
        data: {
          isTrainingLocked: true,
          healthStatus: "INJURED",
          lockedByVetId: vetId,
          lockReason: reason,
          lockedAt: new Date(),
        },
      });
      await tx.trainingSession.updateMany({
        where: { plan: { horseId: id }, isCompleted: false, cancelledAt: null },
        data: { cancelledAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          userId: vetId,
          action: "TRAINING_LOCKED",
          entityType: "Horse",
          entityId: id,
        },
      });
      return horse;
    });
  }
  async releaseLock(id: string, vetId: string, reason: string) {
    return this.prisma.$transaction(async (tx) => {
      const horse = await lockHorseRow(tx, id);
      if (!horse.isTrainingLocked)
        throw new BadRequestException("Horse is not locked");
      const record = await tx.medicalRecord.findFirst({
        where: {
          horseId: id,
          createdAt: { gte: horse.lockedAt || new Date(0) },
        },
      });
      if (!record)
        throw new BadRequestException(
          "Record a follow-up examination before releasing the lock",
        );
      const result = await tx.horse.update({
        where: { id },
        data: {
          isTrainingLocked: false,
          healthStatus: "FIT",
          lockedByVetId: null,
          lockReason: null,
          lockedAt: null,
        },
      });
      await tx.auditLog.create({
        data: {
          userId: vetId,
          action: "TRAINING_RELEASED: " + reason,
          entityType: "Horse",
          entityId: id,
        },
      });
      return result;
    });
  }
  async record(data: MedicalDto, user: Actor) {
    if (Boolean(data.bodyLocation) !== Boolean(data.severity))
      throw new BadRequestException(
        "Specify both injury location and severity",
      );
    return this.prisma.$transaction(async (tx) => {
      const horse = await lockHorseRow(tx, data.horseId);
      const { healthStatus, bodyLocation, severity, notes, ...fields } = data;
      const record = await tx.medicalRecord.create({
        data: {
          ...fields,
          vetId: user.id,
          ...(bodyLocation
            ? { injuries: { create: { bodyLocation, severity, notes } } }
            : {}),
        },
      });
      const locked = ["INJURED", "QUARANTINE"].includes(healthStatus);
      if (horse.isTrainingLocked && !locked && healthStatus === "FIT") {
        // A recorded recovery examination does not silently release a veterinary lock.
      } else {
        await tx.horse.update({
          where: { id: data.horseId },
          data: {
            healthStatus,
            ...(locked
              ? {
                  isTrainingLocked: true,
                  lockedByVetId: user.id,
                  lockReason: data.diagnosis,
                  lockedAt: horse.lockedAt || new Date(),
                }
              : {}),
          },
        });
      }
      if (locked)
        await tx.trainingSession.updateMany({
          where: {
            plan: { horseId: data.horseId },
            isCompleted: false,
            cancelledAt: null,
          },
          data: { cancelledAt: new Date() },
        });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "MEDICAL_RECORDED",
          entityType: "MedicalRecord",
          entityId: record.id,
        },
      });
      return record;
    });
  }
  async care(data: CareDto, user: Actor) {
    return this.prisma.$transaction(async (tx) => {
      const care = await tx.careSchedule.create({
        data: { ...data, scheduledDate: new Date(data.scheduledDate) },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CARE_SCHEDULED",
          entityType: "CareSchedule",
          entityId: care.id,
        },
      });
      return care;
    });
  }
  async due(user: Actor) {
    return this.prisma.careSchedule.findMany({
      where: {
        isCompleted: false,
        scheduledDate: { lte: new Date(Date.now() + 7 * 86400000) },
        horse: ownerScope(user),
      },
      include: { horse: { select: { id: true, name: true } } },
      orderBy: { scheduledDate: "asc" },
    });
  }
  async completeCare(id: string, user: Actor) {
    return this.prisma.$transaction(async (tx) => {
      const care = await tx.careSchedule.update({
        where: { id },
        data: { isCompleted: true, completedDate: new Date() },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CARE_COMPLETED",
          entityType: "CareSchedule",
          entityId: id,
        },
      });
      return care;
    });
  }
}
