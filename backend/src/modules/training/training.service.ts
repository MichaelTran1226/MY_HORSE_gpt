import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/common/prisma/prisma.service";
import { PlanDto, SessionDto, CompleteDto } from "./training.dto";
import { Actor, ownerScope } from "../horses/horses.service";
import { Prisma } from "@prisma/client";
// Every scheduling/execution/medical-lock transaction locks the same horse row.
export async function lockHorseRow(tx: Prisma.TransactionClient, id: string) {
  const rows = await tx.$queryRaw<
    Array<{ id: string }>
  >`SELECT id FROM horses WHERE id = ${id} FOR UPDATE`;
  if (!rows.length) throw new NotFoundException("Horse not found");
  return tx.horse.findUniqueOrThrow({ where: { id } });
}
export function assertTrainable(
  horse: {
    isTrainingLocked: boolean;
    healthStatus: string;
    intakeStatus: string;
  },
  intensity: string,
) {
  if (
    horse.intakeStatus !== "ADMITTED" ||
    horse.isTrainingLocked ||
    ["INJURED", "QUARANTINE"].includes(horse.healthStatus) ||
    (horse.healthStatus === "WATCH" && intensity !== "LIGHT")
  )
    throw new BadRequestException(
      "Horse is not eligible for this training. Review admission and veterinary restrictions.",
    );
}
@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}
  async calendar(from: string, to: string, user: Actor) {
    const start = new Date(from),
      end = new Date(to);
    if (end < start || end.getTime() - start.getTime() > 32 * 86400000)
      throw new BadRequestException("Select a range of up to 32 days");
    return this.prisma.trainingSession.findMany({
      where: {
        sessionDate: { gte: start, lte: end },
        plan: { horse: ownerScope(user) },
        ...(user.role === "GROOM" ? { assignedToId: user.id } : {}),
      },
      include: {
        trialRun: true,
        plan: {
          include: {
            horse: { select: { name: true, isTrainingLocked: true } },
          },
        },
      },
      orderBy: { sessionDate: "asc" },
    });
  }
  async overview(user: Actor) {
    return this.prisma.horse.findMany({
      where: ownerScope(user),
      select: {
        id: true,
        name: true,
        healthStatus: true,
        isTrainingLocked: true,
        trainingPlans: {
          select: {
            sessions: {
              select: {
                sessionDate: true,
                isCompleted: true,
                cancelledAt: true,
                rating: true,
              },
              orderBy: { sessionDate: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
  }
  async createPlan(data: PlanDto, user: Actor) {
    if (new Date(data.endDate) < new Date(data.startDate))
      throw new BadRequestException("End date must follow start date");
    return this.prisma.$transaction(async (tx) => {
      const horse = await lockHorseRow(tx, data.horseId);
      assertTrainable(horse, data.intensity);
      const plan = await tx.trainingPlan.create({
        data: {
          ...data,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
        },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PLAN_CREATED",
          entityType: "TrainingPlan",
          entityId: plan.id,
        },
      });
      return plan;
    });
  }
  async findPlansByHorse(horseId: string, user: Actor) {
    if (
      !(await this.prisma.horse.findFirst({
        where: { id: horseId, ...ownerScope(user) },
      }))
    )
      throw new NotFoundException("Horse not found");
    return this.prisma.trainingPlan.findMany({
      where: { horseId },
      include: { sessions: { include: { trialRun: true } } },
      orderBy: { startDate: "desc" },
    });
  }
  async schedule(planId: string, data: SessionDto, user: Actor) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.trainingPlan.findUnique({ where: { id: planId } });
      if (!plan) throw new NotFoundException("Plan not found");
      const horse = await lockHorseRow(tx, plan.horseId);
      assertTrainable(horse, plan.intensity);
      const date = new Date(data.sessionDate);
      if (date < plan.startDate || date > plan.endDate)
        throw new BadRequestException("Session date must be within the plan");
      if (
        !(await tx.user.findFirst({
          where: {
            id: data.assignedToId,
            role: { in: ["GROOM", "HEAD_TRAINER"] },
            isLocked: false,
          },
        }))
      )
        throw new BadRequestException("Select an active groom or trainer");
      const session = await tx.trainingSession.create({
        data: { ...data, planId, sessionDate: date },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "SESSION_SCHEDULED",
          entityType: "TrainingSession",
          entityId: session.id,
        },
      });
      return session;
    });
  }
  async complete(id: string, data: CompleteDto, user: Actor) {
    const metrics = [
      data.finishTimeSeconds,
      data.maxSpeedKmh,
      data.preHeartRate,
      data.postHeartRate,
    ];
    if (
      metrics.some((v) => v !== undefined) &&
      metrics.some((v) => v === undefined)
    )
      throw new BadRequestException("Supply all four trial metrics");
    return this.prisma.$transaction(async (tx) => {
      const initial = await tx.trainingSession.findUnique({
        where: { id },
        include: { plan: true },
      });
      if (!initial) throw new NotFoundException("Session not found");
      const horse = await lockHorseRow(tx, initial.plan.horseId);
      assertTrainable(horse, initial.plan.intensity);
      const session = await tx.trainingSession.findUniqueOrThrow({
        where: { id },
      });
      if (session.isCompleted || session.cancelledAt)
        throw new BadRequestException(
          "Session is already completed or cancelled",
        );
      const result = await tx.trainingSession.update({
        where: { id },
        data: {
          trainerNote: data.trainerNote,
          rating: data.rating,
          isCompleted: true,
          ...(data.finishTimeSeconds !== undefined
            ? {
                trialRun: {
                  create: {
                    finishTimeSeconds: data.finishTimeSeconds,
                    maxSpeedKmh: data.maxSpeedKmh,
                    preHeartRate: data.preHeartRate,
                    postHeartRate: data.postHeartRate,
                    videoUrl: data.videoUrl,
                  },
                },
              }
            : {}),
        },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "SESSION_COMPLETED",
          entityType: "TrainingSession",
          entityId: id,
        },
      });
      return result;
    });
  }
}
