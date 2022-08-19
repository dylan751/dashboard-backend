import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import AppResponse from 'src/common/models/AppResponse';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  async create(@Body() createFormDto: CreateFormDto) {
    const { err, data } = await this.formsService.create(createFormDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.formsService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.formsService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    const { err, data } = await this.formsService.update(+id, updateFormDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const { err, data } = await this.formsService.delete(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
