/**
 * Type definitions for Stake Engine RGS API
 * 
 * This file contains TypeScript type definitions for all API requests and responses.
 * These types are generated from the OpenAPI schema and provide full type safety.
 */

/** OneOf type helpers for union types */
type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
type OneOf<T extends any[]> = T extends [infer Only]
	? Only
	: T extends [infer A, infer B, ...infer Rest]
		? OneOf<[XOR<A, B>, ...Rest]>
		: never;

/**
 * API endpoint paths and their corresponding operations
 */
export interface paths {
	'/wallet/authenticate': {
		/**
		 * Authenticate Player Request
		 * @description This endpoint validates a sessionID with the operator to ensure it is a valid session.
		 */
		post: operations['authenticate'];
	};
	'/wallet/balance': {
		/**
		 * Player Balance Request
		 * @description Additional API call to receive balance of the player. Most API calls return the players balance, although a provider may want to periodically check if the balance has changed.
		 */
		post: operations['balance'];
	};
	'/wallet/play': {
		/**
		 * Play Game Request
		 * @description This API endpoint triggers a play where the Player is debited money to play a round of the game.
		 */
		post: operations['play'];
	};
	'/wallet/end-round': {
		/**
		 * Player Round End
		 * @description This API endpoint triggers an end round to occur. No futher actions can be made for this round. A payout request will be sent to the operator.
		 */
		post: operations['end-round'];
	};
	'/bet/event': {
		/**
		 * Bet Event
		 * @description This endpoint tracks where in the bet the user is up to. Send a 'event' string to this endpoint to be saved to the RGS database with the bet.
		 */
		post: operations['event'];
	};
	'/bet/action': {
		/**
		 * Bet Action
		 * @description Some games require additional actions, this endpoint will trigger an addtional action to occur if the game has been setup for it.
		 */
		post: operations['action'];
	};
	'/session/start': {
		/**
		 * Start Session
		 * @description This endpoint is must be created on the RGS side that an operator can send a request to. The operator will send a request to this endpoint to get a URL for the game that the player wishes to play. **Please send this API request to the mock-casino endpoint of the environment.**
		 */
		post: operations['session_start'];
	};
	'/game/search': {
		/**
		 * @description TBD
		 */
		post: operations['search'];
	};
	'/bet/replay/{game}/{version}/{mode}/{event}': {
		/**
		 * Replay Bet
		 * @description Fetch historical bet data for replay/review purposes. Returns the round details for a specific bet identified by game, version, mode, and event.
		 */
		get: operations['replay'];
	};
}

export interface components {
	schemas: {
		Error: any;
		Search: {
			bookID?: number;
			kind?: number;
			symbol?: string;
			hasWild?: boolean;
			wildMult?: number;
			gameType?: string;
		};
		req_search: {
			mode?: components['schemas']['Mode'];
			search?: components['schemas']['Search'];
		};
		res_search: {
			balance?: components['schemas']['BalanceObject'];
			round?: components['schemas']['RoundDetailObject'];
			error?: components['schemas']['Error'];
		};
		res_replay: {
			status?: components['schemas']['StatusObject'];
			round?: components['schemas']['RoundDetailObject'];
			error?: components['schemas']['Error'];
		};
		/**
		 * Format: uuid
		 * @description Session ID passed to the iFrame through the URL parameters passed in.
		 */
		SessionID: string;
		/** @description RGS game id */
		Language: string;
		req_authenticate: {
			sessionID: components['schemas']['SessionID'];
			language?: components['schemas']['Language'];
		};
		/**
		 * @description Status codes returned by the Stake Engine RGS API
		 * @enum {string}
		 */
		StatusCode:
			| 'SUCCESS'
			| 'ERR_SCR'  // Invalid Secret
			| 'ERR_OPT'  // Invalid Operator ID
			| 'ERR_IPB'  // Insufficient Player Balance
			| 'ERR_IS'   // Invalid Session Token/ Session Timeout
			| 'ERR_ATE'  // Failed User Authentication/ Authentication Token Expired
			| 'ERR_GLE'  // Gambling limits exceeded
			| 'ERR_BNF'  // Bet not found
			| 'ERR_BE'   // Player already has an active bet
			| 'ERR_UE'   // General Server Error (Unknown Error)
			| 'ERR_GE';  // General Server Error (Without Rollback)
		/** @description Status Message accompanying the status code */
		StatusMessage: string;
		StatusObject: {
			statusCode?: components['schemas']['StatusCode'];
			statusMessage?: components['schemas']['StatusMessage'];
		};
		/**
		 * Format: integer
		 * @description Balance of the player in the currency set. Currency must be an integer. EG 1000 = $10.00
		 */
		Balance: number;
		/** @description Currency the player is playing in */
		Currency: string;
		BalanceObject: {
			amount: components['schemas']['Amount'];
			currency: components['schemas']['Currency'];
		};
		/** @description Unique id of the round on the RGS side */
		RoundID: number;
		/** @description Amount to be actioned. Currency must be an integer. EG 1000 = $10.00 */
		Amount: number;
		/**
		 * Format: float
		 * @description Balance of the player in the currency set. Balance must be 2 decimal places (0.00)
		 */
		Payout: number;
		/**
		 * Format: float
		 * @description Payout Multiplier for the bet. Payout / Amount.
		 */
		PayoutMultiplier: number;
		/** @description Active is whether a bet is still being played and is currently active. */
		Active: boolean;
		/** @description Mode indicates the type of bet the PLAYER is making. Every operator will need to have their own conventions for the mode. */
		Mode: string;
		/** @description Event information that the Provider needs to track the bet progress. This event along with the previous bet will be passed back in the /wallet/authenticate request. */
		Event: string;
		/** @description Describes the state of the game. This is up to the developer of the game to ensure the structure. This will usually be an array of actions to occur in the game */
		GameState: unknown[];
		RoundDetailObject: {
			roundID?: components['schemas']['RoundID'];
			amount?: components['schemas']['Amount'];
			payout?: components['schemas']['Payout'];
			payoutMultiplier?: components['schemas']['PayoutMultiplier'];
			active?: components['schemas']['Active'];
			mode?: components['schemas']['Mode'];
			event?: components['schemas']['Event'];
			state?: components['schemas']['GameState'];
		};
		Config: {
			/** @example BASE */
			mode?: string;
			/**
			 * @description Denotes the multiplier to charge ontop of the base bet amount.
			 * @example [1]
			 */
			costMultiplier?: number;
			/** @description Denotes whether the round is a feature buy or a regular spin. */
			feature?: boolean;
		};
		ConfigObject: {
			betLevels?: number[];
			betModes?: {
				BASE?: components['schemas']['Config'];
			};
			/**
			 * @description Custom bet amounts must be denomiator of this value. Eg if defaultBetLevel = 10 -> $2 / 10 would be a valid bet.
			 * @example 10
			 */
			defaultBetLevel?: number;
			jurisdiction: {
				socialCasino: boolean;
				disabledFullscreen: boolean;
				disabledTurbo: boolean;
				disabledSuperTurbo: boolean;
				disabledAutoplay: boolean;
				disabledSlamstop: boolean;
				disabledSpacebar: boolean;
				disabledBuyFeature: boolean;
				displayNetPosition: boolean;
				displayRTP: boolean;
				displaySessionTimer: boolean;
				minimumRoundDuration: number;
			};
		};
		res_authenticate: {
			status?: components['schemas']['StatusObject'];
			balance?: components['schemas']['BalanceObject'];
			round?: components['schemas']['RoundDetailObject'];
			config?: components['schemas']['ConfigObject'];
			error?: components['schemas']['Error'];
			message?: string;
		};
		req_Balance: {
			sessionID: components['schemas']['SessionID'];
		};
		res_Balance: {
			balance?: components['schemas']['BalanceObject'];
			status?: components['schemas']['StatusObject'];
			error?: components['schemas']['Error'];
		};
		/** @description This field contains values that are not determined by the RGS but by the Game and the Game Provider. Use this field to pass additional information to a game. This information is sent as is and is not validated by the RGS. */
		Meta: Record<string, never>;
		req_play: {
			sessionID: components['schemas']['SessionID'];
			amount: components['schemas']['Amount'];
			currency: components['schemas']['Currency'];
			mode: components['schemas']['Mode'];
			meta?: components['schemas']['Meta'];
		};
		res_play: {
			status?: components['schemas']['StatusObject'];
			balance?: components['schemas']['BalanceObject'];
			round?: components['schemas']['RoundDetailObject'];
			error?: components['schemas']['Error'];
		};
		req_end_round: {
			sessionID: components['schemas']['SessionID'];
		};
		res_end_round: {
			balance?: components['schemas']['BalanceObject'];
			status?: components['schemas']['StatusObject'];
			error?: components['schemas']['Error'];
		};
		req_event: {
			sessionID: components['schemas']['SessionID'];
			event?: components['schemas']['Event'];
		};
		res_event: {
			event?: components['schemas']['Event'];
			status?: components['schemas']['StatusObject'];
			error?: components['schemas']['Error'];
		};
		/** @description Action determines the actions the RGS will take before sending the request to the game. BET will send an additional bet to the Operator. DECISION will send the request directly to the game. */
		Action: string;
		req_action: {
			sessionID: components['schemas']['SessionID'];
			action: components['schemas']['Action'];
			meta?: components['schemas']['Meta'];
		};
		res_action: {
			status?: components['schemas']['StatusObject'];
			balance?: components['schemas']['BalanceObject'];
			action?: components['schemas']['RoundDetailObject'];
			error?: components['schemas']['Error'];
		};
		/** @description Currency the player is playing in */
		currency: string;
		/** @description String that represents a session on the casino side. This can be passed back with every API call. */
		Token: OneOf<[string, Record<string, never>]>;
		req_sess_start: {
			currency: components['schemas']['currency'];
			token: components['schemas']['Token'];
			/** @default 100000 */
			balance?: components['schemas']['BalanceObject'];
			/**
			 * @description setBalance will set the number in 'balance' as the players current balance.
			 * @default false
			 */
			setBalance?: boolean;
		};
		/** @description URL for the game. Pass this url into an iFrame to view the game to begin playing. */
		URL: string;
		res_sess_start: {
			url?: components['schemas']['URL'];
			error?: components['schemas']['Error'];
		};
	};
	responses: never;
	parameters: never;
	requestBodies: never;
	headers: never;
	pathItems: never;
}

export interface operations {
	/**
	 * @description TBD
	 */
	search: {
		/** @description TBD **/
		requestBody: {
			content: {
				'application/json': components['schemas']['req_search'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_search'];
				};
			};
		};
	};
	/**
	 * Authenticate Player Request
	 * @description This endpoint validates a sessionID with the operator to ensure it is a valid session.
	 */
	authenticate: {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_authenticate'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_authenticate'];
				};
			};
		};
	};
	/**
	 * Player Balance Request
	 * @description Additional API call to receive balance of the player. Most API calls return the players balance, although a provider may want to periodically check if the balance has changed.
	 */
	balance: {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_Balance'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_Balance'];
				};
			};
		};
	};
	/**
	 * Play Game Request
	 * @description This API endpoint triggers a play where the Player is debited money to play a round of the game.
	 */
	play: {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_play'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_play'];
				};
			};
		};
	};
	/**
	 * Player Round End
	 * @description This API endpoint triggers an end round to occur. No futher actions can be made for this round. A payout request will be sent to the operator.
	 */
	'end-round': {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_end_round'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_end_round'];
				};
			};
		};
	};
	/**
	 * Bet Event
	 * @description This endpoint tracks where in the bet the user is up to. Send a 'event' string to this endpoint to be saved to the RGS database with the bet.
	 */
	event: {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_event'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_event'];
				};
			};
		};
	};
	/**
	 * Bet Action
	 * @description Some games require additional actions, this endpoint will trigger an addtional action to occur if the game has been setup for it.
	 */
	action: {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_action'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_action'];
				};
			};
		};
	};
	/**
	 * Start Session
	 * @description This endpoint is must be created on the RGS side that an operator can send a request to. The operator will send a request to this endpoint to get a URL for the game that the player wishes to play. **Please send this API request to the mock-casino endpoint of the environment.**
	 */
	session_start: {
		/** @description Session Information */
		requestBody: {
			content: {
				'application/json': components['schemas']['req_sess_start'];
			};
		};
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_sess_start'];
				};
			};
		};
	};
	/**
	 * Replay Bet
	 * @description Fetch historical bet data for replay/review purposes.
	 */
	replay: {
		responses: {
			/** @description OK */
			200: {
				content: {
					'application/json': components['schemas']['res_replay'];
				};
			};
		};
	};
}

/**
 * High-level bet type for game logic
 */
type BaseBet = components['schemas']['RoundDetailObject'];
type BaseBetWithoutState = Omit<BaseBet, 'state'>;

export type BetType<TBookEvent extends object> = BaseBetWithoutState & {
	state: TBookEvent[];
};

/**
 * Generic bet type for any game event
 */
export type BaseBetType = BetType<any>;