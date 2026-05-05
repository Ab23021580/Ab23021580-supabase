<script lang="ts">
	let { 
		pxPerMm = 4, 
		startMm = 50, 
		currentMm = 50 
	}: { 
		pxPerMm?: number, 
		startMm?: number, 
		currentMm?: number 
	} = $props();

	let minMm = $derived(Math.min(startMm, currentMm));
	let maxMm = $derived(Math.max(startMm, currentMm));
</script>

<g class="ruler-base">
	<rect x="50" y="40" width="800" height="80" fill="var(--bg-main)" stroke="#333" stroke-width="2" rx="4" />
	
	{#each Array(201) as _, i}
		{@const x = 50 + i * pxPerMm}
		{@const isCm = i % 10 === 0}
		{@const isHalfCm = i % 5 === 0 && !isCm}
		{@const isPassed = i >= minMm && i <= maxMm && minMm !== maxMm}
		
		<line 
			x1={x} y1="40" 
			x2={x} y2={isCm ? 75 : isHalfCm ? 65 : 55} 
			stroke={isPassed ? "#3b82f6" : "#333"} 
			stroke-width={isCm ? (isPassed ? 3 : 2) : 1}
			class="transition-colors duration-200"
		/>
		
		{#if isCm}
			<text 
				x={x} y="95" 
				text-anchor="middle" 
				font-size="14" 
				font-weight={isPassed ? "900" : "bold"} 
				fill={isPassed ? "#3b82f6" : "#333"}
				class="transition-all duration-200"
			>
				{i / 10}
			</text>
		{/if}
	{/each}

	<!-- 將 cm 字樣放在 19cm 和 20cm 之間的中點 (19.5cm) -->
	<text x={50 + 195 * pxPerMm} y="65" text-anchor="middle" font-size="14" font-weight="900" fill="#333">cm</text>
</g>
