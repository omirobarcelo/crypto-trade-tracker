import { chalkin, Input } from './deps.ts';

import { TransactionsMap } from './interfaces/transactions-map.interface.ts';
import { loadData } from './libs/data-loader.ts';
import { parseTransaction, persistTransaction, writeTransaction } from './libs/write-transaction.ts';

const TRANSACTIONS_PATH = './data/transactions.json';
interface ActionFn {
  // deno-lint-ignore no-explicit-any
  (data: TransactionsMap, ...args: any[]): Promise<void>;
}

// deno-lint-ignore no-explicit-any
const cliParsers: { [key: string]: (...args: any[]) => any[] | null } = {
  '-w': parseTransaction,
  '--write': parseTransaction
};
const cliActors: { [key: string]: ActionFn } = {
  '-w': persistTransaction,
  '--write': persistTransaction
};

// Parse CLI input
// deno-lint-ignore no-explicit-any
let parseResult: any[] | null;
if (Deno.args.length > 0) {
  parseResult = cliParsers[Deno.args[0]](...Deno.args.slice(1));
  if (parseResult == null) {
    Deno.exit(1);
  }
}

console.log('Loading...');
// Mutable
const data = await loadData(TRANSACTIONS_PATH);
console.log(chalkin.green('Data loaded ✓'));

// Execute CLI input
if (Deno.args.length > 0) {
  await cliActors[Deno.args[0]](data, ...parseResult!, TRANSACTIONS_PATH);
  Deno.exit();
}

// Run interactive program
const actions: { [key: number]: ActionFn } = {
  0: writeTransaction
};
const input = new Input();
while (!input.done) {
  const result = await input.choose(['New transaction', 'Exit']);
  const selected = result.findIndex((val) => val);
  if (selected === result.length - 1) {
    input.close();
    continue;
  }
  await actions[selected](data, TRANSACTIONS_PATH);
}
