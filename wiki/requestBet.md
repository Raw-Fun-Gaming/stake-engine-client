# requestBet (Deprecated)

> **⚠️ DEPRECATED:** This function has been renamed to [`play`](play) to better match the underlying API endpoint `/wallet/play`.
>
> `requestBet` still works as an alias but will be removed in a future version. Please update your code to use `play` instead.

## Migration

Simply replace `requestBet` with `play` in your code:

```typescript
// Old (deprecated)
import { requestBet } from 'stake-engine-client';
const result = await requestBet({ amount: 1.00, mode: 'base' });

// New (recommended)
import { play } from 'stake-engine-client';
const result = await play({ amount: 1.00, mode: 'base' });
```

The function signature and behavior are identical - only the name has changed.

## See Also

- **[play](play)** - Current documentation (use this instead)
- **[Migration Guide](#migration)** - How to update your code
