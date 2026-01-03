# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a lightweight TypeScript client extracted from [Stake Engine web-sdk](https://github.com/StakeEngine/web-sdk) for RGS (Remote Gaming Server) API communication. It provides essential backend communication functionality without Svelte dependencies or slot game scripts.

## Development Commands

### Build
```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Build with watch mode
npm run prepublishOnly # Build before publishing
```

### Testing
```bash
node test.js           # Run basic package verification test
```

## Architecture

### Core Components

- **`src/client.ts`** - High-level API client with convenience methods (`authenticate`, `play`, etc.)
- **`src/fetcher.ts`** - Low-level HTTP client for direct API calls
- **`src/types.ts`** - Complete TypeScript definitions from OpenAPI schema
- **`src/constants.ts`** - Amount conversion multipliers for API/Book formats
- **`src/index.ts`** - Main entry point with all exports

### API Communication Pattern

The package provides two levels of API interaction:

1. **High-level methods** - Convenient functions like `authenticate()`, `play()` with automatic amount conversion
2. **Low-level client** - Direct `StakeEngineClient.post()` or `fetcher()` for custom implementations

### Amount Conversion System

- **API Format**: 1,000,000 = $1.00 (via `API_AMOUNT_MULTIPLIER`)  
- **Book Format**: 100 = $1.00 (via `BOOK_AMOUNT_MULTIPLIER`)
- High-level methods automatically handle conversions between dollar amounts and API format

### Type Safety

All API operations are fully typed through OpenAPI-generated schemas in `types.ts`. The type system includes:

- Complete request/response schemas for all RGS endpoints
- Generic `BetType<T>` for game-specific betting logic
- Status code enums and error handling types

## Key Technical Details

- **Target**: ES2020, CommonJS modules for Node.js compatibility
- **Strict TypeScript**: All strict mode flags enabled
- **Framework Agnostic**: Works with any JavaScript framework or Node.js backend
- **Tree Shakable**: Supports selective imports for optimal bundle size

## RGS API Operations

The client covers all essential RGS operations:

- **Authentication**: Session validation with operator
- **Betting**: Place bets, end rounds, track events  
- **Balance Management**: Check/update player balances
- **Game Events**: Track bet progress and outcomes
- **Testing**: Force specific results for development/testing

All operations use the pattern of passing `sessionID`, `rgsUrl`, and operation-specific parameters.