function getAnchor<
  T extends Array<Record<TKey, any>>,
  TKey extends keyof T[number],
  TDefault,
>(arr: T,
  key: TKey,
  def: TDefault,
  type: "newer" | "older",
  refresh?: boolean
): TDefault | T[number][TKey] {
  if (!arr.length || refresh) return def;
  const output = type === "newer" ? arr[arr.length - 1] : arr[0];
  if (output === undefined) return def;
  return output[key];
}

function sort<
  T extends Array<Record<TKey, any>>,
  TKey extends keyof T[number],
>(arr: T, by: TKey, func: (a: T[number][TKey], b: T[number][TKey]) => number): T {
  return arr.sort((a, b) => func(a[by], b[by]));
}

export const array = {
  getAnchor,
  sort,
}