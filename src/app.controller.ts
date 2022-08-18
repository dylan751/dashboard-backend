import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // getHello(): Promise<any> {
  getHello(): string {
    return 'Hello World';
    // return this.appService.getHello();
  }
}
