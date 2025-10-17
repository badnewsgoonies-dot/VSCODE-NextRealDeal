import { GameState, STATE_TRANSITIONS } from './GameState';

// Simple Result type for no-throw error handling
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const err = <T extends string = string>(error: T): Result<never> => ({ ok: false, error });

export class GameStateMachine {
  private current: GameState = 'idle';
  private readonly history: GameState[] = [];

  getState(): GameState {
    return this.current;
  }

  getHistory(): readonly GameState[] {
    return this.history;
  }

  canTransitionTo(next: GameState): boolean {
    return STATE_TRANSITIONS[this.current].includes(next);
  }

  transitionTo(next: GameState): Result<void> {
    if (!this.canTransitionTo(next)) {
      return err(`Invalid transition: ${this.current} -> ${next}`);
    }
    this.history.push(this.current);
    this.current = next;
    return ok(undefined);
  }

  reset(): void {
    this.current = 'idle';
    this.history.length = 0;
  }
}
