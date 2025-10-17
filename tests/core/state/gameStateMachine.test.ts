import { describe, it, expect } from 'vitest';
import { GameStateMachine } from '../../../src/core/state/GameStateMachine';

describe('GameStateMachine', () => {
  it('starts in idle state', () => {
    const fsm = new GameStateMachine();
    expect(fsm.getState()).toBe('idle');
  });

  it('validates legal transitions', () => {
    const fsm = new GameStateMachine();
    expect(fsm.getState()).toBe('idle');
    expect(fsm.transitionTo('route_selection').ok).toBe(true);
    expect(fsm.getState()).toBe('route_selection');
  });

  it('rejects illegal transitions', () => {
    const fsm = new GameStateMachine();
    const result = fsm.transitionTo('battle_active');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid transition');
    }
  });

  it('tracks history', () => {
    const fsm = new GameStateMachine();
    fsm.transitionTo('route_selection');
    fsm.transitionTo('battle_preparation');
    expect(fsm.getHistory()).toEqual(['idle', 'route_selection']);
  });

  it('can transition through complete flow', () => {
    const fsm = new GameStateMachine();
    
    expect(fsm.transitionTo('route_selection').ok).toBe(true);
    expect(fsm.transitionTo('battle_preparation').ok).toBe(true);
    expect(fsm.transitionTo('battle_active').ok).toBe(true);
    expect(fsm.transitionTo('battle_resolution').ok).toBe(true);
    expect(fsm.transitionTo('economy_rewards').ok).toBe(true);
    expect(fsm.transitionTo('route_selection').ok).toBe(true);
  });

  it('can transition to run_complete from route_selection', () => {
    const fsm = new GameStateMachine();
    
    fsm.transitionTo('route_selection');
    expect(fsm.transitionTo('run_complete').ok).toBe(true);
    expect(fsm.getState()).toBe('run_complete');
  });

  it('can transition to run_complete from economy_rewards', () => {
    const fsm = new GameStateMachine();
    
    fsm.transitionTo('route_selection');
    fsm.transitionTo('battle_preparation');
    fsm.transitionTo('battle_active');
    fsm.transitionTo('battle_resolution');
    fsm.transitionTo('economy_rewards');
    expect(fsm.transitionTo('run_complete').ok).toBe(true);
    expect(fsm.getState()).toBe('run_complete');
  });

  it('reset returns to idle and clears history', () => {
    const fsm = new GameStateMachine();
    
    fsm.transitionTo('route_selection');
    fsm.transitionTo('battle_preparation');
    fsm.reset();
    
    expect(fsm.getState()).toBe('idle');
    expect(fsm.getHistory()).toEqual([]);
  });

  it('canTransitionTo checks validity without changing state', () => {
    const fsm = new GameStateMachine();
    
    expect(fsm.canTransitionTo('route_selection')).toBe(true);
    expect(fsm.canTransitionTo('battle_active')).toBe(false);
    expect(fsm.getState()).toBe('idle');
  });
});
