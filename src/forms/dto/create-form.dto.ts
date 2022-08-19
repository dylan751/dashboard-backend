import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateFormDto {
  @IsNumberString()
  tourId: number;

  @IsString()
  name: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsNumberString()
  numberOfPeople: number;

  @IsOptional()
  @IsString()
  startTime: string;

  @IsOptional()
  @IsString()
  endTime: string;
}
