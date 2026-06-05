<script lang="ts">
	let { courseState, onCorrect } = $props();
	
	let showLine = $state(false);
	
	function trigger() {
		showLine = true;
		setTimeout(onCorrect, 1000);
	}

	// SVG Map
	const W = 500;
	const H = 400;
	const padding = 50;
	
	function mapX(v: number) { return padding + (v / 100) * (W - 2 * padding); }
	function mapY(m: number) { return H - padding - (m / 150) * (H - 2 * padding); }

	// Data
	// Water: M = 1 * V
	// Sugar water: M = 1.3 * V
	const fixedV = 60;
	const mWater = fixedV * 1.0;
	const mSugar = fixedV * 1.5;
</script>

<div class="w-full max-w-[600px] mx-auto bg-slate-50 flex flex-col rounded-xl shadow-inner border overflow-hidden">
	<div class="text-base font-bold text-slate-700 pt-4 pb-1 text-center">
		看圖說故事：固定體積 (V)
	</div>

	<!-- SVG in aspect-video wrapper -->
	<div class="relative w-full aspect-video bg-slate-100">
		<svg viewBox="0 0 {W} {H}" class="absolute inset-0 w-full h-full bg-white border-b">
			<defs>
				<marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
					<path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
				</marker>
			</defs>

			<!-- Axes -->
			<line x1={padding} y1={H - padding} x2={W - padding + 20} y2={H - padding} stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
			<line x1={padding} y1={H - padding} x2={padding} y2={padding - 20} stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
			
			<text x={W - padding + 10} y={H - padding + 20} text-anchor="middle" font-weight="bold" fill="#475569">體積 V (cm³)</text>
			<text x={padding - 15} y={padding - 20} text-anchor="end" font-weight="bold" fill="#475569">質量 M (g)</text>

			<!-- Lines -->
			<!-- Water line -->
			<line x1={mapX(0)} y1={mapY(0)} x2={mapX(90)} y2={mapY(90)} stroke="#3b82f6" stroke-width="3"/>
			<text x={mapX(90) + 10} y={mapY(90) + 5} font-weight="bold" fill="#3b82f6">純水</text>
			
			<!-- Sugar water line -->
			<line x1={mapX(0)} y1={mapY(0)} x2={mapX(90)} y2={mapY(135)} stroke="#d97706" stroke-width="3"/>
			<text x={mapX(90) + 10} y={mapY(135) + 5} font-weight="bold" fill="#d97706">糖水</text>

			<!-- Animation Part -->
			{#if showLine}
				<!-- Vertical line at fixed V -->
				<line x1={mapX(fixedV)} y1={H - padding} x2={mapX(fixedV)} y2={mapY(mSugar)} stroke="#ef4444" stroke-width="2" stroke-dasharray="6" class="animate-draw-v"/>
				
				<!-- Horizontal lines to M axis -->
				<line x1={mapX(fixedV)} y1={mapY(mWater)} x2={padding} y2={mapY(mWater)} stroke="#3b82f6" stroke-width="2" stroke-dasharray="4" class="animate-draw-h1 delay-500" style="opacity: 0; animation-fill-mode: forwards;"/>
				<line x1={mapX(fixedV)} y1={mapY(mSugar)} x2={padding} y2={mapY(mSugar)} stroke="#d97706" stroke-width="2" stroke-dasharray="4" class="animate-draw-h2 delay-1000" style="opacity: 0; animation-fill-mode: forwards;"/>
				
				<!-- Points -->
				<circle cx={mapX(fixedV)} cy={mapY(mWater)} r="5" fill="#3b82f6" class="animate-fade-in delay-500" style="opacity: 0; animation-fill-mode: forwards;"/>
				<circle cx={mapX(fixedV)} cy={mapY(mSugar)} r="5" fill="#d97706" class="animate-fade-in delay-1000" style="opacity: 0; animation-fill-mode: forwards;"/>
				
				<!-- V label -->
				<text x={mapX(fixedV)} y={H - padding + 20} text-anchor="middle" font-weight="bold" fill="#ef4444" class="animate-fade-in">相同體積</text>
				
				<!-- M labels -->
				<text x={padding - 10} y={mapY(mWater) + 4} text-anchor="end" font-weight="bold" fill="#3b82f6" class="animate-fade-in delay-500" style="opacity: 0; animation-fill-mode: forwards;">較輕</text>
				<text x={padding - 10} y={mapY(mSugar) + 4} text-anchor="end" font-weight="bold" fill="#d97706" class="animate-fade-in delay-1000" style="opacity: 0; animation-fill-mode: forwards;">較重</text>
			{/if}
		</svg>
	</div>

	<!-- Controls -->
	<div class="w-full px-6 py-4 flex flex-col items-center gap-4 bg-white shrink-0">
		{#if !showLine}
			<button 
				class="px-8 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-lg shadow-md transition-all"
				onclick={trigger}
			>
				畫一條垂直線 (固定 V)
			</button>
		{:else}
			<div class="text-lg font-bold text-slate-700 bg-rose-50 border border-rose-200 px-6 py-3 rounded-lg animate-fade-in delay-1000" style="opacity: 0; animation-fill-mode: forwards;">
				體積一樣時，<span class="text-amber-600">糖水的質量更大</span>，代表糖水比較緊密！
			</div>
		{/if}
	</div>
</div>

<style>
	.animate-draw-v { animation: drawV 0.5s ease-out forwards; }
	@keyframes drawV {
		from { stroke-dashoffset: 400; stroke-dasharray: 400; }
		to { stroke-dashoffset: 0; stroke-dasharray: 400; }
	}
	
	.animate-draw-h1 { animation: drawH 0.5s ease-out forwards; }
	.animate-draw-h2 { animation: drawH 0.5s ease-out forwards; }
	@keyframes drawH {
		from { stroke-dashoffset: 400; stroke-dasharray: 400; opacity: 1; }
		to { stroke-dashoffset: 0; stroke-dasharray: 400; opacity: 1; }
	}

	.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}
	
	.delay-500 { animation-delay: 0.5s; }
	.delay-1000 { animation-delay: 1s; }
</style>
