# VSCODE-NextRealDeal

A deterministic, roguelike game engine with explicit state machine and centralized RNG stream management.

## Features

- **Deterministic RNG**: Reproducible random number generation using fork-able streams
- **Explicit State Machine**: Type-safe game state transitions with validation
- **Result Types**: No-throw error handling using Result pattern
- **Stream Isolation**: Independent RNG streams per subsystem prevent cross-contamination
- **Full Test Coverage**: Comprehensive tests using Vitest and fast-check

## Installation

```bash
npm install
```

## Usage

### Basic Setup

```typescript
import { makeRng } from './src/util/Rng';
import { GameController } from './src/core/GameController';
import {
  MapManager,
  BattleManager,
  UnitManager,
  EconomyManager,
  RouteManager,
  SaveManager,
} from './src/core/Managers';

// Create deterministic RNG with a seed
const rng = makeRng(12345);

// Initialize game controller with all managers
const game = new GameController(
  rng,
  new MapManager(),
  new BattleManager(),
  new UnitManager(),
  new EconomyManager(),
  new RouteManager(),
  new SaveManager()
);

// Start a run
await game.startRun();
console.log(game.getState()); // 'route_selection'

// Progress through the game
await game.selectRouteNode('node-1');
await game.completeBattle({ victory: true });
await game.selectReward('reward-1');
```

### Deterministic RNG with Forking

```typescript
import { makeRng } from './src/util/Rng';

const root = makeRng(42);

// Fork creates independent streams
const battleRng = root.fork('battle');
const economyRng = root.fork('economy');

// Each stream produces independent, reproducible sequences
const damage = battleRng.int(10, 20);
const gold = economyRng.int(50, 100);

// Same seed + same fork label = same sequence
const root2 = makeRng(42);
const battleRng2 = root2.fork('battle');
console.log(battleRng2.int(10, 20) === damage); // true
```

### RNG Stream Manager

```typescript
import { RngStreams } from './src/util/RngStreams';
import { makeRng } from './src/util/Rng';

const root = makeRng(12345);
const streams = new RngStreams(root);

// Access named streams
const routeRng = streams.get('route');
const battleRng = streams.get('battle');
const economyRng = streams.get('economy');

// Each stream is independent and deterministic
routeRng.int(0, 100);
battleRng.int(0, 100);
```

### State Machine

```typescript
import { GameStateMachine } from './src/core/state/GameStateMachine';

const fsm = new GameStateMachine();

// Check current state
console.log(fsm.getState()); // 'idle'

// Transition to new state
const result = fsm.transitionTo('route_selection');
if (result.ok) {
  console.log('Transition successful');
} else {
  console.error(result.error);
}

// Check if transition is valid without executing it
if (fsm.canTransitionTo('battle_preparation')) {
  fsm.transitionTo('battle_preparation');
}

// View state history
console.log(fsm.getHistory()); // ['idle']
```

## Architecture

### State Transitions

The game follows a strict state machine with these transitions:

```
idle → route_selection
route_selection → battle_preparation | run_complete
battle_preparation → battle_active
battle_active → battle_resolution
battle_resolution → economy_rewards
economy_rewards → route_selection | run_complete
run_complete → idle
error → idle
```

### RNG Streams

The following independent RNG streams are available:

- `route` - Route/map generation
- `battle` - Combat calculations
- `economy` - Rewards and loot
- `map` - Map layout
- `unit` - Unit stats and abilities
- `save` - Save file management
- `events` - Random events
- `loot` - Item drops

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Building

```bash
# Type check
npm run type-check

# Build TypeScript
npm run build
```

## Design Principles

1. **Determinism**: All randomness is deterministic and reproducible with the same seed
2. **No Throws**: Use Result types instead of exceptions for error handling
3. **Explicit State**: All state transitions are validated and tracked
4. **Stream Isolation**: Each subsystem has its own RNG stream to prevent contamination
5. **Dependency Injection**: All dependencies are injected at construction time
