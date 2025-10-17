import { RngLike } from '../util/RngStreams';

export interface Manager {
  setRng?(rng: RngLike): void;
}

export class MapManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }
}

export class BattleManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }

  async prepareBattle(nodeId: string): Promise<void> {
    // Stub implementation
  }
}

export class UnitManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }

  isPlayerDead(): boolean {
    return false;
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

export class RouteManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }

  async startRun(): Promise<void> {
    // Stub implementation
  }

  isComplete(): boolean {
    return false;
  }
}

export class SaveManager implements Manager {
  private rng?: RngLike;
  
  setRng(rng: RngLike): void {
    this.rng = rng;
  }
}
