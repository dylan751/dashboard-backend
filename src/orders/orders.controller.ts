import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import AppResponse from 'src/common/models/AppResponse';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const { err, data } = await this.ordersService.create(createOrderDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.ordersService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.ordersService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const { err, data } = await this.ordersService.update(+id, updateOrderDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const { err, data } = await this.ordersService.delete(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
