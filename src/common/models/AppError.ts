import { HttpStatus } from '@nestjs/common';

export enum CustomErrorCode {
  // Just for example
  SIP_ACCOUNT_NOT_FOUND = 1101,
}

export enum CustomErrorMessage {
  // Just for example
  AST_QUEUE_MEMBER_NOT_FOUND = 'You must login sip account first',
}

export default interface AppError {
  // represent the detail of the error
  messages: string;
  errorCode: HttpStatus | CustomErrorCode;
}
