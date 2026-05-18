// Soft wrapper around navigator.vibrate — no-op on desktop / unsupported.

function vibrate(pattern: number | number[]) {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}

export const Haptics = {
  correct: () => vibrate(15),
  wrong: () => vibrate([35, 35, 35]),
  combo: () => vibrate(10),
  levelUp: () => vibrate([60, 50, 60, 50, 80]),
  expire: () => vibrate([100, 40, 60]),
  tap: () => vibrate(8),
};
