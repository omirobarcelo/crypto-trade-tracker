import { chalkin } from '../deps.ts';

import { TransactionsMap } from './../interfaces/transactions-map.interface.ts';

const SEP = '\t\t';

export const printSummary = (data: TransactionsMap): void => {
  const headerMsg = ['COIN', 'FIAT INVESTED', 'FIAT EARNED', 'CRYPTOCOIN LEFT', 'BENEFITS'];
  console.log(chalkin.yellow(headerMsg.join(SEP)));

  let totalInvested = 0;
  let totalEarned = 0;
  let totalBenefits = 0;

  Object.entries(data).forEach(([coin, transactions]) => {
    let invested = 0;
    let earned = 0;
    let coinBought = 0;
    let coinSold = 0;

    transactions.forEach((transaction) => {
      if (Math.sign(transaction.amountFiat.amount) < 0) {
        invested += Math.abs(transaction.amountFiat.amount);
        coinBought += Math.abs(transaction.amountCrypto);
      } else {
        earned += Math.abs(transaction.amountFiat.amount);
        coinSold += Math.abs(transaction.amountCrypto);
      }
    });

    const coinAmount = coinBought - coinSold;

    const avgBuyPrice = invested / coinBought;
    const avgSellPrice = earned / coinSold;
    const benefits = coinSold === 0 ? 0 : coinSold * (avgSellPrice - avgBuyPrice);

    const CURR = transactions[0].amountFiat.currency;
    const coinMsg = [
      chalkin.blueBright(coin),
      `${invested.toFixed(4)}${CURR}`,
      `${earned.toFixed(4)}${CURR}`,
      `${coinAmount.toFixed(4)}${coin}`,
      `${benefits.toFixed(4)}${CURR}`
    ];
    console.log(coinMsg.join(SEP));

    totalInvested += invested;
    totalEarned += earned;
    totalBenefits += benefits;
  });

  const totalMsg = [
    chalkin.green('TOTAL'),
    `${totalInvested.toFixed(4)}EUR`,
    `${totalEarned.toFixed(4)}EUR`,
    '        ', // empty space for padding
    `${totalBenefits.toFixed(4)}EUR`
  ];
  console.log(totalMsg.join(SEP));
};
