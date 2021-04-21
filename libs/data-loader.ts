import { TransactionsMap } from '../interfaces/transactions-map.interface.ts';
import { dateReviver } from './utils/json.ts';

export const loadData = async (filePath: string): Promise<TransactionsMap> => {
  try {
    const jsonString = await Deno.readTextFile(filePath);
    return JSON.parse(jsonString, dateReviver);
  } catch (err) {
    err.message = `${filePath}: ${err.message}`;
    throw err;
  }
};
