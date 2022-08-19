import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Pool } from 'pg';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import { Review } from './entities/review.entity';
import Collection from 'src/common/models/Collection';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(
    createReviewDto: CreateReviewDto,
  ): Promise<ServiceReturn<Review>> {
    try {
      const { userId, name, email, tourId, rating, content } = createReviewDto;

      try {
        await this.conn.query('BEGIN');

        // Create new user record
        const reviewQueryInsert = await this.conn.query(
          `
            INSERT INTO reviews
              (
                userId,
                name,
                email,
                tourId,
                rating,
                content
              )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING reviewid
          `,
          [userId, name, email, tourId, rating, content],
        );
        const id = reviewQueryInsert.rows[0].reviewid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const reviewInfo = data as Review;
          return {
            err: null,
            data: {
              reviewId: id,
              userId: reviewInfo.userId,
              name: reviewInfo.name,
              email: reviewInfo.email,
              tourId: reviewInfo.tourId,
              rating: reviewInfo.rating,
              content: reviewInfo.content,
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
          HTTP_EXCEPTION_ERROR_CODE.REVIEW_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Review>>> {
    try {
      let query = `
        SELECT
          reviewid,
          userid,
          name,
          email,
          tourId,
          rating,
          content
        FROM reviews
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const reviews = await this.conn.query(query);
      // Update code findAll
      const collection: Collection<Review> = {
        edges: reviews.rows.map((row) => ({
          reviewId: row.reviewid,
          userId: row.userid,
          name: row.name,
          email: row.email,
          tourId: row.tourid,
          rating: row.rating,
          content: row.content,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: reviews.rows.length || 0,
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
          HTTP_EXCEPTION_ERROR_CODE.REVIEW_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Review>> {
    try {
      const { rows: reviewData } = await this.conn.query(
        `
          SELECT
            reviewid,
            userid,
            name,
            email,
            tourId,
            rating,
            content
          FROM reviews
          WHERE reviews.reviewId = $1
          `,
        [id],
      );

      const review: Review = reviewData[0]
        ? {
            reviewId: id,
            userId: reviewData[0].userid,
            name: reviewData[0].name,
            email: reviewData[0].email,
            tourId: reviewData[0].tourid,
            rating: reviewData[0].rating,
            content: reviewData[0].content,
          }
        : null;

      return {
        err: null,
        data: review as Review,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.REVIEW_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.REVIEW_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ServiceReturn<Review>> {
    try {
      const { userId, name, email, tourId, rating, content } = updateReviewDto;
      let query = 'UPDATE reviews SET';

      // Query form
      const queryReview = await this.conn.query(
        `
          SELECT
            reviewId
          FROM reviews
          WHERE reviewId = $1
        `,
        [id],
      );

      // Check review exist
      if (queryReview.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.REVIEW_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.REVIEW_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      await this.conn.query('BEGIN');

      // Update userId
      if (userId) {
        query += ` userId = \'${userId}\',`;
      }

      // Update name
      if (name) {
        query += ` name = \'${name}\',`;
      }

      // Update full email
      if (email) {
        query += ` email = \'${email}\',`;
      }

      // Update tourId
      if (tourId) {
        query += ` tourId = \'${tourId}\',`;
      }

      // Update rating
      if (rating) {
        query += ` rating = \'${rating}\',`;
      }

      // Update content
      if (content) {
        query += ` content = \'${content}\'`;
      }

      query += `WHERE reviewid = \'${id}\'`;

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
            [HTTP_EXCEPTION_ERROR_MESSAGES.REVIEW_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.REVIEW_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.REVIEW_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const review = await this.conn.query(
        `
              SELECT
                reviewid
              FROM reviews
              WHERE reviewid = $1
            `,
        [id],
      );

      if (!review.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.REVIEW_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.REVIEW_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const reviewId = review.rows[0].reviewid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove form
      await this.conn.query('DELETE from reviews WHERE reviewid = $1;', [
        reviewId,
      ]);

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
          HTTP_EXCEPTION_ERROR_CODE.REVIEW_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }
}
