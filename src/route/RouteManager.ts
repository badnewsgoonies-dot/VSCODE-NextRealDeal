import { AsyncQueue } from '../util/AsyncQueue.js';
import { makeLogger, type Logger } from '../util/Logger.js';
import type { Rng } from '../util/Rng.js';
import { ok, err, type Result } from '../util/Result.js';
import type { RouteChoice, RouteState } from '../types/route.js';

export class RouteManager {
  private readonly log: Logger;
  private readonly queue = new AsyncQueue();
  private readonly rootRng: Rng;
  private runRng?: Rng;
  private state?: RouteState;
  private choices: RouteChoice[] = [];

  constructor(logger: Logger, rng: Rng) {
    this.log = logger ?? makeLogger();
    this.rootRng = rng;
  }

  async initialize(): Promise<void> { /* no-op */ }
  async destroy(): Promise<void> { /* no-op */ }

  async startRun(runId: string): Promise<Result<void>> {
    return this.queue.run(async () => {
      this.runRng = this.rootRng.fork(`run:${runId}`);
      this.state = { runId, step: 0, complete: false };
      this.choices = this.genChoices(0);
      return ok(undefined);
    });
  }

  current(): RouteState | undefined { return this.state; }

  async getChoices(): Promise<Result<RouteChoice[]>> {
    return this.queue.run(async () => this.state ? ok(this.choices) : err('no-run'));
  }

  async choose(id: string): Promise<Result<void>> {
    return this.queue.run(async () => {
      if (!this.state || !this.runRng) return err('no-run');
      if (!this.choices.some(c => c.id === id)) return err('bad-choice');
      const nextStep = this.state.step + 1;
      this.state = { ...this.state, step: nextStep };
      // naive end condition: 6 steps then complete
      if (nextStep >= 6) { this.state = { ...this.state, complete: true }; this.choices = []; return ok(undefined); }
      this.choices = this.genChoices(nextStep);
      return ok(undefined);
    });
  }

  private genChoices(step: number): RouteChoice[] {
    const r = (this.runRng ?? this.rootRng).fork(`step:${step}`);
    return (['A','B','C'] as const).map((label, i) => ({
      id: `node-${step}-${i}`,
      label,
      arenaSeed: r.int(1, 2 ** 31 - 1),
    }));
  }
}
