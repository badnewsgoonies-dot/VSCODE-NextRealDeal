// Minimal interface compatible with makeRng().fork('key') style.
export interface RngLike {
  int(min: number, max: number): number;
  float(): number;
  fork(label: string): RngLike;
}

type KnownStream =
  | 'route'
  | 'battle'
  | 'economy'
  | 'map'
  | 'unit'
  | 'save'
  | 'events'
  | 'loot';

const DEFAULT_STREAMS: KnownStream[] = [
  'route', 'battle', 'economy', 'map', 'unit', 'save', 'events', 'loot',
];

export class RngStreams {
  private readonly streams = new Map<string, RngLike>();

  constructor(root: RngLike, labels: readonly string[] = DEFAULT_STREAMS) {
    for (const label of labels) {
      // Fork once so sub-systems can't contaminate each other.
      this.streams.set(label, root.fork(label));
    }
  }

  get<T extends string = KnownStream>(label: T): RngLike {
    const s = this.streams.get(label);
    if (!s) throw new Error(`RNG stream '${label}' not initialized`);
    return s;
  }

  // Optional: sanity check used in tests
  sampleDistinct(n = 3): boolean {
    const samples: number[][] = [];
    for (const s of this.streams.values()) {
      const arr = Array.from({ length: n }, () => s.int(0, 1e9));
      samples.push(arr);
    }
    // crude distinctness heuristic
    const asKey = (a: number[]) => a.join(',');
    const keys = new Set(samples.map(asKey));
    return keys.size === samples.length;
  }
}
