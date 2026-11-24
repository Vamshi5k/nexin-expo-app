import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { api, createApiClient, getErrorMessage, statusOf } from '@/core/api';
import { brand, CLIENT_TOKEN } from '@/core/config';
import { useTheme } from '@/theme';
import { Button, Card, Input, LargeTitleScroll, Text } from '@/ui';

const LOCAL_BASE_URL = 'http://localhost:8787';

const local = createApiClient({
  baseURL: LOCAL_BASE_URL,
  clientToken: CLIENT_TOKEN,
  getAccessToken: () => null,
  getRefreshToken: () => null,
  saveTokens: async () => undefined,
  onSessionExpired: async () => undefined,
});

type Line = { label: string; ok: boolean | null; detail: string };

function describe(headers: unknown): string {
  const h = headers as Record<string, unknown> | undefined;
  const setCookie = h?.['set-cookie'];
  return setCookie
    ? `Set-Cookie visible to JS: ${String(setCookie).slice(0, 60)}`
    : 'no Set-Cookie visible to JS';
}

export function CookieCheckScreen({ autoRunLocal = false }: { autoRunLocal?: boolean }) {
  const t = useTheme();
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [appName, setAppName] = useState(brand.apiAppName);
  const add = (l: Line) => setLines((prev) => [...prev, l]);

  useEffect(() => {
    if (autoRunLocal) void runLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRunLocal]);

  async function runLocal() {
    setBusy(true);
    setLines([]);
    try {
      const login = await local.post('/login', {});
      add({
        label: 'A1 local /login',
        ok: login.status === 200,
        detail: `${login.status}, ${describe(login.headers)}`,
      });
      const verify = await local.post('/verify', {});
      add({
        label: 'A2 local /verify (needs cookie)',
        ok: true,
        detail: `${verify.status}: cookie was sent back`,
      });
    } catch (error) {
      add({
        label: 'A local round-trip',
        ok: false,
        detail: `${statusOf(error) ?? '-'}: ${getErrorMessage(error)}`,
      });
    } finally {
      setBusy(false);
    }
  }

  async function runLogin() {
    setBusy(true);
    try {
      const res = await api.post('/auth/app/login', { contact: contact.trim() });
      add({
        label: 'B1 staging /auth/app/login',
        ok: true,
        detail: `${res.status}, ${describe(res.headers)}`,
      });
    } catch (error) {
      add({
        label: 'B1 staging /auth/app/login',
        ok: false,
        detail: `${statusOf(error) ?? '-'}: ${getErrorMessage(error)}`,
      });
    } finally {
      setBusy(false);
    }
  }

  async function runVerify() {
    setBusy(true);
    try {
      const res = await api.post<Record<string, unknown>>('/auth/app/verify', {
        otp: otp.trim(),
        appName: appName.trim(),
      });
      const body = res.data;
      const hasAccess = !!(body.userAccessToken ?? body.accessToken);
      const hasRefresh = !!(body.userRefreshToken ?? body.refreshToken);
      add({
        label: `B2 staging /auth/app/verify (appName "${appName.trim()}")`,
        ok: hasAccess && hasRefresh,
        detail: `${res.status}, access token ${hasAccess ? 'present' : 'MISSING'}, refresh token ${hasRefresh ? 'present' : 'MISSING'} (values not shown)`,
      });
    } catch (error) {
      add({
        label: 'B2 staging /auth/app/verify',
        ok: false,
        detail: `${statusOf(error) ?? '-'}: ${getErrorMessage(error)}`,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <LargeTitleScroll title="Cookie check" subtitle="Temporary Phase 2 tool" back>
      <View style={{ gap: t.layout.sectionGap }}>
        <Card style={{ gap: t.space[3] }}>
          <Text variant="headline">A. Local cookie round-trip</Text>
          <Text tone="secondary">
            Needs the scratch cookie server on port 8787 (adb reverse on Android).
          </Text>
          <Button label="Run local check" size="medium" loading={busy} onPress={runLocal} />
        </Card>
        <Card style={{ gap: t.space[3] }}>
          <Text variant="headline">B. Staging login and verify</Text>
          <Input
            label="Phone or email"
            value={contact}
            onChangeText={setContact}
            autoCapitalize="none"
          />
          <Button
            label="Send OTP"
            size="medium"
            disabled={!contact}
            loading={busy}
            onPress={runLogin}
          />
          <Input
            label="appName sent to verify"
            value={appName}
            onChangeText={setAppName}
            autoCapitalize="none"
          />
          <Input
            label="OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button
            label="Verify"
            size="medium"
            variant="secondary"
            disabled={!otp}
            loading={busy}
            onPress={runVerify}
          />
        </Card>
        <Card style={{ gap: t.space[2] }}>
          <Text variant="headline">Results ({brand.appName})</Text>
          {lines.length === 0 ? <Text tone="tertiary">Nothing run yet.</Text> : null}
          {lines.map((l, i) => (
            <View key={i} style={{ gap: 2 }}>
              <Text
                variant="subhead"
                tone={l.ok ? 'success' : l.ok === false ? 'danger' : 'primary'}
              >
                {l.ok ? 'PASS' : 'FAIL'} · {l.label}
              </Text>
              <Text variant="caption" tone="secondary" selectable>
                {l.detail}
              </Text>
            </View>
          ))}
        </Card>
      </View>
    </LargeTitleScroll>
  );
}
