import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async getStaffDirectory() {
    return this.prisma.user.findMany({
      where: {
        role: { in: ['CLUB_MANAGER', 'HEAD_TRAINER', 'VETERINARIAN', 'GROOM'] },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        isLocked: true,
        createdAt: true,
      },
      orderBy: { fullName: 'asc' },
    });
  }
}
