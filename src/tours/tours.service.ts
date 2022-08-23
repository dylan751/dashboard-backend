import { Inject, Injectable, Logger } from '@nestjs/common';
import Collection from 'src/common/models/Collection';
import { ServiceReturn } from '../../src/common/models/ServiceReturn';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { Pool } from 'pg';
import { Tour } from './entities/tour.entity';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(createTourDto: CreateTourDto): Promise<ServiceReturn<Tour>> {
    try {
      const {
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
        isTrending,
      } = createTourDto;

      // Query all tours. Check unique tour title
      const queryTours = await this.conn.query(
        `
          SELECT title
          FROM tours
        `,
      );

      const tourTitles = queryTours.rows.map((row) => row.title);

      if (tourTitles.includes(title)) {
        return {
          err: AppResponse.conflict(
            [HTTP_EXCEPTION_ERROR_MESSAGES.TOUR_TITLE_MUST_UNIQUE],
            HTTP_EXCEPTION_ERROR_CODE.TOUR_TITLE_MUST_UNIQUE,
          ),
          data: null,
        };
      }
      try {
        await this.conn.query('BEGIN');

        // Create new tour record
        const tourQueryInsert = await this.conn.query(
          `
            INSERT INTO tours
              (
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
              )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            RETURNING tourid
          `,
          [
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
            isTrending,
          ],
        );
        const id = tourQueryInsert.rows[0].tourid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const tourInfo = data as Tour;
          return {
            err: null,
            data: {
              tourId: id,
              title: tourInfo.title,
              duration: tourInfo.duration,
              startTime: tourInfo.startTime,
              rating: tourInfo.rating,
              hotel: tourInfo.hotel,
              price: tourInfo.price,
              vehicle: tourInfo.vehicle,
              type: tourInfo.type,
              numberOfPeople: tourInfo.numberOfPeople,
              description: tourInfo.description,
              numberOfBooking: tourInfo.numberOfBooking,
              image: tourInfo.image,
              isTrending: tourInfo.isTrending,
            },
          };
        }
        return {
          err,
          data: null,
        };
      } catch (error) {
        await this.conn.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      this.logger.log(error);

      this.logger.log(
        `create error: ${
          error.response ? error.response.data.msg : error.message
        }`,
      );

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.TOUR_CREATE_FAILED,
        ),
        data: null,
      };
    }
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
          tourId: row.tourid,
          title: row.title,
          duration: row.duration,
          startTime: row.starttime,
          rating: row.rating,
          hotel: row.hotel,
          price: row.price,
          vehicle: row.vehicle,
          type: row.type,
          numberOfPeople: row.numberofpeople,
          description: row.description,
          numberOfBooking: row.numberofbooking,
          image: row.image,
          isTrending: row.istrending,
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
    try {
      const { rows: tourData } = await this.conn.query(
        `
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
          WHERE tours.tourId = $1
          `,
        [id],
      );

      const tour: Tour = tourData[0]
        ? {
            tourId: id,
            title: tourData[0].title,
            duration: tourData[0].duration,
            startTime: tourData[0].starttime,
            rating: tourData[0].rating,
            hotel: tourData[0].hotel,
            price: tourData[0].price,
            vehicle: tourData[0].vehicle,
            type: tourData[0].type,
            numberOfPeople: tourData[0].numberofpeople,
            description: tourData[0].description,
            numberOfBooking: tourData[0].numberofbooking,
            image: tourData[0].image,
            isTrending: tourData[0].istrending,
          }
        : null;

      return {
        err: null,
        data: tour as Tour,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.TOUR_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.TOUR_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateTourDto: UpdateTourDto,
  ): Promise<ServiceReturn<Tour>> {
    try {
      const {
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
        isTrending,
      } = updateTourDto;
      let query = 'UPDATE tours SET';

      // Query tour
      const queryTour = await this.conn.query(
        `
          SELECT
            tourId
          FROM tours
          WHERE tourId = $1
        `,
        [id],
      );

      // Check tour exist
      if (queryTour.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.TOUR_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.TOUR_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      await this.conn.query('BEGIN');

      // Update title
      if (title) {
        query += ` title = \'${title}\',`;
      }

      // Update duration
      if (duration) {
        query += ` duration = \'${duration}\',`;
      }

      // Update startTime
      if (startTime) {
        query += ` startTime = \'${startTime}\',`;
      }

      // Update full rating
      if (rating) {
        query += ` rating = \'${rating}\',`;
      }

      // Update hotel
      if (hotel) {
        query += ` hotel = \'${hotel}\',`;
      }

      // Update price
      if (price) {
        query += ` price = \'${price}\',`;
      }

      // Update vehicle
      if (vehicle) {
        query += ` vehicle = \'${vehicle}\',`;
      }

      // Update type
      if (type) {
        query += ` type = \'${type}\',`;
      }

      // Update numberOfPeople
      if (numberOfPeople) {
        query += ` numberOfPeople = \'${numberOfPeople}\',`;
      }

      // Update description
      if (description) {
        query += ` description = \'${description}\',`;
      }

      // Update numberOfBooking
      if (numberOfBooking) {
        query += ` numberOfBooking = \'${numberOfBooking}\',`;
      }

      // Update image
      if (image) {
        query += ` image = \'${image}\',`;
      }

      // Update isTrending
      if (isTrending) {
        query += ` isTrending = \'${isTrending}\'`;
      }

      query += `WHERE tourid = \'${id}\'`;

      await this.conn.query(query);

      await this.conn.query('COMMIT');

      return {
        err: null,
        data: {},
      };
    } catch (error) {
      await this.conn.query('ROLLBACK');

      this.logger.log(`update error: ${error.message}`);
      if (error.message === 'NOT_FOUND') {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.TOUR_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.TOUR_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.TOUR_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const tour = await this.conn.query(
        `
          SELECT
            tourid
          FROM tours
          WHERE tourid = $1
        `,
        [id],
      );

      if (!tour.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.TOUR_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.TOUR_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const tourId = tour.rows[0].tourid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove tour
      await this.conn.query('DELETE from tours WHERE tourid = $1;', [tourId]);

      await this.conn.query('COMMIT');

      return {
        err: null,
        data: {},
      };
    } catch (error) {
      await this.conn.query('ROLLBACK');
      this.logger.log(`delete error: ${error.message}`);

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.TOUR_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }

  async getTourPriceBarChart() {
    let query = '';
    const data = [];

    // The range of prices
    const priceRangeArr = [
      { min: 0, max: 200 },
      { min: 200, max: 400 },
      { min: 400, max: 600 },
      { min: 600, max: 800 },
      { min: 800, max: 1000 },
      { min: 1000, max: 1200 },
      { min: 1200, max: 1400 },
      { min: 1400, max: 1600 },
    ];
    await Promise.all(
      priceRangeArr.map(async (priceRange) => {
        query = `
        SELECT COUNT(*)
        FROM tours
        WHERE price > ${priceRange.min} AND price <= ${priceRange.max} 
      `;
        const total = await this.conn.query(query);
        data.push({
          x: `$${priceRange.min}-${priceRange.max}`,
          y: total.rows[0].count,
        });
      }),
    );

    // Sort the result array based on price range
    const sortedData = data.sort((a, b) => {
      if (+a.x.split('-')[1] > +b.x.split('-')[1]) {
        return 1;
      } else {
        return -1;
      }
    });
    return sortedData;
  }
}
