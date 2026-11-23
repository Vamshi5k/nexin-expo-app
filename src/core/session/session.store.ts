import { createStore, useStore } from 'zustand';

import type { Tokens } from '@/core/api/refresh';
import { log } from '@/core/log';
import { SECURE_KEYS, secure, type SecureKey, type SecureStorage } from '@/core/storage';

export type SessionMode = 'none' | 'consumer' | 'fleet';

export type SessionState = {
  /** 'loading' until hydrate() has read SecureStore. */
  status: 'loading' | 'ready';
  mode: SessionMode;
  tokens: Tokens | null;
  hydrate: () => Promise<void>;
  /** Starts a session in `mode`; the other mode's tokens are cleared (one session at a time). */
  signIn: (mode: Exclude<SessionMode, 'none'>, tokens: Tokens) => Promise<void>;
  /** Saves refreshed tokens for the active mode. */
  updateTokens: (tokens: Tokens) => Promise<void>;
  /** Always clears locally, even if storage or the server call fails. */
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

/** App-wide session (SecureStore-backed). */
export const sessionStore = createSessionStore();

export function useSession<T>(selector: (s: SessionState) => T): T {
  return useStore(sessionStore, selector);
}
