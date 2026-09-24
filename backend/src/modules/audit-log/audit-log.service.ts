import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }

  async getRecentLogs(limit = 50) {
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { fullName: true, role: true, email: true } } },
    });
  }
}
