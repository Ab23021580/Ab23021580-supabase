<script lang="ts">
	import type { CourseState } from '../courseState.svelte';
	import { uiTheme } from '../uiTheme.svelte';

	let {
		courseState,
		isCorrect = false,
		showFeedback = false
	}: { courseState: CourseState; isCorrect?: boolean; showFeedback?: boolean } = $props();
	let currentStage = $derived(courseState.currentStage);
	let styles = $derived(uiTheme.styles);
</script>

<div class="instruction-area w-full transition-all duration-300 flex flex-col items-center justify-center gap-4 {styles.container}">
	<div class="flex items-center gap-3">
		<span class="font-black text-xs tracking-[0.2em] uppercase px-3 py-1 transition-all {styles.pill}">
			{currentStage.type}
		</span>
		<h2 class="text-2xl font-black tracking-tight transition-all {styles.text}">
			{currentStage.question}
		</h2>
	</div>
</div>
