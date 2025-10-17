// Deterministic RNG with fork(label). sfc32 + xmur3-style hashing.
export interface Rng {
  int(min: number, max: number): number;
  float(): number;
  fork(label: string): Rng;
}

// Backward compatibility
export type RngLike = Rng;

const hash = (s: string) => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const sfc32 = (a: number, b: number, c: number, d: number) => () => {
  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
  const t = (a + b) | 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) | 0;
  c = (c << 21) | (c >>> 11);
  d = (d + 1) | 0;
  const r = (t + d) | 0;
  return (r >>> 0) / 4294967296;
};

export const createRng = (seed: number | string): Rng => {
  const base = typeof seed === 'number' ? seed >>> 0 : hash(String(seed));
  let rnd = sfc32(base, base ^ 0x9e3779b9, base ^ 0x7f4a7c15, base ^ 0x94d049bb);
  const api: Rng = {
    float: () => rnd(),
    int: (min, max) => {
      if (max < min) [min, max] = [max, min];
      return Math.floor(api.float() * (max - min + 1)) + min;
    },
    fork: (label) => createRng(base ^ hash(label)),
  };
  return api;
};

// Backward compatibility
export function makeRng(seed: number): RngLike {
  return createRng(seed);
}
