import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { BattleManager } from '../../../src/battle/BattleManager.js';
import { makeLogger } from '../../../src/util/Logger.js';
import { createRng } from '../../../src/util/Rng.js';
import type { BattleUnit, Team } from '../../../src/types/battle.js';

const unit = (id: string, o: Partial<BattleUnit> = {}): BattleUnit => ({ 
  id, team: 'player' as Team, hp: 100, maxHp: 100, atk: 24, def: 8, speed: 50, ...o 
});

describe('BattleManager — defend & signature', () => {
  let m: BattleManager;
  beforeEach(async () => { m = new BattleManager(makeLogger({ enabled: false }), createRng(777)); await m.initialize(); });
  afterEach(async () => { await m.destroy(); });

  test('defend reduces next incoming hit ~30%', async () => {
    await m.startBattle([unit('A'), unit('B', { team: 'enemy' })]);
    await m.defend('B');
    const withDefend = await m.attack('A', 'B');
    expect(withDefend.ok).toBe(true);

    const m2 = new BattleManager(makeLogger({ enabled: false }), createRng(777));
    await m2.initialize(); await m2.startBattle([unit('A'), unit('B', { team: 'enemy' })]);
    const base = await m2.attack('A', 'B');

    expect(withDefend.ok && base.ok).toBe(true);
    if (withDefend.ok && base.ok) {
      expect(withDefend.value.damage).toBeLessThanOrEqual(Math.floor(base.value.damage * 0.8));
    }
  });

  test('signature is a heavy strike and is logged', async () => {
    await m.startBattle([unit('A'), unit('B', { team: 'enemy', def: 6 })]);
    const res = await m.signature('A', 'B');
    expect(res.ok).toBe(true);
    const log = m.getCombatLog();
    expect(log.some(a => a.type === 'signature')).toBe(true);
  });
});
