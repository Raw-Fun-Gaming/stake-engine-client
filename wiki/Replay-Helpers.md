# Replay Helper Functions

Helper functions for working with replay mode in the browser. These utilities make it easy to detect replay mode and extract replay parameters from the URL.

## isReplayMode

Check if the current session is in replay mode by examining the URL parameters.

### Syntax

```typescript
isReplayMode(): boolean
```

### Return Value

Returns `true` if the URL contains `replay=true`, otherwise `false`.

### Examples

```typescript
import { isReplayMode } from 'stake-engine-client';

// URL: https://game.com/play?replay=true&game=slots&...
console.log(isReplayMode()); // true

// URL: https://game.com/play?sessionID=abc123&...
console.log(isReplayMode()); // false
```

### Conditional Game Initialization

```typescript
import { isReplayMode, requestAuthenticate, requestReplay, getReplayUrlParams } from 'stake-engine-client';

async function initGame() {
  if (isReplayMode()) {
    // Replay mode - load historical data
    const params = getReplayUrlParams();
    const replay = await requestReplay({
      game: params.game,
      version: params.version,
      mode: params.mode,
      event: params.event
    });

    // Disable betting controls
    disableBettingUI();

    // Show replay indicator
    showReplayBanner();

    // Play back the round
    playbackRound(replay.round?.state);

  } else {
    // Normal mode - authenticate and allow betting
    const auth = await requestAuthenticate();
    enableBettingUI(auth.config?.betLevels);
  }
}
```

---

## getReplayUrlParams

Extract all replay-related parameters from the current URL.

### Syntax

```typescript
getReplayUrlParams(): ReplayUrlParams
```

### Return Value

Returns an object with the following properties:

```typescript
interface ReplayUrlParams {
  replay: boolean;   // Whether replay mode is enabled
  amount: number;    // Original bet amount (0 if not provided)
  game: string;      // Game identifier ('' if not provided)
  version: string;   // Game version ('' if not provided)
  mode: string;      // Bet mode ('' if not provided)
  event: string;     // Event identifier ('' if not provided)
}
```

### URL Parameters

| URL Parameter | Object Property | Type | Default |
|---------------|-----------------|------|---------|
| `replay` | `replay` | `boolean` | `false` |
| `amount` | `amount` | `number` | `0` |
| `game` | `game` | `string` | `''` |
| `version` | `version` | `string` | `''` |
| `mode` | `mode` | `string` | `''` |
| `event` | `event` | `string` | `''` |

### Examples

#### Basic Usage

```typescript
import { getReplayUrlParams } from 'stake-engine-client';

// URL: https://game.com/play?replay=true&game=slots-adventure&version=1.0.0&mode=base&event=abc123&amount=2.50

const params = getReplayUrlParams();

console.log(params.replay);   // true
console.log(params.game);     // 'slots-adventure'
console.log(params.version);  // '1.0.0'
console.log(params.mode);     // 'base'
console.log(params.event);    // 'abc123'
console.log(params.amount);   // 2.5
```

#### With requestReplay

```typescript
import { getReplayUrlParams, requestReplay, isReplayMode } from 'stake-engine-client';

async function loadReplay() {
  if (!isReplayMode()) {
    console.log('Not in replay mode');
    return null;
  }

  const params = getReplayUrlParams();

  // Validate required parameters
  if (!params.game || !params.version || !params.mode || !params.event) {
    console.error('Missing required replay parameters');
    return null;
  }

  const replay = await requestReplay({
    game: params.game,
    version: params.version,
    mode: params.mode,
    event: params.event
  });

  return replay;
}
```

#### Display Original Bet Information

```typescript
import { getReplayUrlParams, isReplayMode } from 'stake-engine-client';

function showReplayInfo() {
  if (!isReplayMode()) return;

  const params = getReplayUrlParams();

  const infoPanel = document.getElementById('replay-info');
  infoPanel.innerHTML = `
    <div class="replay-banner">
      <span class="replay-icon">Replay</span>
      <span class="replay-details">
        Game: ${params.game} v${params.version}
        | Mode: ${params.mode}
        | Original Bet: $${params.amount.toFixed(2)}
      </span>
    </div>
  `;
  infoPanel.style.display = 'block';
}
```

---

## Complete Replay Flow Example

```typescript
import {
  isReplayMode,
  getReplayUrlParams,
  requestReplay,
  requestAuthenticate,
  API_AMOUNT_MULTIPLIER
} from 'stake-engine-client';

class GameManager {
  private isReplay = false;
  private replayData: any = null;

  async initialize() {
    this.isReplay = isReplayMode();

    if (this.isReplay) {
      await this.initializeReplayMode();
    } else {
      await this.initializeNormalMode();
    }
  }

  private async initializeReplayMode() {
    const params = getReplayUrlParams();

    // Show loading state
    this.showLoading('Loading replay...');

    try {
      const replay = await requestReplay({
        game: params.game,
        version: params.version,
        mode: params.mode,
        event: params.event
      });

      if (replay.status?.statusCode === 'SUCCESS') {
        this.replayData = replay.round;

        // Update UI for replay mode
        this.hideNormalControls();
        this.showReplayControls();
        this.displayReplayInfo(params, replay.round);

        // Start the replay
        this.startReplay();

      } else {
        this.showError(`Failed to load replay: ${replay.status?.statusMessage}`);
      }

    } catch (error) {
      this.showError('Network error loading replay');
    }
  }

  private async initializeNormalMode() {
    const auth = await requestAuthenticate();

    if (auth.status?.statusCode === 'SUCCESS') {
      this.setupBetting(auth.config, auth.balance);
    }
  }

  private displayReplayInfo(params: ReturnType<typeof getReplayUrlParams>, round: any) {
    const betAmount = (round?.amount || 0) / API_AMOUNT_MULTIPLIER;
    const payoutAmount = (round?.payout || 0) / API_AMOUNT_MULTIPLIER;
    const multiplier = round?.payoutMultiplier || 0;

    console.log('=== REPLAY INFO ===');
    console.log(`Game: ${params.game} v${params.version}`);
    console.log(`Mode: ${params.mode}`);
    console.log(`Bet: $${betAmount.toFixed(2)}`);
    console.log(`Payout: $${payoutAmount.toFixed(2)} (${multiplier}x)`);
    console.log('==================');
  }

  private startReplay() {
    if (!this.replayData?.state) return;

    // Play through each game event
    const events = this.replayData.state;
    let eventIndex = 0;

    const playNextEvent = () => {
      if (eventIndex < events.length) {
        this.renderEvent(events[eventIndex]);
        eventIndex++;
        setTimeout(playNextEvent, 500);
      } else {
        this.onReplayComplete();
      }
    };

    playNextEvent();
  }

  private renderEvent(event: any) {
    // Implement your game-specific rendering logic
    console.log('Rendering event:', event);
  }

  private onReplayComplete() {
    console.log('Replay complete');
    this.showReplayCompleteMessage();
  }

  // UI helper methods (implement based on your framework)
  private showLoading(message: string) { /* ... */ }
  private showError(message: string) { /* ... */ }
  private hideNormalControls() { /* ... */ }
  private showReplayControls() { /* ... */ }
  private showReplayCompleteMessage() { /* ... */ }
  private setupBetting(config: any, balance: any) { /* ... */ }
}

// Usage
const game = new GameManager();
game.initialize();
```

---

## Building Replay URLs

When creating links to replay mode, construct the URL with all required parameters:

```typescript
function buildReplayUrl(
  baseUrl: string,
  game: string,
  version: string,
  mode: string,
  event: string,
  amount: number,
  rgsUrl: string
): string {
  const params = new URLSearchParams({
    replay: 'true',
    game,
    version,
    mode,
    event,
    amount: amount.toString(),
    rgs_url: rgsUrl
  });

  return `${baseUrl}?${params.toString()}`;
}

// Usage
const replayUrl = buildReplayUrl(
  'https://game.example.com/play',
  'slots-adventure',
  '1.0.0',
  'base',
  'abc123def456',
  2.50,
  'api.stakeengine.com'
);

// Result: https://game.example.com/play?replay=true&game=slots-adventure&version=1.0.0&mode=base&event=abc123def456&amount=2.5&rgs_url=api.stakeengine.com
```

---

## Related Functions

- **[requestReplay](requestReplay)** - Fetch replay data from the server

## See Also

- **[URL Parameters](URL-Parameters)** - All supported URL parameters
- **[Getting Started](Getting-Started)** - Initial setup guide
