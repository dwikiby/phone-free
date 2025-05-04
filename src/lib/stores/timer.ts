// src/lib/stores/timer.ts
import { writable } from 'svelte/store';

export const POMODORO_DURATION = 25 * 60; // 25 menit
export const BREAK_DURATION = 5 * 60; // 5 menit

function createTimer() {
	const { subscribe, set, update } = writable(POMODORO_DURATION);

	return {
		subscribe,
		set,
		update,
		reset: () => set(POMODORO_DURATION)
	};
}

export const timer = createTimer();
export const isRunning = writable(false);
export const isBreak = writable(false);
export const phoneDetected = writable(false);
