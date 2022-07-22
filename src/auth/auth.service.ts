import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AppResponse from 'src/common/models/AppResponse';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/bcrypt';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<ServiceReturn<any>> {
    const user = await this.usersService.findOneByUsername(username);

    if (user.data) {
      const hashedPassword = (user.data as User).password;
      const salt = (user.data as User).salt;
      if (comparePassword(password, salt, hashedPassword)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user.data as User;
        return {
          err: null,
          data: rest,
        };
      } else {
        this.logger.log(`Login error: Invalid password`);
        return {
          err: AppResponse.unauthorized(
            [HTTP_EXCEPTION_ERROR_MESSAGES.INVALID_PASSWORD],
            HTTP_EXCEPTION_ERROR_CODE.INVALID_PASSWORD,
          ),
          data: null,
        };
      }
    } else {
      this.logger.log(`Login error: Not found user`);
      return {
        err: AppResponse.notFound(
          [HTTP_EXCEPTION_ERROR_MESSAGES.USER_DOES_NOT_EXIST],
          HTTP_EXCEPTION_ERROR_CODE.USER_DOES_NOT_EXIST,
        ),
        data: null,
      };
    }
  }

  async login(user: any): Promise<ServiceReturn<any>> {
    const payload = { username: user.username, sub: user.id };

    return {
      err: null,
      data: {
        access_token: this.jwtService.sign(payload),
        user: user.data,
      },
    };
  }
}
