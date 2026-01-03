# Package Integration

This guide shows you how to integrate the Stake Engine Client package into your own project.

## 📦 Installation

Install the package using npm:

```bash
npm install stake-engine-client
```

Or using yarn:

```bash
yarn add stake-engine-client
```

## 🚀 Quick Setup

### Option 1: URL Parameter Configuration (Recommended for browsers)

If you're building a web application, the easiest way to configure the client is through URL parameters:

```
https://your-game.com/play?sessionID=player-123&rgs_url=api.stakeengine.com&lang=en&currency=USD
```

With URL parameters, you can use most functions without passing options:

```typescript
import { requestAuthenticate, requestBet, requestBalance } from 'stake-engine-client';

// All these functions will automatically use URL parameters
const auth = await requestAuthenticate();
const balance = await requestBalance();
const bet = await requestBet({
  amount: 1.00,
  mode: 'base'
  // currency defaults to 'USD' from URL param
});
```

### Option 2: Explicit Configuration

For Node.js or when you prefer explicit configuration:

```typescript
import { requestAuthenticate, requestBet } from 'stake-engine-client';

const config = {
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com',
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

## 🔧 Configuration Parameters

### Required Parameters
- **`sessionID`** - Player session identifier from your authentication system
- **`rgsUrl`** - RGS server hostname (without protocol, e.g., 'api.stakeengine.com')

### Optional Parameters
- **`language`** - Player language code (defaults to 'en')

### URL Parameter Mapping
| Function Parameter | URL Parameter | Default |
|-------------------|---------------|---------|
| `sessionID` | `sessionID` | - |
| `rgsUrl` | `rgs_url` | - |
| `language` | `lang` | `'en'` |
| `currency` | `currency` | `'USD'` |

## 🎯 Basic Usage Flow

Here's a typical game session flow:

```typescript
import {
  requestAuthenticate,
  requestBet,
  requestEndRound,
  requestBalance
} from 'stake-engine-client';

// 1. Authenticate player
const auth = await requestAuthenticate();
console.log('Player balance:', auth.balance?.amount);
console.log('Bet levels:', auth.config?.betLevels);

// 2. Place a bet
const bet = await requestBet({
  amount: 1.00,
  mode: 'base'
  // currency defaults to 'USD' from URL param
});

if (bet.status?.statusCode === 'SUCCESS') {
  console.log('Bet placed! Round ID:', bet.round?.roundID);
  console.log('Payout multiplier:', bet.round?.payoutMultiplier);
} else {
  console.log('Bet failed:', bet.status?.statusMessage);
}

// 3. End the round
const endResult = await requestEndRound();
console.log('Round ended, new balance:', endResult.balance?.amount);

// 4. Check balance anytime
const currentBalance = await requestBalance();
console.log('Current balance:', currentBalance.balance?.amount);
```

## 🛡️ Error Handling

Always check the status code in responses:

```typescript
const bet = await requestBet({
  amount: 1.00,
  mode: 'base'
  // currency defaults to 'USD' from URL param
});

switch (bet.status?.statusCode) {
  case 'SUCCESS':
    console.log('Bet placed successfully!');
    break;
  case 'ERR_IPB':
    console.log('Insufficient player balance');
    break;
  case 'ERR_IS':
    console.log('Invalid session or session expired');
    break;
  default:
    console.log('Error:', bet.status?.statusMessage);
}
```

## 💰 Amount Conversion

The client automatically handles amount conversion:

```typescript
// Input: Dollar amounts (human-readable)
const bet = await requestBet({
  currency: 'USD',
  amount: 1.00,  // $1.00
  mode: 'base'
});

// The client converts this to API format (1000000) automatically
// Responses contain amounts in API format, divide by API_AMOUNT_MULTIPLIER for display
```

## 🔄 Next Steps

Now that you have the basics:

1. **Explore the API** - Check out individual function pages for detailed usage
2. **Handle Errors** - Read the [Error Handling](Error-Handling) guide
3. **See Examples** - Browse [Usage Patterns](Usage-Patterns) for real-world scenarios
4. **Advanced Features** - Learn about [TypeScript Types](TypeScript-Types) and custom clients

## 🆘 Need Help?

- **[Common Issues](Common-Issues)** - Solutions to frequent problems
- **[Status Codes](Status-Codes)** - Complete reference of error codes
- **[GitHub Issues](https://github.com/raw-fun-gaming/stake-engine-client/issues)** - Report bugs or ask questions
