import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateDestinationDto {
  @IsNumberString()
  tourId: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  image: string;
}
