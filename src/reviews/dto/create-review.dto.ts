import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumberString()
  userId: number;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsNumberString()
  tourId: number;

  @IsOptional()
  @IsNumberString()
  rating: number;

  @IsOptional()
  @IsString()
  content: string;
}
