# Getting Started with Demo

This guide walks you through setting up a Stake Engine game from scratch and testing the API using the interactive demo page.

> **Looking to integrate the package into your own project?** See [Package Integration](Package-Integration) instead.

## Prerequisites

- A [Stake Engine](https://stake-engine.com/) account
- Node.js (for local development, optional)

## Step 1: Create Your Game on Stake Engine

1. **Sign up** at [stake-engine.com](https://stake-engine.com/) if you haven't already
2. **Create a Publisher** - This represents your game studio or brand
3. **Create a New Game** - Give it a name and configure basic settings

## Step 2: Upload Math Books

Math books define the game outcomes and probabilities. You can use the included demo math files or create your own.

1. In your game page, click **Files** > **Import Files** > **Math**
2. Upload the files from [`demo/math/`](https://github.com/raw-fun-gaming/stake-engine-client/tree/main/demo/math) folder:
   - `base.csv` - Human-readable format
   - `base.json` - JSON format
   - `base.jsonl` - JSON Lines format
   - `base.zst` - Compressed format

## Step 3: Upload Frontend (Optional)

You have two options for the game frontend:

### Option A: Use Our Demo Page (Recommended for Testing)

Upload a minimal `index.html` file as a placeholder:

```html
<!DOCTYPE html>
<html>
<head><title>Game</title></head>
<body><p>Use the API Demo to test this game.</p></body>
</html>
```

### Option B: Build and Upload the Demo Page

Build the interactive demo and upload it as your frontend:

```bash
git clone https://github.com/raw-fun-gaming/stake-engine-client.git
cd stake-engine-client
npm install
npm run build:demo
```

Then upload the contents of the `docs/` folder via **Files** > **Import Files** > **Frontend**.

## Step 4: Launch and Test

1. In your game page, click **Launch Game**
2. The game will open in a new window with URL parameters like:
   ```
   https://your-game.stake-engine.com/?sessionID=xxx&rgs_url=rgs.stake-engine.com&lang=en
   ```

### Testing with the Live Demo

If you uploaded a placeholder frontend, use the hosted demo page:

1. Copy your game URL (including all parameters)
2. Go to [raw-fun-gaming.github.io/stake-engine-client](https://raw-fun-gaming.github.io/stake-engine-client/)
3. Paste the URL and click **Parse URL**
4. Click **Authenticate** to connect

### Testing with Local Demo

Run the demo locally for development:

```bash
npm run demo
```

Open `http://localhost:5173` and paste your game URL.

## Using the Demo Page

Once authenticated, you can test all API functions:

| Button | Function | Description |
|--------|----------|-------------|
| **Get Balance** | `requestBalance` | Check player's current balance |
| **Place Bet** | `requestBet` | Start a new betting round |
| **End Round** | `requestEndRound` | Complete the current round |
| **End Event** | `requestEndEvent` | End a specific game event |
| **Force Result** | `requestForceResult` | Search for specific outcomes (testing) |
| **Replay** | `requestReplay` | Fetch historical bet data |

### Common Workflow

1. **Authenticate** - Connect to RGS with session
2. **Place Bet** - Enter amount and mode, click Submit
3. **End Round** - Complete the round to see results and update balance
4. Repeat as needed

### Replay Mode

To test replay functionality:

1. Switch to **Replay** mode in the demo page
2. Enter Game ID, Version, Mode, and Event ID
3. Click **Load Replay** to fetch historical data

Or paste a replay URL directly:
```
https://game.example.com/?replay=true&game=xxx&version=1&mode=base&event=123&rgs_url=rgs.stake-engine.com
```

## Troubleshooting

### "player has active bet" Error

Click **End Round** to finish the current round before placing a new bet.

### Authentication Failed

- Verify your `sessionID` hasn't expired
- Check that `rgs_url` is correct
- Ensure your game is properly launched on Stake Engine

### CORS Errors

The RGS server handles CORS. If you see CORS errors, verify:
- You're using the correct `rgs_url`
- Your game is properly configured on Stake Engine

## Next Steps

- [API Reference](requestAuthenticate) - Detailed API documentation
- [TypeScript Types](TypeScript-Types) - Type definitions
- [Usage Patterns](Usage-Patterns) - Real-world examples
