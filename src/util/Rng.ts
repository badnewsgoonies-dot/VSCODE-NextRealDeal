/**
 * A deterministic pseudo-random number generator using a simple LCG algorithm.
 * This implementation supports forking to create independent streams.
 */
export interface RngLike {
  int(min: number, max: number): number;
  float(): number;
  fork(label: string): RngLike;
}

class Rng implements RngLike {
  private state: number;

  constructor(seed: number) {
    // Ensure seed is a valid 32-bit integer
    this.state = (seed >>> 0) || 1;
  }

  /**
   * Generate a random integer between min (inclusive) and max (inclusive)
   */
  int(min: number, max: number): number {
    if (min > max) {
      throw new Error(`min (${min}) must be <= max (${max})`);
    }
    const range = max - min + 1;
    return min + (this.next() % range);
  }

  /**
   * Generate a random float between 0 (inclusive) and 1 (exclusive)
   */
  float(): number {
    return this.next() / 0x100000000;
  }

  /**
   * Fork this RNG to create an independent stream with a derived seed.
   * Does not advance parent state to ensure determinism when creating
   * multiple RngStreams with the same seed.
   */
  fork(label: string): RngLike {
    // Create a hash from the label
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = ((hash << 5) - hash + label.charCodeAt(i)) | 0;
    }
    
    // Combine current state with label hash to create new seed
    const newSeed = (this.state ^ hash) >>> 0;
    
    return new Rng(newSeed);
  }

  /**
   * Generate the next random number using Linear Congruential Generator
   * Using parameters from Numerical Recipes
   */
  private next(): number {
    // LCG: state = (a * state + c) mod m
    // a = 1664525, c = 1013904223, m = 2^32
    this.state = ((1664525 * this.state + 1013904223) >>> 0);
    return this.state;
  }
}

/**
 * Create a new deterministic RNG with the given seed
 */
export function makeRng(seed: number): RngLike {
  return new Rng(seed);
}
