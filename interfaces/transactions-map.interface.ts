import { Transaction } from './transaction.interface.ts';

export interface TransactionsMap {
  [coin: string]: Transaction[];
}
