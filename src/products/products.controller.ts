import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import AppResponse from 'src/common/models/AppResponse';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const { err, data } = await this.productsService.create(createProductDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.productsService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.productsService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const { err, data } = await this.productsService.update(
      +id,
      updateProductDto,
    );
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const { err, data } = await this.productsService.delete(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
