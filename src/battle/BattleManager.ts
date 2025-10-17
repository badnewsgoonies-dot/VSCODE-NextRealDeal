import { AsyncQueue } from '../util/AsyncQueue.js';
import { makeLogger, type Logger } from '../util/Logger.js';
import type { Rng } from '../util/Rng.js';
import { ok, err, type Result } from '../util/Result.js';
import type { BattleState, BattleUnit, CombatResult, CombatAction } from '../types/battle.js';

export class BattleManager {
  private readonly queue = new AsyncQueue();
  private readonly log: Logger;
  private readonly rootRng: Rng;
  private battleRng?: Rng;
  private state?: BattleState;
  private seq = 0;
  private guards = new Map<string, number>();
  private logBuf: CombatAction[] = [];

  constructor(logger: Logger, rng: Rng) { this.log = logger; this.rootRng = rng; }
  async initialize(): Promise<void> { /* no-op */ }
  async destroy(): Promise<void> { /* no-op */ }

  getCombatLog() { return [...this.logBuf]; }
  private push(a: CombatAction) { this.logBuf.push(a); }
  private nextSeq() { return this.seq++; }

  async startBattle(units: BattleUnit[], id = 'battle-1'): Promise<Result<void>> {
    return this.queue.run(async () => {
      this.battleRng = this.rootRng.fork(`battle:${id}`);
      const order = [...units].sort((a, b) => (b.speed - a.speed) || a.id.localeCompare(b.id)).map(u => u.id);
      this.state = { id, isActive: true, units: units.map(u => ({ ...u })), turnOrder: order };
      this.seq = 0; this.guards.clear(); this.logBuf = [];
      return ok(undefined);
    });
  }

  private getUnit(id: string) { return this.state?.units.find(u => u.id === id); }

  private dmgBase(att: BattleUnit, def: BattleUnit) {
    const rng = this.battleRng!;
    const base = Math.max(1, Math.floor(att.atk - def.def * 0.5));
    const variance = Math.floor(base * (rng.float() * 0.2 - 0.1)); // ±10%
    const critical = rng.float() < 0.1;
    let damage = Math.max(1, base + variance);
    if (critical) damage = Math.floor(damage * 1.5);
    return { damage, critical };
  }

  private applyDamageAndLog(attId: string, tarId: string, tag: 'attack' | 'signature', payload: { damage: number; critical: boolean }): Result<CombatResult> {
    const t = this.getUnit(tarId); if (!t) return err('target-missing');
    let damage = payload.damage;

    const guard = this.guards.get(tarId) ?? 0;
    if (guard > 0) { damage = Math.floor(damage * 0.7); this.guards.set(tarId, guard - 1); }

    const finalHp = Math.max(0, t.hp - damage);
    const killed = finalHp === 0 && t.hp > 0;
    t.hp = finalHp;

    this.push({ type: tag, actorId: attId, targetId: tarId, damage, critical: payload.critical, seq: this.nextSeq() });
    if (killed) this.push({ type: 'defeat', actorId: tarId, seq: this.nextSeq() });
    return ok({ damage, finalHp, killed, critical: payload.critical, dodged: false });
  }

  async attack(attackerId: string, targetId: string): Promise<Result<CombatResult>> {
    return this.queue.run(async () => {
      if (!this.state?.isActive || !this.battleRng) return err('no-battle');
      const a = this.getUnit(attackerId), t = this.getUnit(targetId);
      if (!a || !t) return err('unit-missing');
      return this.applyDamageAndLog(attackerId, targetId, 'attack', this.dmgBase(a, t));
    });
  }

  async defend(actorId: string): Promise<Result<void>> {
    return this.queue.run(async () => {
      if (!this.state?.isActive) return err('no-battle');
      const u = this.getUnit(actorId); if (!u) return err('unit-missing');
      this.guards.set(actorId, 1);
      this.push({ type: 'defend', actorId, seq: this.nextSeq() });
      return ok(undefined);
    });
  }

  async signature(attackerId: string, targetId: string): Promise<Result<CombatResult>> {
    return this.queue.run(async () => {
      if (!this.state?.isActive || !this.battleRng) return err('no-battle');
      const a = this.getUnit(attackerId), t = this.getUnit(targetId);
      if (!a || !t) return err('unit-missing');
      const base = this.dmgBase(a, t);
      base.damage = Math.floor(base.damage * 1.25);
      return this.applyDamageAndLog(attackerId, targetId, 'signature', base);
    });
  }
}
