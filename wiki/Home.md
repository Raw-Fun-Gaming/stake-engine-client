# Stake Engine Client Wiki

Welcome to the comprehensive documentation for the **Stake Engine Client** - a lightweight TypeScript client for RGS (Remote Gaming Server) API communication.

## 📚 Documentation Index

### Getting Started
- **[Getting Started with Demo](Getting-Started)** - Set up and test with Stake Engine console
- **[Package Integration](Package-Integration)** - Install and use in your own project
- **[URL Parameters](URL-Parameters)** - Browser-friendly configuration

### API Reference
- **[requestAuthenticate](requestAuthenticate)** - Player authentication
- **[requestBet](requestBet)** - Place bets and start rounds
- **[requestEndRound](requestEndRound)** - End betting rounds
- **[requestBalance](requestBalance)** - Get player balance
- **[requestEndEvent](requestEndEvent)** - Track game events
- **[requestReplay](requestReplay)** - Fetch historical bet data for replay
- **[requestForceResult](requestForceResult)** - Search for specific results (testing)

### Replay Mode
- **[requestReplay](requestReplay)** - Fetch replay data from RGS
- **[Replay Helpers](Replay-Helpers)** - `isReplayMode()` and `getReplayUrlParams()`

### Advanced Usage
- **[StakeEngineClient Class](StakeEngineClient-Class)** - Custom client instances
- **[Low-Level Fetcher](Low-Level-Fetcher)** - Direct HTTP client
- **[Amount Conversion](Amount-Conversion)** - Understanding format conversions
- **[TypeScript Types](TypeScript-Types)** - Type definitions and interfaces

### Examples & Guides
- **[Common Usage Patterns](Usage-Patterns)** - Real-world examples
- **[Error Handling](Error-Handling)** - Handling API errors and edge cases
- **[Browser Integration](Browser-Integration)** - Using in web applications
- **[Node.js Integration](Node-js-Integration)** - Server-side usage

### Troubleshooting
- **[Common Issues](Common-Issues)** - Solutions to frequent problems
- **[Status Codes](Status-Codes)** - Complete reference of RGS status codes
- **[Debug Guide](Debug-Guide)** - Debugging tips and tools

## 🔥 Key Features

- **🚀 Lightweight** - Only essential RGS communication code
- **📱 Framework Agnostic** - Works with any JavaScript framework  
- **🔒 Type Safe** - Full TypeScript support with auto-generated types
- **🎯 Simple API** - High-level methods for common operations
- **🔧 Configurable** - Low-level access for custom implementations
- **💰 Smart Conversion** - Automatic amount conversion between formats
- **🌐 Browser Friendly** - URL parameter fallback for easy integration
- **🔄 Replay Support** - Fetch and replay historical bet data

## 📦 Installation

```bash
npm install stake-engine-client
```

## 🚀 Quick Example

```typescript
import { requestAuthenticate, requestBet } from 'stake-engine-client';

// Authenticate (uses URL params if available)
const auth = await requestAuthenticate();

// Place a bet
const bet = await requestBet({
  currency: 'USD',
  amount: 1.00,
  mode: 'base'
});

console.log('Round ID:', bet.round?.roundID);
console.log('Payout:', bet.round?.payoutMultiplier);
```

## 🔗 Links

- **[GitHub Repository](https://github.com/raw-fun-gaming/stake-engine-client)**
- **[npm Package](https://www.npmjs.com/package/stake-engine-client)**
- **[Releases](https://github.com/raw-fun-gaming/stake-engine-client/releases)**
- **[Issues](https://github.com/raw-fun-gaming/stake-engine-client/issues)**

## 📄 License

MIT License - see the [LICENSE](https://github.com/raw-fun-gaming/stake-engine-client/blob/main/LICENSE) file for details.

---

**Need help?** Check the [Common Issues](Common-Issues) page or [create an issue](https://github.com/raw-fun-gaming/stake-engine-client/issues/new) on GitHub.