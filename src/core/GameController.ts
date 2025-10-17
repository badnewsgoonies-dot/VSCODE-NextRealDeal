import { GameStateMachine } from './state/GameStateMachine.js';
import { RngStreams } from '../util/RngStreams.js';
import type { Logger } from '../util/Logger.js';
import { ok, err, type Result } from '../util/Result.js';
import { RouteManager } from '../route/RouteManager.js';
import { BattleManager } from '../battle/BattleManager.js';

export class GameController {
  private readonly fsm = new GameStateMachine();

  constructor(
    private readonly logger: Logger,
    private readonly streams: RngStreams,
    private readonly route: RouteManager,
    private readonly battle: BattleManager
  ) {}

  getState() { return this.fsm.getState(); }

  async startRun(runId: string): Promise<Result<void>> {
    const t = this.fsm.transitionTo('route_selection');
    if (!t.ok) return t;

    const r = await this.route.startRun(runId);
    if (!r.ok) return r;

    return ok(undefined);
  }

  /** Pick a route node → prepare & enter battle */
  async selectRoute(nodeId: string): Promise<Result<void>> {
    if (this.fsm.getState() !== 'route_selection') return err('not-in-route-selection');

    const t1 = this.fsm.transitionTo('battle_preparation');
    if (!t1.ok) return t1;

    // Example encounter: one player vs one enemy (deterministic seeds via streams)
    const step = this.route.current()?.step ?? 0;
    const brng = this.streams.get('battle').fork(`enc:${step}`);
    const player = { id: 'player', team: 'player' as const, hp: 100, maxHp: 100, atk: 20, def: 10, speed: 50 };
    const enemy  = { id: `e${step}`, team: 'enemy'  as const, hp: 80,  maxHp: 80,  atk: 15, def: 8,  speed: 40 + (brng.int(0, 1) ? 0 : 1) };

    // Advance the route first (so state always matches battle)
    const picked = await this.route.choose(nodeId);
    if (!picked.ok) return picked;

    const started = await this.battle.startBattle([player, enemy], `step-${step}`);
    if (!started.ok) return started;

    const t2 = this.fsm.transitionTo('battle_active');
    if (!t2.ok) return t2;

    return ok(undefined);
  }

  /** Complete a battle → move to rewards → either loop or finish the run */
  async completeBattle(): Promise<Result<void>> {
    if (this.fsm.getState() !== 'battle_active') return err('not-in-battle');

    const t1 = this.fsm.transitionTo('battle_resolution');
    if (!t1.ok) return t1;

    // (Economy would go here; we only switch states for now)
    const t2 = this.fsm.transitionTo('economy_rewards');
    if (!t2.ok) return t2;

    const done = this.route.current()?.complete === true;
    const next = this.fsm.transitionTo(done ? 'run_complete' : 'route_selection');
    if (!next.ok) return next;

    return ok(undefined);
  }
}
