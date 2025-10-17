export interface Unit { id: string; hp: number; maxHp: number; atk: number; def: number; speed: number; }
export interface GameUnit extends Unit { name: string; level: number; experience: number; team: 'player'|'enemy'; equipment?: Partial<Record<EquipmentSlot, Equipment>>; statuses?: readonly StatusEffect[]; }

export type EquipmentSlot = 'weapon'|'armor'|'accessory';
export interface Equipment { id: string; name: string; slot: EquipmentSlot; atkBonus?: number; defBonus?: number; speedBonus?: number; }

export type StatusKind = 'weakened' | 'shielded';
export interface StatusEffect { kind: StatusKind; turns: number; magnitude?: number; }

export interface EffectiveStats { hp: number; maxHp: number; atk: number; def: number; speed: number; }
