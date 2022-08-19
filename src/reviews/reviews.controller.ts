import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import AppResponse from 'src/common/models/AppResponse';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto) {
    const { err, data } = await this.reviewsService.create(createReviewDto);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.reviewsService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { err, data } = await this.reviewsService.findOne(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    const { err, data } = await this.reviewsService.update(
      +id,
      updateReviewDto,
    );
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const { err, data } = await this.reviewsService.delete(+id);
    if (err) throw err;

    return AppResponse.ok(data);
  }
}
