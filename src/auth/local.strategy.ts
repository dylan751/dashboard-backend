import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import AppResponse from 'src/common/models/AppResponse';
import { UserInfo } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super(); // config
  }

  async validate(
    username: string,
    password: string,
  ): Promise<AppResponse<UserInfo>> {
    const { err, data } = await this.authService.validateUser(
      username,
      password,
    );

    if (err) {
      throw err;
    }

    return AppResponse.ok(data);
  }
}
