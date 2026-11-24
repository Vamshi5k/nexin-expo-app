import { useCallback, useEffect, useRef, useState } from 'react';

export type RequestState<T> = {
  data: T | undefined;
  error: unknown;
  loading: boolean;
  refetch: () => Promise<void>;
};

type Settled<T> = { fn: () => Promise<T>; data: T | undefined; error: unknown };

// Loads on mount and whenever `fn` changes (pass a useCallback). Responses that land after
// unmount, or after a newer call, are dropped. `loading` is true until the current `fn` settles.
export function useRequest<T>(
  fn: () => Promise<T>,
  { enabled = true }: { enabled?: boolean } = {},
): RequestState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [refetching, setRefetching] = useState(false);
  const latest = useRef(0);

  const settle = useCallback(
    async (id: number, alive: () => boolean) => {
      try {
        const data = await fn();
        if (alive() && id === latest.current) setSettled({ fn, data, error: null });
      } catch (error) {
        if (alive() && id === latest.current)
          setSettled((prev) => ({ fn, data: prev?.fn === fn ? prev.data : undefined, error }));
      }
    },
    [fn],
  );

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    void settle(++latest.current, () => alive);
    return () => {
      alive = false;
    };
  }, [enabled, settle]);

  const refetch = useCallback(async () => {
    const id = ++latest.current;
    setRefetching(true);
    await settle(id, () => true);
    if (id === latest.current) setRefetching(false);
  }, [settle]);

  const current = settled?.fn === fn ? settled : null;
  return {
    data: current?.data,
    error: current?.error ?? null,
    loading: enabled && (!current || refetching),
    refetch,
  };
}

export type ActionState<A extends unknown[], R> = {
  run: (...args: A) => Promise<R>;
  isPending: boolean;
};

// For writes (submit, verify, logout): tracks pending and rethrows so the caller shows the error.
export function useAction<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
): ActionState<A, R> {
  const [isPending, setPending] = useState(false);
  const run = useCallback(
    async (...args: A) => {
      setPending(true);
      try {
        return await fn(...args);
      } finally {
        setPending(false);
      }
    },
    [fn],
  );
  return { run, isPending };
}
