<script lang="ts">
	import { onDestroy } from 'svelte';
	export let active: boolean;
	let alarm: HTMLAudioElement | null = null;

	$: if (active) {
		if (!alarm) {
			alarm = new Audio('/alarm.mp3');
			alarm.loop = true;
			alarm.play().catch((error) => {
				console.error('Failed to play alarm:', error);
			});
		}
	} else {
		if (alarm) {
			alarm.pause();
			alarm.currentTime = 0;
			alarm = null;
		}
	}
	onDestroy(() => {
		if (alarm) {
			alarm.pause();
			alarm = null;
		}
	});
</script>
