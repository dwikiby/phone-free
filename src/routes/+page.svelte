<script lang="ts">
	import PomodoroTimer from '$lib/components/PomodoroTimer.svelte';
	import VideoDetection from '$lib/components/VideoDetection.svelte';
	import Alarm from '$lib/components/Alarm.svelte';
	import { phoneDetected, isRunning, isBreak } from '$lib/stores/timer';
</script>

<main
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-200 p-6"
>
	<div class="card preset-filled-surface-100-900 w-full max-w-xl p-6 text-center shadow-xl">
		<div class="mb-4 flex flex-col items-center gap-2">
			<span class="inline-flex items-center justify-center rounded-full bg-indigo-100 p-2">
				<svg width="32" height="32" fill="none" viewBox="0 0 24 24"
					><path
						fill="#6366f1"
						d="M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm0 2h10v16H7V4Zm5 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
					/></svg
				>
			</span>
			<h1 class="text-4xl font-extrabold text-indigo-700">Phone-Free</h1>
			<p class="text-lg text-gray-600">Stay focused with Pomodoro and real-time phone detection.</p>
		</div>
		<div class="flex flex-col items-center gap-6">
			<VideoDetection />
			<PomodoroTimer />
			<Alarm active={$phoneDetected && $isRunning && !$isBreak} />
			{#if $phoneDetected && $isRunning && !$isBreak}
				<div
					class="animate-pulse rounded-lg border border-red-300 bg-red-100 px-4 py-2 font-semibold text-red-700 shadow"
				>
					<span class="mr-2">📱</span>Smartphone detected! Stay focused!
				</div>
			{/if}
		</div>
	</div>
	<footer class="mt-8 text-sm text-gray-500">
		&copy; {new Date().getFullYear()} Phone-Free &mdash; Powered by SvelteKit & Skeleton UI
	</footer>
</main>
