import { Easing, FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';

import { motion } from '@/shared/theme';

// Entrance animations shared by screens, so everything rises in with the same timing.
// Reanimated skips them when the system asks for reduced motion.
const EASE_OUT = Easing.out(Easing.cubic);

// Fades in while rising a little; `step` staggers items that appear together.
export const riseIn = (step = 0) =>
  FadeInDown.duration(motion.durationSlow)
    .delay(step * motion.stagger)
    .easing(EASE_OUT);

// Floating controls at the top of a screen drop in from above.
export const dropIn = (step = 0) =>
  FadeInUp.duration(motion.duration)
    .delay(step * motion.stagger)
    .easing(EASE_OUT);

// Cards in a sideways row slide in one after another.
export const slideIn = (step = 0) =>
  FadeInRight.duration(motion.duration)
    .delay(step * motion.stagger)
    .easing(EASE_OUT);

// Bars pinned to the bottom spring up from below.
export const springUp = (step = 0) =>
  FadeInDown.springify()
    .damping(motion.spring.damping)
    .stiffness(motion.spring.stiffness)
    .delay(step * motion.stagger);
