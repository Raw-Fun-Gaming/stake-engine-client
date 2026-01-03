import {
	requestAuthenticate,
	requestBet,
	requestBalance,
	requestEndRound,
	requestEndEvent,
	requestForceResult,
	requestReplay,
	isReplayMode,
	getReplayUrlParams,
	API_AMOUNT_MULTIPLIER,
} from 'stake-engine-client';

// State
let sessionID: string | null = null;
let rgsUrl: string | null = null;
let language = 'en';
let isAuthenticated = false;
let isReplayModeSelected = false;

// DOM Elements
const loginSection = document.getElementById('login-section')!;
const statusSection = document.getElementById('status-section')!;
const replaySection = document.getElementById('replay-section')!;
const apiSection = document.getElementById('api-section')!;
const outputSection = document.getElementById('output-section')!;
const errorSection = document.getElementById('error-section')!;

const urlInput = document.getElementById('url-input') as HTMLInputElement;
const sessionInput = document.getElementById('session-input') as HTMLInputElement;
const rgsInput = document.getElementById('rgs-input') as HTMLInputElement;
const langInput = document.getElementById('lang-input') as HTMLInputElement;

// Mode toggle elements
const authFields = document.getElementById('auth-fields')!;
const replayFields = document.getElementById('replay-fields')!;
const authBtn = document.getElementById('auth-btn')!;
const replayBtn = document.getElementById('replay-btn')!;
const modeAuthBtn = document.getElementById('mode-auth')!;
const modeReplayBtn = document.getElementById('mode-replay')!;

// Replay input fields
const replayGameInput = document.getElementById('replay-game-input') as HTMLInputElement;
const replayVersionInput = document.getElementById('replay-version-input') as HTMLInputElement;
const replayModeInput = document.getElementById('replay-mode-input') as HTMLInputElement;
const replayEventInput = document.getElementById('replay-event-input') as HTMLInputElement;

const statusIndicator = document.getElementById('status-indicator')!;
const balanceDisplay = document.getElementById('balance-display')!;
const replayInfo = document.getElementById('replay-info')!;
const replayOutput = document.getElementById('replay-output')!;
const requestOutput = document.getElementById('request-output')!;
const responseOutput = document.getElementById('response-output')!;
const errorOutput = document.getElementById('error-output')!;

// Option panels
const betOptions = document.getElementById('bet-options')!;
const eventOptions = document.getElementById('event-options')!;
const forceOptions = document.getElementById('force-options')!;
const replayOptions = document.getElementById('replay-options')!;

// Helper functions
function show(element: HTMLElement) {
	element.classList.remove('hidden');
}

function hide(element: HTMLElement) {
	element.classList.add('hidden');
}

function hideAllOptionPanels() {
	hide(betOptions);
	hide(eventOptions);
	hide(forceOptions);
	hide(replayOptions);
}

function formatJson(obj: unknown): string {
	return JSON.stringify(obj, null, 2);
}

function formatBalance(amount: number, currency: string): string {
	const dollars = amount / API_AMOUNT_MULTIPLIER;
	return `$${dollars.toFixed(2)} ${currency}`;
}

function showRequest(name: string, params: object) {
	requestOutput.textContent = `// ${name}\n${formatJson(params)}`;
}

function showResponse(data: unknown) {
	responseOutput.textContent = formatJson(data);
	show(outputSection);
}

function showError(error: unknown) {
	let message = error instanceof Error ? error.message : String(error);

	// Add hints for specific errors
	if (message.includes('player has active bet')) {
		message += '\n\nHint: Click "End Round" to finish the active round first.';
	}

	errorOutput.textContent = message;
	show(errorSection);
}

function clearError() {
	hide(errorSection);
}

function getUrlParams() {
	const params = new URLSearchParams(window.location.search);
	return {
		sessionID: params.get('sessionID'),
		rgsUrl: params.get('rgs_url'),
		language: params.get('lang') || 'en',
	};
}

function setMode(replayMode: boolean) {
	isReplayModeSelected = replayMode;
	if (replayMode) {
		hide(authFields);
		show(replayFields);
		hide(authBtn);
		show(replayBtn);
		modeAuthBtn.classList.remove('active');
		modeReplayBtn.classList.add('active');
	} else {
		show(authFields);
		hide(replayFields);
		show(authBtn);
		hide(replayBtn);
		modeAuthBtn.classList.add('active');
		modeReplayBtn.classList.remove('active');
	}
}

function parseUrlInput(url: string) {
	try {
		const urlObj = new URL(url);
		const params = urlObj.searchParams;

		// Check if it's a replay URL
		const isReplay = params.get('replay') === 'true';

		// Always extract RGS URL
		rgsInput.value = params.get('rgs_url') || '';

		if (isReplay) {
			// Switch to replay mode and populate fields
			setMode(true);
			replayGameInput.value = params.get('game') || '';
			replayVersionInput.value = params.get('version') || '';
			replayModeInput.value = params.get('mode') || 'base';
			replayEventInput.value = params.get('event') || '';
		} else {
			// Switch to auth mode and populate fields
			setMode(false);
			sessionInput.value = params.get('sessionID') || '';
			langInput.value = params.get('lang') || 'en';
		}
	} catch {
		alert('Invalid URL format');
	}
}

async function authenticate() {
	clearError();

	sessionID = sessionInput.value.trim();
	rgsUrl = rgsInput.value.trim();
	language = langInput.value.trim() || 'en';

	if (!sessionID || !rgsUrl) {
		showError('Session ID and RGS URL are required');
		return;
	}

	try {
		showRequest('requestAuthenticate', { sessionID, rgsUrl, language });

		const response = await requestAuthenticate({
			sessionID,
			rgsUrl,
			language,
		});

		showResponse(response);

		// Check for success: either status.statusCode === 'SUCCESS' or we got a balance back
		const isSuccess = response.status?.statusCode === 'SUCCESS' || response.balance != null;

		if (isSuccess) {
			isAuthenticated = true;
			hide(loginSection);
			show(statusSection);
			show(apiSection);

			statusIndicator.innerHTML = '<span class="success">Authenticated</span>';

			if (response.balance) {
				balanceDisplay.textContent = `Balance: ${formatBalance(response.balance.amount, response.balance.currency)}`;
			}
		} else {
			showError(`Authentication failed: ${response.status?.statusCode || 'ERROR'} - ${response.status?.statusMessage || response.message || 'Unknown error'}`);
		}
	} catch (error) {
		showError(error);
	}
}

async function handleReplayMode() {
	const params = getReplayUrlParams();

	replayInfo.innerHTML = `
		<p><strong>Game:</strong> ${params.game} v${params.version}</p>
		<p><strong>Mode:</strong> ${params.mode} | <strong>Event:</strong> ${params.event}</p>
		${params.amount ? `<p><strong>Original Bet:</strong> $${params.amount.toFixed(2)}</p>` : ''}
	`;

	hide(loginSection);
	show(replaySection);

	try {
		const urlParams = getUrlParams();
		rgsUrl = urlParams.rgsUrl;

		if (!rgsUrl) {
			replayOutput.textContent = 'Error: rgs_url parameter is required for replay';
			return;
		}

		const response = await requestReplay({
			game: params.game,
			version: params.version,
			mode: params.mode,
			event: params.event,
			rgsUrl,
		});

		replayOutput.textContent = formatJson(response);
	} catch (error) {
		replayOutput.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
	}
}

async function handleManualReplay() {
	clearError();

	const game = replayGameInput.value.trim();
	const version = replayVersionInput.value.trim();
	const mode = replayModeInput.value.trim() || 'base';
	const event = replayEventInput.value.trim();
	rgsUrl = rgsInput.value.trim();

	if (!game || !version || !event || !rgsUrl) {
		showError('Game ID, Version, Event, and RGS URL are required');
		return;
	}

	replayInfo.innerHTML = `
		<p><strong>Game:</strong> ${game} v${version}</p>
		<p><strong>Mode:</strong> ${mode} | <strong>Event:</strong> ${event}</p>
	`;

	hide(loginSection);
	show(replaySection);

	try {
		const response = await requestReplay({
			game,
			version,
			mode,
			event,
			rgsUrl,
		});

		replayOutput.textContent = formatJson(response);
	} catch (error) {
		replayOutput.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
	}
}

// API button handlers
async function handleBalance() {
	hideAllOptionPanels();
	clearError();

	try {
		showRequest('requestBalance', { sessionID, rgsUrl });
		const response = await requestBalance({ sessionID: sessionID!, rgsUrl: rgsUrl! });
		showResponse(response);

		if (response.balance) {
			balanceDisplay.textContent = `Balance: ${formatBalance(response.balance.amount, response.balance.currency)}`;
		}
	} catch (error) {
		showError(error);
	}
}

function handleBetClick() {
	hideAllOptionPanels();
	show(betOptions);
}

async function handleBetSubmit() {
	clearError();

	const amount = parseFloat((document.getElementById('bet-amount') as HTMLInputElement).value);
	const mode = (document.getElementById('bet-mode') as HTMLInputElement).value;

	try {
		showRequest('requestBet', { sessionID, rgsUrl, amount, mode, currency: 'USD' });
		const response = await requestBet({
			sessionID: sessionID!,
			rgsUrl: rgsUrl!,
			amount,
			mode,
			currency: 'USD',
		});
		showResponse(response);

		if (response.balance) {
			balanceDisplay.textContent = `Balance: ${formatBalance(response.balance.amount, response.balance.currency)}`;
		}
	} catch (error) {
		showError(error);
	}
}

async function handleEndRound() {
	hideAllOptionPanels();
	clearError();

	try {
		showRequest('requestEndRound', { sessionID, rgsUrl });
		const response = await requestEndRound({ sessionID: sessionID!, rgsUrl: rgsUrl! });
		showResponse(response);

		if (response.balance) {
			balanceDisplay.textContent = `Balance: ${formatBalance(response.balance.amount, response.balance.currency)}`;
		}
	} catch (error) {
		showError(error);
	}
}

function handleEndEventClick() {
	hideAllOptionPanels();
	show(eventOptions);
}

async function handleEndEventSubmit() {
	clearError();

	const eventIndex = parseInt((document.getElementById('event-index') as HTMLInputElement).value);

	try {
		showRequest('requestEndEvent', { sessionID, rgsUrl, eventIndex });
		const response = await requestEndEvent({
			sessionID: sessionID!,
			rgsUrl: rgsUrl!,
			eventIndex,
		});
		showResponse(response);
	} catch (error) {
		showError(error);
	}
}

function handleForceResultClick() {
	hideAllOptionPanels();
	show(forceOptions);
}

async function handleForceResultSubmit() {
	clearError();

	const mode = (document.getElementById('force-mode') as HTMLInputElement).value;
	const bookIdStr = (document.getElementById('force-book-id') as HTMLInputElement).value;
	const symbol = (document.getElementById('force-symbol') as HTMLInputElement).value;

	const search: Record<string, unknown> = {};
	if (bookIdStr) search.bookID = parseInt(bookIdStr);
	if (symbol) search.symbol = symbol;

	try {
		showRequest('requestForceResult', { rgsUrl, mode, search });
		const response = await requestForceResult({
			rgsUrl: rgsUrl!,
			mode,
			search,
		});
		showResponse(response);
	} catch (error) {
		showError(error);
	}
}

function handleReplayClick() {
	hideAllOptionPanels();
	show(replayOptions);
}

async function handleReplaySubmit() {
	clearError();

	const game = (document.getElementById('replay-game') as HTMLInputElement).value;
	const version = (document.getElementById('replay-version') as HTMLInputElement).value;
	const mode = (document.getElementById('replay-mode') as HTMLInputElement).value;
	const event = (document.getElementById('replay-event') as HTMLInputElement).value;

	try {
		showRequest('requestReplay', { rgsUrl, game, version, mode, event });
		const response = await requestReplay({
			rgsUrl: rgsUrl!,
			game,
			version,
			mode,
			event,
		});
		showResponse(response);
	} catch (error) {
		showError(error);
	}
}

// Event listeners
document.getElementById('parse-url-btn')!.addEventListener('click', () => {
	parseUrlInput(urlInput.value);
});

document.getElementById('auth-btn')!.addEventListener('click', authenticate);
document.getElementById('replay-btn')!.addEventListener('click', handleManualReplay);
document.getElementById('mode-auth')!.addEventListener('click', () => setMode(false));
document.getElementById('mode-replay')!.addEventListener('click', () => setMode(true));

document.getElementById('btn-balance')!.addEventListener('click', handleBalance);
document.getElementById('btn-bet')!.addEventListener('click', handleBetClick);
document.getElementById('btn-bet-submit')!.addEventListener('click', handleBetSubmit);
document.getElementById('btn-end-round')!.addEventListener('click', handleEndRound);
document.getElementById('btn-end-event')!.addEventListener('click', handleEndEventClick);
document.getElementById('btn-event-submit')!.addEventListener('click', handleEndEventSubmit);
document.getElementById('btn-force-result')!.addEventListener('click', handleForceResultClick);
document.getElementById('btn-force-submit')!.addEventListener('click', handleForceResultSubmit);
document.getElementById('btn-replay')!.addEventListener('click', handleReplayClick);
document.getElementById('btn-replay-submit')!.addEventListener('click', handleReplaySubmit);
document.getElementById('btn-logout')!.addEventListener('click', () => {
	window.location.href = window.location.pathname;
});
document.getElementById('btn-replay-back')!.addEventListener('click', () => {
	window.location.href = window.location.pathname;
});

// Allow Enter key to submit in input fields
sessionInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') authenticate(); });
rgsInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') authenticate(); });
langInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') authenticate(); });
urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') parseUrlInput(urlInput.value); });

// Initialize
function init() {
	// Check for replay mode first
	if (isReplayMode()) {
		handleReplayMode();
		return;
	}

	// Check for URL parameters
	const params = getUrlParams();
	if (params.sessionID && params.rgsUrl) {
		sessionInput.value = params.sessionID;
		rgsInput.value = params.rgsUrl;
		langInput.value = params.language;

		// Auto-authenticate
		authenticate();
	}
}

init();
