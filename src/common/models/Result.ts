import AppError from './AppError';

export interface SuccessResult<T = any> {
  error?: never;
  data: T;
}

export interface FailedResult {
  data?: never;
  error: AppError;
}

export type Result<T> = SuccessResult<T> | FailedResult;
