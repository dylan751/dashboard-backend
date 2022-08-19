import { Inject, Injectable, Logger } from '@nestjs/common';
import Collection from 'src/common/models/Collection';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Pool } from 'pg';
import { Destination } from './entities/destination.entity';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class DestinationsService {
  private readonly logger = new Logger(DestinationsService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(
    createDestinationDto: CreateDestinationDto,
  ): Promise<ServiceReturn<Destination>> {
    try {
      const { tourId, name, address, description, content, image } =
        createDestinationDto;

      // Query all destinations. Check unique destination name
      const queryDestinations = await this.conn.query(
        `
          SELECT name
          FROM destinations
        `,
      );

      const destinationNames = queryDestinations.rows.map((row) => row.name);

      if (destinationNames.includes(name)) {
        return {
          err: AppResponse.conflict(
            [HTTP_EXCEPTION_ERROR_MESSAGES.DESTINATION_NAME_MUST_UNIQUE],
            HTTP_EXCEPTION_ERROR_CODE.DESTINATION_NAME_MUST_UNIQUE,
          ),
          data: null,
        };
      }
      try {
        await this.conn.query('BEGIN');

        // Create new user record
        const destinationQueryInsert = await this.conn.query(
          `
            INSERT INTO destinations
              (
                tourId,
                name,
                address,
                description,
                content,
                image
              )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING destinationid
          `,
          [tourId, name, address, description, content, image],
        );
        const id = destinationQueryInsert.rows[0].destinationid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const destinationInfo = data as Destination;
          return {
            err: null,
            data: {
              destinationId: id,
              tourId: destinationInfo.tourId,
              name: destinationInfo.name,
              address: destinationInfo.address,
              description: destinationInfo.description,
              content: destinationInfo.content,
              image: destinationInfo.image,
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
          HTTP_EXCEPTION_ERROR_CODE.DESTINATION_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Destination>>> {
    try {
      let query = `
        SELECT
          destinationId,
          tourId,
          name,
          address,
          description,
          content,
          image
        FROM destinations
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const destinations = await this.conn.query(query);
      // Update code findAll
      const collection: Collection<Destination> = {
        edges: destinations.rows.map((row) => ({
          destinationId: row.destinationid,
          tourId: row.tourid,
          name: row.name,
          address: row.address,
          description: row.description,
          content: row.content,
          image: row.image,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: destinations.rows.length || 0,
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
          HTTP_EXCEPTION_ERROR_CODE.DESTINATION_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Destination>> {
    try {
      const { rows: destinationData } = await this.conn.query(
        `
          SELECT
            destinationId,
            tourId,
            name,
            address,
            description,
            content,
            image
          FROM destinations
          WHERE destinations.destinationId = $1
          `,
        [id],
      );

      const destination: Destination = destinationData[0]
        ? {
            destinationId: id,
            tourId: destinationData[0].tourid,
            name: destinationData[0].name,
            address: destinationData[0].address,
            description: destinationData[0].description,
            content: destinationData[0].content,
            image: destinationData[0].image,
          }
        : null;

      return {
        err: null,
        data: destination as Destination,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.DESTINATION_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.DESTINATION_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateDestinationDto: UpdateDestinationDto,
  ): Promise<ServiceReturn<Destination>> {
    try {
      const { tourId, name, address, description, content, image } =
        updateDestinationDto;
      let query = 'UPDATE destinations SET';

      // Query tour
      const queryDestination = await this.conn.query(
        `
          SELECT
            destinationId
          FROM destinations
          WHERE destinationId = $1
        `,
        [id],
      );

      // Check tour exist
      if (queryDestination.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.DESTINATION_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.DESTINATION_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      await this.conn.query('BEGIN');

      // Update tourId
      if (tourId) {
        query += ` tourId = \'${tourId}\',`;
      }

      // Update name
      if (name) {
        query += ` name = \'${name}\',`;
      }

      // Update address
      if (address) {
        query += ` address = \'${address}\',`;
      }

      // Update description
      if (description) {
        query += ` description = \'${description}\',`;
      }

      // Update content
      if (content) {
        query += ` content = \'${content}\',`;
      }

      // Update image
      if (image) {
        query += ` image = \'${image}\';`;
      }

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
            [HTTP_EXCEPTION_ERROR_MESSAGES.DESTINATION_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.DESTINATION_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.DESTINATION_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const destination = await this.conn.query(
        `
              SELECT
                destinationid
              FROM destinations
              WHERE destinationid = $1
            `,
        [id],
      );

      if (!destination.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.DESTINATION_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.DESTINATION_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const destinationId = destination.rows[0].destinationid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove user
      await this.conn.query(
        'DELETE from destinations WHERE destinationid = $1;',
        [destinationId],
      );

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
          HTTP_EXCEPTION_ERROR_CODE.DESTINATION_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }
}
