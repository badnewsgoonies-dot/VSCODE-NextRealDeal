// Core game controller
export { GameController } from './core/GameController.js';

// State machine
export { GameStateMachine } from './core/state/GameStateMachine.js';
export type { GameState } from './core/state/GameState.js';
export { STATE_TRANSITIONS } from './core/state/GameState.js';

// Utilities
export { ok, err, isOk, isErr } from './util/Result.js';
export type { Result } from './util/Result.js';
export { makeLogger } from './util/Logger.js';
export type { Logger } from './util/Logger.js';
export { AsyncQueue } from './util/AsyncQueue.js';
export { makeRng, createRng } from './util/Rng.js';
export type { Rng, RngLike } from './util/Rng.js';
export { RngStreams } from './util/RngStreams.js';
export type { RngLabel } from './util/RngStreams.js';

// Managers (legacy stubs from core/Managers)
export {
  MapManager,
  EconomyManager,
  SaveManager,
} from './core/Managers.js';
export type { Manager } from './core/Managers.js';

// New managers with full implementations
export { RouteManager } from './route/RouteManager.js';
export { BattleManager } from './battle/BattleManager.js';
export { UnitManager } from './unit/UnitManager.js';

// Types
export type { RouteChoice, RouteState } from './types/route.js';
export type { 
  Team, 
  BattleUnit, 
  BattleState, 
  CombatActionType, 
  CombatAction, 
  CombatResult 
} from './types/battle.js';
export type { 
  Unit, 
  GameUnit, 
  EquipmentSlot, 
  Equipment, 
  StatusKind, 
  StatusEffect, 
  EffectiveStats 
} from './types/unit.js';
