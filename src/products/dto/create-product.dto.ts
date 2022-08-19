import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumberString()
  price: number;

  @IsNumberString()
  quantity: number;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsNumberString()
  count: number;
}
