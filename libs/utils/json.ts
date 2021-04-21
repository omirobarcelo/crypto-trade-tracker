import { dateRegex } from './regex.ts';

export const dateReviver = (_: string, value: unknown) =>
  typeof value === 'string' && dateRegex.test(value) ? new Date(value) : value;
