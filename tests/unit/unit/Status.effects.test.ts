import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { UnitManager } from '../../../src/unit/UnitManager.js';
import { makeLogger } from '../../../src/util/Logger.js';
import { createRng } from '../../../src/util/Rng.js';

describe('Unit statuses', () => {
  let m: UnitManager;
  beforeEach(async () => { m = new UnitManager(makeLogger({ enabled: false }), createRng(1)); await m.initialize(); });
  afterEach(async () => { await m.destroy(); });

  test('weakened reduces ATK for N turns', async () => {
    const u = await m.createUnit({ id: 'u', name: 'U', team: 'player', hp: 100, maxHp: 100, atk: 40, def: 10, speed: 10 });
    expect(u.ok).toBe(true);
    await m.addStatus('u', { kind: 'weakened', turns: 2, magnitude: 0.25 });
    const s1 = m.getEffectiveStats('u')!;
    expect(s1.atk).toBeLessThan(40);
    m.tickStatuses();
    expect(m.getEffectiveStats('u')!.atk).toBe(s1.atk);
    m.tickStatuses();
    expect(m.getEffectiveStats('u')!.atk).toBeGreaterThanOrEqual(40);
  });

  test('shielded increases DEF for N turns', async () => {
    await m.createUnit({ id: 'v', name: 'V', team: 'player', hp: 100, maxHp: 100, atk: 10, def: 10, speed: 10 });
    await m.addStatus('v', { kind: 'shielded', turns: 1 });
    const s1 = m.getEffectiveStats('v')!;
    expect(s1.def).toBeGreaterThanOrEqual(12);
    m.tickStatuses();
    expect(m.getEffectiveStats('v')!.def).toBeLessThanOrEqual(s1.def);
  });
});
