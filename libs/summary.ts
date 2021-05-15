import { chalkin } from '../deps.ts';

import { TransactionsMap } from './../interfaces/transactions-map.interface.ts';

const SEP = '\t\t';

interface SummaryData {
  invested: number;
  earned: number;
  benefits: number;
}

interface CoinSummaryData extends SummaryData {
  coinBought: number;
  coinSold: number;
  // coinAmount: number;
  avgBuyPrice: number;
  avgSellPrice: number;
}

const printLegend = (): void => {
  const headerMsg = [
    'COIN    ', // whitespace for padding
    'FIAT INVESTED',
    'FIAT EARNED',
    // 'CRYPTOCOIN LEFT',
    'BENEFITS',
    'AVG BUY PRICE',
    'AVG SELL PRICE'
  ];
  console.log(chalkin.yellow(headerMsg.join(SEP)));
};

const initCurrency = (data: { [currency: string]: SummaryData }, currency: string): void => {
  const CURR = currency.toUpperCase();
  if (data[CURR] == null) {
    data[CURR] = {
      invested: 0,
      earned: 0,
      benefits: 0
    };
  }
};

const initCoinCurrency = (data: { [currency: string]: CoinSummaryData }, currency: string): void => {
  const CURR = currency.toUpperCase();
  if (data[CURR] == null) {
    data[CURR] = {
      invested: 0,
      earned: 0,
      benefits: 0,
      coinBought: 0,
      coinSold: 0,
      // coinAmount: 0,
      avgBuyPrice: 0,
      avgSellPrice: 0
    };
  }
};

export const printSummary = (data: TransactionsMap): void => {
  printLegend();

  const total: { [currency: string]: SummaryData } = {};

  Object.entries(data).forEach(([coin, transactions]) => {
    const forCoin: { [currency: string]: CoinSummaryData } = {};

    transactions.forEach((transaction) => {
      const CURR = transaction.amountFiat.currency.toUpperCase();
      initCoinCurrency(forCoin, CURR);
      if (Math.sign(transaction.amountFiat.amount) < 0) {
        forCoin[CURR].invested += Math.abs(transaction.amountFiat.amount);
        forCoin[CURR].coinBought += Math.abs(transaction.amountCrypto);
      } else {
        forCoin[CURR].earned += Math.abs(transaction.amountFiat.amount);
        forCoin[CURR].coinSold += Math.abs(transaction.amountCrypto);
      }
    });

    // TODO move fees to some document and pass it as data
    // TODO no coin amount for now
    // const fees: { [coin: string]: number[] } = {
    //   BTC: [0.00014999]
    // };
    // const feeAmount = fees[coin] ? fees[coin].reduce((acc, curr) => (acc += curr), 0) : 0;
    // const totalCoinBought = Object.entries(forCoin).reduce((acc, [_, summary]) => , 0);
    // const coinAmount = coinBought - coinSold - feeAmount;

    Object.entries(forCoin).forEach(([currency, summary]) => {
      forCoin[currency].avgBuyPrice = summary.invested / summary.coinBought;
      forCoin[currency].avgSellPrice = summary.coinSold === 0 ? 0 : summary.earned / summary.coinSold;
      forCoin[currency].benefits = summary.coinSold * (forCoin[currency].avgSellPrice - forCoin[currency].avgBuyPrice);
    });

    Object.entries(forCoin).forEach(([CURR, summary]) => {
      const coinMsg = [
        chalkin.blueBright(`${coin} (${CURR})`),
        `${summary.invested.toFixed(4)}${CURR}`,
        `${summary.earned.toFixed(4)}${CURR}`,
        // `${coinAmount.toFixed(4)}${coin}`,
        `${summary.benefits.toFixed(4)}${CURR}`,
        `${summary.avgBuyPrice.toFixed(4)} /${CURR}`,
        `${summary.avgSellPrice.toFixed(4)} /${CURR}`
      ];
      console.log(coinMsg.join(SEP));
    });

    Object.entries(forCoin).forEach(([CURR, summary]) => {
      initCurrency(total, CURR);
      total[CURR].invested += summary.invested;
      total[CURR].earned += summary.earned;
      total[CURR].benefits += summary.benefits;
    });
  });

  Object.entries(total).forEach(([CURR, summary]) => {
    const totalMsg = [
      chalkin.green(`TOTAL (${CURR})`),
      `${summary.invested.toFixed(4)}${CURR}`,
      `${summary.earned.toFixed(4)}${CURR}`,
      // '        ', // empty space for padding
      `${summary.benefits.toFixed(4)}${CURR}`
    ];
    console.log(totalMsg.join(SEP));
  });

  printLegend();
};
