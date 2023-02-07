export function useWait<T>(start: () => Promise<T>): () => Promise<T> {
  const threshold = 500;
  let out: T;

  return () => new Promise(async (resolve) => {
    let waited = false;
    let loaded = false;

    setTimeout(() => {
      if (loaded) resolve(out);
      waited = true;
    }, threshold);

    out = await start();

    if (waited) resolve(out);
    loaded = true;
  })
}