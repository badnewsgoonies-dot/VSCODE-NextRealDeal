import { RngLike } from '../util/RngStreams.js';

export interface Manager {
  setRng?(rng: RngLike): void;
}

export class MapManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }
}

export class EconomyManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }

  async generateRewards(outcome: { victory: boolean }): Promise<void> {
    // Stub implementation
  }

  async applyReward(rewardId: string): Promise<void> {
    // Stub implementation
  }
}

export class SaveManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }
}

// Re-export core modules
export * from './GameController.js';
export * from './state/GameState.js';
export * from './state/GameStateMachine.js';

// Re-export full managers
export * from '../route/RouteManager.js';
export * from '../battle/BattleManager.js';
export * from '../unit/UnitManager.js';

// Re-export utilities
export * from '../util/Result.js';
export { makeRng, createRng, type Rng, type RngLike } from '../util/Rng.js';
export { RngStreams, type RngLabel } from '../util/RngStreams.js';
export * from '../util/AsyncQueue.js';
export * from '../util/Logger.js';
