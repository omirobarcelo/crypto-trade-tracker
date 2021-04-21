import { Amount } from './amount.interface.ts';

export interface Transaction {
  when: Date;
  amountCrypto: number;
  amountFiat: Amount;
  prices: Amount[];
}
