# requestForceResult

Search for specific game results in the RGS system. This function is primarily used for testing, debugging, and finding specific game outcomes.

## 📋 Syntax

```typescript
requestForceResult(options: ForceResultOptions): Promise<SearchResponse>
```

## 📝 Parameters

### `options` (required)

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `mode` | `string` | ✅ | Search mode (e.g., 'base', 'bonus', 'freespin') |
| `search` | `SearchCriteria` | ✅ | Search criteria object |
| `rgsUrl` | `string` | ❌ | RGS server hostname (from URL param if not provided) |

### `search` Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `bookID` | `number` | ❌ | Specific book/paytable ID to search |
| `kind` | `number` | ❌ | Result kind/type identifier |
| `symbol` | `string` | ❌ | Specific symbol to search for |
| `hasWild` | `boolean` | ❌ | Whether result contains wild symbols |
| `wildMult` | `number` | ❌ | Wild symbol multiplier value |
| `gameType` | `string` | ❌ | Specific game type identifier |

### URL Parameter Fallback

- `rgsUrl` from `rgs_url` URL parameter

## 🔄 Return Value

Returns a Promise that resolves to a `SearchResponse` object:

```typescript
interface SearchResponse {
  results?: SearchResult[];       // Array of matching results
  status?: {                      // Operation status
    statusCode: StatusCode;
    statusMessage?: string;
  };
}
```

## 💡 Examples

### Basic Result Search (Browser with URL params)

```typescript
import { requestForceResult } from 'stake-engine-client';

// URL: https://game.com/play?rgs_url=api.stakeengine.com
const results = await requestForceResult({
  mode: 'base',
  search: {
    bookID: 42,
    kind: 1
  }
});

if (results.status?.statusCode === 'SUCCESS') {
  console.log(`🔍 Found ${results.results?.length || 0} matching results`);
  results.results?.forEach((result, index) => {
    console.log(`Result ${index + 1}:`, result);
  });
} else {
  console.error('❌ Search failed:', results.status?.statusMessage);
}
```

### Search for Specific Symbols

```typescript
import { requestForceResult } from 'stake-engine-client';

const symbolSearch = await requestForceResult({
  mode: 'base',
  search: {
    symbol: 'BONUS',
    hasWild: false
  },
  rgsUrl: 'api.stakeengine.com'
});

if (symbolSearch.status?.statusCode === 'SUCCESS') {
  console.log('🎯 BONUS symbol results found:', symbolSearch.results?.length);
}
```

### Testing Different Game Modes

```typescript
import { requestForceResult } from 'stake-engine-client';

async function testGameModes() {
  const modes = ['base', 'bonus', 'freespin'];
  const searchResults = new Map();
  
  for (const mode of modes) {
    try {
      console.log(`🔍 Searching ${mode} mode...`);
      
      const results = await requestForceResult({
        mode,
        search: {
          bookID: 1,
          kind: 2
        }
      });
      
      if (results.status?.statusCode === 'SUCCESS') {
        searchResults.set(mode, results.results?.length || 0);
        console.log(`✅ ${mode}: ${results.results?.length || 0} results`);
      } else {
        console.log(`❌ ${mode}: Search failed - ${results.status?.statusMessage}`);
        searchResults.set(mode, 0);
      }
      
    } catch (error) {
      console.error(`❌ ${mode}: Network error -`, error);
      searchResults.set(mode, 0);
    }
    
    // Small delay between searches
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('📊 Search Summary:', Object.fromEntries(searchResults));
  return searchResults;
}

await testGameModes();
```

### Wild Symbol Analysis

```typescript
import { requestForceResult } from 'stake-engine-client';

async function analyzeWildSymbols() {
  const wildMultipliers = [2, 3, 5, 10];
  const wildAnalysis = [];
  
  for (const multiplier of wildMultipliers) {
    try {
      console.log(`🔍 Searching for ${multiplier}x wild symbols...`);
      
      const results = await requestForceResult({
        mode: 'base',
        search: {
          hasWild: true,
          wildMult: multiplier
        }
      });
      
      if (results.status?.statusCode === 'SUCCESS') {
        wildAnalysis.push({
          multiplier,
          count: results.results?.length || 0,
          results: results.results
        });
        
        console.log(`✅ ${multiplier}x wilds: ${results.results?.length || 0} results`);
      } else {
        console.log(`❌ ${multiplier}x wilds: Search failed`);
      }
      
    } catch (error) {
      console.error(`❌ Error searching ${multiplier}x wilds:`, error);
    }
  }
  
  // Display analysis
  console.log('\n🎰 Wild Symbol Analysis:');
  wildAnalysis.forEach(({ multiplier, count }) => {
    console.log(`   ${multiplier}x Wild: ${count} combinations`);
  });
  
  return wildAnalysis;
}

await analyzeWildSymbols();
```

### Advanced Search with Multiple Criteria

```typescript
import { requestForceResult } from 'stake-engine-client';

async function performAdvancedSearch() {
  const searchCriteria = {
    highValueCombos: {
      mode: 'base',
      search: {
        bookID: 10,
        kind: 5,
        hasWild: true
      }
    },
    bonusRounds: {
      mode: 'bonus',
      search: {
        symbol: 'SCATTER',
        gameType: 'freespin'
      }
    },
    jackpotResults: {
      mode: 'base',
      search: {
        bookID: 999,
        kind: 1
      }
    }
  };
  
  const searchResults = {};
  
  for (const [searchName, criteria] of Object.entries(searchCriteria)) {
    try {
      console.log(`🔍 Searching for ${searchName}...`);
      
      const results = await requestForceResult(criteria);
      
      if (results.status?.statusCode === 'SUCCESS') {
        searchResults[searchName] = {
          success: true,
          count: results.results?.length || 0,
          results: results.results
        };
        
        console.log(`✅ ${searchName}: ${results.results?.length || 0} results found`);
      } else {
        searchResults[searchName] = {
          success: false,
          error: results.status?.statusMessage
        };
        
        console.log(`❌ ${searchName}: ${results.status?.statusMessage}`);
      }
      
    } catch (error) {
      searchResults[searchName] = {
        success: false,
        error: error.message
      };
      
      console.error(`❌ ${searchName}: Network error -`, error);
    }
  }
  
  return searchResults;
}

const advancedResults = await performAdvancedSearch();
console.log('📋 Advanced Search Results:', advancedResults);
```

### Test Result Validation

```typescript
import { requestForceResult, requestBet } from 'stake-engine-client';

async function validateTestResults() {
  try {
    console.log('🧪 Validating test results...');
    
    // Search for specific test scenario
    const searchResults = await requestForceResult({
      mode: 'base',
      search: {
        bookID: 1,
        kind: 3,
        symbol: 'WILD'
      }
    });
    
    if (searchResults.status?.statusCode !== 'SUCCESS') {
      throw new Error('Search failed: ' + searchResults.status?.statusMessage);
    }
    
    if (!searchResults.results || searchResults.results.length === 0) {
      console.log('⚠️ No test results found for criteria');
      return false;
    }
    
    console.log(`✅ Found ${searchResults.results.length} test scenarios`);
    
    // Optionally test one of the found results
    console.log('🎲 Testing first result scenario...');
    
    const testBet = await requestBet({
      currency: 'USD',
      amount: 1.00,
      mode: 'base'
    });
    
    if (testBet.status?.statusCode === 'SUCCESS') {
      console.log('✅ Test bet successful');
      console.log(`🎯 Multiplier: ${testBet.round?.payoutMultiplier}x`);
      return true;
    } else {
      console.log('❌ Test bet failed:', testBet.status?.statusMessage);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test validation failed:', error);
    return false;
  }
}

const validationPassed = await validateTestResults();
console.log('Test validation:', validationPassed ? '✅ PASSED' : '❌ FAILED');
```

### Game Configuration Analysis

```typescript
import { requestForceResult } from 'stake-engine-client';

class GameConfigAnalyzer {
  private results: Map<string, any[]> = new Map();
  
  async analyzeGameConfiguration(gameTypes: string[]) {
    console.log('🔍 Analyzing game configuration...');
    
    for (const gameType of gameTypes) {
      await this.analyzeGameType(gameType);
    }
    
    this.generateReport();
  }
  
  private async analyzeGameType(gameType: string) {
    try {
      const results = await requestForceResult({
        mode: 'base',
        search: {
          gameType: gameType
        }
      });
      
      if (results.status?.statusCode === 'SUCCESS') {
        this.results.set(gameType, results.results || []);
        console.log(`✅ ${gameType}: ${results.results?.length || 0} configurations`);
      } else {
        console.log(`❌ ${gameType}: Analysis failed`);
        this.results.set(gameType, []);
      }
      
    } catch (error) {
      console.error(`❌ ${gameType}: Error -`, error);
      this.results.set(gameType, []);
    }
  }
  
  private generateReport() {
    console.log('\n📊 Game Configuration Report:');
    console.log('================================');
    
    for (const [gameType, configs] of this.results) {
      console.log(`${gameType.toUpperCase()}:`);
      console.log(`  Configurations: ${configs.length}`);
      
      if (configs.length > 0) {
        console.log(`  Sample config:`, configs[0]);
      }
      
      console.log('');
    }
  }
  
  getResults(): Map<string, any[]> {
    return new Map(this.results);
  }
}

// Usage
const analyzer = new GameConfigAnalyzer();
await analyzer.analyzeGameConfiguration(['slots', 'poker', 'blackjack']);
```

## ⚠️ Common Status Codes

| Status Code | Description | Action |
|-------------|-------------|---------|
| `SUCCESS` | Search completed successfully | Process results |
| `ERR_UE` | Unknown server error | Retry or contact support |

## 🎯 Best Practices

1. **Use for testing only** - Not for production gameplay
2. **Specific search criteria** - Use precise criteria to get relevant results
3. **Handle empty results** - Not all searches will return matches
4. **Rate limiting** - Don't perform too many searches rapidly
5. **Error handling** - Implement proper fallbacks for failed searches
6. **Document test cases** - Keep track of useful search criteria
7. **Validate results** - Test found scenarios to ensure they work

## 🔗 Related Functions

- **[requestBet](requestBet)** - Test found results with actual bets
- **[requestAuthenticate](requestAuthenticate)** - May be needed for testing scenarios

## 🛠️ Implementation Notes

- Primarily used for testing and quality assurance
- Search criteria are game-specific and may vary by implementation
- Results contain configuration data that can be used for testing
- Not all search criteria combinations will return results
- Useful for finding edge cases and specific game scenarios
- Should not be used in production gameplay flows

## ⚠️ Important Considerations

- **Testing Purpose**: This function is designed for testing, not regular gameplay
- **Search Accuracy**: Use specific criteria to get meaningful results
- **Result Validation**: Always validate found results work as expected
- **Performance**: Don't overuse in production environments
- **Documentation**: Keep records of useful search patterns for future reference

## 📚 See Also

- **[requestBet](requestBet)** - Testing found results with actual gameplay
- **[Usage Patterns](Usage-Patterns)** - Examples of testing workflows
- **[Debug Guide](Debug-Guide)** - Using search results for debugging