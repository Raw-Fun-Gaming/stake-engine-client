# URL Parameters

The Stake Engine Client supports automatic configuration from URL parameters, making it easy to integrate into browser-based games without manual configuration.

## Overview

When Stake Engine launches your game, it passes configuration via URL parameters:

```
https://your-game.com/?sessionID=abc123&rgs_url=rgs.stake-engine.com&lang=en&currency=USD
```

The client automatically reads these parameters, allowing you to call API functions without explicitly passing configuration.

## Supported Parameters

| URL Parameter | Maps To | Description | Required | Default |
|--------------|---------|-------------|----------|---------|
| `sessionID` | `sessionID` | Player session identifier | Yes | - |
| `rgs_url` | `rgsUrl` | RGS server hostname | Yes | - |
| `lang` | `language` | Player language code | No | `'en'` |
| `currency` | `currency` | Currency code (USD, EUR, etc.) | No | `'USD'` |

## Usage with URL Parameters

With URL parameters present, you can omit configuration from function calls:

```typescript
import { requestAuthenticate, requestBet, requestBalance } from 'stake-engine-client';

// All configuration is read from URL automatically
const auth = await requestAuthenticate();
const balance = await requestBalance();

const bet = await requestBet({
  amount: 1.00,
  mode: 'base'
  // sessionID, rgsUrl, language, currency all come from URL
});
```

## Explicit Configuration Override

You can still explicitly pass parameters to override URL values:

```typescript
import { requestBet } from 'stake-engine-client';

// Override URL parameters with explicit values
const bet = await requestBet({
  sessionID: 'custom-session',  // Override URL sessionID
  rgsUrl: 'custom.rgs-server.com',  // Override URL rgs_url
  currency: 'EUR',  // Override URL currency
  amount: 5.00,
  mode: 'base'
});
```

## Replay Mode URL Parameters

For replay functionality, additional parameters are supported:

```
https://your-game.com/?replay=true&game=my-game&version=1&mode=base&event=12345&rgs_url=rgs.stake-engine.com
```

| Parameter | Description | Required for Replay |
|-----------|-------------|---------------------|
| `replay` | Set to `'true'` to enable replay mode | Yes |
| `game` | Game identifier | Yes |
| `version` | Game version number | Yes |
| `mode` | Game mode (base, freespin, etc.) | Yes |
| `event` | Event ID to replay | Yes |

See [Replay Helpers](Replay-Helpers) for utility functions that work with replay URL parameters.

## Browser vs Node.js

### Browser Environment

URL parameters are automatically detected using `window.location.search`:

```typescript
// Automatically works in browser
import { requestAuthenticate } from 'stake-engine-client';

const auth = await requestAuthenticate();
// Reads from window.location.search
```

### Node.js Environment

In Node.js, there's no browser `window` object, so you must explicitly provide configuration:

```typescript
import { requestAuthenticate } from 'stake-engine-client';

// Must provide explicit config in Node.js
const auth = await requestAuthenticate({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com',
  language: 'en'
});
```

## Implementation Details

The client uses `URLSearchParams` internally to parse query strings:

```typescript
// Internal implementation example
const params = new URLSearchParams(window.location.search);
const sessionID = params.get('sessionID') || undefined;
const rgsUrl = params.get('rgs_url') || undefined;
const language = params.get('lang') || 'en';
const currency = params.get('currency') || 'USD';
```

## Best Practices

1. **Browser Games**: Rely on URL parameters for configuration
   - No manual config needed
   - Works automatically with Stake Engine launcher

2. **Node.js Applications**: Always use explicit configuration
   - URL parameters aren't available
   - Pass config object to every function

3. **Hybrid Approach**: Use URL parameters with selective overrides
   - Read most config from URL
   - Override specific values when needed

4. **Testing**: Pass explicit config during development
   - Easier to test without setting up URL parameters
   - Can use `.env` files or config objects

## Examples

### Pure URL-based Configuration (Browser)

```typescript
// Game launched from: ?sessionID=abc&rgs_url=rgs.example.com&lang=en&currency=USD

import { requestAuthenticate, requestBet } from 'stake-engine-client';

const auth = await requestAuthenticate();
// Uses URL params automatically

const bet = await requestBet({
  amount: 1.00,
  mode: 'base'
  // currency, sessionID, rgsUrl all from URL
});
```

### Explicit Configuration (Node.js)

```typescript
import { requestAuthenticate, requestBet } from 'stake-engine-client';

const config = {
  sessionID: process.env.SESSION_ID,
  rgsUrl: process.env.RGS_URL,
  language: 'en'
};

const auth = await requestAuthenticate(config);
const bet = await requestBet({
  ...config,
  currency: 'USD',
  amount: 1.00,
  mode: 'base'
});
```

### Mixed Approach (Browser with Overrides)

```typescript
// URL provides sessionID and rgs_url
// But we want to override currency

import { requestBet } from 'stake-engine-client';

const bet = await requestBet({
  currency: 'EUR',  // Override URL currency
  amount: 1.00,
  mode: 'base'
  // sessionID and rgsUrl still come from URL
});
```

## Related Pages

- [Package Integration](Package-Integration) - Full integration guide
- [Getting Started with Demo](Getting-Started) - Testing with URL parameters
- [Replay Helpers](Replay-Helpers) - Working with replay URL parameters
