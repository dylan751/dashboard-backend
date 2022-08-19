import { Inject, Injectable, Logger } from '@nestjs/common';
import Collection from 'src/common/models/Collection';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Pool } from 'pg';
import { Form } from './entities/form.entity';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class FormsService {
  private readonly logger = new Logger(FormsService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(createFormDto: CreateFormDto): Promise<ServiceReturn<Form>> {
    try {
      const {
        tourId,
        name,
        phoneNumber,
        email,
        numberOfPeople,
        startTime,
        endTime,
      } = createFormDto;

      try {
        await this.conn.query('BEGIN');

        // Create new user record
        const formQueryInsert = await this.conn.query(
          `
            INSERT INTO forms
              (
                tourId,
                name,
                phoneNumber,
                email,
                numberOfPeople,
                startTime,
                endTime
              )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING formid
          `,
          [
            tourId,
            name,
            phoneNumber,
            email,
            numberOfPeople,
            startTime,
            endTime,
          ],
        );
        const id = formQueryInsert.rows[0].formid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const formInfo = data as Form;
          return {
            err: null,
            data: {
              formId: id,
              tourId: formInfo.tourId,
              name: formInfo.name,
              phoneNumber: formInfo.phoneNumber,
              email: formInfo.email,
              numberOfPeople: formInfo.numberOfPeople,
              startTime: formInfo.startTime,
              endTime: formInfo.endTime,
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
          HTTP_EXCEPTION_ERROR_CODE.FORM_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Form>>> {
    try {
      let query = `
        SELECT
          formid,
          tourId,
          name,
          phoneNumber,
          email,
          numberOfPeople,
          startTime,
          endTime
        FROM forms
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const forms = await this.conn.query(query);
      // Update code findAll
      const collection: Collection<Form> = {
        edges: forms.rows.map((row) => ({
          formId: row.formid,
          tourId: row.tourid,
          name: row.name,
          phoneNumber: row.phonenumber,
          email: row.email,
          numberOfPeople: row.numberofpeople,
          startTime: row.starttime,
          endTime: row.endtime,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: forms.rows.length || 0,
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
          HTTP_EXCEPTION_ERROR_CODE.FORM_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Form>> {
    try {
      const { rows: formData } = await this.conn.query(
        `
          SELECT
            tourId,
            name,
            phoneNumber,
            email,
            numberOfPeople,
            startTime,
            endTime
          FROM forms
          WHERE forms.formId = $1
          `,
        [id],
      );

      const form: Form = formData[0]
        ? {
            formId: id,
            tourId: formData[0].tourid,
            name: formData[0].name,
            phoneNumber: formData[0].phonenumber,
            email: formData[0].email,
            numberOfPeople: formData[0].numberofpeople,
            startTime: formData[0].starttime,
            endTime: formData[0].endtime,
          }
        : null;

      return {
        err: null,
        data: form as Form,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.FORM_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.FORM_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateFormDto: UpdateFormDto,
  ): Promise<ServiceReturn<Form>> {
    try {
      const {
        tourId,
        name,
        phoneNumber,
        email,
        numberOfPeople,
        startTime,
        endTime,
      } = updateFormDto;
      let query = 'UPDATE forms SET';

      // Query form
      const queryForm = await this.conn.query(
        `
          SELECT
            formId
          FROM forms
          WHERE formId = $1
        `,
        [id],
      );

      // Check form exist
      if (queryForm.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.FORM_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.FORM_DOES_NOT_EXIST,
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

      // Update phoneNumber
      if (phoneNumber) {
        query += ` phoneNumber = \'${phoneNumber}\',`;
      }

      // Update full email
      if (email) {
        query += ` email = \'${email}\',`;
      }

      // Update numberOfPeople
      if (numberOfPeople) {
        query += ` numberOfPeople = \'${numberOfPeople}\',`;
      }

      // Update startTime
      if (startTime) {
        query += ` startTime = \'${startTime}\',`;
      }

      // Update endTime
      if (endTime) {
        query += ` endTime = \'${endTime}\'`;
      }

      query += `WHERE formid = \'${id}\'`;

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
            [HTTP_EXCEPTION_ERROR_MESSAGES.FORM_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.FORM_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.FORM_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const form = await this.conn.query(
        `
          SELECT
            formid
          FROM forms
          WHERE formid = $1
        `,
        [id],
      );

      if (!form.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.FORM_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.FORM_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const formId = form.rows[0].formid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove form
      await this.conn.query('DELETE from forms WHERE formid = $1;', [formId]);

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
          HTTP_EXCEPTION_ERROR_CODE.FORM_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }
}
