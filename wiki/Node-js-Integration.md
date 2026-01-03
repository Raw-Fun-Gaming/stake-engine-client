# Node.js Integration

Guide for using the Stake Engine Client in Node.js server environments.

## Overview

The client works in Node.js environments but requires explicit configuration since URL parameters aren't available on the server.

## Installation

```bash
npm install stake-engine-client
```

## Basic Setup

Always provide explicit configuration in Node.js:

```typescript
import { requestAuthenticate, requestBet } from 'stake-engine-client';

const config = {
  sessionID: 'player-session-123',
  rgsUrl: 'rgs.stake-engine.com',
  language: 'en'
};

// Authenticate
const auth = await requestAuthenticate(config);

// Place bet
const bet = await requestBet({
  ...config,
  currency: 'USD',
  amount: 1.00,
  mode: 'base'
});
```

## Environment Variables

Use environment variables for configuration:

```typescript
// .env file
SESSION_ID=player-session-123
RGS_URL=rgs.stake-engine.com
LANGUAGE=en
CURRENCY=USD
```

```typescript
import 'dotenv/config';
import { requestAuthenticate, requestBet } from 'stake-engine-client';

const config = {
  sessionID: process.env.SESSION_ID!,
  rgsUrl: process.env.RGS_URL!,
  language: process.env.LANGUAGE || 'en'
};

async function serverSideBet(amount: number, mode: string) {
  const auth = await requestAuthenticate(config);
  console.log('Player balance:', auth.balance?.amount);

  const bet = await requestBet({
    ...config,
    currency: process.env.CURRENCY || 'USD',
    amount,
    mode
  });

  return bet;
}
```

## Express.js Integration

Create API endpoints for your game:

```typescript
import express from 'express';
import { requestAuthenticate, requestBet, requestEndRound } from 'stake-engine-client';

const app = express();
app.use(express.json());

// Authenticate endpoint
app.post('/api/authenticate', async (req, res) => {
  try {
    const { sessionID, rgsUrl } = req.body;

    const auth = await requestAuthenticate({
      sessionID,
      rgsUrl,
      language: 'en'
    });

    res.json(auth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Place bet endpoint
app.post('/api/bet', async (req, res) => {
  try {
    const { sessionID, rgsUrl, amount, mode, currency } = req.body;

    const bet = await requestBet({
      sessionID,
      rgsUrl,
      currency,
      amount,
      mode
    });

    res.json(bet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End round endpoint
app.post('/api/end-round', async (req, res) => {
  try {
    const { sessionID, rgsUrl } = req.body;

    const result = await requestEndRound({
      sessionID,
      rgsUrl
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Next.js API Routes

Using the client in Next.js API routes:

```typescript
// pages/api/authenticate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requestAuthenticate } from 'stake-engine-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionID, rgsUrl } = req.body;

    const auth = await requestAuthenticate({
      sessionID,
      rgsUrl,
      language: 'en'
    });

    res.status(200).json(auth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

```typescript
// pages/api/bet.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requestBet } from 'stake-engine-client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionID, rgsUrl, amount, mode, currency } = req.body;

    const bet = await requestBet({
      sessionID,
      rgsUrl,
      currency,
      amount,
      mode
    });

    res.status(200).json(bet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## Session Management

Managing player sessions on the server:

```typescript
import { requestAuthenticate, requestBet } from 'stake-engine-client';

interface PlayerSession {
  sessionID: string;
  rgsUrl: string;
  balance: number;
  authenticated: boolean;
}

class SessionManager {
  private sessions = new Map<string, PlayerSession>();

  async authenticate(sessionID: string, rgsUrl: string) {
    const auth = await requestAuthenticate({
      sessionID,
      rgsUrl,
      language: 'en'
    });

    this.sessions.set(sessionID, {
      sessionID,
      rgsUrl,
      balance: auth.balance?.amount || 0,
      authenticated: true
    });

    return auth;
  }

  async placeBet(sessionID: string, amount: number, mode: string) {
    const session = this.sessions.get(sessionID);
    if (!session?.authenticated) {
      throw new Error('Session not authenticated');
    }

    const bet = await requestBet({
      sessionID: session.sessionID,
      rgsUrl: session.rgsUrl,
      currency: 'USD',
      amount,
      mode
    });

    // Update cached balance
    session.balance = bet.balance?.amount || session.balance;

    return bet;
  }

  getSession(sessionID: string) {
    return this.sessions.get(sessionID);
  }
}

export const sessionManager = new SessionManager();
```

## Error Handling

Robust error handling for server environments:

```typescript
import { requestBet } from 'stake-engine-client';

async function safeBet(
  sessionID: string,
  rgsUrl: string,
  amount: number,
  mode: string
) {
  try {
    const response = await requestBet({
      sessionID,
      rgsUrl,
      currency: 'USD',
      amount,
      mode
    });

    if (response.status?.statusCode !== 'SUCCESS') {
      return {
        success: false,
        error: response.status?.statusCode,
        message: response.status?.statusMessage
      };
    }

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('Bet failed:', error);
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: error.message
    };
  }
}
```

## Testing

Mock the client for testing:

```typescript
import { jest } from '@jest/globals';

// Mock the entire module
jest.mock('stake-engine-client', () => ({
  requestAuthenticate: jest.fn(),
  requestBet: jest.fn(),
  requestEndRound: jest.fn()
}));

import { requestBet } from 'stake-engine-client';

test('places bet successfully', async () => {
  (requestBet as jest.Mock).mockResolvedValue({
    status: { statusCode: 'SUCCESS' },
    round: { roundID: '123', payoutMultiplier: 2.5 },
    balance: { amount: 5000000, currency: 'USD' }
  });

  const result = await myBetFunction(1.00, 'base');

  expect(result.success).toBe(true);
  expect(requestBet).toHaveBeenCalledWith({
    sessionID: expect.any(String),
    rgsUrl: expect.any(String),
    currency: 'USD',
    amount: 1.00,
    mode: 'base'
  });
});
```

## Logging

Add logging for debugging:

```typescript
import { requestBet } from 'stake-engine-client';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'game.log' })
  ]
});

async function loggedBet(
  sessionID: string,
  rgsUrl: string,
  amount: number,
  mode: string
) {
  logger.info('Placing bet', { sessionID, amount, mode });

  try {
    const response = await requestBet({
      sessionID,
      rgsUrl,
      currency: 'USD',
      amount,
      mode
    });

    logger.info('Bet placed successfully', {
      roundID: response.round?.roundID,
      payout: response.round?.payoutMultiplier
    });

    return response;
  } catch (error) {
    logger.error('Bet failed', { error: error.message });
    throw error;
  }
}
```

## TypeScript Configuration

Recommended `tsconfig.json` for Node.js:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Performance Tips

1. **Reuse connections** - The client uses `fetch` which pools connections automatically
2. **Cache authentication** - Don't authenticate on every request
3. **Use environment variables** - Avoid hardcoding credentials
4. **Implement rate limiting** - Protect against abuse
5. **Log errors** - Monitor API failures

## CommonJS vs ESM

The package supports both CommonJS and ES modules:

```typescript
// ESM
import { requestBet } from 'stake-engine-client';

// CommonJS
const { requestBet } = require('stake-engine-client');
```

## Related Pages

- [Package Integration](Package-Integration) - Installation and setup
- [Browser Integration](Browser-Integration) - Browser-specific patterns
- [Usage Patterns](Usage-Patterns) - Common examples
- [Error Handling](Error-Handling) - Error handling strategies
