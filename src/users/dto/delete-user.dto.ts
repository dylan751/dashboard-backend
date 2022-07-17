import { IsNumberString, Validate } from 'class-validator';
import { IsUserExisted } from 'src/validators/user.validator';

export class DeleteUserParam {
  @IsNumberString()
  @Validate(IsUserExisted)
  id: number;
}
