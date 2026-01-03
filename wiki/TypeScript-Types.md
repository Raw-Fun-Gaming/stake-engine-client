# TypeScript Types

The Stake Engine Client provides complete TypeScript type definitions auto-generated from the OpenAPI schema. All types are exported for use in your own code.

## Overview

All API requests and responses are fully typed, giving you:
- **IntelliSense** - Autocomplete in your IDE
- **Type Safety** - Catch errors at compile time
- **Documentation** - Inline type hints

The types are defined in [src/types.ts](https://github.com/raw-fun-gaming/stake-engine-client/blob/main/src/types.ts) and exported from the main package.

## Importing Types

```typescript
import type {
  components,
  paths,
  operations
} from 'stake-engine-client';
```

## Type Structure

### `components`

Contains all schema definitions for request/response bodies:

```typescript
import type { components } from 'stake-engine-client';

type AuthResponse = components['schemas']['res_authenticate'];
type BetResponse = components['schemas']['res_play'];
type Balance = components['schemas']['Balance'];
type Status = components['schemas']['Status'];
```

### `paths`

Maps API endpoints to their operation types:

```typescript
import type { paths } from 'stake-engine-client';

type AuthenticateEndpoint = paths['/wallet/authenticate'];
type PlayEndpoint = paths['/wallet/play'];
```

### `operations`

Type definitions for each API operation:

```typescript
import type { operations } from 'stake-engine-client';

type AuthenticateOp = operations['authenticate'];
type PlayOp = operations['play'];
type BalanceOp = operations['balance'];
```

## Common Type Examples

### Response Types

```typescript
import type { components } from 'stake-engine-client';

// Authentication response
type AuthResponse = components['schemas']['res_authenticate'];
// Contains: balance, config, status, etc.

// Bet/play response
type BetResponse = components['schemas']['res_play'];
// Contains: round, balance, status, bet, etc.

// Balance response
type BalanceResponse = components['schemas']['res_Balance'];

// End round response
type EndRoundResponse = components['schemas']['res_end_round'];

// Replay response
type ReplayResponse = components['schemas']['res_replay'];
```

### Request Types

```typescript
import type { components } from 'stake-engine-client';

// Authenticate request
type AuthRequest = components['schemas']['req_authenticate'];

// Bet request
type BetRequest = components['schemas']['req_play'];

// Search request
type SearchRequest = components['schemas']['req_search'];
```

### Common Data Types

```typescript
import type { components } from 'stake-engine-client';

// Player balance
type Balance = components['schemas']['Balance'];
// Properties: amount, currency

// API status
type Status = components['schemas']['Status'];
// Properties: statusCode, statusMessage

// Round information
type Round = components['schemas']['Round'];
// Properties: roundID, state, payoutMultiplier, etc.

// Game configuration
type Config = components['schemas']['Config'];
// Properties: betLevels, modes, etc.
```

## Using Types in Your Code

### Typing Function Parameters

```typescript
import type { components } from 'stake-engine-client';

function handleBetResponse(response: components['schemas']['res_play']) {
  if (response.status?.statusCode === 'SUCCESS') {
    console.log('Round ID:', response.round?.roundID);
    console.log('Payout:', response.round?.payoutMultiplier);
  }
}
```

### Typing State

```typescript
import { useState } from 'react';
import type { components } from 'stake-engine-client';

function GameComponent() {
  const [balance, setBalance] = useState<components['schemas']['Balance'] | null>(null);
  const [round, setRound] = useState<components['schemas']['Round'] | null>(null);

  // ...
}
```

### Creating Custom Types

```typescript
import type { components } from 'stake-engine-client';

// Extract specific properties
type RoundInfo = {
  roundID: string;
  payout: number;
  state: components['schemas']['Round']['state'];
};

// Extend existing types
interface GameState extends components['schemas']['res_play'] {
  localState: {
    isAnimating: boolean;
    selectedBet: number;
  };
}
```

## Generic Type Utilities

### `BetType<T>`

Generic type for game-specific betting logic:

```typescript
import type { components } from 'stake-engine-client';

// Define your game-specific bet data
interface MyGameBet {
  selectedLines: number[];
  multiplier: number;
}

type MyGameBetResponse = components['schemas']['res_play'] & {
  bet: MyGameBet;
};
```

## Status Codes

The `Status` type includes all possible status codes:

```typescript
import type { components } from 'stake-engine-client';

type StatusCode = components['schemas']['Status']['statusCode'];

// Common values:
// - 'SUCCESS'
// - 'ERR_IPB' (Insufficient Player Balance)
// - 'ERR_IS' (Invalid Session)
// - 'ERR_IB' (Invalid Bet)
// - 'ERR_PAB' (Player Already has Bet)
```

Usage:
```typescript
import { play } from 'stake-engine-client';
import type { components } from 'stake-engine-client';

const response = await play({ amount: 1.00, mode: 'base' });

switch (response.status?.statusCode) {
  case 'SUCCESS':
    console.log('Bet placed successfully');
    break;
  case 'ERR_IPB':
    console.log('Insufficient balance');
    break;
  case 'ERR_PAB':
    console.log('Player already has an active bet');
    break;
  default:
    console.log('Error:', response.status?.statusMessage);
}
```

## Type Narrowing

Use TypeScript's type narrowing for safer code:

```typescript
import { play } from 'stake-engine-client';

const response = await play({ amount: 1.00, mode: 'base' });

// Check for success
if (response.status?.statusCode === 'SUCCESS') {
  // TypeScript knows round should exist here
  console.log('Round ID:', response.round?.roundID);
}

// Check for specific fields
if (response.balance && response.balance.amount !== undefined) {
  const balance: number = response.balance.amount;
  console.log('Balance:', balance / 1000000);  // Convert to dollars
}
```

## Full Type Reference

All types are defined in [src/types.ts](https://github.com/raw-fun-gaming/stake-engine-client/blob/main/src/types.ts). The file is ~474 lines and includes:

- **8 API endpoints** with full request/response types
- **50+ schema definitions** for all data structures
- **Type helpers** for union types and generics
- **OpenAPI-compliant** types matching the RGS API spec

To explore all available types, check your IDE's autocomplete or view the source file directly.

## Best Practices

1. **Always import types with `type` keyword**
   ```typescript
   import type { components } from 'stake-engine-client';  // ✅ Good
   import { components } from 'stake-engine-client';       // ❌ Bad (runtime import)
   ```

2. **Use optional chaining** for nested properties
   ```typescript
   console.log(response.balance?.amount);  // ✅ Safe
   console.log(response.balance.amount);   // ❌ Can throw if undefined
   ```

3. **Check status codes** before accessing data
   ```typescript
   if (response.status?.statusCode === 'SUCCESS') {
     // Safe to access round data here
   }
   ```

4. **Type your state** early in development
   ```typescript
   const [data, setData] = useState<components['schemas']['res_play'] | null>(null);
   ```

## Related Pages

- [StakeEngineClient Class](StakeEngineClient-Class) - Using types with the client
- [Error Handling](Error-Handling) - Working with status types
- [Status Codes](Status-Codes) - Complete status code reference
