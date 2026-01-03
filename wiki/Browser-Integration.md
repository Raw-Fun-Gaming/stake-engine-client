# Browser Integration

Guide for integrating the Stake Engine Client into browser-based games and web applications.

## Overview

The client is designed for browser environments with automatic URL parameter detection, making integration simple for games launched from the Stake Engine platform.

## Automatic Configuration

When Stake Engine launches your game, it provides configuration via URL parameters:

```
https://your-game.com/?sessionID=abc123&rgs_url=rgs.stake-engine.com&lang=en&currency=USD
```

The client automatically reads these parameters:

```typescript
import { authenticate, play } from 'stake-engine-client';

// No configuration needed - reads from URL automatically
const auth = await authenticate();

const bet = await play({
  amount: 1.00,
  mode: 'base'
  // sessionID, rgsUrl, currency all from URL
});
```

See [URL Parameters](URL-Parameters) for complete details.

## HTML Setup

Basic HTML structure for a game:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Game</title>
</head>
<body>
  <div id="game-container">
    <div id="balance">Loading...</div>
    <button id="bet-button">Place Bet ($1.00)</button>
  </div>

  <script type="module">
    import { authenticate, play } from 'https://esm.sh/stake-engine-client';

    // Initialize game
    async function init() {
      const auth = await authenticate();
      document.getElementById('balance').textContent =
        `Balance: $${(auth.balance?.amount || 0) / 1000000}`;
    }

    document.getElementById('bet-button').addEventListener('click', async () => {
      const bet = await play({ amount: 1.00, mode: 'base' });
      console.log('Bet placed:', bet);
    });

    init();
  </script>
</body>
</html>
```

## Module Bundler Integration

### Vite

```typescript
// src/main.ts
import { authenticate, play } from 'stake-engine-client';

async function initGame() {
  const auth = await authenticate();
  console.log('Authenticated:', auth.balance?.amount);
}

initGame();
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'game.js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'game.js',
    path: __dirname + '/dist'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      }
    ]
  }
};
```

## Framework Integration

### React

```typescript
import { useEffect, useState } from 'react';
import { authenticate, play } from 'stake-engine-client';
import type { components } from 'stake-engine-client';

function Game() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const auth = await authenticate();
      setBalance(auth.balance?.amount || 0);
    }
    init();
  }, []);

  async function handleBet() {
    setIsLoading(true);
    try {
      const bet = await play({ amount: 1.00, mode: 'base' });
      setBalance(bet.balance?.amount || 0);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div>Balance: ${balance / 1000000}</div>
      <button onClick={handleBet} disabled={isLoading}>
        Place Bet
      </button>
    </div>
  );
}
```

### Vue

```vue
<template>
  <div>
    <div>Balance: ${{ balance / 1000000 }}</div>
    <button @click="placeBet" :disabled="isLoading">
      Place Bet ($1.00)
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authenticate, play } from 'stake-engine-client';

const balance = ref(0);
const isLoading = ref(false);

onMounted(async () => {
  const auth = await authenticate();
  balance.value = auth.balance?.amount || 0;
});

async function placeBet() {
  isLoading.value = true;
  try {
    const bet = await play({ amount: 1.00, mode: 'base' });
    balance.value = bet.balance?.amount || 0;
  } finally {
    isLoading.value = false;
  }
}
</script>
```

### Svelte

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { authenticate, play } from 'stake-engine-client';

  let balance = 0;
  let isLoading = false;

  onMount(async () => {
    const auth = await authenticate();
    balance = auth.balance?.amount || 0;
  });

  async function placeBet() {
    isLoading = true;
    try {
      const bet = await play({ amount: 1.00, mode: 'base' });
      balance = bet.balance?.amount || 0;
    } finally {
      isLoading = false;
    }
  }
</script>

<div>
  <div>Balance: ${balance / 1000000}</div>
  <button on:click={placeBet} disabled={isLoading}>
    Place Bet ($1.00)
  </button>
</div>
```

## CDN Usage

For quick prototyping without a build step:

```html
<script type="module">
  import {
    authenticate,
    play,
    endRound
  } from 'https://esm.sh/stake-engine-client';

  window.StakeEngine = {
    authenticate: authenticate,
    bet: play,
    endRound: endRound
  };
</script>

<script>
  // Use globally
  StakeEngine.authenticate().then(auth => {
    console.log('Balance:', auth.balance?.amount);
  });
</script>
```

## Error Handling

Handle network errors and session expiration:

```typescript
import { play } from 'stake-engine-client';

async function placeBet() {
  try {
    const response = await play({ amount: 1.00, mode: 'base' });

    if (response.status?.statusCode === 'ERR_IS') {
      // Session expired - reload page
      alert('Session expired. Please reload the game.');
      window.location.reload();
      return;
    }

    if (response.status?.statusCode !== 'SUCCESS') {
      alert(response.status?.statusMessage || 'Bet failed');
      return;
    }

    // Success
    showWinAnimation(response.round);
  } catch (error) {
    // Network error
    console.error('Network error:', error);
    alert('Network error. Please check your connection.');
  }
}
```

## CORS Considerations

The RGS server handles CORS automatically. No special configuration needed on the client side.

If you encounter CORS errors:
1. Verify your `rgs_url` parameter is correct
2. Ensure your game is properly configured on Stake Engine
3. Check browser console for specific error messages

## Local Development

For local development without URL parameters:

```typescript
import { authenticate } from 'stake-engine-client';

const isDevelopment = window.location.hostname === 'localhost';

const auth = await authenticate(
  isDevelopment
    ? {
        sessionID: 'dev-session-123',
        rgsUrl: 'dev.rgs-server.com',
        language: 'en'
      }
    : undefined  // Use URL params in production
);
```

Or use a test URL:
```
http://localhost:3000/?sessionID=test&rgs_url=dev.rgs-server.com&lang=en
```

## Performance Tips

1. **Authenticate Once** - Call `authenticate()` only on game load
2. **Debounce Balance Checks** - Don't poll balance too frequently
3. **Handle Loading States** - Show loading UI during API calls
4. **Cache Configuration** - Store bet levels and game config from authenticate response

```typescript
import { authenticate } from 'stake-engine-client';
import type { components } from 'stake-engine-client';

let gameConfig: components['schemas']['Config'] | null = null;

async function initGame() {
  const auth = await authenticate();

  // Cache config to avoid repeated authenticate calls
  gameConfig = auth.config || null;

  console.log('Available bet levels:', gameConfig?.betLevels);
}
```

## Bundle Size

The package is lightweight and tree-shakable:
- **Full package**: ~15KB minified
- **Core client only**: ~8KB minified

Import only what you need:
```typescript
// Only imports play and its dependencies
import { play } from 'stake-engine-client';
```

## Browser Compatibility

The client works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- Native `fetch` API
- `URLSearchParams` support
- ES6 features (async/await, Promise)

For older browsers, use polyfills:
```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=fetch,URLSearchParams,Promise"></script>
```

## Related Pages

- [URL Parameters](URL-Parameters) - Automatic configuration
- [Package Integration](Package-Integration) - Installation and setup
- [Usage Patterns](Usage-Patterns) - Common patterns and examples
- [Error Handling](Error-Handling) - Handling errors
