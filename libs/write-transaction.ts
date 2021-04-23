import { chalkin, Input, writeJson } from '../deps.ts';

import { Amount } from '../interfaces/amount.interface.ts';
import { CURRENCIES } from '../interfaces/currencies.const.ts';
import { Transaction } from '../interfaces/transaction.interface.ts';
import { TransactionsMap } from '../interfaces/transactions-map.interface.ts';
import { isValidCurrency } from './utils/currency.ts';
import { FIAT_PRICE_AMOUNT, FIAT_PRICE_CURRENCY, fiatPriceRegex } from './utils/regex.ts';

interface ActionFn {
  (): Promise<[coin: string, transaction: Transaction]>;
}

const askAmount = async (msg: string): Promise<number> => {
  const input = new Input();
  let amount: number;
  do {
    const answer = await input.question(msg);
    amount = Number(answer);
  } while (isNaN(amount));
  return amount;
};

const askCurrency = async (msg: string): Promise<typeof CURRENCIES[number]> => {
  const input = new Input();
  let currency: string;
  do {
    currency = await input.question(msg);
  } while (!isValidCurrency(currency));
  return currency as typeof CURRENCIES[number];
};

const interactiveInput: ActionFn = async () => {
  const input = new Input();
  const coin = await input.question('-- Coin traded');
  const amountCrypto = await askAmount('-- Amount of crypto traded (prefix with - if selling)');
  const amountFiat = await askAmount('-- Amount of fiat traded (prefix with - if buying)');
  const currencyFiat = await askCurrency('-- Fiat currency (3 letter format, e.g.: EUR)');
  const prices: Amount[] = [];
  do {
    const amount = await askAmount('-- Price value (enter x for x BTC/EUR)');
    const currency = await askCurrency('-- Price currency (enter x for 5 BTC/x)');
    prices.push({ amount, currency });
    const enterAnotherPrice = await input.question('-- Enter another price? [Y]es, [N]o');
    if (enterAnotherPrice.toLowerCase().startsWith('n')) {
      input.close();
    }
  } while (!input.done);

  return [
    coin,
    {
      when: new Date(),
      amountCrypto,
      amountFiat: { amount: amountFiat, currency: currencyFiat },
      prices
    }
  ];
};

const fullInput: ActionFn = async () => {
  const input = new Input();
  let validEntry = false;
  let transaction: [coin: string, transaction: Transaction];
  do {
    const entry = await input.question(
      '-- Enter transaction (<coin>,<amountCrypto>,<amountFiat><currencyFiat>,[<amountPrice><currencyPrice>])'
    );
    const [coin, sAmountCrypto, sFiat, ...sPrices] = entry.replaceAll(/\s*,\s*/g, ',').split(',');

    const amountCrypto = Number(sAmountCrypto);
    if (isNaN(amountCrypto)) {
      console.log(chalkin.red('Invalid crypto amount'));
      validEntry = false;
      continue;
    }

    const matches = sFiat.match(fiatPriceRegex);
    if (!matches || !isValidCurrency(matches[FIAT_PRICE_CURRENCY])) {
      console.log(chalkin.red('Invalid fiat amount'));
      validEntry = false;
      continue;
    }
    const amountFiat: Amount = {
      amount: Number(matches[FIAT_PRICE_AMOUNT]),
      currency: matches[FIAT_PRICE_CURRENCY] as typeof CURRENCIES[number]
    };

    const priceMatches = sPrices.map((sPrice) => sPrice.match(fiatPriceRegex));
    if (priceMatches.some((m) => !m || !isValidCurrency(m[FIAT_PRICE_CURRENCY]))) {
      console.log(chalkin.red('Invalid crypto price'));
      validEntry = false;
      continue;
    }
    const prices = priceMatches.map(
      (m) =>
        ({
          amount: Number(m![FIAT_PRICE_AMOUNT]),
          currency: m![FIAT_PRICE_CURRENCY] as typeof CURRENCIES[number]
        } as Amount)
    );

    validEntry = true;
    transaction = [
      coin,
      {
        when: new Date(),
        amountCrypto,
        amountFiat,
        prices
      }
    ];
  } while (!validEntry);

  return transaction!;
};

export const parseTransaction = (entry: string): [coin: string, transaction: Transaction] | null => {
  const [coin, sAmountCrypto, sFiat, ...sPrices] = entry.replaceAll(/\s*,\s*/g, ',').split(',');

  const amountCrypto = Number(sAmountCrypto);
  if (isNaN(amountCrypto)) {
    console.log(chalkin.red('Invalid crypto amount'));
    return null;
  }

  const matches = sFiat.match(fiatPriceRegex);
  if (!matches || !isValidCurrency(matches[FIAT_PRICE_CURRENCY])) {
    console.log(chalkin.red('Invalid fiat amount'));
    return null;
  }
  const amountFiat: Amount = {
    amount: Number(matches[FIAT_PRICE_AMOUNT]),
    currency: matches[FIAT_PRICE_CURRENCY] as typeof CURRENCIES[number]
  };

  const priceMatches = sPrices.map((sPrice) => sPrice.match(fiatPriceRegex));
  if (priceMatches.some((m) => !m || !isValidCurrency(m[FIAT_PRICE_CURRENCY]))) {
    console.log(chalkin.red('Invalid crypto price'));
    return null;
  }
  const prices = priceMatches.map(
    (m) =>
      ({
        amount: Number(m![FIAT_PRICE_AMOUNT]),
        currency: m![FIAT_PRICE_CURRENCY] as typeof CURRENCIES[number]
      } as Amount)
  );

  return [
    coin,
    {
      when: new Date(),
      amountCrypto,
      amountFiat,
      prices
    }
  ];
};

export const persistTransaction = async (
  data: TransactionsMap,
  coin: string,
  transaction: Transaction,
  filePath: string
): Promise<void> => {
  if (!data[coin]) {
    data[coin] = [];
  }
  data[coin].push(transaction);
  console.log('Saving...');
  await writeJson(filePath, data, { spaces: 2 });
  console.log(chalkin.green('Data saved ✓'));
};

export const writeTransaction = async (data: TransactionsMap, path: string): Promise<void> => {
  const actions: { [key: number]: ActionFn } = {
    0: interactiveInput,
    1: fullInput
  };
  const input = new Input();
  const result = await input.choose(['Interactive input', 'Full input']);
  const selected = result.findIndex((val) => val);
  const [coin, transaction] = await actions[selected]();
  await persistTransaction(data, coin, transaction, path);
};
