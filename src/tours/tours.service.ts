import { Inject, Injectable, Logger } from '@nestjs/common';
import Collection from 'src/common/models/Collection';
import { ServiceReturn } from '../../src/common/models/ServiceReturn';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Pool } from 'pg';
import { Tour } from './entities/tour.entity';
import AppResponse from 'src/common/models/AppResponse';
import { HTTP_EXCEPTION_ERROR_CODE } from 'src/utils/constants';

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(createTourDto: CreateTourDto): Promise<ServiceReturn<Tour>> {
    return {
      data: {},
      err: null,
    };
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Tour>>> {
    try {
      let query = `
        SELECT
          tourId,
          title,
          duration,
          startTime,
          rating,
          hotel,
          price,
          vehicle,
          type,
          numberOfPeople,
          description,
          numberOfBooking,
          image,
          isTrending
        FROM tours
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const tours = await this.conn.query(query);

      // Update code findAll
      const collection: Collection<Tour> = {
        edges: tours.rows.map((row) => ({
          tourId: row.tourId,
          title: row.title,
          duration: row.duration,
          startTime: row.startTime,
          rating: row.rating,
          hotel: row.hotel,
          price: row.price,
          vehicle: row.vehicle,
          type: row.type,
          numberOfPeople: row.numberOfPeople,
          description: row.description,
          numberOfBooking: row.numberOfBooking,
          image: row.image,
          isTrending: row.isTrending,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: tours.rows.length || 0,
        },
      };

      return {
        err: null,
        data: collection,
      };
    } catch (error) {
      this.logger.log(`findAll error: ${error.message}`);
      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.TOUR_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Tour>> {
    return {
      data: {},
      err: null,
    };
  }

  async update(
    id: number,
    updateTourDto: UpdateTourDto,
  ): Promise<ServiceReturn<Tour>> {
    return {
      data: {},
      err: null,
    };
  }

  async remove(id: number): Promise<ServiceReturn<any>> {
    return {
      data: {},
      err: null,
    };
  }
}
