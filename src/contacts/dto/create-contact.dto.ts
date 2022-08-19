import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsNumberString()
  userId: number;

  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description: string;
}
