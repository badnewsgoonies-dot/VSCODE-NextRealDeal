// Explicit game states with allowable transitions.
// Keep this file SMALL and purely declarative.
export type GameState =
  | 'idle'
  | 'route_selection'
  | 'battle_preparation'
  | 'battle_active'
  | 'battle_resolution'
  | 'economy_rewards'
  | 'run_complete'
  | 'error';

export const STATE_TRANSITIONS: Readonly<Record<GameState, readonly GameState[]>> = {
  idle: ['route_selection'],
  route_selection: ['battle_preparation', 'run_complete'],
  battle_preparation: ['battle_active'],
  battle_active: ['battle_resolution'],
  battle_resolution: ['economy_rewards'],
  economy_rewards: ['route_selection', 'run_complete'],
  run_complete: ['idle'],
  error: ['idle'],
} as const;
