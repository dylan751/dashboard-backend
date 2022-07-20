import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { comparePassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (user.data) {
      const hashedPassword = (user.data as User).password;
      const salt = (user.data as User).salt;
      if (comparePassword(password, salt, hashedPassword)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user.data as User;
        return rest;
      } else {
        console.log('Password is not valid');
        return null;
      }
    } else {
      console.log('Username does not exist');
    }
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
