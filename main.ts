const loadData = async (): Promise<unknown> => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
  const reviver = (_: string, value: unknown) =>
    typeof value === 'string' && dateRegex.test(value) ? new Date(value) : value;
  const filePath = './data/transactions.json';
  try {
    const jsonString = await Deno.readTextFile(filePath);
    return JSON.parse(jsonString, reviver);
  } catch (err) {
    err.message = `${filePath}: ${err.message}`;
    throw err;
  }
};

console.log('Loading...');
const data = await loadData();
console.log(data);
