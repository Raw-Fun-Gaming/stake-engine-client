# Common Issues

Solutions to frequently encountered problems when using the Stake Engine Client.

## Authentication Issues

### "sessionID is required" Error

**Problem:** Missing sessionID parameter

**Solution:**
```typescript
// ❌ Bad - no sessionID
const auth = await requestAuthenticate();

// ✅ Good - provide sessionID explicitly (Node.js)
const auth = await requestAuthenticate({
  sessionID: 'player-session-123',
  rgsUrl: 'rgs.stake-engine.com'
});

// ✅ Good - use URL parameters (Browser)
// URL: ?sessionID=abc123&rgs_url=rgs.stake-engine.com
const auth = await requestAuthenticate();  // Auto-reads from URL
```

### "Invalid Session" (ERR_IS)

**Problem:** Session expired or invalid

**Solution:**
- Verify the sessionID hasn't expired
- Check that you're using the correct RGS URL
- In browser, reload the game to get a fresh session
- Ensure the session was created properly by Stake Engine

```typescript
const response = await requestBet({ amount: 1.00, mode: 'base' });

if (response.status?.statusCode === 'ERR_IS') {
  // Session expired - reload game
  window.location.reload();
}
```

## Betting Issues

### "Player Already has Bet" (ERR_PAB)

**Problem:** Trying to place a bet while another round is active

**Solution:** End the current round first

```typescript
const bet = await requestBet({ amount: 1.00, mode: 'base' });

if (bet.status?.statusCode === 'ERR_PAB') {
  // End the existing round
  await requestEndRound();

  // Now place the new bet
  const newBet = await requestBet({ amount: 1.00, mode: 'base' });
}
```

### "Insufficient Player Balance" (ERR_IPB)

**Problem:** Player doesn't have enough balance

**Solution:**
```typescript
const bet = await requestBet({ amount: 1.00, mode: 'base' });

if (bet.status?.statusCode === 'ERR_IPB') {
  alert('Insufficient balance. Please add funds.');
  // Redirect to deposit page or show error UI
}
```

### Amount Conversion Confusion

**Problem:** Using API format instead of dollar amounts

**Solution:** High-level methods handle conversion automatically

```typescript
// ✅ Good - use dollars
const bet = await requestBet({
  amount: 1.00,  // $1.00
  mode: 'base'
});

// ❌ Bad - don't use API format with high-level methods
const bet = await requestBet({
  amount: 1000000,  // Wrong! This would be $1,000!
  mode: 'base'
});
```

If using `StakeEngineClient` directly, convert manually:
```typescript
import { stakeEngineClient, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

await stakeEngineClient.post({
  url: '/wallet/play',
  rgsUrl: 'rgs.stake-engine.com',
  variables: {
    sessionID: 'abc123',
    currency: 'USD',
    mode: 'base',
    amount: 1.00 * API_AMOUNT_MULTIPLIER  // Convert to API format
  }
});
```

## CORS Errors

### "CORS policy blocked" Error

**Problem:** Browser CORS error when calling RGS API

**Causes:**
1. Incorrect `rgs_url` parameter
2. Game not properly configured on Stake Engine
3. Local development without proper setup

**Solution:**
```typescript
// ✅ Verify rgsUrl is correct (no protocol)
const auth = await requestAuthenticate({
  sessionID: 'abc123',
  rgsUrl: 'rgs.stake-engine.com'  // ✅ Good
  // rgsUrl: 'https://rgs.stake-engine.com'  // ❌ Bad
});
```

For local development, use the demo page or ensure your game is launched through Stake Engine.

## URL Parameter Issues

### URL Parameters Not Working

**Problem:** Client not reading URL parameters in browser

**Check:**
1. Parameters are in the correct format
2. Using correct parameter names

```
✅ Good: ?sessionID=abc&rgs_url=rgs.example.com&lang=en
❌ Bad: ?session=abc&rgsUrl=rgs.example.com&language=en
```

Correct parameter names:
- `sessionID` (not `session`)
- `rgs_url` (not `rgsUrl`)
- `lang` (not `language`)
- `currency` (optional)

### Node.js "window is not defined"

**Problem:** Trying to use URL parameters in Node.js

**Solution:** Always use explicit configuration in Node.js

```typescript
// ❌ Bad - tries to access window.location
const auth = await requestAuthenticate();

// ✅ Good - explicit config
const auth = await requestAuthenticate({
  sessionID: process.env.SESSION_ID,
  rgsUrl: process.env.RGS_URL,
  language: 'en'
});
```

## TypeScript Issues

### Type Errors

**Problem:** TypeScript errors about missing properties

**Solution:** Use optional chaining and null checks

```typescript
import { requestBet } from 'stake-engine-client';

const bet = await requestBet({ amount: 1.00, mode: 'base' });

// ❌ Bad - may throw if balance is undefined
console.log(bet.balance.amount);

// ✅ Good - safe access
console.log(bet.balance?.amount);

// ✅ Good - with fallback
console.log(bet.balance?.amount ?? 0);
```

### Import Errors

**Problem:** Can't import types

**Solution:** Use `type` keyword for type imports

```typescript
// ✅ Good - type-only import
import type { components } from 'stake-engine-client';

// ❌ Bad - runtime import of types
import { components } from 'stake-engine-client';
```

## Build Issues

### Module Resolution Errors

**Problem:** Can't resolve module in build

**Solution:** Check your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### Tree Shaking Not Working

**Problem:** Full package included in bundle

**Solution:** Use named imports

```typescript
// ✅ Good - tree-shakable
import { requestBet, requestAuthenticate } from 'stake-engine-client';

// ❌ Bad - imports everything
import * as StakeEngine from 'stake-engine-client';
```

## Network Issues

### Timeout Errors

**Problem:** Requests timing out

**Solution:**
```typescript
import { fetcher } from 'stake-engine-client';

// Add timeout handling
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  const response = await fetch('https://rgs.example.com/wallet/play', {
    method: 'POST',
    body: JSON.stringify({ sessionID: 'abc' }),
    signal: controller.signal
  });
} catch (error) {
  if (error.name === 'AbortError') {
    console.error('Request timed out');
  }
} finally {
  clearTimeout(timeoutId);
}
```

### Connection Refused

**Problem:** Can't connect to RGS server

**Checklist:**
- [ ] Verify `rgs_url` is correct
- [ ] Check internet connection
- [ ] Ensure game is properly launched from Stake Engine
- [ ] Verify RGS server is operational

## Replay Issues

### Replay Data Not Loading

**Problem:** `requestReplay` returns error

**Solution:**
```typescript
import { requestReplay } from 'stake-engine-client';

try {
  const replay = await requestReplay({
    game: 'my-game',
    version: '1',
    mode: 'base',
    event: 'event-id-123',
    rgsUrl: 'rgs.stake-engine.com'
  });

  console.log('Replay data:', replay);
} catch (error) {
  console.error('Replay failed:', error.message);
  // Event ID may not exist or parameters incorrect
}
```

Verify:
- Event ID exists and is valid
- Game name matches exactly
- Version and mode are correct

## Performance Issues

### Slow API Calls

**Problem:** API calls taking too long

**Tips:**
1. Don't authenticate on every request - cache the result
2. Minimize balance checks - only when needed
3. Batch operations when possible
4. Check network conditions

```typescript
// ❌ Bad - authenticates repeatedly
async function bet() {
  await requestAuthenticate();  // Slow!
  await requestBet({ amount: 1.00, mode: 'base' });
}

// ✅ Good - authenticate once
let authenticated = false;

async function init() {
  await requestAuthenticate();
  authenticated = true;
}

async function bet() {
  if (!authenticated) await init();
  await requestBet({ amount: 1.00, mode: 'base' });
}
```

## Debugging Tips

1. **Check the response status**
   ```typescript
   const response = await requestBet({ amount: 1.00, mode: 'base' });
   console.log('Status:', response.status?.statusCode);
   console.log('Message:', response.status?.statusMessage);
   ```

2. **Enable network logs** in browser DevTools (Network tab)

3. **Log all API calls**
   ```typescript
   import { requestBet } from 'stake-engine-client';

   const originalBet = requestBet;
   requestBet = async (options) => {
     console.log('Placing bet:', options);
     const result = await originalBet(options);
     console.log('Bet result:', result);
     return result;
   };
   ```

4. **Check URL parameters**
   ```typescript
   const params = new URLSearchParams(window.location.search);
   console.log('sessionID:', params.get('sessionID'));
   console.log('rgs_url:', params.get('rgs_url'));
   ```

## Getting Help

If your issue isn't covered here:

1. Check [Status Codes](Status-Codes) for error code meanings
2. Review [Package Integration](Package-Integration) for setup
3. See [Usage Patterns](Usage-Patterns) for examples
4. Create an issue on [GitHub](https://github.com/raw-fun-gaming/stake-engine-client/issues)

## Related Pages

- [Status Codes](Status-Codes) - Error code reference
- [Error Handling](Error-Handling) - Error handling guide
- [Package Integration](Package-Integration) - Setup guide
- [Debug Guide](Debug-Guide) - Debugging strategies
