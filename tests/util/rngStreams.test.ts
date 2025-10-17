import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { RngStreams } from '../../src/util/RngStreams';
import { makeRng } from '../../src/util/Rng';

describe('RngStreams', () => {
  it('forks deterministic, independent streams', () => {
    const root = makeRng(12345);
    const mgr = new RngStreams(root);

    // Determinism: same seed => same samples per named stream
    const mgrB = new RngStreams(makeRng(12345));
    const a = mgr.get('battle').int(0, 1e9);
    const b = mgrB.get('battle').int(0, 1e9);
    expect(a).toBe(b);

    // Independence heuristic - test on fresh managers
    const mgr2 = new RngStreams(makeRng(99999));
    expect(mgr2.sampleDistinct()).toBe(true);
  });

  it('throws for uninitialized stream', () => {
    const root = makeRng(12345);
    const mgr = new RngStreams(root, ['route', 'battle']);
    
    expect(() => mgr.get('nonexistent')).toThrow("RNG stream 'nonexistent' not initialized");
  });

  it('each stream produces different sequences', () => {
    const root = makeRng(42);
    const mgr = new RngStreams(root);

    const route1 = mgr.get('route').int(0, 1000);
    const battle1 = mgr.get('battle').int(0, 1000);
    
    // Different streams should produce different values
    expect(route1).not.toBe(battle1);
  });

  it('same stream with same seed produces same sequence', () => {
    const mgr1 = new RngStreams(makeRng(999));
    const mgr2 = new RngStreams(makeRng(999));

    const values1 = Array.from({ length: 5 }, () => mgr1.get('economy').int(0, 100));
    const values2 = Array.from({ length: 5 }, () => mgr2.get('economy').int(0, 100));

    expect(values1).toEqual(values2);
  });

  it('property: different seeds produce variety', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1 }), (seed) => {
        const s1 = new RngStreams(makeRng(seed)).get('route').int(0, 1e9);
        const s2 = new RngStreams(makeRng(seed + 1)).get('route').int(0, 1e9);
        return s1 !== s2;
      }),
      { numRuns: 50 }
    );
  });

  it('property: streams remain independent across many calls', () => {
    fc.assert(
      fc.property(fc.integer(), (seed) => {
        const mgr = new RngStreams(makeRng(seed));
        
        // Generate many values from different streams
        for (let i = 0; i < 100; i++) {
          mgr.get('route').int(0, 1000);
          mgr.get('battle').int(0, 1000);
          mgr.get('economy').int(0, 1000);
        }
        
        // After many calls, streams should still be distinct
        return mgr.sampleDistinct(5);
      }),
      { numRuns: 20 }
    );
  });

  it('allows custom stream labels', () => {
    const root = makeRng(777);
    const mgr = new RngStreams(root, ['custom1', 'custom2', 'custom3']);

    expect(() => mgr.get('custom1')).not.toThrow();
    expect(() => mgr.get('custom2')).not.toThrow();
    expect(() => mgr.get('custom3')).not.toThrow();
    expect(() => mgr.get('route')).toThrow();
  });
});
