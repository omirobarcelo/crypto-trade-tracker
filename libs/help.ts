export const help = (): void => {
  console.log('NAME');
  console.log('\tCrypto Trade Tracker');
  console.log();

  console.log('SYNOPSIS');
  console.log('\tctt [OPTION] [ARGS]');
  console.log();

  console.log('DESCRIPTION');

  console.log('\t-w, --write');
  console.log('\t\tRecords transaction.');
  console.log('\t\tInput: <coin>,<amountCoin>,<amountFiat><fiatCurrency>[,<price><priceCurrency>]');

  console.log('\t-l, --list');
  console.log('\t\tShows the JSON records for everything or the specified coin.');
  console.log('\t\tInput: [<coin>]');

  console.log('\t-s, --summary');
  console.log(
    '\t\tShows the invested and earned amounts, the number of coins left, and the benefits, for each coin and in total.'
  );

  console.log('\t-b, --benefit');
  console.log('\t\tShows the benefit price list or the specified benefit price for a coin.');
  console.log('\t\tInput: <coin> [<benefitPercent>]');
};
