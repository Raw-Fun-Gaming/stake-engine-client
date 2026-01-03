# Stake Engine Client

[![npm version](https://img.shields.io/npm/v/stake-engine-client.svg?style=flat-square)](https://www.npmjs.com/package/stake-engine-client)
[![npm downloads](https://img.shields.io/npm/dm/stake-engine-client.svg?style=flat-square)](https://www.npmjs.com/package/stake-engine-client)
[![CI](https://img.shields.io/github/actions/workflow/status/raw-fun-gaming/stake-engine-client/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/raw-fun-gaming/stake-engine-client/actions/workflows/ci.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/raw-fun-gaming/stake-engine-client/security.yml?branch=main&style=flat-square&label=Security)](https://github.com/raw-fun-gaming/stake-engine-client/actions/workflows/security.yml)
[![License](https://img.shields.io/npm/l/stake-engine-client.svg?style=flat-square)](https://github.com/raw-fun-gaming/stake-engine-client/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg?style=flat-square)](http://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/stake-engine-client?style=flat-square)](https://bundlephobia.com/package/stake-engine-client)
[![Tree Shaking](https://img.shields.io/badge/tree%20shaking-supported-brightgreen?style=flat-square)](https://webpack.js.org/guides/tree-shaking/)

> Lightweight TypeScript client extracted from [Stake Engine web-sdk](https://github.com/StakeEngine/web-sdk) for RGS (Remote Gaming Server) API communication. Contains only essential backend communication code without Svelte dependencies or slot game scripts.

**[Live Demo](https://raw-fun-gaming.github.io/stake-engine-client/)** | **[Getting Started Guide](https://github.com/raw-fun-gaming/stake-engine-client/wiki/Getting-Started)** | **[API Documentation](https://github.com/raw-fun-gaming/stake-engine-client/wiki)**

## Features

- 🚀 **Lightweight**: Only essential RGS communication code
- 📱 **Framework Agnostic**: Works with any JavaScript framework
- 🔒 **Type Safe**: Full TypeScript support with auto-generated types
- 🎯 **Simple API**: High-level methods for common operations
- 🔧 **Configurable**: Low-level access for custom implementations
- 💰 **Smart Conversion**: Automatic amount conversion between formats

## Installation

```bash
npm install stake-engine-client
```

## Quick Start

### Option 1: Using URL Parameters (Browser)

If your URL contains the required parameters (`?sessionID=player-123&rgs_url=api.stakeengine.com&lang=en&currency=USD`), you can call functions without options:

```typescript
import { authenticate, play } from 'stake-engine-client';

// Authenticate player (uses URL params automatically)
const auth = await authenticate();

console.log('Player balance:', auth.balance?.amount);
console.log('Available bet levels:', auth.config?.betLevels);

// Place a bet (only specify required bet details)
const bet = await play({
  amount: 1.00, // $1.00 (automatically converted)
  mode: 'base'
  // currency defaults to USD from URL param or 'USD'
});

console.log('Round ID:', bet.round?.roundID);
console.log('Payout multiplier:', bet.round?.payoutMultiplier);
```

### Option 2: Explicit Parameters

```typescript
import { authenticate, play } from 'stake-engine-client';

// Authenticate player
const auth = await authenticate({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com',
  language: 'en'
});

console.log('Player balance:', auth.balance?.amount);
console.log('Available bet levels:', auth.config?.betLevels);

// Place a bet
const bet = await play({
  sessionID: 'player-session-123',
  currency: 'USD',
  amount: 1.00, // $1.00 (automatically converted)
  mode: 'base',
  rgsUrl: 'api.stakeengine.com'
});

console.log('Round ID:', bet.round?.roundID);
console.log('Payout multiplier:', bet.round?.payoutMultiplier);
```

## API Reference

### Authentication

#### `authenticate(options?)`

Authenticate a player session with the RGS.

```typescript
// Uses URL parameters automatically
const auth = await authenticate();

// Or provide explicit options
const auth = await authenticate({
  sessionID?: string,    // From URL param 'sessionID' if not provided
  rgsUrl?: string,       // From URL param 'rgs_url' if not provided  
  language?: string      // From URL param 'lang' if not provided (defaults to 'en')
});
```

**URL Parameters:**
- `sessionID` - Player session ID
- `rgs_url` - RGS server URL
- `lang` - Language code (optional, defaults to 'en')
- `currency` - Currency code (optional, defaults to 'USD')

**Returns:** `AuthenticateResponse`
- `balance` - Player's current balance
- `config` - Game configuration including bet levels
- `round` - Active round information (if any)
- `status` - Operation status

### Betting

#### `play(options)`

Place a bet and start a new round.

```typescript
// Uses URL parameters for sessionID/rgsUrl/currency automatically
const bet = await play({
  amount: number,      // Required: Dollar amount (e.g., 1.00 for $1)
  mode: string,        // Required: Bet mode (e.g., 'base')
  currency?: string,   // From URL param 'currency' if not provided (defaults to 'USD')
  sessionID?: string,  // From URL param 'sessionID' if not provided
  rgsUrl?: string      // From URL param 'rgs_url' if not provided
});
```

**Returns:** `PlayResponse`
- `round` - Round details including payout and multiplier
- `balance` - Updated player balance
- `status` - Operation status

#### `endRound(options?)`

End the current betting round.

```typescript
// Uses URL parameters automatically
const result = await endRound();

// Or provide explicit options
const result = await endRound({
  sessionID?: string,  // From URL param 'sessionID' if not provided
  rgsUrl?: string      // From URL param 'rgs_url' if not provided
});
```

### Balance Management

#### `getBalance(options?)`

Get current player balance.

```typescript
// Uses URL parameters automatically
const balance = await getBalance();

// Or provide explicit options
const balance = await getBalance({
  sessionID?: string,  // From URL param 'sessionID' if not provided
  rgsUrl?: string      // From URL param 'rgs_url' if not provided
});
```

### Game Events

#### `endEvent(options)`

Track a game event for bet progress.

```typescript
const result = await endEvent({
  eventIndex: number,  // Required: Event index number
  sessionID?: string,  // From URL param 'sessionID' if not provided
  rgsUrl?: string      // From URL param 'rgs_url' if not provided
});
```

### Replay

#### `replay(options)`

Fetch historical bet data for replay/review purposes.

```typescript
const replay = await replay({
  game: string,        // Required: Game identifier
  version: string,     // Required: Game version
  mode: string,        // Required: Bet mode
  event: string,       // Required: Event identifier
  rgsUrl?: string      // From URL param 'rgs_url' if not provided
});
```

**Returns:** `ReplayResponse`
- `round` - Historical round details including game state
- `status` - Operation status

#### `isReplayMode()`

Check if the current session is in replay mode.

```typescript
if (isReplayMode()) {
  // Handle replay mode
}
```

#### `getReplayUrlParams()`

Get all replay-related URL parameters.

```typescript
const params = getReplayUrlParams();
// Returns: { replay, amount, game, version, mode, event }
```

**URL Parameters for Replay:**
- `replay` - Set to 'true' to enable replay mode
- `amount` - Original bet amount
- `game` - Game identifier
- `version` - Game version
- `mode` - Bet mode
- `event` - Event identifier

### Testing & Debugging

#### `forceResult(options)`

Search for specific game results (useful for testing).

```typescript
const results = await forceResult({
  mode: string,        // Required: Search mode
  search: {            // Required: Search criteria
    bookID?: number,
    kind?: number,
    symbol?: string,
    hasWild?: boolean,
    wildMult?: number,
    gameType?: string
  },
  rgsUrl?: string      // From URL param 'rgs_url' if not provided
});
```

## Advanced Usage

### Custom Client Instance

```typescript
import { StakeEngineClient } from 'stake-engine-client';

const client = new StakeEngineClient();

// Make custom API calls with full type safety
const response = await client.post({
  url: '/wallet/authenticate',
  rgsUrl: 'api.stakeengine.com',
  variables: {
    sessionID: 'player-123',
    language: 'en'
  }
});
```

### Low-level HTTP Client

```typescript
import { fetcher } from 'stake-engine-client';

const response = await fetcher({
  method: 'POST',
  endpoint: 'https://api.stakeengine.com/wallet/play',
  variables: { sessionID: 'abc123', amount: 1000000 }
});

const data = await response.json();
```

### Amount Conversion

The client automatically handles amount conversion between different formats:

```typescript
import { API_AMOUNT_MULTIPLIER, BOOK_AMOUNT_MULTIPLIER } from 'stake-engine-client';

// API format: 1,000,000 = $1.00
const apiAmount = 1.00 * API_AMOUNT_MULTIPLIER; // 1000000

// Book format: 100 = $1.00  
const bookAmount = 1.00 * BOOK_AMOUNT_MULTIPLIER; // 100
```

## Type Definitions

The package includes comprehensive TypeScript definitions:

```typescript
import type {
  StatusCode,
  BalanceObject,
  RoundDetailObject,
  ConfigObject,
  AuthenticateResponse,
  PlayResponse,
  ReplayResponse,
  BetType,
  BaseBetType
} from 'stake-engine-client';
```

### Status Codes

The RGS API returns standard status codes:

- `SUCCESS` - Operation completed successfully
- `ERR_IPB` - Insufficient player balance
- `ERR_IS` - Invalid session token/timeout
- `ERR_ATE` - Authentication failed/expired
- `ERR_GLE` - Gambling limits exceeded
- `ERR_BNF` - Bet not found
- `ERR_UE` - Unknown server error
- And more...

### Bet Types

For game-specific betting logic:

```typescript
interface MyGameEvent {
  symbol: string;
  multiplier: number;
  position: [number, number];
}

type MyGameBet = BetType<MyGameEvent>;

// Use in your game logic
const processBet = (bet: MyGameBet) => {
  bet.state.forEach(event => {
    console.log(`Symbol ${event.symbol} at ${event.position}`);
  });
};
```

## Error Handling

All methods return responses with status information:

```typescript
const bet = await play({
  sessionID: 'player-123',
  currency: 'USD',
  amount: 1.00,
  mode: 'base',
  rgsUrl: 'api.stakeengine.com'
});

if (bet.status?.statusCode === 'SUCCESS') {
  // Handle successful bet
  console.log('Bet placed successfully!');
} else if (bet.status?.statusCode === 'ERR_IPB') {
  // Handle insufficient balance
  console.log('Insufficient balance');
} else {
  // Handle other errors
  console.log('Error:', bet.status?.statusMessage);
}
```

## Package Extraction

This package was extracted from the official [Stake Engine web-sdk](https://github.com/StakeEngine/web-sdk) to provide:

✅ **Included:**
- RGS API client with full type safety
- Authentication and session management
- Betting and balance operations
- Game event tracking
- Amount conversion utilities
- TypeScript definitions

❌ **Removed:**
- Svelte framework dependencies
- Slot game specific scripts
- UI components and styling
- Audio/visual effects
- Game-specific logic

This makes the package much lighter and suitable for any JavaScript framework or backend usage.

## License

MIT

## Contributing

This package is extracted from Stake Engine web-sdk. For updates to the core functionality, please refer to the [original repository](https://github.com/StakeEngine/web-sdk).

For issues specific to this extraction or TypeScript definitions, please file issues in this repository.