import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';

@Module({
  controllers: [ToursController],
  providers: [ToursService],
})
export class ToursModule {}
