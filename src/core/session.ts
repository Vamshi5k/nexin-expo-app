import { createStore, useStore, type StoreApi } from 'zustand';

import type { Tokens } from '@/core/api';
import { log } from '@/core/log';
import { SECURE_KEYS, secure, type SecureKey, type SecureStorage } from '@/core/storage';

export type SessionMode = 'none' | 'consumer' | 'fleet';
type SignedInMode = Exclude<SessionMode, 'none'>;

export type SessionState = {
  status: 'loading' | 'ready';
  mode: SessionMode;
  tokens: Tokens | null;
  hydrate: () => Promise<void>;
  signIn: (mode: SignedInMode, tokens: Tokens) => Promise<void>;
  updateTokens: (tokens: Tokens) => Promise<void>;
  signOut: () => Promise<void>;
};

export type ServerLogout = (mode: SignedInMode, accessToken: string | null) => Promise<void>;

const CONSUMER_KEYS: SecureKey[] = [SECURE_KEYS.accessToken, SECURE_KEYS.refreshToken];
const FLEET_KEYS: SecureKey[] = [SECURE_KEYS.fleetToken, SECURE_KEYS.fleetRefreshToken];
const ALL_KEYS: SecureKey[] = [...CONSUMER_KEYS, ...FLEET_KEYS];

const keysFor = (mode: SignedInMode) => (mode === 'consumer' ? CONSUMER_KEYS : FLEET_KEYS);

const signedOut = { status: 'ready', mode: 'none', tokens: null } as const;

const saveTokens = async (storage: SecureStorage, mode: SignedInMode, tokens: Tokens) => {
  const [accessKey, refreshKey] = keysFor(mode);
  await storage.set(accessKey, tokens.accessToken);
  await storage.set(refreshKey, tokens.refreshToken);
};

const readTokens = async (storage: SecureStorage, mode: SignedInMode) => {
  const [accessKey, refreshKey] = keysFor(mode);
  const accessToken = await storage.get(accessKey);
  const refreshToken = await storage.get(refreshKey);

  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
};

const removeTokens = async (storage: SecureStorage, keys: SecureKey[]) => {
  const results = await Promise.allSettled(keys.map(key => storage.remove(key)));
  const failed = results.filter(result => result.status === 'rejected').length;
  if (failed) log.warn('could not delete some stored tokens', { failed });
};

export const createSessionStore = (storage: SecureStorage = secure) =>
  createStore<SessionState>()((set, get) => ({
    status: 'loading',
    mode: 'none',
    tokens: null,

    hydrate: async () => {
      try {
        const consumerTokens = await readTokens(storage, 'consumer');
        const fleetTokens = await readTokens(storage, 'fleet');

        if (consumerTokens) {
          // BLUEPRINT bug 12: both sessions stored -> keep consumer, drop fleet.
          await removeTokens(storage, FLEET_KEYS);
          set({ status: 'ready', mode: 'consumer', tokens: consumerTokens });
          return;
        }

        if (fleetTokens) {
          set({ status: 'ready', mode: 'fleet', tokens: fleetTokens });
          return;
        }

        set(signedOut);
      } catch (error) {
        log.warn('session hydrate failed; starting signed out', { error: String(error) });
        set(signedOut);
      }
    },

    signIn: async (mode, tokens) => {
      set({ status: 'ready', mode, tokens });

      const otherMode = mode === 'consumer' ? 'fleet' : 'consumer';
      await removeTokens(storage, keysFor(otherMode));
      await saveTokens(storage, mode, tokens);
    },

    updateTokens: async tokens => {
      const { mode } = get();
      if (mode === 'none') return;

      set({ tokens });
      await saveTokens(storage, mode, tokens);
    },

    signOut: async () => {
      set(signedOut);
      await removeTokens(storage, ALL_KEYS);
    },
  }));

export const sessionStore = createSessionStore();

export const useSession = <T>(selector: (state: SessionState) => T): T =>
  useStore(sessionStore, selector);

// Clear the phone first so the app reacts at once; tell the server in the background.
export const signOutThen = async (
  serverLogout: ServerLogout,
  store: StoreApi<SessionState> = sessionStore,
) => {
  const { mode, tokens } = store.getState();
  if (mode === 'none') return;

  await store.getState().signOut();

  serverLogout(mode, tokens?.accessToken ?? null).catch((error: unknown) =>
    log.warn('server logout failed; session already cleared locally', { error: String(error) }),
  );
};
