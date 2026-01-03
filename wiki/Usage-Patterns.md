# Usage Patterns

Common usage patterns and real-world examples for the Stake Engine Client.

## Basic Game Flow

Complete game session from authentication to bet completion:

```typescript
import {
  requestAuthenticate,
  requestBet,
  requestEndRound,
  requestBalance
} from 'stake-engine-client';

// 1. Authenticate player when game loads
const auth = await requestAuthenticate();
console.log('Initial balance:', auth.balance?.amount);
console.log('Available bet levels:', auth.config?.betLevels);

// 2. Place a bet
const bet = await requestBet({
  amount: 1.00,  // $1.00
  mode: 'base'
});

if (bet.status?.statusCode === 'SUCCESS') {
  console.log('Round ID:', bet.round?.roundID);
  console.log('Payout multiplier:', bet.round?.payoutMultiplier);

  // Show game animation, spin reels, etc.
  await animateGameplay(bet.round);

  // 3. End the round
  const endResult = await requestEndRound();
  console.log('Final balance:', endResult.balance?.amount);
} else {
  console.error('Bet failed:', bet.status?.statusMessage);
}
```

## Error Handling Pattern

Robust error handling for API calls:

```typescript
import { requestBet } from 'stake-engine-client';

async function placeBet(amount: number, mode: string) {
  try {
    const response = await requestBet({ amount, mode });

    switch (response.status?.statusCode) {
      case 'SUCCESS':
        return { success: true, data: response };

      case 'ERR_IPB':
        // Insufficient balance
        showError('Insufficient balance. Please add funds.');
        return { success: false, error: 'insufficient_balance' };

      case 'ERR_PAB':
        // Player already has active bet
        showError('Please finish your current round first.');
        return { success: false, error: 'active_bet' };

      case 'ERR_IS':
        // Invalid session
        showError('Session expired. Please reload the game.');
        return { success: false, error: 'invalid_session' };

      default:
        showError(response.status?.statusMessage || 'Unknown error');
        return { success: false, error: 'unknown' };
    }
  } catch (error) {
    console.error('Network error:', error);
    showError('Network error. Please check your connection.');
    return { success: false, error: 'network' };
  }
}
```

## React Integration

Using the client in a React application:

```typescript
import { useState, useEffect } from 'react';
import { requestAuthenticate, requestBet, requestBalance } from 'stake-engine-client';
import type { components } from 'stake-engine-client';

function GameComponent() {
  const [balance, setBalance] = useState<components['schemas']['Balance'] | null>(null);
  const [round, setRound] = useState<components['schemas']['Round'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate on mount
  useEffect(() => {
    async function authenticate() {
      const auth = await requestAuthenticate();
      setBalance(auth.balance || null);
    }
    authenticate();
  }, []);

  async function handlePlaceBet(amount: number) {
    setIsLoading(true);
    try {
      const response = await requestBet({ amount, mode: 'base' });

      if (response.status?.statusCode === 'SUCCESS') {
        setRound(response.round || null);
        setBalance(response.balance || null);
      } else {
        alert(response.status?.statusMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshBalance() {
    const response = await requestBalance();
    setBalance(response.balance || null);
  }

  return (
    <div>
      <div>Balance: ${(balance?.amount || 0) / 1000000}</div>
      <button onClick={() => handlePlaceBet(1.00)} disabled={isLoading}>
        Bet $1.00
      </button>
      <button onClick={refreshBalance}>Refresh Balance</button>
      {round && <div>Round ID: {round.roundID}</div>}
    </div>
  );
}
```

## Multi-Step Betting (Events)

Games with multiple events per round:

```typescript
import { requestBet, requestEndEvent, requestEndRound } from 'stake-engine-client';

async function playMultiStepGame() {
  // 1. Initial bet
  const bet = await requestBet({ amount: 1.00, mode: 'base' });
  console.log('Initial state:', bet.round?.state);

  // 2. Player makes a choice, trigger event 1
  await requestEndEvent({ eventIndex: 1 });
  console.log('After event 1');

  // 3. Player makes another choice, trigger event 2
  await requestEndEvent({ eventIndex: 2 });
  console.log('After event 2');

  // 4. End the round
  const result = await requestEndRound();
  console.log('Final payout:', result.balance?.amount);
}
```

## Testing with Force Result

Use `requestForceResult` to find specific outcomes for testing:

```typescript
import { requestForceResult, requestBet } from 'stake-engine-client';

async function testBonusFeature() {
  // 1. Search for a round with bonus symbols
  const search = await requestForceResult({
    mode: 'base',
    search: {
      symbol: 'BONUS',
      kind: 3  // 3-of-a-kind
    }
  });

  console.log('Found rounds:', search.results?.length);

  if (search.results && search.results.length > 0) {
    // 2. Place bet (RGS will use the forced result)
    const bet = await requestBet({
      amount: 1.00,
      mode: 'base'
    });

    console.log('Testing round:', bet.round?.state);
    // This round will have the BONUS symbols
  }
}
```

## Replay Historical Bets

Fetch and replay previous bet data:

```typescript
import { requestReplay, isReplayMode, getReplayUrlParams } from 'stake-engine-client';

// Check if in replay mode
if (isReplayMode()) {
  const params = getReplayUrlParams();

  // Load replay data
  const replay = await requestReplay({
    game: params.game,
    version: params.version,
    mode: params.mode,
    event: params.event
  });

  console.log('Replaying round:', replay.round?.roundID);
  console.log('Original bet amount:', replay.bet?.amount);

  // Display the historical data
  showReplayUI(replay);
} else {
  // Normal game mode
  showNormalUI();
}
```

## Balance Display

Convert API amounts to human-readable format:

```typescript
import { requestBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

async function displayBalance() {
  const response = await requestBalance();
  const amount = response.balance?.amount || 0;
  const currency = response.balance?.currency || 'USD';

  // Convert from API format (1000000 = $1.00) to dollars
  const dollars = amount / API_AMOUNT_MULTIPLIER;

  console.log(`${currency} ${dollars.toFixed(2)}`);
  // Output: "USD 10.50"
}
```

## Node.js Server Integration

Using the client in a Node.js backend:

```typescript
import { requestAuthenticate, requestBet } from 'stake-engine-client';

// Must provide explicit configuration (no URL params in Node.js)
const config = {
  sessionID: process.env.SESSION_ID || '',
  rgsUrl: process.env.RGS_URL || '',
  language: 'en'
};

async function serverSideBet(amount: number, mode: string) {
  // Authenticate
  const auth = await requestAuthenticate(config);
  console.log('Player balance:', auth.balance?.amount);

  // Place bet with explicit config
  const bet = await requestBet({
    ...config,
    currency: 'USD',
    amount,
    mode
  });

  return bet;
}
```

## Custom Client Wrapper

Building a game-specific wrapper:

```typescript
import {
  requestAuthenticate,
  requestBet,
  requestEndRound,
  requestBalance
} from 'stake-engine-client';
import type { components } from 'stake-engine-client';

class MyGameClient {
  private authenticated = false;
  private balance: number = 0;

  async init() {
    const auth = await requestAuthenticate();
    this.authenticated = true;
    this.balance = auth.balance?.amount || 0;
    return auth;
  }

  async bet(dollars: number, mode: string) {
    if (!this.authenticated) {
      throw new Error('Must authenticate first');
    }

    const response = await requestBet({ amount: dollars, mode });

    if (response.status?.statusCode !== 'SUCCESS') {
      throw new Error(response.status?.statusMessage || 'Bet failed');
    }

    this.balance = response.balance?.amount || this.balance;
    return response;
  }

  async endRound() {
    const response = await requestEndRound();
    this.balance = response.balance?.amount || this.balance;
    return response;
  }

  getBalance() {
    return this.balance / 1000000;  // Convert to dollars
  }
}

// Usage
const game = new MyGameClient();
await game.init();
console.log('Balance:', game.getBalance());

const bet = await game.bet(1.00, 'base');
await game.endRound();
```

## Periodic Balance Checks

Check balance periodically (e.g., if external transactions can occur):

```typescript
import { requestBalance } from 'stake-engine-client';

let balanceCheckInterval: NodeJS.Timeout;

function startBalanceMonitoring(onBalanceChange: (amount: number) => void) {
  let lastBalance = 0;

  balanceCheckInterval = setInterval(async () => {
    const response = await requestBalance();
    const currentBalance = response.balance?.amount || 0;

    if (currentBalance !== lastBalance) {
      lastBalance = currentBalance;
      onBalanceChange(currentBalance);
    }
  }, 5000);  // Check every 5 seconds
}

function stopBalanceMonitoring() {
  clearInterval(balanceCheckInterval);
}

// Usage
startBalanceMonitoring((amount) => {
  console.log('Balance changed:', amount / 1000000);
});
```

## Related Pages

- [Package Integration](Package-Integration) - Installation and setup
- [Error Handling](Error-Handling) - Handling errors and edge cases
- [TypeScript Types](TypeScript-Types) - Type definitions
- [Browser Integration](Browser-Integration) - Browser-specific patterns
- [Node.js Integration](Node-js-Integration) - Server-side patterns
