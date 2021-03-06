import { chalkin, Input } from './deps.ts';

import { TransactionsMap } from './interfaces/transactions-map.interface.ts';
import { parseBenefitQuery, printBenefits, showBenefits } from './libs/benefits.ts';
import { loadData } from './libs/data-loader.ts';
import { help } from './libs/help.ts';
import { listTransactions, parseListing, showTransactions } from './libs/list-transactions.ts';
import { printSummary } from './libs/summary.ts';
import { parseTransaction, persistTransaction, writeTransaction } from './libs/write-transaction.ts';

const TRANSACTIONS_PATH = './data/transactions.json';
interface ActionFn {
  // deno-lint-ignore no-explicit-any
  (data: TransactionsMap, ...args: any[]): void | Promise<void>;
}

// deno-lint-ignore no-explicit-any
const cliParsers: { [key: string]: (...args: any[]) => any[] | null } = {
  '-w': parseTransaction,
  '--write': parseTransaction,
  '-l': parseListing,
  '--list': parseListing,
  '-s': () => [],
  '--summary': () => [],
  '-b': parseBenefitQuery,
  '--benefit': parseBenefitQuery
};
const cliActors: { [key: string]: ActionFn } = {
  '-w': persistTransaction,
  '--write': persistTransaction,
  '-l': showTransactions,
  '--list': showTransactions,
  '-s': printSummary,
  '--summary': printSummary,
  '-b': showBenefits,
  '--benefit': showBenefits
};

// Parse CLI input
// deno-lint-ignore no-explicit-any
let parseResult: any[] | null;
if (Deno.args.length > 0) {
  if (Deno.args[0] === '-m' || Deno.args[0] === '--man') {
    help();
    Deno.exit();
  }

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
const ACTION_NAME = 0;
const ACTION_PROGRAM = 1;
const actions: { [key: number]: [string, ActionFn] } = {
  0: ['List transactions', listTransactions],
  1: ['New transaction', writeTransaction],
  2: ['Print summary', printSummary],
  3: ['Calculate benefits price', printBenefits]
};
const input = new Input();
while (!input.done) {
  const result = await input.choose([...Object.values(actions).map((action) => action[ACTION_NAME]), 'Exit']);
  const selected = result.findIndex((val) => val);
  if (selected === result.length - 1) {
    input.close();
    continue;
  }
  await actions[selected][ACTION_PROGRAM](data, TRANSACTIONS_PATH);
}
