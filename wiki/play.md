# requestPlay

Place a bet and start a new betting round. This is the core function for initiating gameplay.

## 📋 Syntax

```typescript
requestPlay(options: BetOptions): Promise<PlayResponse>
```

## 📝 Parameters

### `options` (required)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `amount` | `number` | ✅ | Bet amount in dollars (e.g., 1.00 for $1) |
| `mode` | `string` | ✅ | Bet mode (e.g., 'base', 'bonus', 'freespin') |
| `currency` | `string` | ❌ | Currency code (from URL param if not provided, defaults to 'USD') |
| `sessionID` | `string` | ❌ | Player session ID (from URL param if not provided) |
| `rgsUrl` | `string` | ❌ | RGS server hostname (from URL param if not provided) |

### URL Parameter Fallback

- `sessionID` from `sessionID` URL parameter
- `rgsUrl` from `rgs_url` URL parameter
- `currency` from `currency` URL parameter (defaults to 'USD')

## 🔄 Return Value

Returns a Promise that resolves to a `PlayResponse` object:

```typescript
interface PlayResponse {
  round?: RoundDetailObject;      // Round details and game results
  balance?: BalanceObject;        // Updated player balance
  status?: {                      // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
}
```

### Response Properties

- **`round`** - Round results and details
  - `roundID`: Unique round identifier
  - `payoutMultiplier`: Win multiplier (0 for no win)
  - `payoutAmount`: Total payout amount
  - `gameState`: Current game state
  - `betAmount`: Actual bet amount placed
  
- **`balance`** - Updated balance after bet
  - `amount`: New balance amount (in API format)
  - `currency`: Currency code

## 💡 Examples

### Basic Betting (Browser with URL params)

```typescript
import { requestPlay } from 'stake-engine-client';

// URL: https://game.com/play?sessionID=player-123&rgs_url=api.stakeengine.com&currency=USD
const bet = await requestPlay({
  amount: 1.00,      // $1.00 bet
  mode: 'base'       // Base game mode, currency from URL param
});

if (bet.status?.statusCode === 'SUCCESS') {
  console.log('🎲 Bet placed! Round:', bet.round?.roundID);
  console.log('💰 Payout multiplier:', bet.round?.payoutMultiplier);
  console.log('💵 New balance:', bet.balance?.amount);
}
```

### With Explicit Configuration

```typescript
import { requestPlay } from 'stake-engine-client';

const bet = await requestPlay({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com',
  currency: 'USD',
  amount: 5.00,      // $5.00 bet
  mode: 'base'
});

console.log('Bet result:', bet.round?.payoutMultiplier);
```

### Complete Betting Flow with Error Handling

```typescript
import { requestPlay, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

async function placeBet(betAmount: number, currency: string = 'USD') {
  try {
    const bet = await requestPlay({
      currency,
      amount: betAmount,
      mode: 'base'
    });
    
    switch (bet.status?.statusCode) {
      case 'SUCCESS':
        const payout = bet.round?.payoutMultiplier || 0;
        const winAmount = betAmount * payout;
        
        console.log(`🎲 Bet: $${betAmount}`);
        console.log(`🎯 Multiplier: ${payout}x`);
        
        if (payout > 0) {
          console.log(`🎉 WIN! You won $${winAmount.toFixed(2)}`);
        } else {
          console.log(`💔 No win this time`);
        }
        
        // Display new balance (convert from API format)
        const newBalance = (bet.balance?.amount || 0) / API_AMOUNT_MULTIPLIER;
        console.log(`💰 New balance: $${newBalance.toFixed(2)}`);
        
        return bet.round;
        
      case 'ERR_IPB':
        console.error('❌ Insufficient balance for this bet');
        break;
        
      case 'ERR_IS':
        console.error('❌ Session expired - please re-authenticate');
        break;
        
      case 'ERR_GLE':
        console.error('❌ Gambling limits exceeded');
        break;
        
      default:
        console.error('❌ Bet failed:', bet.status?.statusMessage);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
  
  return null;
}

// Usage
await placeBet(2.50);  // Place a $2.50 bet
```

### Different Bet Modes

```typescript
import { requestPlay } from 'stake-engine-client';

// Base game bet
const baseBet = await requestPlay({
  currency: 'USD',
  amount: 1.00,
  mode: 'base'
});

// Bonus game bet (if applicable to your game)
const bonusBet = await requestPlay({
  currency: 'USD',
  amount: 2.00,
  mode: 'bonus'
});

// Free spin bet (usually amount is 0)
const freeSpinBet = await requestPlay({
  currency: 'USD',
  amount: 0.00,
  mode: 'freespin'
});
```

### Variable Bet Amounts

```typescript
import { requestPlay } from 'stake-engine-client';

// Different bet sizes
const betAmounts = [0.10, 0.25, 0.50, 1.00, 2.50, 5.00, 10.00];

async function placeBetWithAmount(amount: number) {
  const bet = await requestPlay({
    currency: 'USD',
    amount: amount,
    mode: 'base'
  });
  
  return bet.status?.statusCode === 'SUCCESS';
}

// Place different sized bets
for (const amount of betAmounts) {
  const success = await placeBetWithAmount(amount);
  console.log(`$${amount} bet:`, success ? '✅' : '❌');
}
```

## ⚠️ Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|---------|
| `SUCCESS` | Bet placed successfully | Process game results |
| `ERR_IPB` | Insufficient player balance | Show balance error |
| `ERR_IS` | Invalid session or timeout | Re-authenticate |
| `ERR_GLE` | Gambling limits exceeded | Show limit message |
| `ERR_BNF` | Bet not found/invalid | Check bet parameters |
| `ERR_UE` | Unknown server error | Retry or contact support |

## 🔧 Amount Conversion

The client automatically converts dollar amounts to API format:

```typescript
// You provide dollar amounts (human-readable)
amount: 1.00    // $1.00

// Client converts to API format internally
// 1.00 * 1000000 = 1000000 (API format)

// Responses contain API format amounts
// Divide by API_AMOUNT_MULTIPLIER for display
```

## 🎯 Best Practices

1. **Always check status codes** before processing results
2. **Validate bet amounts** against available balance
3. **Handle session expiration** gracefully
4. **Store round IDs** for tracking and auditing
5. **Use appropriate bet modes** for your game type
6. **Display converted amounts** to users correctly

## 🔗 Related Functions

- **[requestAuthenticate](requestAuthenticate)** - Must be called first
- **[requestEndRound](requestEndRound)** - End the current round
- **[requestBalance](requestBalance)** - Check balance before betting
- **[requestEndEvent](requestEndEvent)** - Track game events during play

## 🛠️ Implementation Notes

- Players must be authenticated before placing bets
- Only one active round allowed per player at a time
- Bet amounts are automatically converted from dollars to API format
- Session tokens can expire during long gameplay sessions
- Always end rounds properly to maintain game state consistency

## 📚 See Also

- **[Error Handling](Error-Handling)** - Complete guide to handling bet errors
- **[Amount Conversion](Amount-Conversion)** - Understanding format conversions
- **[Usage Patterns](Usage-Patterns)** - Real-world betting examples