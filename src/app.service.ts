import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import AppResponse from './common/models/AppResponse';
import { ServiceReturn } from './common/models/ServiceReturn';
import { HTTP_EXCEPTION_ERROR_CODE } from './utils/constants';

interface User {
  username: string;
  password: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  // Test API Only
  async getHello(): Promise<ServiceReturn<User>> {
    const queryUsers = await this.conn.query(
      `
        SELECT *
        FROM users
      `,
    );
    const { username, password } = queryUsers.rows[0];

    try {
      return {
        err: null,
        data: {
          edges: {
            username: username,
            password: password,
          },
        },
      };
    } catch (error) {
      this.logger.log('find all error: ', error.message);
      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.IVR_FIND_FAILED,
        ),
        data: null,
      };
    }
  }
}
