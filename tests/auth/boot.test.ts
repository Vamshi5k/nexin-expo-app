import { QueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders } from 'axios';

import { queryKeys } from '@/core/query';
import { sessionStore } from '@/core/session';

import { BootTimeoutError, checkSession, classifySessionError } from '@/features/auth/hooks';

jest.mock('@/core/log');
jest.mock('@/features/client-config', () => ({ primeClientConfig: jest.fn() }));
jest.mock('@/features/auth/api', () => ({
  ...jest.requireActual('@/features/auth/api'),
  userByToken: jest.fn(),
}));
jest.mock('@/features/fleet', () => ({
  fleetMeQuery: () => ({ queryKey: ['fleet-me'], queryFn: jest.fn(async () => ({ id: 'f1' })) }),
}));
jest.mock('@/core/session', () => {
  const state = { mode: 'consumer', signOut: jest.fn(async () => undefined) };
  return { sessionStore: { getState: () => state } };
});

const { userByToken } = jest.requireMock('@/features/auth/api') as { userByToken: jest.Mock };

function httpError(status: number) {
  const headers = new AxiosHeaders();
  return new AxiosError('http', 'ERR', { headers }, undefined, {
    status,
    statusText: '',
    headers: {},
    config: { headers },
    data: {},
  });
}

describe('classifySessionError', () => {
  it.each([400, 401, 403, 404, 422])('%i -> expired', (s) => {
    expect(classifySessionError(httpError(s))).toBe('expired');
  });
  it.each([408, 429, 500, 503])('%i -> retryable', (s) => {
    expect(classifySessionError(httpError(s))).toBe('retryable');
  });
  it('network errors and timeouts -> retryable', () => {
    expect(classifySessionError(new AxiosError('Network Error', 'ERR_NETWORK'))).toBe('retryable');
    expect(classifySessionError(new BootTimeoutError())).toBe('retryable');
  });
});

describe('checkSession', () => {
  const state = sessionStore.getState() as unknown as { mode: string; signOut: jest.Mock };
  let qc: QueryClient;

  beforeEach(() => {
    // gcTime Infinity: no cache-cleanup timers left running after the test.
    qc = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity } } });
    state.mode = 'consumer';
    state.signOut.mockClear();
    userByToken.mockReset();
  });

  afterEach(() => qc.clear());

  it('no session -> ready without any request', async () => {
    state.mode = 'none';
    await expect(checkSession(qc)).resolves.toBe('ready');
    expect(userByToken).not.toHaveBeenCalled();
  });

  it('valid consumer session -> ready and the user is cached', async () => {
    userByToken.mockResolvedValue({ id: 7, isFirstLogin: false });
    await expect(checkSession(qc)).resolves.toBe('ready');
    expect(qc.getQueryData(queryKeys.me())).toMatchObject({ id: '7', isFirstLogin: false });
    expect(state.signOut).not.toHaveBeenCalled();
  });

  it('401 -> signs out, keeps client config, ready', async () => {
    qc.setQueryData(queryKeys.clientConfig(), { brandName: 'x' });
    userByToken.mockRejectedValue(httpError(401));
    await expect(checkSession(qc)).resolves.toBe('ready');
    expect(state.signOut).toHaveBeenCalledTimes(1);
    expect(qc.getQueryData(queryKeys.clientConfig())).toEqual({ brandName: 'x' });
  });

  it('500 -> error, tokens kept', async () => {
    userByToken.mockRejectedValue(httpError(500));
    await expect(checkSession(qc)).resolves.toBe('error');
    expect(state.signOut).not.toHaveBeenCalled();
  });

  it('timeout -> error, tokens kept', async () => {
    userByToken.mockImplementation(() => new Promise(() => undefined));
    await expect(checkSession(qc, 20)).resolves.toBe('error');
    expect(state.signOut).not.toHaveBeenCalled();
  });

  it('fleet session -> fleet check', async () => {
    state.mode = 'fleet';
    await expect(checkSession(qc)).resolves.toBe('ready');
    expect(userByToken).not.toHaveBeenCalled();
    expect(qc.getQueryData(['fleet-me'])).toEqual({ id: 'f1' });
  });
});
