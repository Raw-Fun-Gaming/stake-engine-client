# Debug Guide

Comprehensive debugging strategies for the Stake Engine Client.

## Enable Logging

### Console Logging

Log all API calls and responses:

```typescript
import { requestBet, requestAuthenticate } from 'stake-engine-client';

// Wrapper function with logging
async function debugRequest<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  console.log(`[${name}] Starting...`);
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`[${name}] Success (${duration.toFixed(2)}ms)`, result);
    return result;
  } catch (error) {
    console.error(`[${name}] Failed:`, error);
    throw error;
  }
}

// Usage
const auth = await debugRequest(
  () => requestAuthenticate(),
  'Authenticate'
);

const bet = await debugRequest(
  () => requestBet({ amount: 1.00, mode: 'base' }),
  'Place Bet'
);
```

### Network Inspection

Use browser DevTools to inspect HTTP requests:

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Click on requests to see headers, body, and response

Look for:
- Request URL
- Request headers
- Request payload
- Response status
- Response body

## Debugging URL Parameters

Check if parameters are being read correctly:

```typescript
// Log URL parameters
const params = new URLSearchParams(window.location.search);
console.log('URL Parameters:', {
  sessionID: params.get('sessionID'),
  rgsUrl: params.get('rgs_url'),
  language: params.get('lang'),
  currency: params.get('currency'),
  replay: params.get('replay')
});

// Verify they're being used
import { requestAuthenticate } from 'stake-engine-client';

const auth = await requestAuthenticate();
console.log('Auth used:', {
  balance: auth.balance,
  config: auth.config
});
```

## Debugging Authentication

Verify authentication is working correctly:

```typescript
import { requestAuthenticate } from 'stake-engine-client';

try {
  console.log('Authenticating...');

  const auth = await requestAuthenticate({
    sessionID: 'your-session-id',
    rgsUrl: 'rgs.stake-engine.com',
    language: 'en'
  });

  console.log('Authentication successful:', {
    statusCode: auth.status?.statusCode,
    statusMessage: auth.status?.statusMessage,
    balance: auth.balance?.amount,
    currency: auth.balance?.currency,
    betLevels: auth.config?.betLevels
  });

  if (auth.status?.statusCode !== 'SUCCESS') {
    console.error('Authentication failed:', auth.status);
  }
} catch (error) {
  console.error('Authentication error:', error.message);
  console.error('Full error:', error);
}
```

## Debugging Bet Placement

Track bet lifecycle:

```typescript
import { requestBet, requestEndRound } from 'stake-engine-client';

async function debugBet(amount: number, mode: string) {
  console.group('Place Bet');
  console.log('Amount:', amount, 'Mode:', mode);

  try {
    // Place bet
    const betStart = performance.now();
    const bet = await requestBet({ amount, mode });
    console.log('Bet placed in', performance.now() - betStart, 'ms');

    console.log('Bet Response:', {
      status: bet.status?.statusCode,
      roundID: bet.round?.roundID,
      payout: bet.round?.payoutMultiplier,
      newBalance: bet.balance?.amount,
      state: bet.round?.state
    });

    if (bet.status?.statusCode !== 'SUCCESS') {
      console.error('Bet failed:', bet.status?.statusMessage);
      console.groupEnd();
      return;
    }

    // End round
    console.log('Ending round...');
    const endStart = performance.now();
    const end = await requestEndRound();
    console.log('Round ended in', performance.now() - endStart, 'ms');

    console.log('End Result:', {
      status: end.status?.statusCode,
      finalBalance: end.balance?.amount
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.groupEnd();
  }
}

// Usage
await debugBet(1.00, 'base');
```

## Debugging Amount Conversion

Verify amounts are converted correctly:

```typescript
import { API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

function debugAmount(dollars: number) {
  const apiAmount = dollars * API_AMOUNT_MULTIPLIER;
  const backToDollars = apiAmount / API_AMOUNT_MULTIPLIER;

  console.log('Amount Conversion:', {
    input: `$${dollars}`,
    apiFormat: apiAmount,
    converted: `$${backToDollars}`,
    match: dollars === backToDollars
  });
}

// Test
debugAmount(1.00);    // $1.00 -> 1000000 -> $1.00
debugAmount(10.50);   // $10.50 -> 10500000 -> $10.50
```

## Error Tracking

Track all errors systematically:

```typescript
interface ErrorLog {
  timestamp: Date;
  function: string;
  error: string;
  statusCode?: string;
  details?: any;
}

const errorLog: ErrorLog[] = [];

function logError(fn: string, error: any, details?: any) {
  const entry: ErrorLog = {
    timestamp: new Date(),
    function: fn,
    error: error.message || String(error),
    statusCode: error.status?.statusCode,
    details
  };

  errorLog.push(entry);
  console.error('[ERROR]', entry);
}

// Usage
import { requestBet } from 'stake-engine-client';

try {
  const bet = await requestBet({ amount: 1.00, mode: 'base' });

  if (bet.status?.statusCode !== 'SUCCESS') {
    logError('requestBet', bet.status, { amount: 1.00, mode: 'base' });
  }
} catch (error) {
  logError('requestBet', error, { amount: 1.00, mode: 'base' });
}

// View error log
console.table(errorLog);
```

## Performance Monitoring

Track API call performance:

```typescript
interface PerformanceMetric {
  function: string;
  duration: number;
  timestamp: Date;
  success: boolean;
}

const metrics: PerformanceMetric[] = [];

async function measurePerformance<T>(
  fn: () => Promise<T>,
  name: string
): Promise<T> {
  const start = performance.now();
  let success = false;

  try {
    const result = await fn();
    success = true;
    return result;
  } finally {
    const duration = performance.now() - start;
    metrics.push({
      function: name,
      duration,
      timestamp: new Date(),
      success
    });

    console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`);
  }
}

// Usage
import { requestBet, requestAuthenticate } from 'stake-engine-client';

await measurePerformance(
  () => requestAuthenticate(),
  'authenticate'
);

await measurePerformance(
  () => requestBet({ amount: 1.00, mode: 'base' }),
  'bet'
);

// Analyze
const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
console.log('Average API call duration:', avgDuration.toFixed(2), 'ms');
console.table(metrics);
```

## State Debugging

Track game state changes:

```typescript
import type { components } from 'stake-engine-client';

interface GameState {
  balance: number;
  roundID: string | null;
  isPlaying: boolean;
  lastUpdate: Date;
}

class GameStateDebugger {
  private history: GameState[] = [];

  logState(state: Partial<GameState>) {
    const fullState: GameState = {
      balance: state.balance ?? 0,
      roundID: state.roundID ?? null,
      isPlaying: state.isPlaying ?? false,
      lastUpdate: new Date()
    };

    this.history.push(fullState);
    console.log('[STATE]', fullState);
  }

  getHistory() {
    return this.history;
  }

  printHistory() {
    console.table(this.history);
  }
}

const stateDebugger = new GameStateDebugger();

// Usage
import { requestBet, requestEndRound } from 'stake-engine-client';

// After authentication
stateDebugger.logState({ balance: 10000000, isPlaying: false });

// After bet
const bet = await requestBet({ amount: 1.00, mode: 'base' });
stateDebugger.logState({
  balance: bet.balance?.amount ?? 0,
  roundID: bet.round?.roundID ?? null,
  isPlaying: true
});

// After end round
const end = await requestEndRound();
stateDebugger.logState({
  balance: end.balance?.amount ?? 0,
  isPlaying: false
});

// View history
stateDebugger.printHistory();
```

## Network Debugging

Test network conditions:

```typescript
// Simulate slow network
async function slowFetch(url: string, options: RequestInit) {
  const delay = 2000; // 2 second delay
  console.log(`[SLOW NETWORK] Adding ${delay}ms delay...`);

  await new Promise(resolve => setTimeout(resolve, delay));
  return fetch(url, options);
}

// Use with custom fetch
import { fetcher } from 'stake-engine-client';

const response = await fetcher({
  method: 'POST',
  endpoint: 'https://rgs.stake-engine.com/wallet/play',
  variables: { sessionID: 'abc' },
  fetch: slowFetch
});
```

## Replay Debugging

Debug replay functionality:

```typescript
import { isReplayMode, getReplayUrlParams, requestReplay } from 'stake-engine-client';

console.log('Is Replay Mode:', isReplayMode());

if (isReplayMode()) {
  const params = getReplayUrlParams();
  console.log('Replay Parameters:', params);

  try {
    const replay = await requestReplay({
      game: params.game,
      version: params.version,
      mode: params.mode,
      event: params.event
    });

    console.log('Replay Data:', {
      roundID: replay.round?.roundID,
      state: replay.round?.state,
      payout: replay.round?.payoutMultiplier,
      bet: replay.bet
    });
  } catch (error) {
    console.error('Replay failed:', error);
  }
}
```

## Browser Console Shortcuts

Add helper functions to window for quick debugging:

```typescript
import * as StakeEngine from 'stake-engine-client';

// Make available globally
(window as any).StakeEngine = StakeEngine;
(window as any).debugParams = () => {
  const params = new URLSearchParams(window.location.search);
  console.table({
    sessionID: params.get('sessionID'),
    rgsUrl: params.get('rgs_url'),
    lang: params.get('lang'),
    currency: params.get('currency')
  });
};
(window as any).debugBet = async (amount = 1.00, mode = 'base') => {
  const bet = await StakeEngine.requestBet({ amount, mode });
  console.log(bet);
  return bet;
};

console.log('Debug helpers loaded:');
console.log('- window.StakeEngine');
console.log('- window.debugParams()');
console.log('- window.debugBet(amount, mode)');
```

Usage in console:
```javascript
// Check URL params
debugParams()

// Quick bet test
await debugBet(1.00, 'base')

// Manual API call
await StakeEngine.requestBalance()
```

## Common Debug Checks

Quick checklist when debugging:

```typescript
function runDebugChecks() {
  console.group('Debug Checks');

  // 1. URL Parameters
  const params = new URLSearchParams(window.location.search);
  console.log('✓ sessionID:', params.get('sessionID') ? '✅' : '❌');
  console.log('✓ rgs_url:', params.get('rgs_url') ? '✅' : '❌');

  // 2. Network
  console.log('✓ Online:', navigator.onLine ? '✅' : '❌');

  // 3. Environment
  console.log('✓ Browser:', typeof window !== 'undefined' ? '✅' : '❌');
  console.log('✓ Fetch API:', typeof fetch !== 'undefined' ? '✅' : '❌');

  // 4. Package loaded
  console.log('✓ Package:', typeof requestBet !== 'undefined' ? '✅' : '❌');

  console.groupEnd();
}

runDebugChecks();
```

## Related Pages

- [Common Issues](Common-Issues) - Solutions to frequent problems
- [Error Handling](Error-Handling) - Error handling strategies
- [Status Codes](Status-Codes) - Error code reference
- [Package Integration](Package-Integration) - Setup guide
