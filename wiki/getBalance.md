# getBalance

Get the current player balance information. This function can be called anytime to retrieve up-to-date balance data.

## 📋 Syntax

```typescript
getBalance(options?: BalanceOptions): Promise<BalanceResponse>
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

Returns a Promise that resolves to a `BalanceResponse` object:

```typescript
interface BalanceResponse {
  balance?: BalanceObject;        // Current player balance
  status?: {                      // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
}
```

### Response Properties

- **`balance`** - Current balance information
  - `amount`: Balance amount (in API format - divide by API_AMOUNT_MULTIPLIER for display)
  - `currency`: Currency code (e.g., 'USD', 'EUR')

## 💡 Examples

### Basic Balance Check (Browser with URL params)

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

// URL: https://game.com/play?sessionID=player-123&rgs_url=api.stakeengine.com
const balanceInfo = await getBalance();

if (balanceInfo.status?.statusCode === 'SUCCESS') {
  const balanceInDollars = (balanceInfo.balance?.amount || 0) / API_AMOUNT_MULTIPLIER;
  console.log(`💰 Current balance: $${balanceInDollars.toFixed(2)}`);
  console.log(`💱 Currency: ${balanceInfo.balance?.currency}`);
} else {
  console.error('❌ Failed to get balance:', balanceInfo.status?.statusMessage);
}
```

### With Explicit Configuration

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

const balanceInfo = await getBalance({
  sessionID: 'player-session-123',
  rgsUrl: 'api.stakeengine.com'
});

if (balanceInfo.balance) {
  const displayBalance = balanceInfo.balance.amount / API_AMOUNT_MULTIPLIER;
  console.log(`Balance: $${displayBalance.toFixed(2)} ${balanceInfo.balance.currency}`);
}
```

### Balance Check with Error Handling

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

async function checkPlayerBalance(): Promise<number | null> {
  try {
    const balanceInfo = await getBalance();
    
    switch (balanceInfo.status?.statusCode) {
      case 'SUCCESS':
        const balance = (balanceInfo.balance?.amount || 0) / API_AMOUNT_MULTIPLIER;
        console.log(`✅ Balance retrieved: $${balance.toFixed(2)}`);
        return balance;
        
      case 'ERR_IS':
        console.error('❌ Session expired - need to re-authenticate');
        // Redirect to authentication
        break;
        
      case 'ERR_UE':
        console.error('❌ Server error getting balance');
        // Retry or show error message
        break;
        
      default:
        console.error('❌ Balance check failed:', balanceInfo.status?.statusMessage);
    }
    
  } catch (error) {
    console.error('Network error checking balance:', error);
  }
  
  return null;
}

const currentBalance = await checkPlayerBalance();
```

### Balance Monitoring System

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

class BalanceMonitor {
  private lastKnownBalance: number = 0;
  private currency: string = 'USD';
  
  async updateBalance(): Promise<boolean> {
    try {
      const balanceInfo = await getBalance();
      
      if (balanceInfo.status?.statusCode === 'SUCCESS' && balanceInfo.balance) {
        const newBalance = balanceInfo.balance.amount / API_AMOUNT_MULTIPLIER;
        const balanceChanged = newBalance !== this.lastKnownBalance;
        
        if (balanceChanged) {
          const difference = newBalance - this.lastKnownBalance;
          console.log(`💰 Balance changed: ${difference >= 0 ? '+' : ''}$${difference.toFixed(2)}`);
          console.log(`💳 New balance: $${newBalance.toFixed(2)}`);
          
          this.lastKnownBalance = newBalance;
          this.currency = balanceInfo.balance.currency;
          
          // Trigger UI update
          this.onBalanceChanged(newBalance, this.currency);
        }
        
        return true;
      }
      
    } catch (error) {
      console.error('Balance update failed:', error);
    }
    
    return false;
  }
  
  private onBalanceChanged(balance: number, currency: string): void {
    // Update UI elements
    document.getElementById('balance-display')!.textContent = 
      `$${balance.toFixed(2)} ${currency}`;
    
    // Check for low balance warning
    if (balance < 1.0) {
      this.showLowBalanceWarning();
    }
  }
  
  private showLowBalanceWarning(): void {
    console.warn('⚠️ Low balance warning');
    // Show low balance notification
  }
  
  getCurrentBalance(): number {
    return this.lastKnownBalance;
  }
  
  getCurrency(): string {
    return this.currency;
  }
}

// Usage
const balanceMonitor = new BalanceMonitor();
await balanceMonitor.updateBalance();

// Check balance every 30 seconds
setInterval(() => {
  balanceMonitor.updateBalance();
}, 30000);
```

### Balance Validation Before Betting

```typescript
import { getBalance, play, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

async function placeBetWithValidation(betAmount: number): Promise<boolean> {
  // Check balance first
  const balanceInfo = await getBalance();
  
  if (balanceInfo.status?.statusCode !== 'SUCCESS') {
    console.error('❌ Cannot check balance before betting');
    return false;
  }
  
  const currentBalance = (balanceInfo.balance?.amount || 0) / API_AMOUNT_MULTIPLIER;
  
  if (currentBalance < betAmount) {
    console.error(`❌ Insufficient balance: $${currentBalance.toFixed(2)} < $${betAmount.toFixed(2)}`);
    return false;
  }
  
  console.log(`✅ Balance check passed: $${currentBalance.toFixed(2)} >= $${betAmount.toFixed(2)}`);
  
  // Proceed with bet
  const bet = await play({
    currency: 'USD',
    amount: betAmount,
    mode: 'base'
  });
  
  return bet.status?.statusCode === 'SUCCESS';
}

// Validate and place bet
const betSuccessful = await placeBetWithValidation(2.50);
```

### Periodic Balance Updates

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

class GameBalanceManager {
  private balanceUpdateInterval: NodeJS.Timeout | null = null;
  private onBalanceUpdate?: (balance: number, currency: string) => void;
  
  startBalanceUpdates(callback: (balance: number, currency: string) => void, intervalMs: number = 5000): void {
    this.onBalanceUpdate = callback;
    
    // Initial balance check
    this.checkBalance();
    
    // Set up periodic updates
    this.balanceUpdateInterval = setInterval(() => {
      this.checkBalance();
    }, intervalMs);
    
    console.log(`🔄 Balance updates started (every ${intervalMs/1000}s)`);
  }
  
  stopBalanceUpdates(): void {
    if (this.balanceUpdateInterval) {
      clearInterval(this.balanceUpdateInterval);
      this.balanceUpdateInterval = null;
      console.log('⏹️ Balance updates stopped');
    }
  }
  
  private async checkBalance(): Promise<void> {
    try {
      const balanceInfo = await getBalance();
      
      if (balanceInfo.status?.statusCode === 'SUCCESS' && balanceInfo.balance) {
        const balance = balanceInfo.balance.amount / API_AMOUNT_MULTIPLIER;
        const currency = balanceInfo.balance.currency;
        
        this.onBalanceUpdate?.(balance, currency);
      }
      
    } catch (error) {
      console.error('Periodic balance check failed:', error);
    }
  }
}

// Usage
const balanceManager = new GameBalanceManager();

balanceManager.startBalanceUpdates((balance, currency) => {
  console.log(`💰 Balance: $${balance.toFixed(2)} ${currency}`);
  
  // Update UI
  document.getElementById('balance')!.textContent = `$${balance.toFixed(2)}`;
}, 10000); // Update every 10 seconds

// Stop updates when game ends
// balanceManager.stopBalanceUpdates();
```

## ⚠️ Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|---------|
| `SUCCESS` | Balance retrieved successfully | Use balance data |
| `ERR_IS` | Invalid session or timeout | Re-authenticate |
| `ERR_UE` | Unknown server error | Retry or contact support |

## 🎯 Best Practices

1. **Check balance before betting** to prevent insufficient fund errors
2. **Handle session expiration** gracefully during balance checks
3. **Convert amounts properly** for display (divide by API_AMOUNT_MULTIPLIER)
4. **Cache balance locally** but refresh periodically
5. **Implement retry logic** for network failures
6. **Show loading states** during balance retrieval
7. **Update UI immediately** when balance changes

## 🔗 Related Functions

- **[authenticate](authenticate)** - Initial balance is included in auth response
- **[play](play)** - Updates balance after betting
- **[endRound](endRound)** - Final balance after round completion

## 🛠️ Implementation Notes

- Balance amounts are returned in API format (multiply by 1,000,000 for $1.00)
- Use `API_AMOUNT_MULTIPLIER` constant for proper conversion
- Session tokens can expire - handle `ERR_IS` appropriately
- This function can be called frequently for real-time balance updates
- Balance reflects all completed transactions and game outcomes
- Currency information is included in the response

## ⚠️ Important Considerations

- **Amount Format**: Always convert API amounts for user display
- **Session Management**: Handle expired sessions gracefully
- **Rate Limiting**: Don't call too frequently (recommended: every 5-10 seconds max)
- **Error Handling**: Implement proper fallbacks for network issues
- **UI Updates**: Keep balance display in sync with actual balance

## 📚 See Also

- **[Amount Conversion](Amount-Conversion)** - Understanding format conversions
- **[Error Handling](Error-Handling)** - Complete guide to handling errors
- **[Usage Patterns](Usage-Patterns)** - Real-world balance management examples