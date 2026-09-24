import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService], // Export để TrainingModule gọi kiểm tra Training Lock
})
export class HealthModule {}
