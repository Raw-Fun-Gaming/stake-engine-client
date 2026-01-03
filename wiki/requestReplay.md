# requestReplay

Fetch historical bet data for replay/review purposes. This function retrieves the complete round state for a previously played bet, allowing you to replay the game visuals without making real bets.

## Syntax

```typescript
requestReplay(options: ReplayOptions): Promise<ReplayResponse>
```

## Parameters

### `options` (required)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `game` | `string` | Yes | Game identifier (e.g., 'slots-adventure') |
| `version` | `string` | Yes | Game version (e.g., '1.0.0') |
| `mode` | `string` | Yes | Bet mode (e.g., 'base', 'bonus') |
| `event` | `string` | Yes | Event identifier for the specific bet |
| `rgsUrl` | `string` | No | RGS server hostname (from URL param if not provided) |

### URL Parameter Fallback

- `rgsUrl` from `rgs_url` URL parameter

## Return Value

Returns a Promise that resolves to a `ReplayResponse` object:

```typescript
interface ReplayResponse {
  round?: RoundDetailObject;   // Historical round details
  status?: {                   // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
  error?: any;                 // Error details if request failed
}
```

### Response Properties

- **`round`** - Historical round details
  - `roundID`: Original round identifier
  - `amount`: Original bet amount
  - `payout`: Payout amount
  - `payoutMultiplier`: Win multiplier
  - `mode`: Bet mode
  - `event`: Event identifier
  - `state`: Complete game state for replay

- **`status`** - Operation result
  - `statusCode`: Status code (e.g., 'SUCCESS')
  - `statusMessage`: Human-readable message

## Examples

### Basic Replay Request

```typescript
import { requestReplay } from 'stake-engine-client';

const replay = await requestReplay({
  game: 'slots-adventure',
  version: '1.0.0',
  mode: 'base',
  event: 'abc123def456',
  rgsUrl: 'api.stakeengine.com'
});

if (replay.status?.statusCode === 'SUCCESS') {
  console.log('Round ID:', replay.round?.roundID);
  console.log('Game state:', replay.round?.state);
}
```

### Using URL Parameters

```typescript
import { requestReplay, getReplayUrlParams, isReplayMode } from 'stake-engine-client';

// URL: https://game.com/play?replay=true&game=slots&version=1.0.0&mode=base&event=abc123&rgs_url=api.stakeengine.com

if (isReplayMode()) {
  const params = getReplayUrlParams();

  const replay = await requestReplay({
    game: params.game,
    version: params.version,
    mode: params.mode,
    event: params.event
    // rgsUrl from URL param automatically
  });

  // Render the replay using round.state
  renderGameReplay(replay.round?.state);
}
```

### Complete Replay Flow

```typescript
import {
  requestReplay,
  getReplayUrlParams,
  isReplayMode,
  API_AMOUNT_MULTIPLIER
} from 'stake-engine-client';

async function initializeGame() {
  // Check if we're in replay mode
  if (isReplayMode()) {
    const params = getReplayUrlParams();

    console.log('Replay mode detected');
    console.log('Original bet amount:', params.amount);

    try {
      const replay = await requestReplay({
        game: params.game,
        version: params.version,
        mode: params.mode,
        event: params.event
      });

      if (replay.status?.statusCode === 'SUCCESS' && replay.round) {
        // Display replay information
        const betAmount = (replay.round.amount || 0) / API_AMOUNT_MULTIPLIER;
        const payoutAmount = (replay.round.payout || 0) / API_AMOUNT_MULTIPLIER;

        console.log(`Replaying round ${replay.round.roundID}`);
        console.log(`Bet: $${betAmount.toFixed(2)}`);
        console.log(`Payout: $${payoutAmount.toFixed(2)} (${replay.round.payoutMultiplier}x)`);

        // Start the visual replay
        startReplayAnimation(replay.round.state);
      } else {
        console.error('Replay failed:', replay.status?.statusMessage);
      }

    } catch (error) {
      console.error('Failed to load replay:', error);
    }

  } else {
    // Normal game initialization
    await initializeNormalGame();
  }
}

function startReplayAnimation(gameState: unknown[]) {
  // Iterate through game events and animate
  gameState.forEach((event, index) => {
    setTimeout(() => {
      renderGameEvent(event);
    }, index * 500); // 500ms between events
  });
}
```

### Error Handling

```typescript
import { requestReplay } from 'stake-engine-client';

async function loadReplay(game: string, version: string, mode: string, event: string) {
  try {
    const replay = await requestReplay({
      game,
      version,
      mode,
      event,
      rgsUrl: 'api.stakeengine.com'
    });

    switch (replay.status?.statusCode) {
      case 'SUCCESS':
        return replay.round;

      case 'ERR_BNF':
        console.error('Bet not found - invalid replay parameters');
        break;

      case 'ERR_UE':
        console.error('Server error - please try again');
        break;

      default:
        console.error('Replay failed:', replay.status?.statusMessage);
    }

  } catch (error) {
    console.error('Network error:', error);
  }

  return null;
}
```

## URL Parameters for Replay Mode

When linking to a game in replay mode, include these URL parameters:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `replay` | Enable replay mode | `true` |
| `game` | Game identifier | `slots-adventure` |
| `version` | Game version | `1.0.0` |
| `mode` | Bet mode | `base` |
| `event` | Event identifier | `abc123def456` |
| `amount` | Original bet amount (for display) | `1.00` |
| `rgs_url` | RGS server hostname | `api.stakeengine.com` |

**Example URL:**
```
https://game.com/play?replay=true&game=slots-adventure&version=1.0.0&mode=base&event=abc123&amount=1.00&rgs_url=api.stakeengine.com
```

## Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|--------|
| `SUCCESS` | Replay data loaded successfully | Process game state |
| `ERR_BNF` | Bet not found | Check replay parameters |
| `ERR_UE` | Unknown server error | Retry or contact support |

## API Details

- **HTTP Method:** GET
- **Endpoint:** `/bet/replay/{game}/{version}/{mode}/{event}`
- **Authentication:** Not required (replay data is read-only)

## Best Practices

1. **Check replay mode first** - Use `isReplayMode()` before initializing the game
2. **Disable betting UI** - In replay mode, hide or disable bet controls
3. **Show replay indicator** - Clearly indicate to users they're watching a replay
4. **Handle missing data** - Gracefully handle cases where replay data is unavailable
5. **Cache replay data** - Store loaded replay data to avoid repeated requests

## Related Functions

- **[isReplayMode](Replay-Helpers)** - Check if in replay mode
- **[getReplayUrlParams](Replay-Helpers)** - Get all replay URL parameters
- **[requestBet](requestBet)** - Place actual bets (opposite of replay)

## See Also

- **[Error Handling](Error-Handling)** - Complete guide to handling errors
- **[Status Codes](Status-Codes)** - Full reference of status codes
- **[URL Parameters](URL-Parameters)** - All supported URL parameters
