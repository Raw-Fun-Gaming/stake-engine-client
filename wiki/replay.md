# replay

Fetch historical bet data for replay/review purposes. This function retrieves the complete round state for a previously played bet, allowing you to replay the game visuals without making real bets.

## Syntax

```typescript
replay(options: ReplayOptions): Promise<ReplayResponse>
```

## Parameters

### `options` (required)

| Property  | Type     | Required | Description                                          |
| --------- | -------- | -------- | ---------------------------------------------------- |
| `game`    | `string` | Yes      | Game identifier (e.g., 'slots-adventure')            |
| `version` | `string` | Yes      | Game version (e.g., '1.0.0')                         |
| `mode`    | `string` | Yes      | Bet mode (e.g., 'base', 'bonus')                     |
| `event`   | `string` | Yes      | Event identifier for the specific bet                |
| `rgsUrl`  | `string` | No       | RGS server hostname (from URL param if not provided) |

### URL Parameter Fallback

- `rgsUrl` from `rgs_url` URL parameter

## Return Value

Returns a Promise that resolves to a `ReplayResponse` object:

```typescript
interface ReplayResponse {
	payoutMultiplier?: number;  // Payout multiplier for the bet
	costMultiplier?: number;    // Cost multiplier for the bet mode
	state?: GameState;          // Game state array for replay
	error?: any;                // Error details if request failed
}
```

### Response Properties

- **`payoutMultiplier`** - Win multiplier for the replayed bet (e.g., 2.5 means 2.5x the bet amount)
- **`costMultiplier`** - Cost multiplier for the bet mode (usually 1)
- **`state`** - Array containing game state data for replay simulation
  - Each element represents a game event or state transition
  - Format varies by game implementation
- **`error`** - Error details if the request failed

## Examples

### Basic Replay Request

```typescript
import { replay } from 'stake-engine-client';

const replay = await replay({
	game: 'slots-adventure',
	version: '1.0.0',
	mode: 'base',
	event: 'abc123def456',
	rgsUrl: 'api.stakeengine.com',
});

console.log('Payout multiplier:', replay.payoutMultiplier);  // 2.5
console.log('Cost multiplier:', replay.costMultiplier);      // 1
console.log('Game state:', replay.state);                    // Array of game events
```

### Using URL Parameters

```typescript
import {
	requestReplay,
	getReplayUrlParams,
	isReplayMode,
} from 'stake-engine-client';

// URL: https://game.com/play?replay=true&game=slots&version=1.0.0&mode=base&event=abc123&rgs_url=api.stakeengine.com

if (isReplayMode()) {
	const params = getReplayUrlParams();

	const replay = await replay({
		game: params.game,
		version: params.version,
		mode: params.mode,
		event: params.event,
		// rgsUrl from URL param automatically
	});

	// Render the replay using state
	renderGameReplay(replay.state);
}
```

### Complete Replay Flow

```typescript
import {
	requestReplay,
	getReplayUrlParams,
	isReplayMode,
	API_AMOUNT_MULTIPLIER,
} from 'stake-engine-client';

async function initializeGame() {
	// Check if we're in replay mode
	if (isReplayMode()) {
		const params = getReplayUrlParams();

		console.log('Replay mode detected');
		console.log('Original bet amount:', params.amount);

		try {
			const replay = await replay({
				game: params.game,
				version: params.version,
				mode: params.mode,
				event: params.event,
			});

			if (replay.payoutMultiplier !== undefined && replay.state) {
				// Display replay information
				const betAmount = params.amount;  // From URL params

				console.log(`Replaying bet`);
				console.log(`Bet: $${betAmount.toFixed(2)}`);
				console.log(
					`Payout: ${replay.payoutMultiplier}x (${
						(betAmount * replay.payoutMultiplier).toFixed(2)
					} total)`
				);

				// Start the visual replay
				startReplayAnimation(replay.state);
			} else {
				console.error('Replay data incomplete');
			}
		} catch (error) {
			console.error('Failed to load replay:', error);
		}
	} else {
		// Normal game initialization
		await initializeNormalGame();
	}
}

function startReplayAnimation(gameState: unknown[] | undefined) {
	if (!gameState) return;

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
import { replay } from 'stake-engine-client';

async function loadReplay(
	game: string,
	version: string,
	mode: string,
	event: string
) {
	try {
		const replay = await replay({
			game,
			version,
			mode,
			event,
			rgsUrl: 'api.stakeengine.com',
		});

		if (replay.error) {
			console.error('Replay failed:', replay.error);
			return null;
		}

		if (replay.payoutMultiplier !== undefined && replay.state) {
			return replay;
		}

		console.error('Incomplete replay data');
	} catch (error) {
		console.error('Network error:', error);
	}

	return null;
}
```

## URL Parameters for Replay Mode

When linking to a game in replay mode, include these URL parameters:

| Parameter | Description                       | Example               |
| --------- | --------------------------------- | --------------------- |
| `replay`  | Enable replay mode                | `true`                |
| `game`    | Game identifier                   | `slots-adventure`     |
| `version` | Game version                      | `1.0.0`               |
| `mode`    | Bet mode                          | `base`                |
| `event`   | Event identifier                  | `abc123def456`        |
| `amount`  | Original bet amount (for display) | `1.00`                |
| `rgs_url` | RGS server hostname               | `api.stakeengine.com` |

**Example URL:**

```
https://game.com/play?replay=true&game=slots-adventure&version=1.0.0&mode=base&event=abc123&amount=1.00&rgs_url=api.stakeengine.com
```

## Error Handling

Replay requests don't use the standard status code system. Instead:
- **Success:** Returns `payoutMultiplier`, `costMultiplier`, and `state` properties
- **Failure:** Returns an `error` property with details

```typescript
const replay = await replay({ game, version, mode, event });

if (replay.error) {
	console.error('Replay failed:', replay.error);
	// Handle error (bet not found, invalid parameters, etc.)
} else if (replay.state) {
	console.log('Success:', replay.payoutMultiplier);
	// Process replay data
}

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
- **[play](play)** - Place actual bets (opposite of replay)

## See Also

- **[Error Handling](Error-Handling)** - Complete guide to handling errors
- **[Status Codes](Status-Codes)** - Full reference of status codes
- **[URL Parameters](URL-Parameters)** - All supported URL parameters

### Example Response

```json
{
  "payoutMultiplier": 2.5,
  "costMultiplier": 1,
  "state": [
    {
      "result": "nice"
    }
  ]
}
```

**Properties:**
- `payoutMultiplier`: 2.5 means the player won 2.5x their bet
- `costMultiplier`: 1 means standard cost (no multiplier)
- `state`: Array of game state events to replay visually
