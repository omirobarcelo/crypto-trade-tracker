import { Currency } from './currency.enum.ts';

export interface Amount {
  amount: number;
  currency: Currency;
}
