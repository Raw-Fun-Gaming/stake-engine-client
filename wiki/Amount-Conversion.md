# Amount Conversion

Understanding and working with the amount conversion system used by the Stake Engine Client.

## 🔢 Overview

The Stake Engine Client automatically handles conversion between human-readable dollar amounts and the internal API format used by the RGS system.

## 💱 Conversion Constants

```typescript
import { API_AMOUNT_MULTIPLIER, BOOK_AMOUNT_MULTIPLIER } from 'stake-engine-client';

console.log(API_AMOUNT_MULTIPLIER);   // 1000000
console.log(BOOK_AMOUNT_MULTIPLIER);  // 100
```

## 📊 Format Comparison

| Format | $1.00 | $0.50 | $10.00 | $0.01 |
|--------|-------|-------|--------|-------|
| **Human** | 1.00 | 0.50 | 10.00 | 0.01 |
| **API** | 1000000 | 500000 | 10000000 | 10000 |
| **Book** | 100 | 50 | 1000 | 1 |

## 🔄 Conversion Examples

### Input Conversion (Human → API)

```typescript
import { play, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

// You provide human-readable amounts
const bet = await play({
  currency: 'USD',
  amount: 2.50,    // $2.50 in dollars
  mode: 'base'
});

// Client automatically converts to API format internally:
// 2.50 * 1000000 = 2500000 (sent to RGS)
```

### Output Conversion (API → Human)

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

const balance = await getBalance();

if (balance.status?.statusCode === 'SUCCESS') {
  // Response contains API format
  const apiAmount = balance.balance?.amount; // e.g., 5000000
  
  // Convert to human-readable
  const dollarAmount = (apiAmount || 0) / API_AMOUNT_MULTIPLIER; // 5.00
  
  console.log(`Balance: $${dollarAmount.toFixed(2)}`); // "Balance: $5.00"
}
```

## 💡 Practical Examples

### Display Balance with Proper Formatting

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

async function displayBalance(): Promise<void> {
  const balanceInfo = await getBalance();
  
  if (balanceInfo.status?.statusCode === 'SUCCESS' && balanceInfo.balance) {
    const apiAmount = balanceInfo.balance.amount;
    const currency = balanceInfo.balance.currency;
    
    // Convert API format to display format
    const displayAmount = apiAmount / API_AMOUNT_MULTIPLIER;
    
    // Format for display with proper decimal places
    const formattedAmount = displayAmount.toFixed(2);
    
    console.log(`💰 Balance: $${formattedAmount} ${currency}`);
    
    // Update UI
    document.getElementById('balance-display')!.textContent = 
      `$${formattedAmount} ${currency}`;
  }
}

await displayBalance();
```

### Bet Amount Validation

```typescript
import { API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

function validateBetAmount(
  betAmount: number,
  availableBalance: number,
  minBet: number = 0.01,
  maxBet: number = 1000.00
): { valid: boolean; error?: string } {
  
  // Convert balance from API format for comparison
  const balanceInDollars = availableBalance / API_AMOUNT_MULTIPLIER;
  
  if (betAmount < minBet) {
    return {
      valid: false,
      error: `Minimum bet is $${minBet.toFixed(2)}`
    };
  }
  
  if (betAmount > maxBet) {
    return {
      valid: false,
      error: `Maximum bet is $${maxBet.toFixed(2)}`
    };
  }
  
  if (betAmount > balanceInDollars) {
    return {
      valid: false,
      error: `Insufficient balance. Available: $${balanceInDollars.toFixed(2)}`
    };
  }
  
  return { valid: true };
}

// Usage
const validation = validateBetAmount(5.00, 3000000); // $5 bet, $3 balance
console.log(validation); // { valid: false, error: "Insufficient balance. Available: $3.00" }
```

### Bet History with Conversions

```typescript
import { API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

interface BetRecord {
  roundID: string;
  betAmount: number;      // API format
  payoutAmount: number;   // API format
  multiplier: number;
  timestamp: Date;
}

class BetHistory {
  private history: BetRecord[] = [];
  
  addBet(roundID: string, betAmount: number, payoutAmount: number, multiplier: number): void {
    this.history.push({
      roundID,
      betAmount,
      payoutAmount,
      multiplier,
      timestamp: new Date()
    });
  }
  
  getFormattedHistory(): Array<{
    roundID: string;
    betAmount: string;
    payoutAmount: string;
    multiplier: number;
    profit: string;
    timestamp: string;
  }> {
    return this.history.map(record => {
      const betDollars = record.betAmount / API_AMOUNT_MULTIPLIER;
      const payoutDollars = record.payoutAmount / API_AMOUNT_MULTIPLIER;
      const profitDollars = payoutDollars - betDollars;
      
      return {
        roundID: record.roundID,
        betAmount: `$${betDollars.toFixed(2)}`,
        payoutAmount: `$${payoutDollars.toFixed(2)}`,
        multiplier: record.multiplier,
        profit: `${profitDollars >= 0 ? '+' : ''}$${profitDollars.toFixed(2)}`,
        timestamp: record.timestamp.toLocaleString()
      };
    });
  }
  
  getTotalStats(): {
    totalBet: string;
    totalPayout: string;
    netProfit: string;
    roundsPlayed: number;
  } {
    const totals = this.history.reduce(
      (acc, record) => ({
        bet: acc.bet + record.betAmount,
        payout: acc.payout + record.payoutAmount
      }),
      { bet: 0, payout: 0 }
    );
    
    const totalBetDollars = totals.bet / API_AMOUNT_MULTIPLIER;
    const totalPayoutDollars = totals.payout / API_AMOUNT_MULTIPLIER;
    const netProfitDollars = totalPayoutDollars - totalBetDollars;
    
    return {
      totalBet: `$${totalBetDollars.toFixed(2)}`,
      totalPayout: `$${totalPayoutDollars.toFixed(2)}`,
      netProfit: `${netProfitDollars >= 0 ? '+' : ''}$${netProfitDollars.toFixed(2)}`,
      roundsPlayed: this.history.length
    };
  }
}

// Usage
const betHistory = new BetHistory();
betHistory.addBet('round-123', 1000000, 2500000, 2.5); // $1 bet, $2.50 payout
betHistory.addBet('round-124', 2000000, 0, 0);        // $2 bet, no payout

console.log('Bet History:', betHistory.getFormattedHistory());
console.log('Total Stats:', betHistory.getTotalStats());
```

### Currency Conversion Utility

```typescript
import { API_AMOUNT_MULTIPLIER, BOOK_AMOUNT_MULTIPLIER } from 'stake-engine-client';

class AmountConverter {
  // Human → API
  static toApiFormat(dollarAmount: number): number {
    return Math.round(dollarAmount * API_AMOUNT_MULTIPLIER);
  }
  
  // API → Human
  static fromApiFormat(apiAmount: number): number {
    return apiAmount / API_AMOUNT_MULTIPLIER;
  }
  
  // Human → Book
  static toBookFormat(dollarAmount: number): number {
    return Math.round(dollarAmount * BOOK_AMOUNT_MULTIPLIER);
  }
  
  // Book → Human
  static fromBookFormat(bookAmount: number): number {
    return bookAmount / BOOK_AMOUNT_MULTIPLIER;
  }
  
  // Format for display
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  // Validate amount precision
  static isValidPrecision(amount: number): boolean {
    // Check if amount has more than 2 decimal places
    return Math.round(amount * 100) === amount * 100;
  }
}

// Usage examples
console.log(AmountConverter.toApiFormat(1.50));      // 1500000
console.log(AmountConverter.fromApiFormat(1500000)); // 1.5
console.log(AmountConverter.formatCurrency(1.50));   // "$1.50"
console.log(AmountConverter.isValidPrecision(1.50)); // true
console.log(AmountConverter.isValidPrecision(1.555)); // false
```

### Balance Monitoring with Conversion

```typescript
import { getBalance, API_AMOUNT_MULTIPLIER } from 'stake-engine-client';

class BalanceMonitor {
  private lastBalance: number = 0;
  private currency: string = 'USD';
  
  async checkBalanceChange(): Promise<{
    currentBalance: number;
    change: number;
    formatted: {
      current: string;
      change: string;
    }
  } | null> {
    try {
      const balanceInfo = await getBalance();
      
      if (balanceInfo.status?.statusCode === 'SUCCESS' && balanceInfo.balance) {
        // Convert from API format
        const currentBalance = balanceInfo.balance.amount / API_AMOUNT_MULTIPLIER;
        const change = currentBalance - this.lastBalance;
        this.currency = balanceInfo.balance.currency;
        
        const result = {
          currentBalance,
          change,
          formatted: {
            current: this.formatAmount(currentBalance),
            change: this.formatChange(change)
          }
        };
        
        this.lastBalance = currentBalance;
        return result;
      }
      
    } catch (error) {
      console.error('Balance check failed:', error);
    }
    
    return null;
  }
  
  private formatAmount(amount: number): string {
    return `$${amount.toFixed(2)} ${this.currency}`;
  }
  
  private formatChange(change: number): string {
    if (change === 0) return 'No change';
    const sign = change > 0 ? '+' : '';
    return `${sign}$${change.toFixed(2)}`;
  }
}

// Usage
const monitor = new BalanceMonitor();
const balanceChange = await monitor.checkBalanceChange();

if (balanceChange) {
  console.log('Current:', balanceChange.formatted.current);
  console.log('Change:', balanceChange.formatted.change);
}
```

## 🎯 Best Practices

### 1. Always Convert for Display
```typescript
// ✅ Good
const displayAmount = apiAmount / API_AMOUNT_MULTIPLIER;
console.log(`$${displayAmount.toFixed(2)}`);

// ❌ Bad
console.log(`$${apiAmount}`); // Shows 1000000 instead of 1.00
```

### 2. Validate Input Precision
```typescript
// ✅ Good
function validateAmount(amount: number): boolean {
  return Math.round(amount * 100) === amount * 100;
}

// ❌ Bad
// Allowing amounts like 1.555 which cause precision issues
```

### 3. Use Proper Rounding
```typescript
// ✅ Good
const apiAmount = Math.round(dollarAmount * API_AMOUNT_MULTIPLIER);

// ❌ Bad
const apiAmount = dollarAmount * API_AMOUNT_MULTIPLIER; // May have floating point errors
```

### 4. Handle Edge Cases
```typescript
// ✅ Good
const displayAmount = (apiAmount || 0) / API_AMOUNT_MULTIPLIER;

// ❌ Bad
const displayAmount = apiAmount / API_AMOUNT_MULTIPLIER; // Crashes if apiAmount is null
```

## ⚠️ Common Pitfalls

### Floating Point Precision
```typescript
// ❌ Problem
0.1 + 0.2 === 0.3 // false in JavaScript

// ✅ Solution
Math.round((0.1 + 0.2) * 100) / 100 === 0.3 // true
```

### Missing Conversions
```typescript
// ❌ Problem - Displaying raw API amounts
console.log(`Balance: ${balance.amount}`); // Shows "1000000"

// ✅ Solution - Always convert for display
const displayAmount = balance.amount / API_AMOUNT_MULTIPLIER;
console.log(`Balance: $${displayAmount.toFixed(2)}`); // Shows "$1.00"
```

### Incorrect Multipliers
```typescript
// ❌ Problem - Using wrong multiplier
const converted = amount / 100; // Should be 1000000

// ✅ Solution - Use constants
const converted = amount / API_AMOUNT_MULTIPLIER;
```

## 🔗 Related Pages

- **[play](play)** - Automatic amount conversion in betting
- **[getBalance](getBalance)** - Converting balance responses
- **[Error Handling](Error-Handling)** - Handling conversion errors
- **[Usage Patterns](Usage-Patterns)** - Real-world conversion examples