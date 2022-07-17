import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserParam } from './dto/update-user.dto';
import AppResponse from 'src/common/models/AppResponse';
import { FindUserParam } from './dto/find-one.dto';
import { DeleteUserParam } from './dto/delete-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() userData: CreateUserDto): Promise<AppResponse<any>> {
    const { err, data } = await this.usersService.create(userData);

    if (err) {
      throw err;
    }

    return AppResponse.ok(data);
  }

  @Get()
  async findAll(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    const { err, data } = await this.usersService.findAll(limit, offset);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Get(':id')
  async findById(@Param() param: FindUserParam) {
    const { err, data } = await this.usersService.findOne(param.id);
    if (err) throw err;

    return AppResponse.ok(data);
  }

  @Put(':id')
  async update(
    @Param() param: UpdateUserParam,
    @Body() updateUserData: UpdateUserDto,
  ): Promise<AppResponse<any>> {
    const { err, data } = await this.usersService.update(
      param.id,
      updateUserData,
    );

    if (err) {
      throw err;
    }

    return AppResponse.ok(data);
  }

  @Delete(':id')
  async delete(
    @Param() param: DeleteUserParam,
  ): Promise<AppResponse<undefined>> {
    const { err, data } = await this.usersService.delete(param.id);

    if (err) {
      throw err;
    }

    return AppResponse.ok(data);
  }
}
