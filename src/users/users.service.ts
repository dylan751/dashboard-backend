import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pool } from 'pg';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import Collection from 'src/common/models/Collection';
import { User, UserInfo } from './entities/user.entity';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';
import * as bcrypt from 'bcrypt';
import { hashPassword } from 'src/utils/bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(userData: CreateUserDto): Promise<ServiceReturn<UserInfo>> {
    try {
      const { email, password } = userData;

      // Hashing user's password
      const salt = bcrypt.genSaltSync();
      const hashedPassword = hashPassword(password, salt);

      // Query all user. Check unique email
      const queryEmails = await this.conn.query(
        `
          SELECT email
          FROM users
        `,
      );

      const emails = queryEmails.rows.map((row) => row.email);

      // TODO: Update check email unique on all server
      if (emails.includes(email)) {
        return {
          err: AppResponse.conflict(
            [HTTP_EXCEPTION_ERROR_MESSAGES.USER_EMAIL_MUST_UNIQUE],
            HTTP_EXCEPTION_ERROR_CODE.USER_EMAIL_MUST_UNIQUE,
          ),
          data: null,
        };
      }
      try {
        await this.conn.query('BEGIN');

        // Create new user record
        const userQueryInsert = await this.conn.query(
          `
            INSERT INTO users
              (
                email,
                salt,
                password
              )
            VALUES ($1,$2,$3)
            RETURNING userid
          `,
          [email, salt, hashedPassword],
        );
        const userId = userQueryInsert.rows[0].userid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(userId);

        if (data && !err) {
          const userInfo = data as UserInfo;
          return {
            err: null,
            data: {
              userId: userId,
              email: userInfo.email,
              salt: userInfo.salt,
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
      // Truong hop loi do gotrue
      if (error.response) {
        switch (error.response.data.code) {
          case 422:
            return {
              err: AppResponse.authenticationFailed(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.GOTRUE_AUTH_FAILED,
              ),
              data: null,
            };
          case 401:
            return {
              err: AppResponse.forbidden(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.GOTRUE_FORBIDDEN,
              ),
              data: null,
            };
          default:
            return {
              err: AppResponse.internalServerError(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.GOTRUE_FAILED,
              ),
              data: null,
            };
        }
      }

      this.logger.log(
        `create error: ${
          error.response ? error.response.data.msg : error.message
        }`,
      );

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.USER_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<User>>> {
    try {
      let query = `
        SELECT
          userid,
          email,
          salt,
          password
        FROM users
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const users = await this.conn.query(query);

      // Update code findAll
      const collection: Collection<User> = {
        edges: users.rows.map((row) => ({
          userId: row.userid,
          email: row.email,
          salt: row.salt,
          password: row.password,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: users.rows.length || 0,
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
          HTTP_EXCEPTION_ERROR_CODE.USER_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<UserInfo>> {
    try {
      const { rows: userData } = await this.conn.query(
        `
            SELECT
              userid,
              email,
              salt
            FROM users
            WHERE users.userid = $1
            `,
        [id],
      );

      const user: UserInfo = userData[0]
        ? {
            userId: id,
            email: userData[0].email,
          }
        : null;

      return {
        err: null,
        data: user as UserInfo,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.USER_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOneByEmail(email: string): Promise<ServiceReturn<User>> {
    try {
      const { rows: userData } = await this.conn.query(
        `
            SELECT
              userid,
              email,
              password,
              salt
            FROM users
            WHERE users.email = $1
            `,
        [email],
      );

      const user: User = userData[0]
        ? {
            userId: userData[0].userid,
            email: userData[0].email,
            password: userData[0].password,
            salt: userData[0].salt,
          }
        : null;

      return {
        err: null,
        data: user as User,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.USER_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    userId: number,
    updateUserData: UpdateUserDto,
  ): Promise<ServiceReturn<UserInfo>> {
    try {
      const { email, password } = updateUserData;
      let query = 'UPDATE users SET';

      // Query user
      const queryUser = await this.conn.query(
        `
          SELECT
            userid,
          FROM users
          WHERE userid = $1
        `,
        [userId],
      );

      // Check user exist
      if (queryUser.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.USER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      await this.conn.query('BEGIN');

      // Update email
      if (email) {
        query += ` email = \'${email}\'`;
      }

      // Update password
      if (password) {
        query += ` password = \'${password}\',`;
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
            [HTTP_EXCEPTION_ERROR_MESSAGES.USER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }
      if (error.response) {
        switch (error.response.data?.code) {
          case 401:
            return {
              err: AppResponse.forbidden(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.USER_UPDATE_FORBIDDEN,
              ),
              data: null,
            };
          default:
            return {
              err: AppResponse.internalServerError(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.USER_UPDATE_FAILED,
              ),
              data: null,
            };
        }
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.USER_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number) {
    try {
      const user = await this.conn.query(
        `
          SELECT
            userid
          FROM users
          WHERE userid = $1`,
        [id],
      );

      if (!user.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.USER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const userId = user.rows[0].userid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove user
      await this.conn.query('DELETE from users WHERE userid = $1;', [userId]);

      await this.conn.query('COMMIT');

      return {
        err: null,
        data: {},
      };
    } catch (error) {
      await this.conn.query('ROLLBACK');
      this.logger.log(`delete error: ${error.message}`);

      if (error.message === 'NOT_FOUND') {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.USER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      if (error.response) {
        switch (error.response.data.code) {
          case 401:
            return {
              err: AppResponse.unauthorized(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.UNAUTHORIZED_TO_REMOVE_USER,
              ),
              data: null,
            };
          default:
            return {
              err: AppResponse.internalServerError(
                [error.response.data.msg],
                HTTP_EXCEPTION_ERROR_CODE.USER_DELETE_FAILED,
              ),
              data: null,
            };
        }
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.USER_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }
}
