import { Meta } from './meta.interface';

export interface ResponseInterface<T> {
  status: string;
  message: string;
  data: T[] | T | string | null;
  meta?: Meta;
}
