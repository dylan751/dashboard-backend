import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { UserInfo } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guards';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req): any {
    return this.authService.login(req.user); // Return JWT access token
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getUser(@Request() req): UserInfo {
    // Require an Bearer token, validate token
    return req.user;
  }
}
