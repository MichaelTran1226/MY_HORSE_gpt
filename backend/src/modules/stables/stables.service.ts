import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class StablesService {
  constructor(private prisma: PrismaService) {}

  async getStalls() {
    return this.prisma.stall.findMany({
      include: { horse: true },
      orderBy: { stallNumber: 'asc' },
    });
  }

  async reportIncident(data: {
    groomId: string;
    horseId: string;
    description: string;
    photoUrl?: string;
    severity: string;
  }) {
    return this.prisma.stableIncident.create({ data });
  }
}
