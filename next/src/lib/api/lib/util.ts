function intParse(str: string, def: number) {
  const parsed = parseInt(str, 10);
  return Number.isNaN(parsed) ? def : parsed;
}

export const util = {
  intParse,
}