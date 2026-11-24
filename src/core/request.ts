import { useCallback, useEffect, useRef, useState } from 'react';

import { sessionStore } from './session';

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

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export type SessionData<T> = {
  data: T | null;
  status: LoadStatus;
  error: unknown;
  load: () => Promise<T>;
};

type SessionDataState<T> = Pick<SessionData<T>, 'data' | 'status' | 'error'>;

const EMPTY = { data: null, status: 'idle', error: null } as const;

// Data that belongs to the signed-in account (user, driver). Cleared on every session mode
// change, and a response that lands after the change is dropped. `fetch` must be stable.
export function useSessionData<T>(fetch: () => Promise<T>): SessionData<T> {
  const [state, setState] = useState<SessionDataState<T>>(EMPTY);
  const generation = useRef(0);

  useEffect(
    () =>
      sessionStore.subscribe((next, prev) => {
        if (next.mode === prev.mode) return;
        generation.current++;
        setState(EMPTY);
      }),
    [],
  );

  const load = useCallback(async () => {
    const gen = generation.current;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const data = await fetch();
      if (gen === generation.current) setState({ data, status: 'ready', error: null });
      return data;
    } catch (error) {
      if (gen === generation.current) setState((s) => ({ ...s, status: 'error', error }));
      throw error;
    }
  }, [fetch]);

  return { ...state, load };
}
