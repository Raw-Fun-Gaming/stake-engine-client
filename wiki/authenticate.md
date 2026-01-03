# authenticate

Authenticate a player session with the RGS and retrieve player information, game configuration, and active round details.

## 📋 Syntax

```typescript
authenticate(options?: AuthenticateOptions): Promise<AuthenticateResponse>
```

## 📝 Parameters

### `options` (optional)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `sessionID` | `string` | ✅ | Player session ID (from URL param if not provided) |
| `rgsUrl` | `string` | ✅ | RGS server hostname (from URL param if not provided) |
| `language` | `string` | ❌ | Language code, defaults to 'en' (from URL param if not provided) |

### URL Parameter Fallback

If options are not provided, the function automatically uses:
- `sessionID` from `sessionID` URL parameter
- `rgsUrl` from `rgs_url` URL parameter
- `language` from `lang` URL parameter (defaults to 'en')

## 🔄 Return Value

Returns a Promise that resolves to an `AuthenticateResponse` object:

```typescript
interface AuthenticateResponse {
  balance?: BalanceObject;        // Player's current balance
  config?: ConfigObject;          // Game configuration
  round?: RoundDetailObject;      // Active round information (if any)
  status?: {                      // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
}
```

### Response Properties

- **`balance`** - Player's current balance information
  - `amount`: Current balance amount (in API format)
  - `currency`: Currency code (e.g., 'USD')
  
- **`config`** - Game configuration settings
  - `betLevels`: Available bet amounts
  - `maxBet`: Maximum allowed bet
  - `minBet`: Minimum allowed bet
  
- **`round`** - Active round details (if player has an active round)
  - `roundID`: Unique round identifier
  - `gameState`: Current game state
  - `betAmount`: Current bet amount

## 💡 Examples

### Using URL Parameters (Browser)

```typescript
import { authenticate } from 'stake-engine-client';

// URL: https://game.com/play?sessionID=player-123&rgs_url=api.stakeengine.com&lang=en
const auth = await authenticate();

if (auth.status?.statusCode === 'SUCCESS') {
  console.log('🎉 Authentication successful!');
  console.log('💰 Balance:', auth.balance?.amount);
  console.log('🎯 Available bet levels:', auth.config?.betLevels);
  
  if (auth.round) {
    console.log('🎲 Active round:', auth.round.roundID);
  }
}
```

### Using Explicit Parameters

```typescript
import { authenticate } from 'stake-engine-client';

const auth = await authenticate({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com',
  language: 'es'  // Spanish
});

console.log('Player authenticated:', auth.status?.statusCode === 'SUCCESS');
```

### With Error Handling

```typescript
import { authenticate } from 'stake-engine-client';

try {
  const auth = await authenticate();
  
  switch (auth.status?.statusCode) {
    case 'SUCCESS':
      console.log('✅ Authentication successful');
      console.log('Balance:', auth.balance?.amount, auth.balance?.currency);
      break;
      
    case 'ERR_IS':
      console.error('❌ Invalid session or session expired');
      // Redirect to login
      break;
      
    case 'ERR_ATE':
      console.error('❌ Authentication failed');
      // Handle auth failure
      break;
      
    default:
      console.error('❌ Authentication error:', auth.status?.statusMessage);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Checking for Active Rounds

```typescript
import { authenticate } from 'stake-engine-client';

const auth = await authenticate();

if (auth.status?.statusCode === 'SUCCESS') {
  if (auth.round) {
    console.log('🎲 Player has an active round:', auth.round.roundID);
    console.log('💵 Bet amount:', auth.round.betAmount);
    // Handle existing round
  } else {
    console.log('🆕 No active round - player can place new bets');
    // Allow new betting
  }
}
```

## ⚠️ Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|---------|
| `SUCCESS` | Authentication successful | Proceed with game |
| `ERR_IS` | Invalid session or timeout | Re-authenticate |
| `ERR_ATE` | Authentication failed | Check credentials |
| `ERR_UE` | Unknown server error | Retry or contact support |

## 🔗 Related Functions

- **[getBalance](getBalance)** - Get updated balance information
- **[play](play)** - Place a bet after authentication
- **[endRound](endRound)** - End any active round

## 🛠️ Implementation Notes

- Always call this function before other RGS operations
- The response includes all necessary information to start gameplay
- Active rounds must be completed before placing new bets
- Session tokens can expire - handle `ERR_IS` status appropriately
- The function automatically converts URL parameters for browser usage

## 📚 See Also

- **[Error Handling](Error-Handling)** - Complete guide to handling errors
- **[Status Codes](Status-Codes)** - Full reference of all status codes
- **[Getting Started](Getting-Started)** - Basic setup and usage guide