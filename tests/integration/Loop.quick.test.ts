import { describe, it, expect } from 'vitest';
import { makeLogger } from '../../src/util/Logger.js';
import { createRng } from '../../src/util/Rng.js';
import { RngStreams } from '../../src/util/RngStreams.js';
import { RouteManager } from '../../src/route/RouteManager.js';
import { BattleManager } from '../../src/battle/BattleManager.js';
import { GameController } from '../../src/core/GameController.js';

describe('GameController integration', () => {
  it('loops deterministically for one step', async () => {
    const logger = makeLogger({ enabled: false });
    const streams = new RngStreams(createRng('seed-42'));
    const route = new RouteManager(logger, streams.get('route'));
    const battle = new BattleManager(logger, streams.get('battle'));
    const gc = new GameController(logger, streams, route, battle);

    await route.initialize(); await battle.initialize();
    await gc.startRun('run-1');

    const firstChoices = await route.getChoices();
    expect(firstChoices.ok).toBe(true);

    const nodeId = firstChoices.ok ? firstChoices.value[0].id : '';
    await gc.selectRoute(nodeId);
    expect(gc.getState()).toBe('battle_active');

    await gc.completeBattle();
    expect(['route_selection', 'run_complete']).toContain(gc.getState());
  });

  it('maintains determinism across multiple runs with same seed', async () => {
    const runGame = async (seed: string) => {
      const logger = makeLogger({ enabled: false });
      const streams = new RngStreams(createRng(seed));
      const route = new RouteManager(logger, streams.get('route'));
      const battle = new BattleManager(logger, streams.get('battle'));
      const gc = new GameController(logger, streams, route, battle);

      await route.initialize(); await battle.initialize();
      await gc.startRun('test-run');

      const choices = await route.getChoices();
      if (!choices.ok) throw new Error('no choices');

      await gc.selectRoute(choices.value[0].id);
      const log = battle.getCombatLog();
      
      return {
        choices: choices.value.map(c => c.arenaSeed),
        logLength: log.length,
        state: gc.getState()
      };
    };

    const run1 = await runGame('determinism-test');
    const run2 = await runGame('determinism-test');

    expect(run1).toEqual(run2);
  });

  it('produces different results with different seeds', async () => {
    const runGame = async (seed: string) => {
      const logger = makeLogger({ enabled: false });
      const streams = new RngStreams(createRng(seed));
      const route = new RouteManager(logger, streams.get('route'));
      const battle = new BattleManager(logger, streams.get('battle'));
      const gc = new GameController(logger, streams, route, battle);

      await route.initialize(); await battle.initialize();
      await gc.startRun('test-run');

      const choices = await route.getChoices();
      return choices.ok ? choices.value.map(c => c.arenaSeed) : [];
    };

    const run1 = await runGame('seed-A');
    const run2 = await runGame('seed-B');

    expect(run1).not.toEqual(run2);
  });

  it('completes a full 6-step run', async () => {
    const logger = makeLogger({ enabled: false });
    const streams = new RngStreams(createRng(999));
    const route = new RouteManager(logger, streams.get('route'));
    const battle = new BattleManager(logger, streams.get('battle'));
    const gc = new GameController(logger, streams, route, battle);

    await route.initialize(); await battle.initialize();
    await gc.startRun('full-run');

    // Run through 6 steps (RouteManager completes after step 6)
    for (let i = 0; i < 6; i++) {
      const choices = await route.getChoices();
      expect(choices.ok).toBe(true);
      
      if (choices.ok) {
        await gc.selectRoute(choices.value[1].id); // Pick middle choice
        expect(gc.getState()).toBe('battle_active');
        
        await gc.completeBattle();
        
        if (i < 5) {
          expect(gc.getState()).toBe('route_selection');
        } else {
          expect(gc.getState()).toBe('run_complete');
        }
      }
    }
  });
});
