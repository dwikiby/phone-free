<script lang="ts">
	import { timer, isRunning, isBreak, POMODORO_DURATION, BREAK_DURATION } from '$lib/stores/timer';
	import { formatTime } from '$lib/utils/formatTime';
	import { onDestroy } from 'svelte';

	let interval: NodeJS.Timeout;

	function startPomodoro() {
		isRunning.set(true);
		isBreak.set(false);
		timer.set(POMODORO_DURATION);
	}
	// Subscribe to isRunning store
	const unsubscribe = isRunning.subscribe((running) => {
		if (running) {
			clearInterval(interval);
			interval = setInterval(() => {
				timer.update((t) => {
					if (t <= 0) {
						isRunning.set(false);
						isBreak.update((b) => !b);
						return $isBreak ? BREAK_DURATION : POMODORO_DURATION;
					}
					return t - 1;
				});
			}, 1000);
		} else {
			clearInterval(interval);
		}
	});

	onDestroy(() => {
		clearInterval(interval);
		unsubscribe();
	});
</script>

<div class="flex flex-col items-center gap-2">
	<div class="text-3xl font-bold">{formatTime($timer)}</div>
	<div>{$isBreak ? 'Break Time!' : 'Focus Time!'}</div>
	{#if !$isRunning}
		<button
			on:click={startPomodoro}
			class="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
		>
			Start Pomodoro
		</button>
	{/if}
	{#if $isRunning}
		<button
			on:click={() => isRunning.set(false)}
			class="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
		>
			Stop
		</button>
	{/if}
</div>
