# StakeEngineClient Class

The `StakeEngineClient` class provides a low-level, type-safe interface for making RGS API calls directly. Use this when you need more control than the high-level convenience methods provide.

## Overview

While most users will use the convenience methods like `play()` and `authenticate()`, the `StakeEngineClient` class allows you to:
- Make custom API calls not covered by convenience methods
- Build your own abstractions on top of the RGS API
- Access the full OpenAPI type system for complete type safety

## Creating a Client Instance

```typescript
import { StakeEngineClient } from 'stake-engine-client';

const client = new StakeEngineClient();
```

Or use the default instance:

```typescript
import { stakeEngineClient } from 'stake-engine-client';

// Use the default exported instance
await stakeEngineClient.post({ /* ... */ });
```

## Methods

### `post<T>(options)`

Make a type-safe POST request to any RGS API endpoint.

**Parameters:**
- `url` - API endpoint path (e.g., `/wallet/play`)
- `rgsUrl` - RGS server hostname
- `variables` - Request body (typed based on the endpoint)

**Returns:** Promise with typed response data

```typescript
const client = new StakeEngineClient();

const response = await client.post({
  url: '/wallet/play',
  rgsUrl: 'rgs.stake-engine.com',
  variables: {
    sessionID: 'abc123',
    currency: 'USD',
    mode: 'base',
    amount: 1000000  // API format (not converted automatically)
  }
});
```

### `get<T>(options)`

Make a type-safe GET request to any RGS API endpoint.

**Parameters:**
- `url` - API endpoint path
- `rgsUrl` - RGS server hostname

**Returns:** Promise with response data

```typescript
const client = new StakeEngineClient();

const response = await client.get({
  url: '/bet/replay/my-game/1/base/event123',
  rgsUrl: 'rgs.stake-engine.com'
});
```

## Type Safety

The client uses TypeScript's type system to provide full type safety based on the OpenAPI schema:

```typescript
import { StakeEngineClient } from 'stake-engine-client';
import type { paths } from 'stake-engine-client';

const client = new StakeEngineClient();

// TypeScript knows the exact shape of variables and response
const response = await client.post({
  url: '/wallet/authenticate',
  rgsUrl: 'rgs.stake-engine.com',
  variables: {
    sessionID: 'abc123',
    language: 'en'
  }
});

// Response is typed as res_authenticate
console.log(response.balance?.amount);  // Type-safe access
```

## Custom Implementations

Use the client to build your own abstractions:

```typescript
import { StakeEngineClient } from 'stake-engine-client';

class MyGameClient {
  private client = new StakeEngineClient();
  private rgsUrl: string;
  private sessionID: string;

  constructor(rgsUrl: string, sessionID: string) {
    this.rgsUrl = rgsUrl;
    this.sessionID = sessionID;
  }

  async placeBet(amount: number, mode: string) {
    return this.client.post({
      url: '/wallet/play',
      rgsUrl: this.rgsUrl,
      variables: {
        sessionID: this.sessionID,
        currency: 'USD',
        mode,
        amount: amount * 1000000  // Convert to API format
      }
    });
  }

  async getBalance() {
    return this.client.post({
      url: '/wallet/balance',
      rgsUrl: this.rgsUrl,
      variables: {
        sessionID: this.sessionID
      }
    });
  }
}

// Usage
const gameClient = new MyGameClient('rgs.stake-engine.com', 'session-123');
await gameClient.placeBet(1.00, 'base');
```

## Error Handling

The client throws errors for non-200 responses:

```typescript
try {
  const response = await client.post({
    url: '/wallet/play',
    rgsUrl: 'rgs.stake-engine.com',
    variables: { /* ... */ }
  });
} catch (error) {
  console.error('API call failed:', error.message);
}
```

## Comparison with High-Level Methods

| Feature | High-Level Methods | StakeEngineClient |
|---------|-------------------|-------------------|
| **Amount Conversion** | Automatic | Manual |
| **URL Param Fallback** | Yes | No |
| **Type Safety** | Yes | Yes |
| **Flexibility** | Limited to predefined operations | Any API endpoint |
| **Ease of Use** | Simple | More verbose |

### When to Use Each

**Use High-Level Methods** (`play`, etc.) when:
- You're calling standard API operations
- You want automatic amount conversion
- You want URL parameter fallback support
- You prefer convenience over control

**Use StakeEngineClient** when:
- You need to call custom API endpoints
- You're building your own abstraction layer
- You want full control over request/response handling
- You need access to all OpenAPI types

## Related Pages

- [Low-Level Fetcher](Low-Level-Fetcher) - Even lower-level HTTP client
- [TypeScript Types](TypeScript-Types) - Complete type reference
- [Package Integration](Package-Integration) - Using high-level methods
