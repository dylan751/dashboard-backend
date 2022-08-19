import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateTourDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  startTime: string;

  @IsOptional()
  @IsNumberString()
  rating: number;

  @IsOptional()
  @IsString()
  hotel: string;

  @IsOptional()
  price: number;

  @IsString()
  vehicle: string;

  @IsString()
  type: string; // Should be ENUM

  @IsOptional()
  @IsString()
  numberOfPeople: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumberString()
  numberOfBooking: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  isTrending: boolean;
}
