import { GameStateMachine } from './state/GameStateMachine';
import { RngStreams, RngLike } from '../util/RngStreams';
import {
  MapManager,
  BattleManager,
  UnitManager,
  EconomyManager,
  RouteManager,
  SaveManager,
} from './Managers';
import { GameState } from './state/GameState';

export class GameController {
  private readonly fsm: GameStateMachine;
  private readonly rngStreams: RngStreams;

  constructor(
    private readonly rng: RngLike,
    private readonly map: MapManager,
    private readonly battle: BattleManager,
    private readonly unit: UnitManager,
    private readonly economy: EconomyManager,
    private readonly route: RouteManager,
    private readonly save: SaveManager
  ) {
    this.fsm = new GameStateMachine();
    this.rngStreams = new RngStreams(rng);

    // Inject subsystem streams up-front
    this.route.setRng?.(this.rngStreams.get('route'));
    this.battle.setRng?.(this.rngStreams.get('battle'));
    this.economy.setRng?.(this.rngStreams.get('economy'));
    this.map.setRng?.(this.rngStreams.get('map'));
    this.unit.setRng?.(this.rngStreams.get('unit'));
    this.save.setRng?.(this.rngStreams.get('save'));
  }

  getState(): GameState {
    return this.fsm.getState();
  }

  async startRun(): Promise<void> {
    const t1 = this.fsm.transitionTo('route_selection');
    if (!t1.ok) throw new Error(t1.error);

    await this.route.startRun?.();
  }

  async selectRouteNode(nodeId: string): Promise<void> {
    if (!this.fsm.transitionTo('battle_preparation').ok) return;

    await this.battle.prepareBattle(nodeId);

    if (!this.fsm.transitionTo('battle_active').ok) return;
  }

  async completeBattle(outcome: { victory: boolean }): Promise<void> {
    if (!this.fsm.transitionTo('battle_resolution').ok) return;

    await this.economy.generateRewards(outcome);

    this.fsm.transitionTo('economy_rewards');
  }

  async selectReward(rewardId: string): Promise<void> {
    await this.economy.applyReward(rewardId);

    const runOver = this.route.isComplete?.() || this.unit.isPlayerDead?.();
    this.fsm.transitionTo(runOver ? 'run_complete' : 'route_selection');
  }
}
