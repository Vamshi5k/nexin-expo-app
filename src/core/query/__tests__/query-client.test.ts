import { ApiError } from '@/core/api/errors';

import { createQueryClient, QUERY_STALE_TIME_MS, shouldRetry } from '../query-client';

describe('query client defaults', () => {
  it('retries once on network / 5xx errors', () => {
    expect(shouldRetry(0, new ApiError('x', 'network'))).toBe(true);
    expect(shouldRetry(0, new ApiError('x', 'http', 503))).toBe(true);
    expect(shouldRetry(1, new ApiError('x', 'http', 503))).toBe(false);
  });

  it('never retries 4xx', () => {
    for (const s of [400, 401, 404, 422, 429]) {
      expect(shouldRetry(0, new ApiError('x', 'http', s))).toBe(false);
    }
  });

  it('uses a 30 s stale time and the retry rule', () => {
    const q = createQueryClient().getDefaultOptions().queries;
    expect(q?.staleTime).toBe(30_000);
    expect(QUERY_STALE_TIME_MS).toBe(30_000);
    expect(q?.retry).toBe(shouldRetry);
  });
});
