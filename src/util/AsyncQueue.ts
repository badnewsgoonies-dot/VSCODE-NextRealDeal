export class AsyncQueue {
  private tail: Promise<void> = Promise.resolve();
  private _pending = 0;
  get pending() { return this._pending; }

  run<T>(fn: () => Promise<T>, opts: { signal?: AbortSignal } = {}): Promise<T> {
    const { signal } = opts;
    const interrupted = () => signal?.aborted ? Object.assign(new Error('aborted'), { name: 'AbortError' }) : null;

    const p = this.tail.then(async () => {
      const err = interrupted(); if (err) throw err;
      this._pending++;
      try { return await fn(); }
      finally { this._pending--; }
    });

    this.tail = p.then(() => undefined, () => undefined);
    return p;
  }
}
