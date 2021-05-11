import { chalkin, Input } from '../deps.ts';

import { Transaction } from './../interfaces/transaction.interface.ts';
import { TransactionsMap } from './../interfaces/transactions-map.interface.ts';

const SEP = '\t\t';

export const parseBenefitQuery = (coin: string, percentStr?: string): [coin: string, percent: number | null] | null => {
  if (coin == null || coin === '') {
    console.log(chalkin.red(`Cryptocoin not supplied.`));
    return null;
  }

  if (percentStr != null && percentStr !== '') {
    const percent = Number(percentStr);
    if (isNaN(percent)) {
      console.log(chalkin.red(`Invalid percent.`));
      return null;
    }
    return [coin.toUpperCase(), percent];
  }

  return [coin.toUpperCase(), null];
};

const calculateAvgBuyPrice = (transactions: Transaction[]): [CURR: string, avgBuyPrice: number] => {
  let invested = 0;
  let coinBought = 0;

  transactions.forEach((transaction) => {
    if (Math.sign(transaction.amountFiat.amount) < 0) {
      invested += Math.abs(transaction.amountFiat.amount);
      coinBought += Math.abs(transaction.amountCrypto);
    }
  });

  const CURR = transactions[0].amountFiat.currency;
  const avgBuyPrice = invested / coinBought;

  return [CURR, avgBuyPrice];
};

const calculateBenefitPrice = (avgBuyPrice: number, percent: number): number => avgBuyPrice * (1 + percent / 100);

const printBenefit = (coin: string, transactions: Transaction[], benefitPcent: number): void => {
  const [CURR, avgBuyPrice] = calculateAvgBuyPrice(transactions);

  const benefitPrice = calculateBenefitPrice(avgBuyPrice, benefitPcent);

  console.log(
    [chalkin.blueBright(coin), chalkin.yellow(`${benefitPcent}%`), `${benefitPrice.toFixed(3)}${coin}/${CURR}`].join(
      SEP
    )
  );
};

const printBenefitList = (coin: string, transactions: Transaction[]): void => {
  const [CURR, avgBuyPrice] = calculateAvgBuyPrice(transactions);

  const benefitPercentList = [5, 10, 20, 30, 40, 50, 100, 200];
  const benefitPriceList = benefitPercentList.map((pcent) => calculateBenefitPrice(avgBuyPrice, pcent));

  console.log(chalkin.yellow(['   ', ...benefitPercentList.map((pcent) => `${pcent}%\t`)].join(SEP)));
  console.log(
    [chalkin.blueBright(coin), ...benefitPriceList.map((price) => `${price.toFixed(3)}${coin}/${CURR}`)].join(SEP)
  );
};

export const showBenefits = (data: TransactionsMap, coin: string, percent: number | null): void => {
  if (data[coin] == null || data[coin].length === 0) {
    console.log(chalkin.red(`No transactions for ${coin}`));
  }

  if (percent == null) printBenefitList(coin, data[coin]);
  else printBenefit(coin, data[coin], percent);
};

const askBenefitAndPrint = async (coin: string, transactions: Transaction[]): Promise<void> => {
  let benefit = 10;
  const input = new Input();
  while (!input.done) {
    const benefitStr = await input.question('-- How much benefit percent do you want?');
    benefit = Number(benefitStr);
    if (isNaN(benefit)) {
      console.log(chalkin.red(`Invalid percent.`));
      continue;
    }
    input.close();
  }
  printBenefit(coin, transactions, benefit);
};

export const printBenefits = async (data: TransactionsMap): Promise<void> => {
  const input = new Input();
  const actions: { [key: number]: (coin: string, transactions: Transaction[]) => void | Promise<void> } = {
    0: printBenefitList,
    1: askBenefitAndPrint
  };

  const coin = (await input.question('-- For which cryptocoin do you want to check benefits?')).toUpperCase();
  if (data[coin] == null || data[coin].length === 0) {
    console.log(chalkin.red(`No transactions recorded for ${coin}.`));
    return;
  }

  const result = await input.choose(['Benefits list', 'Specific benefit']);
  const selected = result.findIndex((val) => val);
  await actions[selected](coin, data[coin]);
};
