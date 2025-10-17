export type Logger = {
  enabled: boolean;
  info: (...a: unknown[]) => void;
  warn: (...a: unknown[]) => void;
  error: (...a: unknown[]) => void;
};

export const makeLogger = (opts: { enabled?: boolean } = {}): Logger => {
  const on = opts.enabled ?? true;
  const wrap = (fn: (...a: unknown[]) => void) => (...a: unknown[]) => { if (on) fn(...a); };
  return {
    enabled: on,
    info: wrap(console.log),
    warn: wrap(console.warn),
    error: wrap(console.error),
  };
};
