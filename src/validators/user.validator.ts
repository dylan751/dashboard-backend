import { Inject, Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsUserExisted', async: true })
@Injectable()
export class IsUserExisted implements ValidatorConstraintInterface {
  constructor(@Inject('DATABASE_POOL') private conn: any) {}

  async validate(value: string) {
    try {
      const queryData = await this.conn.query(
        `
          SELECT *
          FROM users
          WHERE id = $1
        `,
        [value],
      );

      if (queryData.rows.length === 0) {
        return false;
      }
    } catch (error) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    // here you can provide default error message if validation failed
    return `User isnt existed.`;
  }
}
