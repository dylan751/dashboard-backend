import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import AppResponse from 'src/common/models/AppResponse';
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Post()
  async create(@Body() createDestinationDto: CreateDestinationDto) {
    const { err, data } = await this.destinationsService.create(
      createDestinationDto,
    );
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.destinationsService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.destinationsService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
  ) {
    const { err, data } = await this.destinationsService.update(
      +id,
      updateDestinationDto,
    );
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const { err, data } = await this.destinationsService.delete(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
