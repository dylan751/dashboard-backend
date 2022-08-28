import { Module } from '@nestjs/common';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ToursModule } from '../tours/tours.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [ToursModule, ProductsModule, DatabaseModule],
  controllers: [ChartsController],
  providers: [ChartsService],
})
export class ChartsModule {}
