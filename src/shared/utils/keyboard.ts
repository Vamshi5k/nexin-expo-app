import { useEffect, useState } from 'react';

import { useAnimatedKeyboard, useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

// Taller than an accessory bar alone, which is all that shows with a hardware keyboard.
const MIN_KEYBOARD_HEIGHT = 80;
export const KEYBOARD_CLOSE_DELAY_MS = 300;

// useAnimatedKeyboard, not Keyboard events: edge-to-edge Android never sends those.
export const useKeyboardOpen = (): boolean => {
  const keyboard = useAnimatedKeyboard();
  const [up, setUp] = useState(false);

  useAnimatedReaction(
    () => keyboard.height.value >= MIN_KEYBOARD_HEIGHT,
    (next, prev) => {
      if (next !== prev) scheduleOnRN(setUp, next);
    },
  );

  return useHeldOpen(up);
};

// Opens at once but closes only after the delay, so swapping inputs (hide, then show again)
// and an autofocused screen never flash closed.
export const useHeldOpen = (up: boolean): boolean => {
  const [settled, setSettled] = useState(true);
  if (up && !settled) setSettled(true);

  useEffect(() => {
    if (up) return;
    const timer = setTimeout(() => setSettled(false), KEYBOARD_CLOSE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [up]);

  return up || settled;
};
