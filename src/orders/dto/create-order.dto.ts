import { IsNumberString } from 'class-validator';

export class CreateOrderDto {
  @IsNumberString()
  productId: number;

  @IsNumberString()
  quantity: number;
}
