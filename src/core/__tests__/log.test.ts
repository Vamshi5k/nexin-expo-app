import { redact } from '../log';

describe('redact', () => {
  it('hides secret-looking keys at any depth', () => {
    expect(
      redact({
        accessToken: 'abc',
        user: { id: 1, refresh_token: 'x' },
        headers: { Authorization: 'Bearer y' },
      }),
    ).toEqual({
      accessToken: '[redacted]',
      user: { id: 1, refresh_token: '[redacted]' },
      headers: { Authorization: '[redacted]' },
    });
  });
});
