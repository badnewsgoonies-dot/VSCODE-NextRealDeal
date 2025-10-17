import { AsyncQueue } from '../util/AsyncQueue.js';
import { makeLogger, type Logger } from '../util/Logger.js';
import { ok, err, type Result } from '../util/Result.js';
import type { GameUnit, Equipment, EquipmentSlot, EffectiveStats, StatusEffect } from '../types/unit.js';
import type { Rng } from '../util/Rng.js';

export class UnitManager {
  private readonly queue = new AsyncQueue();
  private readonly log: Logger;
  private readonly rng: Rng;
  private units = new Map<string, GameUnit>();

  constructor(logger: Logger, rng: Rng) { this.log = logger; this.rng = rng; }
  async initialize(): Promise<void> { /* no-op */ }
  async destroy(): Promise<void> { /* no-op */ }

  async createUnit(u: Omit<GameUnit, 'experience' | 'level'> & { level?: number; experience?: number }): Promise<Result<GameUnit>> {
    return this.queue.run(async () => {
      const nu: GameUnit = { experience: u.experience ?? 0, level: u.level ?? 1, ...u };
      this.units.set(nu.id, nu);
      return ok(nu);
    });
  }

  get(id: string) { return this.units.get(id); }

  async equipItem(unitId: string, item: Equipment): Promise<Result<GameUnit>> {
    return this.queue.run(async () => {
      const u = this.units.get(unitId); if (!u) return err('not-found');
      const eq = { ...(u.equipment ?? {}), [item.slot]: item };
      const nu = { ...u, equipment: eq };
      this.units.set(unitId, nu);
      return ok(nu);
    });
  }

  async unequipSlot(unitId: string, slot: EquipmentSlot): Promise<Result<GameUnit>> {
    return this.queue.run(async () => {
      const u = this.units.get(unitId); if (!u) return err('not-found');
      const eq = { ...(u.equipment ?? {}) }; delete (eq as any)[slot];
      const nu = { ...u, equipment: eq };
      this.units.set(unitId, nu);
      return ok(nu);
    });
  }

  async addStatus(unitId: string, effect: StatusEffect): Promise<Result<GameUnit>> {
    return this.queue.run(async () => {
      const u = this.units.get(unitId); if (!u) return err('not-found');
      const list = [...(u.statuses ?? []), effect];
      const nu = { ...u, statuses: list };
      this.units.set(unitId, nu);
      return ok(nu);
    });
  }

  tickStatuses(): void {
    const next = new Map<string, GameUnit>();
    for (const [id, u] of this.units) {
      const upd = (u.statuses ?? []).map(s => ({ ...s, turns: Math.max(0, s.turns - 1) })).filter(s => s.turns > 0);
      next.set(id, { ...u, statuses: upd });
    }
    this.units = next;
  }

  getEffectiveStats(unitId: string): EffectiveStats | undefined {
    const u = this.units.get(unitId); if (!u) return undefined;
    const eq = u.equipment ?? {};
    let atk = u.atk + (eq.weapon?.atkBonus ?? 0) + (eq.armor?.atkBonus ?? 0) + (eq.accessory?.atkBonus ?? 0);
    let def = u.def + (eq.weapon?.defBonus ?? 0) + (eq.armor?.defBonus ?? 0) + (eq.accessory?.defBonus ?? 0);
    let speed = u.speed + (eq.weapon?.speedBonus ?? 0) + (eq.armor?.speedBonus ?? 0) + (eq.accessory?.speedBonus ?? 0);
    for (const s of (u.statuses ?? [])) {
      const m = s.magnitude ?? 0.25;
      if (s.kind === 'weakened') atk = Math.max(1, Math.floor(atk * (1 - m)));
      if (s.kind === 'shielded') def = Math.max(0, Math.floor(def * (1 + m)));
    }
    return { hp: u.hp, maxHp: u.maxHp, atk, def, speed };
  }
}
