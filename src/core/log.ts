/* eslint-disable no-console -- this is the one place allowed to use console */

type Level = 'debug' | 'info' | 'warn' | 'error';

const SECRET_KEYS = /token|authorization|password|otp|secret/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      SECRET_KEYS.test(k) ? '[redacted]' : redact(v, depth + 1),
    ]),
  );
}

function write(level: Level, message: string, data?: unknown) {
  if (!__DEV__ && (level === 'debug' || level === 'info')) return;
  const args = data === undefined ? [message] : [message, redact(data)];
  console[level](...args);
}

export const log = {
  debug: (message: string, data?: unknown) => write('debug', message, data),
  info: (message: string, data?: unknown) => write('info', message, data),
  warn: (message: string, data?: unknown) => write('warn', message, data),
  error: (message: string, data?: unknown) => write('error', message, data),
};
