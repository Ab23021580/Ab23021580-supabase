<script lang="ts">
	let { courseState, onCorrect } = $props();
</script>

<div class="w-full h-full flex flex-col items-center justify-center bg-slate-50 min-h-[300px] rounded-xl border">
	<button 
		class="group flex flex-col items-center justify-center gap-4 transition-transform hover:scale-110 active:scale-95"
		onclick={onCorrect}
	>
		<div class="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg group-hover:bg-blue-600 group-hover:shadow-blue-500/50 transition-all">
			<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
		</div>
		<span class="text-xl font-bold text-slate-700 tracking-wider">點擊開始單元</span>
	</button>
</div>
