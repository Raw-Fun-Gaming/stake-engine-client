# endEvent

Track a game event during bet progress. This function is used to signal the completion of specific game events or stages within a betting round.

## 📋 Syntax

```typescript
endEvent(options: EndEventOptions): Promise<EventResponse>
```

## 📝 Parameters

### `options` (required)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `eventIndex` | `number` | ✅ | Sequential event number (starting from 1) |
| `sessionID` | `string` | ❌ | Player session ID (from URL param if not provided) |
| `rgsUrl` | `string` | ❌ | RGS server hostname (from URL param if not provided) |

### URL Parameter Fallback

- `sessionID` from `sessionID` URL parameter
- `rgsUrl` from `rgs_url` URL parameter

## 🔄 Return Value

Returns a Promise that resolves to an `EventResponse` object:

```typescript
interface EventResponse {
  status?: {                      // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
}
```

## 💡 Examples

### Basic Event Tracking (Browser with URL params)

```typescript
import { endEvent } from 'stake-engine-client';

// URL: https://game.com/play?sessionID=player-123&rgs_url=api.stakeengine.com

// Track first game event
const event1 = await endEvent({
  eventIndex: 1
});

if (event1.status?.statusCode === 'SUCCESS') {
  console.log('✅ Event 1 tracked successfully');
}
```

### With Explicit Configuration

```typescript
import { endEvent } from 'stake-engine-client';

const event = await endEvent({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com',
  eventIndex: 2
});

console.log('Event tracked:', event.status?.statusCode === 'SUCCESS');
```

### Sequential Event Tracking

```typescript
import { play, endEvent, endRound } from 'stake-engine-client';

async function playGameWithEvents() {
  try {
    // 1. Start the round with a bet
    const bet = await play({
      currency: 'USD',
      amount: 1.00,
      mode: 'base'
    });
    
    if (bet.status?.statusCode !== 'SUCCESS') {
      throw new Error('Bet failed');
    }
    
    console.log('🎲 Round started:', bet.round?.roundID);
    
    // 2. Track game events sequentially
    const events = [];
    
    // Event 1: Base game spin
    console.log('🎯 Processing base game spin...');
    const event1 = await endEvent({ eventIndex: 1 });
    events.push(event1.status?.statusCode === 'SUCCESS');
    
    // Simulate game processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Event 2: Bonus feature trigger (if applicable)
    console.log('🎁 Processing bonus feature...');
    const event2 = await endEvent({ eventIndex: 2 });
    events.push(event2.status?.statusCode === 'SUCCESS');
    
    // Event 3: Final result calculation
    console.log('🏁 Processing final results...');
    const event3 = await endEvent({ eventIndex: 3 });
    events.push(event3.status?.statusCode === 'SUCCESS');
    
    // 3. End the round
    const endResult = await endRound();
    
    console.log('📊 Game Summary:');
    console.log(`   Events tracked: ${events.filter(Boolean).length}/${events.length}`);
    console.log(`   Round completed: ${endResult.status?.statusCode === 'SUCCESS'}`);
    console.log(`   Final multiplier: ${bet.round?.payoutMultiplier}x`);
    
    return endResult.status?.statusCode === 'SUCCESS';
    
  } catch (error) {
    console.error('Game with events failed:', error);
    return false;
  }
}

await playGameWithEvents();
```

### Event Tracking with Error Recovery

```typescript
import { endEvent } from 'stake-engine-client';

async function trackEventSafely(eventIndex: number, maxRetries: number = 3): Promise<boolean> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      attempts++;
      
      const event = await endEvent({ eventIndex });
      
      switch (event.status?.statusCode) {
        case 'SUCCESS':
          console.log(`✅ Event ${eventIndex} tracked successfully`);
          return true;
          
        case 'ERR_IS':
          console.log(`⚠️ Session expired tracking event ${eventIndex}`);
          // Could re-authenticate here
          break;
          
        case 'ERR_BNF':
          console.log(`⚠️ No active round for event ${eventIndex}`);
          return false; // Don't retry - no round active
          
        default:
          console.log(`❌ Event ${eventIndex} failed: ${event.status?.statusMessage}`);
      }
      
    } catch (error) {
      console.error(`Network error tracking event ${eventIndex} (attempt ${attempts}):`, error);
    }
    
    if (attempts < maxRetries) {
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`🔄 Retrying event ${eventIndex} (attempt ${attempts + 1}/${maxRetries})`);
    }
  }
  
  console.error(`❌ Failed to track event ${eventIndex} after ${maxRetries} attempts`);
  return false;
}

// Usage with retry logic
const eventTracked = await trackEventSafely(1);
```

### Multi-Stage Game Flow

```typescript
import { 
  play, 
  endEvent, 
  endRound 
} from 'stake-engine-client';

interface GameStage {
  name: string;
  eventIndex: number;
  duration: number; // milliseconds
}

async function playMultiStageGame(): Promise<void> {
  const gameStages: GameStage[] = [
    { name: 'Reel Spin', eventIndex: 1, duration: 2000 },
    { name: 'Symbol Evaluation', eventIndex: 2, duration: 1000 },
    { name: 'Bonus Check', eventIndex: 3, duration: 1500 },
    { name: 'Final Calculation', eventIndex: 4, duration: 500 }
  ];
  
  try {
    // Start the game round
    const bet = await play({
      currency: 'USD',
      amount: 2.50,
      mode: 'base'
    });
    
    if (bet.status?.statusCode !== 'SUCCESS') {
      throw new Error('Failed to start game');
    }
    
    console.log('🎮 Multi-stage game started');
    console.log(`🎲 Round ID: ${bet.round?.roundID}`);
    
    // Process each game stage
    for (const stage of gameStages) {
      console.log(`🎯 ${stage.name}...`);
      
      // Simulate stage processing
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      
      // Track stage completion
      const event = await endEvent({ 
        eventIndex: stage.eventIndex 
      });
      
      if (event.status?.statusCode === 'SUCCESS') {
        console.log(`✅ ${stage.name} completed`);
      } else {
        console.warn(`⚠️ ${stage.name} tracking failed: ${event.status?.statusMessage}`);
      }
    }
    
    // Complete the round
    const endResult = await endRound();
    
    if (endResult.status?.statusCode === 'SUCCESS') {
      console.log('🏁 Game completed successfully');
      console.log(`💰 Payout: ${bet.round?.payoutMultiplier}x`);
    }
    
  } catch (error) {
    console.error('Multi-stage game failed:', error);
  }
}

await playMultiStageGame();
```

### Event Progress Tracking

```typescript
import { endEvent } from 'stake-engine-client';

class GameEventTracker {
  private currentEventIndex: number = 1;
  private trackedEvents: number[] = [];
  private onEventTracked?: (eventIndex: number, success: boolean) => void;
  
  setEventCallback(callback: (eventIndex: number, success: boolean) => void): void {
    this.onEventTracked = callback;
  }
  
  async trackNextEvent(): Promise<boolean> {
    const eventIndex = this.currentEventIndex;
    
    try {
      const event = await endEvent({ eventIndex });
      const success = event.status?.statusCode === 'SUCCESS';
      
      if (success) {
        this.trackedEvents.push(eventIndex);
        console.log(`📍 Event ${eventIndex} tracked (${this.trackedEvents.length} total)`);
      } else {
        console.error(`❌ Event ${eventIndex} failed: ${event.status?.statusMessage}`);
      }
      
      this.onEventTracked?.(eventIndex, success);
      this.currentEventIndex++;
      
      return success;
      
    } catch (error) {
      console.error(`Network error tracking event ${eventIndex}:`, error);
      this.onEventTracked?.(eventIndex, false);
      return false;
    }
  }
  
  async trackMultipleEvents(count: number): Promise<number> {
    let successCount = 0;
    
    for (let i = 0; i < count; i++) {
      const success = await this.trackNextEvent();
      if (success) successCount++;
      
      // Small delay between events
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return successCount;
  }
  
  getTrackedEvents(): number[] {
    return [...this.trackedEvents];
  }
  
  reset(): void {
    this.currentEventIndex = 1;
    this.trackedEvents = [];
  }
}

// Usage
const eventTracker = new GameEventTracker();

eventTracker.setEventCallback((eventIndex, success) => {
  const status = success ? '✅' : '❌';
  console.log(`${status} Event ${eventIndex}`);
  
  // Update UI progress bar
  updateProgressBar(eventTracker.getTrackedEvents().length);
});

// Track 5 events
const successfulEvents = await eventTracker.trackMultipleEvents(5);
console.log(`🎯 ${successfulEvents}/5 events tracked successfully`);

function updateProgressBar(eventCount: number): void {
  // Update UI progress indicator
  const progressPercent = (eventCount / 5) * 100;
  document.getElementById('progress-bar')?.style.setProperty('width', `${progressPercent}%`);
}
```

## ⚠️ Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|---------|
| `SUCCESS` | Event tracked successfully | Continue to next event |
| `ERR_IS` | Invalid session or timeout | Re-authenticate |
| `ERR_BNF` | No active round for event | Check round state |
| `ERR_UE` | Unknown server error | Retry or contact support |

## 🎯 Best Practices

1. **Track events sequentially** starting from index 1
2. **Handle network failures** gracefully with retry logic
3. **Don't skip event indices** - maintain proper sequence
4. **Track events before ending rounds** for proper audit trail
5. **Implement timeout handling** for long-running game stages
6. **Log event tracking** for debugging and compliance
7. **Update UI progress** to show game stage completion

## 🔗 Related Functions

- **[play](play)** - Must be called before tracking events
- **[endRound](endRound)** - Called after all events are tracked
- **[getBalance](getBalance)** - Check balance during long game sequences

## 🛠️ Implementation Notes

- Events must be tracked in sequential order (1, 2, 3, ...)
- Only works within active betting rounds
- Used for compliance, auditing, and game state tracking
- Essential for games with multiple stages or complex mechanics
- Session tokens can expire during long game sequences
- Events provide detailed audit trail for regulatory compliance

## ⚠️ Important Considerations

- **Sequential Order**: Always track events in proper sequence
- **Active Rounds**: Only works when a round is active from `play`
- **Session Management**: Handle session expiration during event tracking
- **Error Handling**: Implement retry logic for network failures
- **Compliance**: Event tracking may be required for regulatory compliance
- **Performance**: Don't delay game experience waiting for event confirmations

## 📚 See Also

- **[play](play)** - Starting rounds that contain events
- **[endRound](endRound)** - Ending rounds after event tracking
- **[Error Handling](Error-Handling)** - Managing event tracking failures