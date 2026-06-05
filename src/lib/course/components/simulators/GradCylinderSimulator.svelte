<script lang="ts">
	import type { CourseState } from '$lib/course/courseState.svelte';
	import GraduatedCylinder from './_global/lab/GraduatedCylinder.svelte';

	let { courseState, onCorrect }: {
		courseState: CourseState;
		onCorrect: () => void;
	} = $props();

	// 靜態展示，自動通過
	import { onMount } from 'svelte';
	onMount(() => { onCorrect(); });
</script>

<div class="flex flex-col items-center gap-2 p-4 w-full select-none">
	<p class="text-sm font-bold text-gray-600 text-center">
		實驗室中通常以量筒，測量液體的體積
	</p>

	<svg width="100%" viewBox="0 0 300 280"
		preserveAspectRatio="xMidYMid meet" class="max-w-[320px]"
		role="img" aria-label="量筒示意圖">

		<GraduatedCylinder x={150} y={250} height={210} waterLevel={0.6} />

		<!-- 標籤 -->
		<text x="150" y="270" text-anchor="middle"
			font-size="12" fill="#475569" font-weight="bold">
			量筒
		</text>

		<!-- 讀數標示 -->
		<text x="225" y={250 - 14 - 0.6 * (210 - 14) + 4} text-anchor="start"
			font-size="10" fill="#3b82f6" font-weight="bold">
			← 讀取此處
		</text>
	</svg>
</div>
