import { useEffect, useRef, useState } from 'react';

import { useReducedMotion } from 'react-native-reanimated';

const DURATION_MS = 700;

// Counts a number up to `target` (eased), starting from the last value shown, so a new balance
// rolls to its value instead of jumping. Jumps straight there with Reduce Motion on.
export const useCountUp = (target: number) => {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(reduceMotion ? target : 0);
  const shown = useRef(value);

  useEffect(() => {
    const from = shown.current;
    if (reduceMotion || from === target) {
      shown.current = target;
      const frame = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frame);
    }

    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const progress = Math.min((Date.now() - start) / DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = Math.round(from + (target - from) * eased);
      shown.current = next;
      setValue(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, target]);

  return value;
};
