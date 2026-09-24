import { Module } from '@nestjs/common';
import { RacingService } from './racing.service';
import { RacingController } from './racing.controller';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [HealthModule],
  controllers: [RacingController],
  providers: [RacingService],
  exports: [RacingService],
})
export class RacingModule {}
