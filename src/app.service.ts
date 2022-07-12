import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class AppService {
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  // Test API
  async getHello(): Promise<any> {
    const queryUsers = await this.conn.query(
      `
        SELECT *
        FROM users
      `,
    );
    const { username, password } = queryUsers.rows[0];

    return {
      err: null,
      data: {
        edges: {
          username: username,
          password: password,
        },
      },
    };
  }
}
