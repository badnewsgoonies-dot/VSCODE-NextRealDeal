export interface RouteChoice { id: string; label: 'A' | 'B' | 'C'; arenaSeed: number; }
export interface RouteState { runId: string; step: number; complete: boolean; }
