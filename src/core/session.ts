import { createStore, useStore, type StoreApi } from 'zustand';

import type { Tokens } from '@/core/api';
import { log } from '@/core/log';
import { SECURE_KEYS, secure, type SecureKey, type SecureStorage } from '@/core/storage';

export type SessionMode = 'none' | 'consumer' | 'fleet';

export type SessionState = {
  status: 'loading' | 'ready';
  mode: SessionMode;
  tokens: Tokens | null;
  hydrate: () => Promise<void>;
  signIn: (mode: Exclude<SessionMode, 'none'>, tokens: Tokens) => Promise<void>;
  updateTokens: (tokens: Tokens) => Promise<void>;
  signOut: () => Promise<void>;
};

const KEYS: Record<Exclude<SessionMode, 'none'>, { access: SecureKey; refresh: SecureKey }> = {
  consumer: { access: SECURE_KEYS.accessToken, refresh: SECURE_KEYS.refreshToken },
  fleet: { access: SECURE_KEYS.fleetToken, refresh: SECURE_KEYS.fleetRefreshToken },
};
const ALL_KEYS = Object.values(SECURE_KEYS) as SecureKey[];

async function removeAll(storage: SecureStorage, keys: SecureKey[]) {
  const results = await Promise.allSettled(keys.map((k) => storage.remove(k)));
  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed) log.warn('could not delete some stored tokens', { failed });
}

export function createSessionStore(storage: SecureStorage = secure) {
  return createStore<SessionState>()((set, get) => ({
    status: 'loading',
    mode: 'none',
    tokens: null,

    async hydrate() {
      try {
        const [access, refresh, fleetAccess, fleetRefresh] = await Promise.all(
          [KEYS.consumer.access, KEYS.consumer.refresh, KEYS.fleet.access, KEYS.fleet.refresh].map(
            (k) => storage.get(k),
          ),
        );
        if (access && refresh) {
          // BLUEPRINT bug 12: both sessions stored -> keep consumer, drop fleet.
          if (fleetAccess || fleetRefresh)
            await removeAll(storage, [KEYS.fleet.access, KEYS.fleet.refresh]);
          set({
            status: 'ready',
            mode: 'consumer',
            tokens: { accessToken: access, refreshToken: refresh },
          });
        } else if (fleetAccess && fleetRefresh) {
          set({
            status: 'ready',
            mode: 'fleet',
            tokens: { accessToken: fleetAccess, refreshToken: fleetRefresh },
          });
        } else {
          set({ status: 'ready', mode: 'none', tokens: null });
        }
      } catch (error) {
        log.warn('session hydrate failed; starting signed out', { error: String(error) });
        set({ status: 'ready', mode: 'none', tokens: null });
      }
    },

    async signIn(mode, tokens) {
      const other = mode === 'consumer' ? KEYS.fleet : KEYS.consumer;
      set({ mode, tokens, status: 'ready' });
      await removeAll(storage, [other.access, other.refresh]);
      await storage.set(KEYS[mode].access, tokens.accessToken);
      await storage.set(KEYS[mode].refresh, tokens.refreshToken);
    },

    async updateTokens(tokens) {
      const { mode } = get();
      if (mode === 'none') return;
      set({ tokens });
      await storage.set(KEYS[mode].access, tokens.accessToken);
      await storage.set(KEYS[mode].refresh, tokens.refreshToken);
    },

    async signOut() {
      set({ mode: 'none', tokens: null, status: 'ready' });
      await removeAll(storage, ALL_KEYS);
    },
  }));
}

export const sessionStore = createSessionStore();

export type ServerLogout = (
  mode: Exclude<SessionMode, 'none'>,
  accessToken: string | null,
) => Promise<void>;

// Local first (BLUEPRINT: logout always clears locally): guards react at once, and the
// best-effort server call runs in the background with the token captured before clearing.
export async function signOutThen(
  serverLogout: ServerLogout,
  store: StoreApi<SessionState> = sessionStore,
): Promise<void> {
  const { mode, tokens } = store.getState();
  if (mode === 'none') return;
  await store.getState().signOut();
  void serverLogout(mode, tokens?.accessToken ?? null).catch((error: unknown) =>
    log.warn('server logout failed; session already cleared locally', { error: String(error) }),
  );
}

export function useSession<T>(selector: (s: SessionState) => T): T {
  return useStore(sessionStore, selector);
}
