import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [HealthModule], // Tái sử dụng HealthService an toàn mà không xâm lấn dữ liệu
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
