import { Injectable } from '@nestjs/common';
import { ToursService } from '../tours/tours.service';
import { ServiceReturn } from '../common/models/ServiceReturn';

@Injectable()
export class ChartsService {
  constructor(private toursService: ToursService) {}

  async getTourPriceBarChart(): Promise<ServiceReturn<any>> {
    const barCharData = await this.toursService.getTourPriceBarChart();
    return {
      data: barCharData,
      err: null,
    };
  }
}
