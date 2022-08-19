import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Validate } from 'class-validator';
import { IsUserExisted } from 'src/validators/user.validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class UpdateUserParam {
  @IsNumberString()
  @Validate(IsUserExisted)
  id: number;
}
