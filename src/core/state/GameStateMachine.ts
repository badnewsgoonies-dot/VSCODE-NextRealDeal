import { GameState, STATE_TRANSITIONS } from './GameState.js';
import { Result, ok, err } from '../../util/Result.js';

export class GameStateMachine {
  private current: GameState = 'idle';
  private readonly history: GameState[] = [];

  getState() { return this.current; }
  getHistory(): readonly GameState[] { return this.history; }
  canTransitionTo(next: GameState) { return STATE_TRANSITIONS[this.current].includes(next); }

  transitionTo(next: GameState): Result<void> {
    if (!this.canTransitionTo(next)) return err(`Invalid transition: ${this.current} -> ${next}`);
    this.history.push(this.current);
    this.current = next;
    return ok(undefined);
  }

  reset() { this.current = 'idle'; this.history.length = 0; }
}
