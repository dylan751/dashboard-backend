import { Injectable } from '@nestjs/common';
import { ToursService } from '../tours/tours.service';
import { ServiceReturn } from '../common/models/ServiceReturn';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class ChartsService {
  constructor(
    private toursService: ToursService,
    private productsService: ProductsService,
  ) {}

  async getTourPriceBarChart(): Promise<ServiceReturn<any>> {
    const barCharData = await this.toursService.getTourPriceBarChart();
    return {
      data: barCharData,
      err: null,
    };
  }

  async getProductCategoryPieChart(): Promise<ServiceReturn<any>> {
    const pieCharData = await this.productsService.getProductCategoryPieChart();
    return {
      data: pieCharData,
      err: null,
    };
  }
}
