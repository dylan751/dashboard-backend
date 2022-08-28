import { Controller, Get } from '@nestjs/common';
import AppResponse from '../common/models/AppResponse';
import { ChartsService } from './charts.service';

@Controller('charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get('tour-bar-chart')
  async getTourPriceBarChart() {
    const { err, data } = await this.chartsService.getTourPriceBarChart();
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get('product-pie-chart')
  async getProductCategoryPieChart() {
    const { err, data } = await this.chartsService.getProductCategoryPieChart();
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
