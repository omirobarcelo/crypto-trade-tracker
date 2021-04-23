import { chalkin, Input } from '../deps.ts';

import { TransactionsMap } from '../interfaces/transactions-map.interface.ts';

export const parseListing = (entry: string): [coin: string] | null => {
  if (entry == null || entry === '') {
    return [''];
  } else {
    return [entry];
  }
};

export const showTransactions = (data: TransactionsMap, coin: string): void => {
  if (coin != null && coin !== '' && !data[coin]) {
    console.log(chalkin.red('No recorded transactions for given coin'));
    return;
  }

  console.log(coin == null || coin === '' ? data : data[coin]);
};

export const listTransactions = async (data: TransactionsMap): Promise<void> => {
  const input = new Input();
  const coin = await input.question('-- List transaction from which coin (empty for all transactions)');
  showTransactions(data, coin);
};
