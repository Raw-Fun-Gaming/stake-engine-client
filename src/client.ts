/**
 * High-level client for Stake Engine RGS API operations
 * 
 * @description
 * This module provides convenient methods for all RGS API operations including
 * authentication, betting, balance checking, and game events. All methods
 * include automatic amount conversion and type safety.
 */

import { fetcher } from './fetcher';
import { API_AMOUNT_MULTIPLIER } from './constants';
import type { paths, components } from './types';

// Helper type for filtering paths that have POST operations
type PathsWithPost = {
	[K in keyof paths]: paths[K] extends { post: unknown } ? K : never;
}[keyof paths];

/**
 * Type-safe RGS API client with automatic response parsing
 */
export class StakeEngineClient {
	/**
	 * Make a POST request to the RGS API
	 *
	 * @param options - Request configuration
	 * @returns Typed response data
	 */
	async post<
		T extends PathsWithPost,
		TResponse = paths[T]['post']['responses'][200]['content']['application/json'],
	>(options: {
		url: T;
		rgsUrl: string;
		variables?: paths[T]['post']['requestBody']['content']['application/json'];
	}): Promise<TResponse> {
		const response = await fetcher({
			method: 'POST',
			variables: options.variables,
			endpoint: `https://${options.rgsUrl}${options.url}`,
		});

		if (response.status !== 200) {
			const errorData = await response.json().catch(() => ({}));
			console.error('RGS API error:', errorData.message);
			throw new Error(errorData.message || `RGS API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data as TResponse;
	}

	/**
	 * Make a GET request to the RGS API
	 * 
	 * @param options - Request configuration
	 * @returns Typed response data
	 */
	async get<T extends keyof paths>(options: {
		url: T;
		rgsUrl: string;
	}): Promise<any> {
		const response = await fetcher({
			method: 'GET',
			endpoint: `https://${options.rgsUrl}${options.url}`,
		});

		if (response.status !== 200) {
			const errorData = await response.json().catch(() => ({}));
			console.error('RGS API error:', errorData.message);
			throw new Error(errorData.message || `RGS API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	}
}

/**
 * Default client instance for convenience
 */
export const stakeEngineClient = new StakeEngineClient();

// High-level API methods using the client

/**
 * Get URL parameters for common RGS values
 * @returns Object with sessionID, rgsUrl, and language from URL params
 */
const getUrlParams = () => {
	const urlParams = new URLSearchParams(window.location.search);
	return {
		sessionID: urlParams.get('sessionID'),
		rgsUrl: urlParams.get('rgs_url'),
		language: urlParams.get('lang') || 'en',
		currency: urlParams.get('currency') || 'USD'
	};
};

/**
 * Get replay-specific URL parameters
 * @returns Object with replay mode flag and parameters
 */
export const getReplayUrlParams = () => {
	const urlParams = new URLSearchParams(window.location.search);
	return {
		replay: urlParams.get('replay') === 'true',
		amount: Number(urlParams.get('amount')) || 0,
		game: urlParams.get('game') || '',
		version: urlParams.get('version') || '',
		mode: urlParams.get('mode') || '',
		event: urlParams.get('event') || '',
	};
};

/**
 * Check if current session is in replay mode
 * @returns true if replay=true is in URL params
 */
export const isReplayMode = (): boolean => {
	return new URLSearchParams(window.location.search).get('replay') === 'true';
};

/**
 * Authenticate a player session with the RGS
 * 
 * @param options - Authentication parameters
 * @returns Authentication response with balance, config, and active round info
 * 
 * @example
 * ```typescript
 * const auth = await requestAuthenticate({
 *   sessionID: 'player-session-123',
 *   rgsUrl: 'api.stakeengine.com',
 *   language: 'en'
 * });
 * 
 * console.log('Player balance:', auth.balance?.amount);
 * console.log('Available bet levels:', auth.config?.betLevels);
 * ```
 */
export const requestAuthenticate = async (options?: {
	sessionID?: string;
	rgsUrl?: string;
	language?: string;
}): Promise<components['schemas']['res_authenticate']> => {
	const urlParams = getUrlParams();
	const sessionID = options?.sessionID || urlParams.sessionID;
	const rgsUrl = options?.rgsUrl || urlParams.rgsUrl;
	const language = options?.language || urlParams.language;

	if (!sessionID) throw new Error('sessionID is required (provide in options or URL param)');
	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');
	return stakeEngineClient.post({
		rgsUrl,
		url: '/wallet/authenticate',
		variables: {
			sessionID,
			language,
		},
	});
};


/**
 * Place a bet and start a new round
 * 
 * @param options - Bet parameters
 * @returns Bet response with round details, balance, and game state
 * 
 * @example
 * ```typescript
 * const bet = await requestBet({
 *   amount: 1.00,  // $1.00 (automatically converted to API format)
 *   mode: 'base'
 *   // sessionID, currency, rgsUrl from URL params if not provided
 * });
 * 
 * console.log('Round ID:', bet.round?.roundID);
 * console.log('Payout multiplier:', bet.round?.payoutMultiplier);
 * console.log('New balance:', bet.balance?.amount);
 * ```
 */
export const requestBet = async (options: {
	amount: number;
	mode: string;
	currency?: string;
	sessionID?: string;
	rgsUrl?: string;
}): Promise<components['schemas']['res_play']> => {
	const urlParams = getUrlParams();
	const sessionID = options.sessionID || urlParams.sessionID;
	const rgsUrl = options.rgsUrl || urlParams.rgsUrl;
	const currency = options.currency || urlParams.currency;

	if (!sessionID) throw new Error('sessionID is required (provide in options or URL param)');
	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');
	return stakeEngineClient.post({
		rgsUrl,
		url: '/wallet/play',
		variables: {
			mode: options.mode,
			currency,
			sessionID,
			amount: options.amount * API_AMOUNT_MULTIPLIER, // Convert to API format
		},
	});
};

/**
 * End the current betting round
 * 
 * @param options - End round parameters
 * @returns Response with updated balance and status
 * 
 * @example
 * ```typescript
 * const result = await requestEndRound({
 *   sessionID: 'player-session-123',
 *   rgsUrl: 'api.stakeengine.com'
 * });
 * 
 * if (result.status?.statusCode === 'SUCCESS') {
 *   console.log('Round ended successfully');
 * }
 * ```
 */
export const requestEndRound = async (options?: {
	sessionID?: string;
	rgsUrl?: string;
}): Promise<components['schemas']['res_end_round']> => {
	const urlParams = getUrlParams();
	const sessionID = options?.sessionID || urlParams.sessionID;
	const rgsUrl = options?.rgsUrl || urlParams.rgsUrl;

	if (!sessionID) throw new Error('sessionID is required (provide in options or URL param)');
	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');
	return stakeEngineClient.post({
		rgsUrl,
		url: '/wallet/end-round',
		variables: {
			sessionID,
		},
	});
};

/**
 * Track a game event (for bet progress tracking)
 * 
 * @param options - Event parameters
 * @returns Event response with confirmation
 * 
 * @example
 * ```typescript
 * const result = await requestEndEvent({
 *   sessionID: 'player-session-123',
 *   eventIndex: 1,
 *   rgsUrl: 'api.stakeengine.com'
 * });
 * ```
 */
export const requestEndEvent = async (options: {
	eventIndex: number;
	sessionID?: string;
	rgsUrl?: string;
}): Promise<components['schemas']['res_event']> => {
	const urlParams = getUrlParams();
	const sessionID = options.sessionID || urlParams.sessionID;
	const rgsUrl = options.rgsUrl || urlParams.rgsUrl;

	if (!sessionID) throw new Error('sessionID is required (provide in options or URL param)');
	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');
	return stakeEngineClient.post({
		rgsUrl,
		url: '/bet/event',
		variables: {
			sessionID,
			event: `${options.eventIndex}`,
		},
	});
};

/**
 * Search for specific game results (for testing/debugging)
 * 
 * @param options - Search parameters
 * @returns Search results with matching rounds
 * 
 * @example
 * ```typescript
 * const results = await requestForceResult({
 *   mode: 'base',
 *   search: {
 *     bookID: 42,
 *     kind: 1,
 *     symbol: 'BONUS'
 *   },
 *   rgsUrl: 'api.stakeengine.com'
 * });
 * ```
 */
export const requestForceResult = async (options: {
	mode: string;
	search: {
		bookID?: number;
		kind?: number;
		symbol?: string;
		hasWild?: boolean;
		wildMult?: number;
		gameType?: string;
	};
	rgsUrl?: string;
}): Promise<components['schemas']['res_search']> => {
	const urlParams = getUrlParams();
	const rgsUrl = options.rgsUrl || urlParams.rgsUrl;

	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');
	return stakeEngineClient.post({
		rgsUrl,
		url: '/game/search',
		variables: {
			mode: options.mode,
			search: options.search,
		},
	});
};

/**
 * Get current player balance
 * 
 * @param options - Balance request parameters
 * @returns Current balance information
 * 
 * @example
 * ```typescript
 * const balance = await requestBalance({
 *   sessionID: 'player-session-123',
 *   rgsUrl: 'api.stakeengine.com'
 * });
 * 
 * console.log('Current balance:', balance.balance?.amount, balance.balance?.currency);
 * ```
 */
export const requestBalance = async (options?: {
	sessionID?: string;
	rgsUrl?: string;
}): Promise<components['schemas']['res_Balance']> => {
	const urlParams = getUrlParams();
	const sessionID = options?.sessionID || urlParams.sessionID;
	const rgsUrl = options?.rgsUrl || urlParams.rgsUrl;

	if (!sessionID) throw new Error('sessionID is required (provide in options or URL param)');
	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');
	return stakeEngineClient.post({
		rgsUrl,
		url: '/wallet/balance',
		variables: {
			sessionID,
		},
	});
};

/**
 * Replay a historical bet
 *
 * @param options - Replay parameters
 * @returns Replay response with round details
 *
 * @example
 * ```typescript
 * const replay = await requestReplay({
 *   game: 'slots-adventure',
 *   version: '1.0.0',
 *   mode: 'base',
 *   event: 'abc123',
 *   rgsUrl: 'api.stakeengine.com'
 * });
 *
 * console.log('Replaying round:', replay.round?.state);
 * ```
 */
export const requestReplay = async (options: {
	game: string;
	version: string;
	mode: string;
	event: string;
	rgsUrl?: string;
}): Promise<components['schemas']['res_replay']> => {
	const urlParams = getUrlParams();
	const rgsUrl = options.rgsUrl || urlParams.rgsUrl;

	if (!rgsUrl) throw new Error('rgsUrl is required (provide in options or rgs_url URL param)');

	return stakeEngineClient.get({
		rgsUrl,
		url: `/bet/replay/${options.game}/${options.version}/${options.mode}/${options.event}` as keyof paths,
	});
};