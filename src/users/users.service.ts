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
      const { username, password, email, name, role } = userData;

      // Hashing user's password
      const salt = bcrypt.genSaltSync();
      const hashedPassword = hashPassword(password, salt);

      // Query all user. Check unique email
      const queryUsernames = await this.conn.query(
        `
          SELECT username
          FROM users
        `,
      );

      const usernames = queryUsernames.rows.map((row) => row.username);

      // TODO: Update check username unique on all server
      if (usernames.includes(username)) {
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
                      username,
                      password,
                      salt,
                      email,
                      name,
                      role
                    )
                  VALUES ($1,$2,$3,$4,$5,$6)
                  RETURNING id
                `,
          [username, hashedPassword, salt, email, name, role],
        );
        const { id: userId } = userQueryInsert.rows[0];
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(userId);

        if (data && !err) {
          const userInfo = data as UserInfo;
          return {
            err: null,
            data: {
              id: userId,
              username: userInfo.username,
              salt: userInfo.salt,
              email: userInfo.email,
              name: userInfo.name,
              role: userInfo.role,
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
          id,
          username,
          salt,
          email,
          name,
          role
        FROM users
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const users = await this.conn.query(query);

      // Update code findAll
      const collection: Collection<User> = {
        edges: users.rows.map((row) => ({
          id: row.id,
          username: row.username,
          salt: row.salt,
          email: row.email,
          name: row.name,
          role: row.role,
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
              id,
              username,
              salt,
              email,
              name,
              role
            FROM users
            WHERE users.id = $1
            `,
        [id],
      );

      const user: UserInfo = userData[0]
        ? {
            id,
            username: userData[0].username,
            name: userData[0].name,
            email: userData[0].email,
            role: userData[0].role,
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

  async findOneByUsername(username: string): Promise<ServiceReturn<User>> {
    try {
      const { rows: userData } = await this.conn.query(
        `
            SELECT
              id,
              username,
              password,
              salt,
              email,
              name,
              role
            FROM users
            WHERE users.username = $1
            `,
        [username],
      );

      const user: User = userData[0]
        ? {
            id: userData[0].id,
            username: userData[0].username,
            password: userData[0].password,
            salt: userData[0].salt,
            name: userData[0].name,
            email: userData[0].email,
            role: userData[0].role,
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
      const { username, password, salt, email, name, role } = updateUserData;
      let query = 'UPDATE users SET';

      // Query user
      const queryUser = await this.conn.query(
        `
          SELECT
            id,
          FROM users
          WHERE id = $1
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

      // Update username
      if (username) {
        query += ` username = \'${username}\',`;
      }

      // Update password
      if (password) {
        query += ` password = \'${password}\',`;
      }

      // Update salt
      if (salt) {
        query += ` salt = \'${salt}\',`;
      }

      // Update email
      if (email) {
        query += ` email = \'${email}\',`;
      }

      // Update full name
      if (name) {
        query += ` name = \'${name}\',`;
      }

      // Update role
      if (role) {
        query += ` role = \'${role}\';`;
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

  async delete(userId: number) {
    try {
      const user = await this.conn.query(
        `
          SELECT
            id
          FROM users
          WHERE id = $1`,
        [userId],
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

      const { id } = user.rows[0];

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove user
      await this.conn.query('DELETE from users WHERE id = $1;', [id]);

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
