# requestBet (Deprecated)

> **⚠️ DEPRECATED:** This function has been renamed to [`requestPlay`](requestPlay) to better match the underlying API endpoint `/wallet/play`.
>
> `requestBet` still works as an alias but will be removed in a future version. Please update your code to use `requestPlay` instead.

## Migration

Simply replace `requestBet` with `requestPlay` in your code:

```typescript
// Old (deprecated)
import { requestBet } from 'stake-engine-client';
const bet = await requestBet({ amount: 1.00, mode: 'base' });

// New (recommended)
import { requestPlay } from 'stake-engine-client';
const play = await requestPlay({ amount: 1.00, mode: 'base' });
```

The function signature and behavior are identical - only the name has changed.

## See Also

- **[requestPlay](requestPlay)** - Current documentation (use this instead)
- **[Migration Guide](#migration)** - How to update your code
