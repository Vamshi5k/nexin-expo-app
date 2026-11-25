import { act, renderHook } from '@testing-library/react-native';

import { KEYBOARD_CLOSE_DELAY_MS, useHeldOpen } from '@/shared/utils/keyboard';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

it('reports closed only after the delay when no keyboard is up', async () => {
  const { result } = await renderHook(() => useHeldOpen(false));
  expect(result.current).toBe(true);
  await wait(KEYBOARD_CLOSE_DELAY_MS);
  expect(result.current).toBe(false);
});

it('opens at once and closes after the delay', async () => {
  const { result, rerender } = await renderHook(({ up }: { up: boolean }) => useHeldOpen(up), {
    initialProps: { up: false },
  });
  await wait(KEYBOARD_CLOSE_DELAY_MS);
  await rerender({ up: true });
  expect(result.current).toBe(true);
  await rerender({ up: false });
  expect(result.current).toBe(true);
  await wait(KEYBOARD_CLOSE_DELAY_MS);
  expect(result.current).toBe(false);
});

it('stays open when the keyboard hides and shows again (switching inputs)', async () => {
  const { result, rerender } = await renderHook(({ up }: { up: boolean }) => useHeldOpen(up), {
    initialProps: { up: true },
  });
  await rerender({ up: false });
  await wait(100);
  expect(result.current).toBe(true);
  await rerender({ up: true });
  await wait(KEYBOARD_CLOSE_DELAY_MS * 2);
  expect(result.current).toBe(true);
});
