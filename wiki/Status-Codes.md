# Status Codes

Complete reference of all RGS status codes returned by the Stake Engine Client functions.

## 📋 Overview

All Stake Engine Client functions return a consistent status structure:

```typescript
interface Status {
  statusCode: StatusCode;
  statusMessage?: string;
}
```

## ✅ Success Codes

| Code | Description | Functions | Meaning |
|------|-------------|-----------|---------|
| `SUCCESS` | Operation completed successfully | All functions | Continue normal flow |

## 🔐 Authentication & Session Codes

| Code | Description | Common Causes | Recommended Action |
|------|-------------|---------------|-------------------|
| `ERR_IS` | Invalid session or session timeout | • Session expired<br>• Invalid sessionID<br>• Server restart | • Re-authenticate user<br>• Redirect to login<br>• Refresh session token |
| `ERR_ATE` | Authentication failed/expired | • Invalid credentials<br>• Account disabled<br>• Token corruption | • Check credentials<br>• Re-authenticate<br>• Contact support if persistent |

## 💰 Balance & Financial Codes

| Code | Description | Common Causes | Recommended Action |
|------|-------------|---------------|-------------------|
| `ERR_IPB` | Insufficient player balance | • Balance lower than bet<br>• Concurrent transactions<br>• Balance sync issues | • Show current balance<br>• Suggest smaller bet<br>• Offer deposit option |
| `ERR_GLE` | Gambling limits exceeded | • Daily limit reached<br>• Session limit exceeded<br>• Regulatory limits | • Show limit details<br>• Suggest lower bet<br>• Display time until reset |

## 🎲 Game & Betting Codes

| Code | Description | Common Causes | Recommended Action |
|------|-------------|---------------|-------------------|
| `ERR_BNF` | Bet not found / No active round | • No round active<br>• Round already ended<br>• Invalid round state | • Check game state<br>• Start new round<br>• Often normal for end operations |

## 🔧 System & Server Codes

| Code | Description | Common Causes | Recommended Action |
|------|-------------|---------------|-------------------|
| `ERR_UE` | Unknown server error | • Internal server error<br>• Database issues<br>• Service unavailable | • Retry operation<br>• Show generic error<br>• Contact support if persistent |

## 📊 Status Code Usage by Function

### authenticate
| Status Code | Probability | Meaning |
|-------------|-------------|---------|
| `SUCCESS` | 95%+ | Authentication successful |
| `ERR_IS` | 3% | Invalid/expired session |
| `ERR_ATE` | 1% | Authentication failed |
| `ERR_UE` | <1% | Server error |

### play
| Status Code | Probability | Meaning |
|-------------|-------------|---------|
| `SUCCESS` | 85%+ | Bet placed successfully |
| `ERR_IPB` | 10% | Insufficient balance |
| `ERR_IS` | 3% | Session expired |
| `ERR_GLE` | 1% | Gambling limits exceeded |
| `ERR_UE` | <1% | Server error |

### endRound
| Status Code | Probability | Meaning |
|-------------|-------------|---------|
| `SUCCESS` | 90%+ | Round ended successfully |
| `ERR_BNF` | 8% | No active round (often normal) |
| `ERR_IS` | 1% | Session expired |
| `ERR_UE` | <1% | Server error |

### getBalance
| Status Code | Probability | Meaning |
|-------------|-------------|---------|
| `SUCCESS` | 95%+ | Balance retrieved successfully |
| `ERR_IS` | 4% | Session expired |
| `ERR_UE` | <1% | Server error |

### endEvent
| Status Code | Probability | Meaning |
|-------------|-------------|---------|
| `SUCCESS` | 90%+ | Event tracked successfully |
| `ERR_BNF` | 7% | No active round |
| `ERR_IS` | 2% | Session expired |
| `ERR_UE` | <1% | Server error |

### forceResult
| Status Code | Probability | Meaning |
|-------------|-------------|---------|
| `SUCCESS` | 95%+ | Search completed |
| `ERR_UE` | 5% | Search failed or no results |

## 🎯 Error Handling Strategies

### High Priority (Immediate Action Required)
```typescript
const highPriorityErrors = [
  'ERR_IS',   // Session expired - redirect to login
  'ERR_ATE',  // Authentication failed - re-authenticate
  'ERR_IPB'   // Insufficient balance - show balance error
];
```

### Medium Priority (User Notification)
```typescript
const mediumPriorityErrors = [
  'ERR_GLE',  // Gambling limits - show limits message
  'ERR_UE'    // Server error - show retry option
];
```

### Low Priority (Often Normal)
```typescript
const lowPriorityErrors = [
  'ERR_BNF'   // No active round - may be expected
];
```

## 💡 Status Code Examples

### Handling Success
```typescript
if (response.status?.statusCode === 'SUCCESS') {
  console.log('✅ Operation successful');
  // Process response data
  processSuccess(response);
}
```

### Handling Authentication Errors
```typescript
switch (response.status?.statusCode) {
  case 'ERR_IS':
    console.log('🔐 Session expired');
    redirectToLogin();
    break;
    
  case 'ERR_ATE':
    console.log('🚫 Authentication failed');
    showAuthenticationError();
    break;
}
```

### Handling Financial Errors
```typescript
switch (response.status?.statusCode) {
  case 'ERR_IPB':
    console.log('💰 Insufficient balance');
    showBalanceError(currentBalance);
    break;
    
  case 'ERR_GLE':
    console.log('🚫 Gambling limits exceeded');
    showLimitsError(dailyLimit, sessionLimit);
    break;
}
```

### Handling System Errors
```typescript
switch (response.status?.statusCode) {
  case 'ERR_UE':
    console.log('🔧 Server error');
    showRetryDialog();
    break;
    
  case 'ERR_BNF':
    console.log('⚠️ No active round');
    // This might be normal - check context
    if (expectingActiveRound) {
      showRoundStateError();
    }
    break;
}
```

## 📈 Error Analytics

### Tracking Error Rates
```typescript
class ErrorAnalytics {
  private static errorCounts: Map<string, number> = new Map();
  private static totalRequests: number = 0;
  
  static trackError(statusCode: string): void {
    this.errorCounts.set(
      statusCode,
      (this.errorCounts.get(statusCode) || 0) + 1
    );
    this.totalRequests++;
  }
  
  static getErrorRate(statusCode: string): number {
    const count = this.errorCounts.get(statusCode) || 0;
    return this.totalRequests > 0 ? (count / this.totalRequests) * 100 : 0;
  }
  
  static getTopErrors(): Array<{code: string, rate: number}> {
    return Array.from(this.errorCounts.entries())
      .map(([code, count]) => ({
        code,
        rate: (count / this.totalRequests) * 100
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
  }
}

// Usage
ErrorAnalytics.trackError('ERR_IPB');
console.log('Error rates:', ErrorAnalytics.getTopErrors());
```

## 🔍 Debugging Status Codes

### Status Code Logger
```typescript
class StatusLogger {
  static log(
    functionName: string,
    statusCode: string,
    statusMessage?: string,
    context?: any
  ): void {
    const timestamp = new Date().toISOString();
    const level = this.getLogLevel(statusCode);
    
    console[level](`[${timestamp}] ${functionName}: ${statusCode}`, {
      message: statusMessage,
      context: context
    });
  }
  
  private static getLogLevel(statusCode: string): 'log' | 'warn' | 'error' {
    if (statusCode === 'SUCCESS') return 'log';
    if (statusCode === 'ERR_BNF') return 'warn';
    return 'error';
  }
}

// Usage in functions
const bet = await play({ currency: 'USD', amount: 1.00, mode: 'base' });
StatusLogger.log('play', bet.status?.statusCode || 'NO_STATUS', bet.status?.statusMessage, { amount: 1.00 });
```

## 🎯 Best Practices

### 1. Always Check Status Codes
```typescript
// ✅ Good
if (response.status?.statusCode === 'SUCCESS') {
  // Handle success
} else {
  // Handle specific error
}

// ❌ Bad
if (response.data) {
  // Assuming success based on data
}
```

### 2. Handle Expected vs Unexpected Errors
```typescript
// ✅ Good - Handle expected errors specifically
switch (response.status?.statusCode) {
  case 'SUCCESS':
    handleSuccess();
    break;
  case 'ERR_IPB':
    handleInsufficientBalance();
    break;
  case 'ERR_IS':
    handleSessionExpired();
    break;
  default:
    handleUnexpectedError(response.status?.statusCode);
}

// ❌ Bad - Generic error handling only
if (response.status?.statusCode !== 'SUCCESS') {
  showGenericError();
}
```

### 3. Provide Context-Appropriate Messages
```typescript
// ✅ Good
function getErrorMessage(statusCode: string, context: string): string {
  const messages = {
    betting: {
      'ERR_IPB': 'You need more balance to place this bet',
      'ERR_GLE': 'This bet exceeds your daily limit'
    },
    authentication: {
      'ERR_IS': 'Please log in again to continue',
      'ERR_ATE': 'Login failed - please check your credentials'
    }
  };
  return messages[context]?.[statusCode] || 'An error occurred';
}
```

### 4. Log Errors for Monitoring
```typescript
// ✅ Good
if (response.status?.statusCode !== 'SUCCESS') {
  console.error('RGS Error:', {
    function: 'play',
    statusCode: response.status.statusCode,
    statusMessage: response.status.statusMessage,
    timestamp: new Date().toISOString()
  });
}
```

## 🔗 Related Pages

- **[Error Handling](Error-Handling)** - Comprehensive error handling guide
- **[Common Issues](Common-Issues)** - Solutions to frequent problems
- **[Debug Guide](Debug-Guide)** - Debugging tips and tools
- **[Getting Started](Getting-Started)** - Basic setup and error prevention