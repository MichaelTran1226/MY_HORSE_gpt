import { Module } from '@nestjs/common';
import { StablesService } from './stables.service';
import { StablesController } from './stables.controller';

@Module({
  controllers: [StablesController],
  providers: [StablesService],
  exports: [StablesService],
})
export class StablesModule {}
