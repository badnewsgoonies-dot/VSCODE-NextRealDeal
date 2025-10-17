// Core game controller
export { GameController } from './core/GameController';

// State machine
export { GameStateMachine, ok, err } from './core/state/GameStateMachine';
export type { Result } from './core/state/GameStateMachine';
export type { GameState } from './core/state/GameState';
export { STATE_TRANSITIONS } from './core/state/GameState';

// RNG utilities
export { makeRng } from './util/Rng';
export type { RngLike } from './util/Rng';
export { RngStreams } from './util/RngStreams';

// Managers
export {
  MapManager,
  BattleManager,
  UnitManager,
  EconomyManager,
  RouteManager,
  SaveManager,
} from './core/Managers';
export type { Manager } from './core/Managers';
