/**
 * Example demonstration of the deterministic game engine
 */
import { makeRng } from '../src/util/Rng';
import { GameController } from '../src/core/GameController';
import { RngStreams } from '../src/util/RngStreams';
import {
  MapManager,
  BattleManager,
  UnitManager,
  EconomyManager,
  RouteManager,
  SaveManager,
} from '../src/core/Managers';

async function main() {
  console.log('=== Deterministic Game Engine Demo ===\n');

  // Example 1: Basic RNG usage
  console.log('1. Basic RNG with determinism:');
  const rng1 = makeRng(42);
  const rng2 = makeRng(42);
  console.log(`  RNG 1: ${rng1.int(1, 100)}`);
  console.log(`  RNG 2: ${rng2.int(1, 100)} (same seed → same result)`);
  console.log();

  // Example 2: RNG Forking
  console.log('2. Independent RNG streams via forking:');
  const root = makeRng(12345);
  const battleRng = root.fork('battle');
  const economyRng = root.fork('economy');
  console.log(`  Battle damage: ${battleRng.int(10, 20)}`);
  console.log(`  Economy gold: ${economyRng.int(50, 100)}`);
  console.log();

  // Example 3: RNG Stream Manager
  console.log('3. Centralized RNG stream manager:');
  const streams = new RngStreams(makeRng(99999));
  console.log(`  Route stream: ${streams.get('route').int(1, 10)}`);
  console.log(`  Battle stream: ${streams.get('battle').int(1, 10)}`);
  console.log(`  Economy stream: ${streams.get('economy').int(1, 10)}`);
  const isIndependent = streams.sampleDistinct() ? 'Yes' : 'No';
  console.log(`  Streams are independent: ${isIndependent}`);
  console.log();

  // Example 4: Game Controller with State Machine
  console.log('4. Game controller with state transitions:');
  const game = new GameController(
    makeRng(424242),
    new MapManager(),
    new BattleManager(),
    new UnitManager(),
    new EconomyManager(),
    new RouteManager(),
    new SaveManager()
  );

  console.log(`  Initial state: ${game.getState()}`);
  
  await game.startRun();
  console.log(`  After startRun: ${game.getState()}`);
  
  await game.selectRouteNode('node-1');
  console.log(`  After selectRouteNode: ${game.getState()}`);
  
  await game.completeBattle({ victory: true });
  console.log(`  After completeBattle: ${game.getState()}`);
  
  await game.selectReward('reward-1');
  console.log(`  After selectReward: ${game.getState()}`);
  console.log();

  // Example 5: Determinism verification
  console.log('5. Determinism verification:');
  const createAndRunGame = async (seed: number) => {
    const g = new GameController(
      makeRng(seed),
      new MapManager(),
      new BattleManager(),
      new UnitManager(),
      new EconomyManager(),
      new RouteManager(),
      new SaveManager()
    );
    await g.startRun();
    return g.getState();
  };

  const state1 = await createAndRunGame(777);
  const state2 = await createAndRunGame(777);
  console.log(`  Run 1 state: ${state1}`);
  console.log(`  Run 2 state: ${state2}`);
  console.log(`  States match: ${state1 === state2} (determinism confirmed!)`);
  console.log();

  console.log('=== All examples completed successfully! ===');
}

main().catch(console.error);
