import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import AppResponse from 'src/common/models/AppResponse';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  async create(@Body() createTourDto: CreateTourDto) {
    const { err, data } = await this.toursService.create(createTourDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.toursService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.toursService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    const { err, data } = await this.toursService.update(+id, updateTourDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const { err, data } = await this.toursService.remove(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
