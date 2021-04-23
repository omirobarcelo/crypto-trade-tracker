export { writeJson } from 'https://deno.land/x/jsonfile@1.0.0/mod.ts';

import { chalkin as Chalkin } from 'https://deno.land/x/chalkin@v0.1.3/mod.ts';
export const chalkin = new Chalkin();

import InputLoop from 'https://deno.land/x/input@2.0.2/index.ts';
export const Input = InputLoop;
