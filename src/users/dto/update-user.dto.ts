import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { IsUserExisted } from 'src/validators/user.validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  role?: UserRole;

  @ApiProperty()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateUserParam {
  @IsNumberString()
  @Validate(IsUserExisted)
  id: number;
}
