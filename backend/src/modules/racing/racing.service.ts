import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { HealthService } from '../health/health.service';

@Injectable()
export class RacingService {
  constructor(
    private prisma: PrismaService,
    private healthService: HealthService // Inject HealthService để kiểm tra điều kiện sức khỏe ngựa
  ) {}

  async registerHorseForRace(data: {
    horseId: string;
    raceName: string;
    raceDate: Date;
    distance: number;
  }) {
    // Chỉ ngựa đạt chuẩn Fit, không bị Training Lock mới được đăng ký đua
    const isLocked = await this.healthService.isHorseLocked(data.horseId);
    if (isLocked) {
      throw new BadRequestException(
        'Horse is under medical training lock and cannot be registered for races.'
      );
    }

    return this.prisma.raceEntry.create({ data });
  }

  async getRaceEntries() {
    return this.prisma.raceEntry.findMany({
      include: { horse: true, result: true },
      orderBy: { raceDate: 'desc' },
    });
  }
}
