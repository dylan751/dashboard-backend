import { HttpException } from '@nestjs/common';
import Collection from './Collection';

export interface ServiceReturn<T> {
  err: HttpException | null;
  data: T | Collection<T> | null | Record<string, unknown>;
}
