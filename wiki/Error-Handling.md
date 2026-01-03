# Error Handling

Comprehensive guide to handling errors and edge cases when using the Stake Engine Client.

## 🔍 Overview

The Stake Engine Client uses a consistent error handling pattern across all functions. Every response includes a `status` object with a `statusCode` and optional `statusMessage` for detailed error information.

## 📊 Error Response Structure

```typescript
interface ErrorResponse {
  status?: {
    statusCode: StatusCode;
    statusMessage?: string;
  };
  // ... other response properties
}
```

## 🚨 Common Status Codes

### Success Codes
| Code | Description | Action |
|------|-------------|--------|
| `SUCCESS` | Operation completed successfully | Continue normal flow |

### Authentication Errors
| Code | Description | Action |
|------|-------------|--------|
| `ERR_IS` | Invalid session or session timeout | Re-authenticate user |
| `ERR_ATE` | Authentication failed/expired | Check credentials, re-authenticate |

### Balance & Betting Errors
| Code | Description | Action |
|------|-------------|--------|
| `ERR_IPB` | Insufficient player balance | Show balance error, suggest deposit |
| `ERR_GLE` | Gambling limits exceeded | Show limit message, suggest lower bet |
| `ERR_BNF` | Bet not found/No active round | Check game state, may be normal |

### System Errors
| Code | Description | Action |
|------|-------------|--------|
| `ERR_UE` | Unknown server error | Retry operation, contact support if persistent |

## 💡 Error Handling Patterns

### Basic Error Checking

```typescript
import { play } from 'stake-engine-client';

const bet = await play({
  currency: 'USD',
  amount: 1.00,
  mode: 'base'
});

// Always check status code
if (bet.status?.statusCode === 'SUCCESS') {
  // Handle success
  console.log('✅ Bet placed successfully');
  console.log('Round ID:', bet.round?.roundID);
} else {
  // Handle error
  console.error('❌ Bet failed:', bet.status?.statusMessage);
}
```

### Comprehensive Error Handler

```typescript
import { StatusCode } from 'stake-engine-client';

interface ApiResponse {
  status?: {
    statusCode: StatusCode;
    statusMessage?: string;
  };
}

class ErrorHandler {
  static handle(response: ApiResponse, operation: string): boolean {
    if (!response.status) {
      console.error(`❌ ${operation}: No status in response`);
      return false;
    }
    
    const { statusCode, statusMessage } = response.status;
    
    switch (statusCode) {
      case 'SUCCESS':
        return true;
        
      case 'ERR_IS':
        console.error(`🔐 ${operation}: Session expired - please re-authenticate`);
        this.redirectToLogin();
        break;
        
      case 'ERR_ATE':
        console.error(`🔐 ${operation}: Authentication failed`);
        this.redirectToLogin();
        break;
        
      case 'ERR_IPB':
        console.error(`💰 ${operation}: Insufficient balance`);
        this.showBalanceError();
        break;
        
      case 'ERR_GLE':
        console.error(`🚫 ${operation}: Gambling limits exceeded`);
        this.showLimitError();
        break;
        
      case 'ERR_BNF':
        console.warn(`⚠️ ${operation}: No active round found`);
        // This might be normal depending on context
        break;
        
      case 'ERR_UE':
        console.error(`🔧 ${operation}: Server error`);
        this.showRetryOption(operation);
        break;
        
      default:
        console.error(`❓ ${operation}: Unknown error - ${statusCode}: ${statusMessage}`);
        this.showGenericError(statusMessage);
    }
    
    return false;
  }
  
  private static redirectToLogin(): void {
    // Implement login redirect logic
    console.log('Redirecting to login...');
  }
  
  private static showBalanceError(): void {
    // Show insufficient balance UI
    console.log('Showing balance error dialog...');
  }
  
  private static showLimitError(): void {
    // Show gambling limits UI
    console.log('Showing limits error dialog...');
  }
  
  private static showRetryOption(operation: string): void {
    // Show retry option for server errors
    console.log(`Showing retry option for ${operation}...`);
  }
  
  private static showGenericError(message?: string): void {
    // Show generic error message
    console.log('Showing generic error:', message);
  }
}

// Usage
import { authenticate } from 'stake-engine-client';

const auth = await authenticate();
const success = ErrorHandler.handle(auth, 'Authentication');

if (success) {
  console.log('✅ Authentication successful');
  // Continue with game logic
}
```

### Retry Logic for Network Errors

```typescript
import { getBalance } from 'stake-engine-client';

async function requestWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      console.log(`✅ Operation succeeded on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        console.log(`🔄 Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
  }
  
  console.error(`❌ Operation failed after ${maxRetries} attempts:`, lastError?.message);
  return null;
}

// Usage with balance check
const balance = await requestWithRetry(
  () => getBalance(),
  3,
  1000
);

if (balance?.status?.statusCode === 'SUCCESS') {
  console.log('Balance retrieved successfully');
} else {
  console.error('Failed to get balance after retries');
}
```

### Session Management

```typescript
import { authenticate, play } from 'stake-engine-client';

class SessionManager {
  private static sessionValid: boolean = false;
  private static lastAuthTime: number = 0;
  private static SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  
  static async ensureValidSession(): Promise<boolean> {
    const now = Date.now();
    
    // Check if session is recent enough
    if (this.sessionValid && (now - this.lastAuthTime) < this.SESSION_TIMEOUT) {
      return true;
    }
    
    try {
      console.log('🔐 Refreshing session...');
      const auth = await authenticate();
      
      if (auth.status?.statusCode === 'SUCCESS') {
        this.sessionValid = true;
        this.lastAuthTime = now;
        console.log('✅ Session refreshed successfully');
        return true;
      } else {
        console.error('❌ Session refresh failed:', auth.status?.statusMessage);
        this.sessionValid = false;
        return false;
      }
      
    } catch (error) {
      console.error('❌ Session refresh error:', error);
      this.sessionValid = false;
      return false;
    }
  }
  
  static async executeWithSession<T>(
    operation: () => Promise<T>
  ): Promise<T | null> {
    // Ensure valid session first
    if (!await this.ensureValidSession()) {
      console.error('❌ Cannot execute operation - invalid session');
      return null;
    }
    
    try {
      const result = await operation();
      
      // Check if operation succeeded
      if (result && (result as any).status?.statusCode === 'SUCCESS') {
        return result;
      }
      
      // Check for session-related errors
      if ((result as any).status?.statusCode === 'ERR_IS') {
        console.log('🔄 Session expired during operation, retrying...');
        this.sessionValid = false;
        
        // Retry once after refreshing session
        if (await this.ensureValidSession()) {
          return await operation();
        }
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Operation failed:', error);
      return null;
    }
  }
  
  static invalidateSession(): void {
    this.sessionValid = false;
    this.lastAuthTime = 0;
  }
}

// Usage
const bet = await SessionManager.executeWithSession(() => 
  play({
    currency: 'USD',
    amount: 1.00,
    mode: 'base'
  })
);

if (bet?.status?.statusCode === 'SUCCESS') {
  console.log('✅ Bet placed with valid session');
}
```

### Error Boundary for React Applications

```typescript
import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class StakeEngineErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Stake Engine Client Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }
  
  private reportError(error: Error, errorInfo: React.ErrorInfo): void {
    // Send error to monitoring service
    console.log('Reporting error to monitoring service...');
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className=\"error-boundary\">
          <h2>🚨 Game Error</h2>
          <p>Something went wrong with the game client.</p>
          <button onClick={() => window.location.reload()}>
            Reload Game
          </button>
          <details>
            <summary>Error Details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage in React app
function App() {
  return (
    <StakeEngineErrorBoundary>
      <GameComponent />
    </StakeEngineErrorBoundary>
  );
}
```

### Parameter Validation

```typescript
import { play } from 'stake-engine-client';

class ParameterValidator {
  static validateBetParams(params: {
    currency?: string;
    amount?: number;
    mode?: string;
    sessionID?: string;
    rgsUrl?: string;
  }): string[] {
    const errors: string[] = [];
    
    // Required parameters when not using URL fallback
    if (!params.currency) {
      errors.push('Currency is required');
    } else if (!/^[A-Z]{3}$/.test(params.currency)) {
      errors.push('Currency must be 3-letter code (e.g., USD, EUR)');
    }
    
    if (params.amount === undefined || params.amount === null) {
      errors.push('Amount is required');
    } else if (params.amount <= 0) {
      errors.push('Amount must be greater than 0');
    } else if (params.amount > 10000) {
      errors.push('Amount too large (max: $10,000)');
    }
    
    if (!params.mode) {
      errors.push('Mode is required');
    } else if (!/^[a-z]+$/.test(params.mode)) {
      errors.push('Mode must be lowercase letters only');
    }
    
    // Validate URL parameters if provided
    if (params.rgsUrl && !/^[a-zA-Z0-9.-]+$/.test(params.rgsUrl)) {
      errors.push('Invalid RGS URL format');
    }
    
    if (params.sessionID && params.sessionID.length < 10) {
      errors.push('Session ID too short (minimum 10 characters)');
    }
    
    return errors;
  }
  
  static async validateAndExecuteBet(params: any): Promise<any> {
    const validationErrors = this.validateBetParams(params);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:');
      validationErrors.forEach(error => console.error(`  - ${error}`));
      return {
        status: {
          statusCode: 'VALIDATION_ERROR',
          statusMessage: validationErrors.join(', ')
        }
      };
    }
    
    try {
      return await play(params);
    } catch (error) {
      console.error('❌ Bet execution error:', error);
      return {
        status: {
          statusCode: 'EXECUTION_ERROR',
          statusMessage: (error as Error).message
        }
      };
    }
  }
}

// Usage
const betResult = await ParameterValidator.validateAndExecuteBet({
  currency: 'USD',
  amount: 1.00,
  mode: 'base'
});

if (betResult.status?.statusCode === 'SUCCESS') {
  console.log('✅ Bet placed successfully');
} else {
  console.error('❌ Bet failed:', betResult.status?.statusMessage);
}
```

## 🎯 Best Practices

### 1. Always Check Status Codes
```typescript
// ✅ Good
if (response.status?.statusCode === 'SUCCESS') {
  // Process success
} else {
  // Handle error
}

// ❌ Bad
if (response.balance) {
  // Assuming success based on data presence
}
```

### 2. Handle Session Expiration
```typescript
// ✅ Good
if (response.status?.statusCode === 'ERR_IS') {
  await reauthenticate();
  // Retry operation
}

// ❌ Bad
// Ignoring session errors
```

### 3. Implement Proper Retry Logic
```typescript
// ✅ Good
async function operationWithRetry() {
  for (let i = 0; i < 3; i++) {
    try {
      return await someOperation();
    } catch (error) {
      if (i === 2) throw error;
      await delay(1000 * Math.pow(2, i));
    }
  }
}

// ❌ Bad
// No retry for transient failures
```

### 4. Provide User-Friendly Messages
```typescript
// ✅ Good
function getErrorMessage(statusCode: string): string {
  const messages = {
    'ERR_IPB': 'You don\\'t have enough balance for this bet.',
    'ERR_GLE': 'This bet exceeds your gambling limits.',
    'ERR_IS': 'Your session has expired. Please log in again.'
  };
  return messages[statusCode] || 'An unexpected error occurred.';
}

// ❌ Bad
// Showing raw error codes to users
```

## 🔗 Related Pages

- **[Status Codes](Status-Codes)** - Complete reference of all status codes
- **[Common Issues](Common-Issues)** - Solutions to frequent problems
- **[Debug Guide](Debug-Guide)** - Debugging tips and tools
- **[Getting Started](Getting-Started)** - Basic setup and error prevention