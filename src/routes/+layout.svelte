<script lang="ts">
	import '../app.css';
	import { uiTheme } from '$lib/course/uiTheme.svelte';

	let { children } = $props();
</script>

<div class={uiTheme.current === 'classic' ? 'bg-classic-lab' : 'bg-[#876D5A] min-h-screen'}>
	{#if uiTheme.current === 'pixel'}
		<div class="pixel-frame"></div>
	{/if}

	{@render children()}
</div>
