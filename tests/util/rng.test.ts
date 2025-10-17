import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { makeRng } from '../../src/util/Rng';

describe('Rng', () => {
  it('generates integers in specified range', () => {
    const rng = makeRng(12345);
    
    for (let i = 0; i < 100; i++) {
      const val = rng.int(0, 10);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('generates floats between 0 and 1', () => {
    const rng = makeRng(12345);
    
    for (let i = 0; i < 100; i++) {
      const val = rng.float();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('is deterministic with same seed', () => {
    const rng1 = makeRng(42);
    const rng2 = makeRng(42);

    const values1 = Array.from({ length: 10 }, () => rng1.int(0, 1000));
    const values2 = Array.from({ length: 10 }, () => rng2.int(0, 1000));

    expect(values1).toEqual(values2);
  });

  it('produces different sequences with different seeds', () => {
    const rng1 = makeRng(42);
    const rng2 = makeRng(43);

    const values1 = Array.from({ length: 10 }, () => rng1.int(0, 1000));
    const values2 = Array.from({ length: 10 }, () => rng2.int(0, 1000));

    expect(values1).not.toEqual(values2);
  });

  it('fork creates independent streams', () => {
    const root = makeRng(100);
    const fork1 = root.fork('stream1');
    const fork2 = root.fork('stream2');

    const v1 = fork1.int(0, 1e9);
    const v2 = fork2.int(0, 1e9);

    expect(v1).not.toBe(v2);
  });

  it('fork is deterministic', () => {
    const root1 = makeRng(100);
    const root2 = makeRng(100);
    
    const fork1a = root1.fork('test');
    const fork2a = root2.fork('test');

    const values1 = Array.from({ length: 5 }, () => fork1a.int(0, 1000));
    const values2 = Array.from({ length: 5 }, () => fork2a.int(0, 1000));

    expect(values1).toEqual(values2);
  });

  it('handles swapped range (new behavior)', () => {
    const rng = makeRng(123);
    // New RNG auto-swaps if max < min instead of throwing
    const val = rng.int(10, 5);
    expect(val).toBeGreaterThanOrEqual(5);
    expect(val).toBeLessThanOrEqual(10);
  });

  it('property: values are in range', () => {
    fc.assert(
      fc.property(
        fc.integer(),
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (seed, a, b) => {
          const [min, max] = a <= b ? [a, b] : [b, a];
          const rng = makeRng(seed);
          const val = rng.int(min, max);
          return val >= min && val <= max;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('property: determinism holds across multiple operations', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const rng1 = makeRng(seed);
        const rng2 = makeRng(seed);

        for (let i = 0; i < 50; i++) {
          const v1 = rng1.int(0, 1000);
          const v2 = rng2.int(0, 1000);
          if (v1 !== v2) return false;
        }
        return true;
      }),
      { numRuns: 50 }
    );
  });
});
