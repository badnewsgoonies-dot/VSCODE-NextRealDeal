import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
import { RouteManager } from '../../../src/route/RouteManager.js';
import { makeLogger } from '../../../src/util/Logger.js';
import { createRng } from '../../../src/util/Rng.js';

const mk = (seed: number) => new RouteManager(makeLogger({ enabled: false }), createRng(seed));

describe('RouteManager (properties)', () => {
  test('determinism: same seed -> identical choices at step 0', async () => {
    await fc.assert(fc.asyncProperty(fc.integer(), async seed => {
      const a = mk(seed), b = mk(seed);
      await a.initialize(); await b.initialize();
      await a.startRun('r'); await b.startRun('r');
      const ca = await a.getChoices(); const cb = await b.getChoices();
      expect(ca.ok && cb.ok).toBe(true);
      if (ca.ok && cb.ok) expect(ca.value).toEqual(cb.value);
    }), { numRuns: 40 });
  });

  test('acyclic: step increases strictly with choices', async () => {
    const m = mk(42); await m.initialize(); await m.startRun('r');
    let last = -1;
    for (let i = 0; i < 5; i++) {
      const c = await m.getChoices(); if (!c.ok) throw new Error('no choices');
      await m.choose(c.value[0].id);
      const st = m.current()!; expect(st.step).toBeGreaterThan(last); last = st.step;
    }
  });

  test('connectivity: three choices per step until complete', async () => {
    const m = mk(9); await m.initialize(); await m.startRun('r');
    for (let i = 0; i < 3; i++) {
      const c = await m.getChoices(); expect(c.ok).toBe(true);
      if (c.ok) expect(c.value).toHaveLength(3);
      await m.choose(c.ok ? c.value[1].id : '');
    }
  });
});
