import { IsNumberString } from 'class-validator';

export class FindUserParam {
  @IsNumberString()
  // @Validate(IsUserExisted)
  id: number;
}
