<script lang="ts">
	let { courseState, onCorrect } = $props();
	let step = $state(0);
	
	function next() {
		step++;
		if (step >= 4) {
			onCorrect();
		}
	}
</script>

<div class="w-full max-w-[600px] mx-auto bg-slate-50 flex flex-col items-center justify-center p-8 rounded-xl shadow-inner border min-h-[400px]">
	
	<div class="text-xl font-bold text-slate-700 mb-6">
		數學移項：如何單獨求出 M？
	</div>

	<div class="w-full max-w-md flex flex-col gap-4">
		
		<!-- Step 1: Base Equation -->
		<div class="bg-white p-6 rounded-xl shadow-md border-2 border-indigo-100 flex justify-center">
			<div class="text-3xl font-black text-slate-800 flex items-center gap-4">
				<span>D</span>
				<span class="text-slate-400">=</span>
				<div class="flex flex-col items-center">
					<span class="text-rose-500 border-b-2 border-slate-800 px-2">M</span>
					<span class="text-blue-500 px-2 mt-1">V</span>
				</div>
			</div>
		</div>

		{#if step >= 1}
			<!-- Step 2: Multiply both sides -->
			<div class="flex justify-center text-slate-400 font-bold animate-fade-in">
				↓ 等號兩邊同乘 V ↓
			</div>
			
			<div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in flex justify-center">
				<div class="text-2xl font-black text-slate-800 flex items-center gap-4">
					<span>D <span class="text-blue-500">× V</span></span>
					<span class="text-slate-400">=</span>
					<div class="flex flex-col items-center">
						<span class="text-rose-500 border-b-2 border-slate-800 px-2">M</span>
						<span class="text-blue-500 px-2 mt-1">V</span>
					</div>
					<span class="text-blue-500">× V</span>
				</div>
			</div>
		{/if}

		{#if step >= 2}
			<!-- Step 3: Cancel out -->
			<div class="flex justify-center text-slate-400 font-bold animate-fade-in">
				↓ 右邊的 V 被消掉了 ↓
			</div>
			
			<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-fade-in flex justify-center relative overflow-hidden">
				<div class="text-2xl font-black text-slate-800 flex items-center gap-4 relative z-10">
					<span>D × V</span>
					<span class="text-slate-400">=</span>
					<span class="text-rose-500">M</span>
				</div>
			</div>
		{/if}

		{#if step >= 3}
			<div class="flex justify-center text-slate-400 font-bold animate-fade-in">
				↓ 左右交換，寫成好記的口訣 ↓
			</div>
		{/if}

		{#if step >= 4}
			<!-- Result -->
			<div class="bg-indigo-500 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center animate-fade-in gap-2">
				<span class="text-4xl font-black tracking-widest"><span class="text-rose-200">M</span> = <span class="text-blue-200">V</span> × D</span>
				<span class="text-indigo-100 font-bold mt-2">（超好記口訣：MoVie = ViDeo）</span>
			</div>
		{/if}

	</div>

	<div class="mt-8">
		{#if step < 4}
			<button 
				class="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-lg shadow-md transition-all"
				onclick={next}
			>
				下一步
			</button>
		{/if}
	</div>
</div>

<style>
	.animate-fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
