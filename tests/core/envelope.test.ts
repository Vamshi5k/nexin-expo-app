import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { nextPage, toPage, unwrap, type Envelope } from '@/core/api';
import { getErrorMessage, isApiError, statusOf, toApiError } from '@/core/api';

function res<T>(data: Envelope<T>): AxiosResponse<Envelope<T>> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

describe('envelope', () => {
  it('unwraps data', () => {
    expect(unwrap(res({ success: true, data: { id: 1 } }))).toEqual({ id: 1 });
  });

  it('normalises currentPage and page', () => {
    expect(toPage(res({ data: [1, 2], pagination: { currentPage: 2, totalPages: 5 } }))).toEqual({
      items: [1, 2],
      page: 2,
      totalPages: 5,
    });
    expect(toPage(res({ data: [3], pagination: { page: 3, totalPages: 3 } }))).toEqual({
      items: [3],
      page: 3,
      totalPages: 3,
    });
  });

  it('defaults missing data and pagination', () => {
    expect(toPage(res<number[] | null>({ data: null }))).toEqual({
      items: [],
      page: 1,
      totalPages: 1,
    });
  });

  it('computes the next page', () => {
    expect(nextPage({ items: [], page: 1, totalPages: 2 })).toBe(2);
    expect(nextPage({ items: [], page: 2, totalPages: 2 })).toBeUndefined();
  });
});

describe('errors', () => {
  const config = {} as InternalAxiosRequestConfig;
  const httpError = (status: number, data: unknown) =>
    new AxiosError('Request failed', String(status), config, null, {
      data,
      status,
      statusText: '',
      headers: {},
      config,
    });

  it('prefers the server message, then error.message, then fallback', () => {
    expect(getErrorMessage(httpError(400, { message: 'Invalid OTP' }))).toBe('Invalid OTP');
    expect(getErrorMessage(httpError(500, {}))).toBe('Request failed');
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });

  it('classifies http, timeout and network errors', () => {
    expect(toApiError(httpError(404, {}))).toMatchObject({ kind: 'http', status: 404 });
    expect(toApiError(new AxiosError('timeout', 'ECONNABORTED', config))).toMatchObject({
      kind: 'timeout',
    });
    expect(toApiError(new AxiosError('Network Error', 'ERR_NETWORK', config))).toMatchObject({
      kind: 'network',
    });
    expect(isApiError(toApiError(httpError(422, {})))).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
    expect(statusOf(httpError(429, {}))).toBe(429);
  });
});
