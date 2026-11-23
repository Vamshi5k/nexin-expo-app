import { isAxiosError } from 'axios';

export type ApiErrorKind = 'http' | 'network' | 'timeout' | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, kind: ApiErrorKind, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.data = data;
  }

  get isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }
}

function messageFromData(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return undefined;
}

/** BLUEPRINT: response.data.message || error.message || fallback. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (isAxiosError(error)) {
    return messageFromData(error.response?.data) || error.message || fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (isAxiosError(error)) {
    const message = getErrorMessage(error);
    if (error.response)
      return new ApiError(message, 'http', error.response.status, error.response.data);
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT')
      return new ApiError(message, 'timeout');
    return new ApiError(message, 'network');
  }
  return new ApiError(getErrorMessage(error), 'unknown');
}

/** HTTP status of any error, if it has one. */
export function statusOf(error: unknown): number | undefined {
  if (error instanceof ApiError) return error.status;
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}
