export type Team = 'player' | 'enemy';

export interface BattleUnit { id: string; team: Team; hp: number; maxHp: number; atk: number; def: number; speed: number; }
export interface BattleState { id: string; isActive: boolean; units: BattleUnit[]; turnOrder: string[]; }

export type CombatActionType = 'attack' | 'defend' | 'signature' | 'defeat';
export interface CombatAction {
  type: CombatActionType; actorId: string; targetId?: string;
  damage?: number; critical?: boolean; dodged?: boolean; seq: number;
}
export interface CombatResult { damage: number; finalHp: number; killed: boolean; critical: boolean; dodged: boolean; }
