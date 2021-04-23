import { CURRENCIES } from './currencies.const.ts';

export interface Amount {
  amount: number;
  currency: typeof CURRENCIES[number];
}
