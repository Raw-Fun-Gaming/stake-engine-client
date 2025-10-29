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
 * @author Planet Blue Invasion Team
 * @license MIT
 */

// Export all client functionality
export {
	StakeEngineClient,
	stakeEngineClient,
	requestAuthenticate,
	requestBalance,
	requestBet,
	requestEndRound,
	requestEndEvent,
	requestForceResult,
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
export type AuthenticateResponse = import('./types').components['schemas']['res_authenticate'];
export type PlayResponse = import('./types').components['schemas']['res_play'];
export type BalanceResponse = import('./types').components['schemas']['res_Balance'];
export type EndRoundResponse = import('./types').components['schemas']['res_end_round'];

/**
 * Version information
 */
export const version = '1.0.1';

/**
 * Package metadata
 */
export const metadata = {
	name: 'stake-engine-client',
	version: '1.0.1',
	description: 'Lightweight TypeScript client extracted from Stake Engine web-sdk for RGS API communication',
	source: 'https://github.com/StakeEngine/web-sdk',
	repository: 'https://github.com/raw-fun-gaming/stake-engine-client',
} as const;