# endRound

End the current betting round and finalize any pending game results. This function should be called after game completion to properly close the round.

## 📋 Syntax

```typescript
endRound(options?: EndRoundOptions): Promise<EndRoundResponse>
```

## 📝 Parameters

### `options` (optional)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `sessionID` | `string` | ❌ | Player session ID (from URL param if not provided) |
| `rgsUrl` | `string` | ❌ | RGS server hostname (from URL param if not provided) |

### URL Parameter Fallback

If options are not provided, the function automatically uses:
- `sessionID` from `sessionID` URL parameter
- `rgsUrl` from `rgs_url` URL parameter

## 🔄 Return Value

Returns a Promise that resolves to an `EndRoundResponse` object:

```typescript
interface EndRoundResponse {
  balance?: BalanceObject;        // Updated player balance
  status?: {                      // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
}
```

### Response Properties

- **`balance`** - Final balance after round completion
  - `amount`: Current balance amount (in API format)
  - `currency`: Currency code (e.g., 'USD')

## 💡 Examples

### Basic Round Ending (Browser with URL params)

```typescript
import { endRound } from 'stake-engine-client';

// URL: https://game.com/play?sessionID=player-123&rgs_url=api.stakeengine.com
const result = await endRound();

if (result.status?.statusCode === 'SUCCESS') {
  console.log('✅ Round ended successfully');
  console.log('💰 Final balance:', result.balance?.amount);
} else {
  console.error('❌ Failed to end round:', result.status?.statusMessage);
}
```

### With Explicit Configuration

```typescript
import { endRound } from 'stake-engine-client';

const result = await endRound({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com'
});

console.log('Round ended:', result.status?.statusCode === 'SUCCESS');
```

### Complete Game Flow

```typescript
import { 
  requestAuthenticate, 
  requestBet, 
  requestEndRound,
  API_AMOUNT_MULTIPLIER 
} from 'stake-engine-client';

async function playCompleteRound() {
  try {
    // 1. Authenticate player
    const auth = await authenticate();
    if (auth.status?.statusCode !== 'SUCCESS') {
      throw new Error('Authentication failed');
    }
    
    // 2. Place a bet
    const bet = await play({
      currency: 'USD',
      amount: 1.00,
      mode: 'base'
    });
    
    if (bet.status?.statusCode !== 'SUCCESS') {
      throw new Error('Bet failed: ' + bet.status?.statusMessage);
    }
    
    console.log('🎲 Round started:', bet.round?.roundID);
    console.log('🎯 Multiplier:', bet.round?.payoutMultiplier);
    
    // 3. Simulate game play time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. End the round
    const endResult = await endRound();
    
    if (endResult.status?.statusCode === 'SUCCESS') {
      const finalBalance = (endResult.balance?.amount || 0) / API_AMOUNT_MULTIPLIER;
      console.log('✅ Round completed successfully');
      console.log('💰 Final balance: $' + finalBalance.toFixed(2));
      return true;
    } else {
      console.error('❌ Failed to end round:', endResult.status?.statusMessage);
      return false;
    }
    
  } catch (error) {
    console.error('Game flow error:', error);
    return false;
  }
}

// Execute complete game round
await playCompleteRound();
```

### Error Handling with Recovery

```typescript
import { endRound } from 'stake-engine-client';

async function endRoundSafely() {
  try {
    const result = await endRound();
    
    switch (result.status?.statusCode) {
      case 'SUCCESS':
        console.log('✅ Round ended successfully');
        return result.balance;
        
      case 'ERR_IS':
        console.log('⚠️ Session expired during round end');
        // Re-authenticate and retry
        break;
        
      case 'ERR_BNF':
        console.log('⚠️ No active round to end');
        // This is actually okay - no round was active
        return null;
        
      default:
        console.error('❌ Round end failed:', result.status?.statusMessage);
        // May need manual intervention
    }
    
  } catch (error) {
    console.error('Network error ending round:', error);
    // Implement retry logic if needed
  }
  
  return null;
}

const finalBalance = await endRoundSafely();
```

### Batch Operations - Multiple Rounds

```typescript
import { requestBet, endRound } from 'stake-engine-client';

async function playMultipleRounds(count: number, betAmount: number) {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    console.log(`🎲 Starting round ${i + 1}/${count}`);
    
    // Place bet
    const bet = await play({
      currency: 'USD',
      amount: betAmount,
      mode: 'base'
    });
    
    if (bet.status?.statusCode === 'SUCCESS') {
      console.log(`Round ${i + 1} - Multiplier: ${bet.round?.payoutMultiplier}x`);
      
      // End round
      const endResult = await endRound();
      
      results.push({
        roundNumber: i + 1,
        roundID: bet.round?.roundID,
        multiplier: bet.round?.payoutMultiplier,
        success: endResult.status?.statusCode === 'SUCCESS',
        finalBalance: endResult.balance?.amount
      });
    } else {
      console.error(`Round ${i + 1} failed:`, bet.status?.statusMessage);
      break;
    }
    
    // Small delay between rounds
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Play 5 rounds with $1 bets
const gameResults = await playMultipleRounds(5, 1.00);
console.log('Game session results:', gameResults);
```

## ⚠️ Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|---------|
| `SUCCESS` | Round ended successfully | Continue normal flow |
| `ERR_IS` | Invalid session or timeout | Re-authenticate |
| `ERR_BNF` | No active round to end | Normal - no action needed |
| `ERR_UE` | Unknown server error | Retry or contact support |

## 🎯 Best Practices

1. **Always end rounds** after game completion to maintain proper state
2. **Handle "no round" cases** gracefully (ERR_BNF is often normal)
3. **Check final balance** to update UI correctly
4. **Implement retry logic** for network failures
5. **Track round completion** for auditing and compliance
6. **Clean up UI state** after successful round end

## 🔗 Related Functions

- **[play](play)** - Start a round that needs to be ended
- **[getBalance](getBalance)** - Get updated balance after round end
- **[authenticate](authenticate)** - May need re-authentication if session expires
- **[endEvent](endEvent)** - Track events before ending round

## 🛠️ Implementation Notes

- Can only end rounds that were previously started with `requestBet`
- Calling this function when no round is active returns `ERR_BNF` (not an error)
- Session tokens can expire during long gameplay sessions
- The function finalizes all pending game calculations
- Balance is updated with final amounts after all game logic completes
- Essential for maintaining consistent game state in the RGS

## ⚠️ Important Considerations

- **State Management**: Always call this function to properly close rounds
- **Balance Updates**: The response contains the most current balance
- **Session Handling**: Handle session expiration during round end
- **Error Recovery**: Implement strategies for failed round endings
- **Audit Trail**: Keep track of successfully ended rounds for compliance

## 📚 See Also

- **[play](play)** - How to start rounds
- **[Error Handling](Error-Handling)** - Complete guide to handling errors
- **[Usage Patterns](Usage-Patterns)** - Real-world game flow examples