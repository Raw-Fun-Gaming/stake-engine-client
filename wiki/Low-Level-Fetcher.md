# Low-Level Fetcher

The `fetcher` function is the lowest-level HTTP client in the package. It provides a simple wrapper around the native `fetch` API for making JSON requests to the RGS API.

## Overview

Most users should use [high-level methods](Package-Integration) or the [StakeEngineClient class](StakeEngineClient-Class). The fetcher is useful when you need:
- Maximum control over HTTP requests
- Custom fetch implementations (testing, Node.js)
- To build completely custom API clients

## Basic Usage

```typescript
import { fetcher } from 'stake-engine-client';

const response = await fetcher({
  method: 'POST',
  endpoint: 'https://rgs.stake-engine.com/wallet/balance',
  variables: {
    sessionID: 'player-session-123'
  }
});

if (response.status === 200) {
  const data = await response.json();
  console.log('Balance:', data.balance?.amount);
}
```

## Function Signature

```typescript
interface FetcherOptions {
  /** Custom fetch function (optional, defaults to global fetch) */
  fetch?: typeof fetch;
  /** HTTP method */
  method: 'POST' | 'GET';
  /** Full endpoint URL */
  endpoint: string;
  /** Request body variables for POST requests */
  variables?: object;
}

function fetcher(options: FetcherOptions): Promise<Response>
```

## Parameters

### `method` (required)
HTTP method - either `'POST'` or `'GET'`

### `endpoint` (required)
Full URL to the API endpoint including protocol and hostname:
```typescript
endpoint: 'https://rgs.stake-engine.com/wallet/play'
```

### `variables` (optional)
Request body for POST requests. Automatically serialized as JSON:
```typescript
variables: {
  sessionID: 'abc123',
  amount: 1000000,
  currency: 'USD'
}
```

### `fetch` (optional)
Custom fetch implementation. Useful for:
- Testing with mock responses
- Node.js environments without global fetch
- Adding custom middleware

```typescript
import { fetcher } from 'stake-engine-client';
import nodeFetch from 'node-fetch';

const response = await fetcher({
  method: 'POST',
  endpoint: 'https://rgs.stake-engine.com/wallet/play',
  variables: { /* ... */ },
  fetch: nodeFetch as typeof fetch
});
```

## Return Value

Returns a `Promise<Response>` - the standard [Fetch API Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) object.

You need to:
1. Check the status code
2. Parse the JSON response manually

```typescript
const response = await fetcher({ /* ... */ });

if (response.status !== 200) {
  const error = await response.json();
  console.error('Error:', error.message);
  return;
}

const data = await response.json();
console.log('Success:', data);
```

## Examples

### POST Request

```typescript
import { fetcher } from 'stake-engine-client';

const response = await fetcher({
  method: 'POST',
  endpoint: 'https://rgs.stake-engine.com/wallet/play',
  variables: {
    sessionID: 'player-123',
    currency: 'USD',
    mode: 'base',
    amount: 1000000
  }
});

const data = await response.json();
```

### GET Request

```typescript
import { fetcher } from 'stake-engine-client';

const response = await fetcher({
  method: 'GET',
  endpoint: 'https://rgs.stake-engine.com/bet/replay/game/1/base/event123'
});

const data = await response.json();
```

### With Custom Fetch (Node.js)

```typescript
import { fetcher } from 'stake-engine-client';
import fetch from 'node-fetch';

const response = await fetcher({
  method: 'POST',
  endpoint: 'https://rgs.stake-engine.com/wallet/balance',
  variables: { sessionID: 'abc123' },
  fetch: fetch as typeof globalThis.fetch
});
```

### With Error Handling

```typescript
import { fetcher } from 'stake-engine-client';

try {
  const response = await fetcher({
    method: 'POST',
    endpoint: 'https://rgs.stake-engine.com/wallet/play',
    variables: {
      sessionID: 'player-123',
      amount: 1000000,
      currency: 'USD',
      mode: 'base'
    }
  });

  if (response.status !== 200) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('Bet placed:', data.round?.roundID);
} catch (error) {
  console.error('Failed to place bet:', error.message);
}
```

## Request Details

The fetcher automatically:
- Sets `Content-Type: application/json` header
- Serializes `variables` to JSON for POST requests
- Omits body for GET requests

Generated request:
```http
POST /wallet/play HTTP/1.1
Host: rgs.stake-engine.com
Content-Type: application/json

{"sessionID":"abc123","amount":1000000}
```

## When to Use

### Use `fetcher` when:
- Building a completely custom API client
- You need maximum control over requests/responses
- Testing with custom fetch implementations
- Integrating with middleware or custom HTTP logic

### Use [StakeEngineClient](StakeEngineClient-Class) when:
- You want type safety from OpenAPI schema
- You need access to all API endpoints
- You want error handling built-in

### Use [High-Level Methods](Package-Integration) when:
- You're calling standard operations (bet, authenticate, etc.)
- You want automatic amount conversion
- You want URL parameter fallback
- You prefer simplicity and convenience

## Comparison

| Feature | fetcher | StakeEngineClient | High-Level Methods |
|---------|---------|-------------------|-------------------|
| **Type Safety** | No | Yes (OpenAPI) | Yes (OpenAPI) |
| **Error Handling** | Manual | Automatic | Automatic |
| **Amount Conversion** | Manual | Manual | Automatic |
| **URL Param Fallback** | No | No | Yes |
| **Response Parsing** | Manual | Automatic | Automatic |
| **Control** | Maximum | High | Limited |

## Related Pages

- [StakeEngineClient Class](StakeEngineClient-Class) - Type-safe API client
- [Package Integration](Package-Integration) - High-level convenience methods
- [TypeScript Types](TypeScript-Types) - Type definitions
