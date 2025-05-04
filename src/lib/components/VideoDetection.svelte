<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as cocoSsd from '@tensorflow-models/coco-ssd';
	import '@tensorflow/tfjs';
	import { phoneDetected, isRunning, isBreak } from '$lib/stores/timer';

	let videoRef: HTMLVideoElement;
	let canvasRef: HTMLCanvasElement;
	let model: cocoSsd.ObjectDetection | null = null;

	// adjust it
	const PHONE_DETECTION_THRESHOLD = 0.2;

	const DEVICE_CLASSES = ['cell phone', 'mobile phone', 'smartphone', 'telephone', 'remote'];

	let detectionFrame: number;
	let detectionCount = 0;
	const DETECTION_MEMORY = 5;

	let lastDetection = {
		confidence: 0,
		class: '',
		distance: 0
	};

	async function setupCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 1920 },
					height: { ideal: 1080 },
					facingMode: 'user',
					frameRate: { ideal: 30 },
					aspectRatio: { ideal: 16 / 9 }
				}
			});

			if (videoRef) {
				videoRef.srcObject = stream;
				await videoRef.play();

				canvasRef.width = videoRef.videoWidth;
				canvasRef.height = videoRef.videoHeight;
			}
		} catch (error) {
			console.error('Camera setup error:', error);
		}
	}

	async function detectObjects() {
		if (!model || !videoRef || !canvasRef) return;

		const ctx = canvasRef.getContext('2d');
		if (!ctx) return;

		try {
			// Gambar frame video ke canvas
			ctx.clearRect(0, 0, canvasRef.width, canvasRef.height);
			ctx.drawImage(videoRef, 0, 0, canvasRef.width, canvasRef.height);

			// Deteksi objek
			const predictions = await model.detect(videoRef);
			let foundDevice = false;
			let highestConfidence = 0;
			let detectedClass = '';

			predictions.forEach((pred) => {
				// Cek semua kemungkinan device
				if (DEVICE_CLASSES.includes(pred.class.toLowerCase())) {
					foundDevice = true;

					// Update confidence tertinggi
					if (pred.score > highestConfidence) {
						highestConfidence = pred.score;
						detectedClass = pred.class;

						// Hitung ukuran relatif (untuk estimasi jarak)
						const objectSize = (pred.bbox[2] * pred.bbox[3]) / (canvasRef.width * canvasRef.height);
						lastDetection = {
							confidence: pred.score,
							class: pred.class,
							distance: objectSize
						};
					}

					// Draw bounding box dengan warna berdasarkan confidence
					ctx.beginPath();
					ctx.rect(...pred.bbox);
					ctx.lineWidth = 2;

					// Warna berdasarkan confidence
					const confidenceColor = `rgb(${255 * (1 - pred.score)}, ${255 * pred.score}, 0)`;
					ctx.strokeStyle = confidenceColor;
					ctx.stroke();

					// Label dengan detail
					ctx.fillStyle = confidenceColor;
					ctx.font = '16px Arial';
					const label = `${pred.class} (${Math.round(pred.score * 100)}%)`;
					ctx.fillText(label, pred.bbox[0], pred.bbox[1] > 20 ? pred.bbox[1] - 5 : 20);
				}
			});

			// Update detection counter dengan memory
			if (foundDevice && highestConfidence > PHONE_DETECTION_THRESHOLD) {
				detectionCount = Math.min(detectionCount + 1, DETECTION_MEMORY);
			} else {
				detectionCount = Math.max(detectionCount - 1, 0);
			}

			// Set phone detected berdasarkan detection memory
			phoneDetected.set(detectionCount > DETECTION_MEMORY / 2);

			// Debug overlay
			if ($isRunning && !$isBreak) {
				ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
				ctx.fillRect(10, 10, 200, 80);
				ctx.fillStyle = 'white';
				ctx.font = '14px Arial';
				ctx.fillText(`Last Detection: ${lastDetection.class}`, 20, 30);
				ctx.fillText(`Confidence: ${(lastDetection.confidence * 100).toFixed(1)}%`, 20, 50);
				ctx.fillText(`Detection Count: ${detectionCount}/${DETECTION_MEMORY}`, 20, 70);
			}

			detectionFrame = requestAnimationFrame(detectObjects);
		} catch (error) {
			console.error('Detection error:', error);
			detectionFrame = requestAnimationFrame(detectObjects);
		}
	}

	onMount(async () => {
		try {
			model = await cocoSsd.load({
				base: 'lite_mobilenet_v2'
			});

			await setupCamera();
			detectObjects();
		} catch (error) {
			console.error('Setup error:', error);
		}
	});

	onDestroy(() => {
		if (detectionFrame) cancelAnimationFrame(detectionFrame);
		if (videoRef?.srcObject) {
			(videoRef.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
		}
	});
</script>

<div class="relative mx-auto w-full max-w-xl">
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<video bind:this={videoRef} autoplay playsinline muted class="hidden" />
	<!-- svelte-ignore element_invalid_self_closing_tag -->
	<canvas bind:this={canvasRef} class="w-full rounded-lg border-2 border-gray-300" />

	<!-- Detection Status Overlay -->
	{#if $isRunning && !$isBreak}
		<div class="absolute top-4 right-4 rounded bg-black/50 p-2 text-sm text-white">
			Detection Status: {detectionCount > 0 ? 'Active' : 'Waiting'}
		</div>
	{/if}
</div>
