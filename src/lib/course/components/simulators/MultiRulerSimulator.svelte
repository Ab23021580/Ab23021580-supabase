<script lang="ts">
	import type { CourseState } from '$lib/course/courseState.svelte';
	import RulerBase from './ruler/RulerBase.svelte';

	let {
		courseState,
		onCorrect
	}: {
		courseState: CourseState;
		onCorrect: () => void;
	} = $props();

	let config = $derived(courseState.currentStage.simulator?.config);
	let rulers: { label: string; minUnit: string; mmPerDiv: number; majorInt: number; unit: string; hsStart: number }[] = $derived(config?.rulers ?? []);

	let clicked = $state<boolean[]>([]);
	$effect(() => {
		if (clicked.length !== rulers.length) clicked = rulers.map(() => false);
	});

	let allClicked = $derived(clicked.length > 0 && clicked.every(Boolean));

	$effect(() => {
		if (allClicked && !courseState.isUnlocked(courseState.currentStage.id)) {
			onCorrect();
		}
	});

	function handleClick(i: number) {
		if (courseState.isUnlocked(courseState.currentStage.id)) return;
		clicked[i] = true;
	}

	const pxPerMm = 3; // 稍微縮小比例以節省空間
</script>

<div class="flex flex-col gap-1 p-2 w-full max-h-full overflow-y-auto">
	<p class="text-xs text-gray-500 font-semibold mb-1 text-center">點擊每一把直尺上的色塊區，觀察它們的最小刻度間距</p>

	{#each rulers as ruler, i}
		<div class="w-full flex flex-col items-center mb-1">
			<div class="flex items-center gap-2 w-full max-w-[600px] px-4 justify-between">
				<span class="font-bold text-xs text-gray-700 whitespace-nowrap">{ruler.label}</span>
				<div class="flex items-center gap-2">
					<span class="text-[10px] px-2 py-0.5 rounded font-bold {clicked[i] ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}">
						間距：{ruler.minUnit}
					</span>
					{#if clicked[i]}
						<span class="text-emerald-600 font-black text-[10px]">✓ OK</span>
					{/if}
				</div>
			</div>

			<div class="w-full max-w-[600px] h-[80px]">
				<svg
					width="100%"
					height="100%"
					viewBox="0 30 800 100"
					preserveAspectRatio="xMidYMid meet"
					role="img"
					class="select-none"
				>
					<RulerBase 
						startMm={0} 
						currentMm={0} 
						pxPerMm={pxPerMm} 
						tickIntervalMm={ruler.mmPerDiv} 
						majorTickIntervalMm={ruler.majorInt}
						unitLabel={ruler.unit}
					/>
					
					<!-- 熱區 -->
					<g onclick={() => handleClick(i)} class="cursor-pointer group">
						<rect 
							x={50 + ruler.hsStart * pxPerMm - 5}
							y="35" 
							width={Math.max(20, ruler.mmPerDiv * pxPerMm + 10)} 
							height="65" 
							fill="transparent" 
						/>
						<rect 
							x={50 + ruler.hsStart * pxPerMm}
							y="40" 
							width={Math.max(2, ruler.mmPerDiv * pxPerMm)} 
							height="40" 
							fill={clicked[i] ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.4)"} 
							class="transition-colors group-hover:fill-blue-400"
						/>
					</g>
				</svg>
			</div>
		</div>
	{/each}
</div>
