<script lang="ts">
	let { courseState, onCorrect } = $props();
	let step = $state(0);
	
	function next() {
		step++;
		if (step >= 2) {
			onCorrect();
		}
	}
</script>

<div class="w-full max-w-[600px] mx-auto bg-slate-50 flex flex-col items-center justify-center p-8 rounded-xl shadow-inner border min-h-[300px]">
	
	<div class="text-xl font-bold text-slate-700 mb-8">
		密度的單位是怎麼來的？
	</div>

	<div class="w-full max-w-sm flex flex-col gap-6">
		<!-- Formula -->
		<div class="bg-white p-6 rounded-xl shadow-md border-2 border-indigo-100 flex items-center justify-center">
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
			<div class="flex justify-center text-slate-400 animate-fade-in">↓ 代入單位 ↓</div>
			
			<!-- Units -->
			<div class="bg-white p-6 rounded-xl shadow-md border-2 border-emerald-100 flex items-center justify-center animate-fade-in">
				<div class="text-2xl font-black text-slate-800 flex items-center gap-4">
					<span>單位</span>
					<span class="text-slate-400">=</span>
					<div class="flex flex-col items-center">
						<span class="text-rose-600 border-b-2 border-slate-800 px-2">g</span>
						<span class="text-blue-600 px-2 mt-1">cm³</span>
					</div>
				</div>
			</div>
		{/if}

		{#if step >= 2}
			<div class="flex justify-center text-slate-400 animate-fade-in">↓ 寫成單行 ↓</div>
			
			<!-- Result -->
			<div class="bg-emerald-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-center animate-fade-in">
				<span class="text-3xl font-black">g/cm³</span>
			</div>
		{/if}
	</div>

	<div class="mt-8">
		{#if step < 2}
			<button 
				class="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold rounded-lg shadow-md transition-all"
				onclick={next}
			>
				{step === 0 ? '代入單位' : '推導結果'}
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
