import { CURRENCIES } from '../../interfaces/currencies.const.ts';

export const isValidCurrency = (currency: string): boolean => {
  const currencies = CURRENCIES.map((val) => val as string);
  return currencies.includes(currency);
};
