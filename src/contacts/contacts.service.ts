import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Pool } from 'pg';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import { Contact } from './entities/contact.entity';
import Collection from 'src/common/models/Collection';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<ServiceReturn<Contact>> {
    try {
      const { userId, name, phoneNumber, email, title, description } =
        createContactDto;

      try {
        await this.conn.query('BEGIN');

        // Create new contact record
        const contactQueryInsert = await this.conn.query(
          `
            INSERT INTO contacts
              (
                userId,
                name,
                phoneNumber,
                email,
                title,
                description
              )
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING contactid
          `,
          [userId ? userId : 4, name, phoneNumber, email, title, description],
        );
        const id = contactQueryInsert.rows[0].contactid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const contactInfo = data as Contact;
          return {
            err: null,
            data: {
              contactId: id,
              userId: contactInfo.userId,
              name: contactInfo.name,
              phoneNumber: contactInfo.phoneNumber,
              email: contactInfo.email,
              title: contactInfo.title,
              description: contactInfo.description,
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
          HTTP_EXCEPTION_ERROR_CODE.CONTACT_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Contact>>> {
    try {
      let query = `
        SELECT
          contactid,
          userid,
          name,
          phoneNumber,
          email,
          title,
          description
        FROM contacts
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const contacts = await this.conn.query(query);
      // Update code findAll
      const collection: Collection<Contact> = {
        edges: contacts.rows.map((row) => ({
          contactId: row.contactid,
          userId: row.userid,
          name: row.name,
          phoneNumber: row.phonenumber,
          email: row.email,
          title: row.title,
          description: row.description,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: contacts.rows.length || 0,
        },
      };

      // Sort result array
      collection.edges.sort((a, b) => (a.contactId > b.contactId ? 1 : -1));

      return {
        err: null,
        data: collection,
      };
    } catch (error) {
      this.logger.log(`findAll error: ${error.message}`);
      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.CONTACT_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Contact>> {
    try {
      const { rows: contactData } = await this.conn.query(
        `
          SELECT
            contactid,
            userid,
            name,
            phoneNumber,
            email,
            title,
            description
          FROM contacts
          WHERE contacts.contactId = $1
          `,
        [id],
      );

      const contact: Contact = contactData[0]
        ? {
            contactId: id,
            userId: contactData[0].userid,
            name: contactData[0].name,
            phoneNumber: contactData[0].phonenumber,
            email: contactData[0].email,
            title: contactData[0].title,
            description: contactData[0].description,
          }
        : null;

      return {
        err: null,
        data: contact as Contact,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.CONTACT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.CONTACT_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateContactDto: UpdateContactDto,
  ): Promise<ServiceReturn<Contact>> {
    try {
      const { userId, name, phoneNumber, email, title, description } =
        updateContactDto;
      let query = 'UPDATE contacts SET';

      // Query contact
      const queryContact = await this.conn.query(
        `
          SELECT
            contactId
          FROM contacts
          WHERE contactId = $1
        `,
        [id],
      );

      // Check contact exist
      if (queryContact.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.CONTACT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.CONTACT_DOES_NOT_EXIST,
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

      // Update full phoneNumber
      if (phoneNumber) {
        query += ` phoneNumber = \'${phoneNumber}\',`;
      }

      // Update full email
      if (email) {
        query += ` email = \'${email}\',`;
      }

      // Update full title
      if (title) {
        query += ` title = \'${title}\',`;
      }

      // Update full description
      if (description) {
        query += ` description = \'${description}\'`;
      }

      query += `WHERE contactid = \'${id}\'`;

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
            [HTTP_EXCEPTION_ERROR_MESSAGES.CONTACT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.CONTACT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.CONTACT_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const contact = await this.conn.query(
        `
          SELECT
            contactid
          FROM contacts
          WHERE contactid = $1
        `,
        [id],
      );

      if (!contact.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.CONTACT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.CONTACT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const contactId = contact.rows[0].contactid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove form
      await this.conn.query('DELETE from contacts WHERE contactid = $1;', [
        contactId,
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
          HTTP_EXCEPTION_ERROR_CODE.CONTACT_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }
}
