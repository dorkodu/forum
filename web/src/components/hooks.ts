import { useEffect, useState } from "react";

export function useWait<T>(start: () => Promise<T>): () => Promise<T> {
  const before = 100;
  const after = 500;
  let out: T;

  return () => new Promise(async (resolve) => {
    let didBefore = false;
    let didAfter = false;
    let loaded = false;

    setTimeout(() => {
      if (loaded) resolve(out);
      didBefore = true;
    }, before);

    setTimeout(() => {
      if (loaded) resolve(out);
      didAfter = true;
    }, after);

    out = await start();

    if (!didBefore || didAfter) resolve(out);
    loaded = true;
  })
}

export function useDelay() {
  const [state, setState] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setState(false), 100);
    return () => clearTimeout(timeout);
  }, []);

  return state;
}

export function useFeedProps() {
  return useState<{
    loading: boolean;
    status: boolean | undefined;
    hasMore: boolean;
  }>({
    loading: false,
    status: undefined,
    hasMore: true,
  })
}