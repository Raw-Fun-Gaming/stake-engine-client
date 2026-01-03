/**
 * Stake Engine Client
 * 
 * @description
 * Lightweight TypeScript client extracted from Stake Engine web-sdk 
 * (https://github.com/StakeEngine/web-sdk) for RGS (Remote Gaming Server) 
 * API communication. Contains only essential backend communication code 
 * without Svelte dependencies or slot game scripts.
 * 
 * This package provides a complete solution for communicating with 
 * Stake Engine's RGS API, including authentication, betting, balance 
 * management, and game event tracking.
 * 
 * @version 1.0.0
 * @author Raw Run Gaming
 * @license MIT
 */

// Export all client functionality

// New simplified names (recommended)
export {
	StakeEngineClient,
	stakeEngineClient,
	authenticate,
	getBalance,
	play,
	endRound,
	endEvent,
	forceResult,
	replay,
	getReplayUrlParams,
	isReplayMode,
} from './client';

// Deprecated aliases (backward compatibility)
export {
	requestAuthenticate, // @deprecated - use authenticate
	requestBalance, // @deprecated - use getBalance
	requestPlay, // @deprecated - use play
	requestBet, // @deprecated - use play
	bet, // @deprecated - use play
	requestEndRound, // @deprecated - use endRound
	requestEndEvent, // @deprecated - use endEvent
	requestForceResult, // @deprecated - use forceResult
	requestReplay, // @deprecated - use replay
} from './client';

// Export low-level fetcher for custom implementations
export { fetcher, type FetcherOptions } from './fetcher';

// Export constants for amount conversion
export { API_AMOUNT_MULTIPLIER, BOOK_AMOUNT_MULTIPLIER } from './constants';

// Export all type definitions
export type {
	paths,
	components,
	operations,
	BetType,
	BaseBetType,
} from './types';

// Re-export commonly used types for convenience
export type StatusCode = import('./types').components['schemas']['StatusCode'];
export type BalanceObject = import('./types').components['schemas']['BalanceObject'];
export type RoundDetailObject = import('./types').components['schemas']['RoundDetailObject'];
export type ConfigObject = import('./types').components['schemas']['ConfigObject'];
export type AuthenticateResponse = import('./types').components['schemas']['AuthenticateResponse'];
export type PlayResponse = import('./types').components['schemas']['PlayResponse'];
export type BalanceResponse = import('./types').components['schemas']['BalanceResponse'];
export type EndRoundResponse = import('./types').components['schemas']['EndRoundResponse'];
export type ReplayResponse = import('./types').components['schemas']['ReplayResponse'];