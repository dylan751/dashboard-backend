import { Inject, Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import AppResponse from './common/models/AppResponse';
import { ServiceReturn } from './common/models/ServiceReturn';
import { HTTP_EXCEPTION_ERROR_CODE } from './utils/constants';

interface User {
  email: string;
  password: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  getHello() {
    return 'Hello World';
  }

  // Test API Only
  async findAll(): Promise<ServiceReturn<User>> {
    const queryUsers = await this.conn.query(
      `
        SELECT *
        FROM users
      `,
    );
    const { email, password } = queryUsers.rows[0];

    try {
      return {
        err: null,
        data: {
          edges: {
            email: email,
            password: password,
          },
        },
      };
    } catch (error) {
      this.logger.log('find all error: ', error.message);
      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.USER_LIST_FAILED,
        ),
        data: null,
      };
    }
  }
}
