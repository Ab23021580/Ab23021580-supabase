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
		水的大單位換算：1000 kg/m³ = ? g/cm³
	</div>

	<div class="w-full max-w-md flex flex-col gap-4">
		
		<!-- Step 1: Base Units -->
		<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-around">
			<div class="text-lg font-bold text-rose-600">1 kg = 1000 g</div>
			<div class="text-lg font-bold text-blue-600">1 m³ = 10⁶ cm³</div>
		</div>

		{#if step >= 1}
			<!-- Step 2: Plug in -->
			<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-fade-in flex flex-col items-center gap-2">
				<div class="text-slate-500 font-bold text-sm">先換算 1 kg/m³</div>
				<div class="text-xl font-black text-slate-800 flex items-center gap-4">
					<span>1 <span class="text-rose-600">kg</span> / <span class="text-blue-600">m³</span></span>
					<span class="text-slate-400">=</span>
					<div class="flex flex-col items-center">
						<span class="text-rose-600 border-b-2 border-slate-800 px-2">1000 g</span>
						<span class="text-blue-600 px-2 mt-1">1,000,000 cm³</span>
					</div>
				</div>
			</div>
		{/if}

		{#if step >= 2}
			<!-- Step 3: Simplify -->
			<div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-fade-in flex flex-col items-center">
				<div class="text-slate-500 font-bold text-sm mb-2">約分消掉 3 個 0</div>
				<div class="text-xl font-black text-slate-800 flex items-center gap-4">
					<span>1 kg/m³</span>
					<span class="text-slate-400">=</span>
					<div class="flex flex-col items-center">
						<span class="text-rose-600 border-b-2 border-slate-800 px-2">1 g</span>
						<span class="text-blue-600 px-2 mt-1">1000 cm³</span>
					</div>
				</div>
			</div>
		{/if}

		{#if step >= 3}
			<!-- Step 4: Multiply by 1000 -->
			<div class="flex justify-center text-slate-400 font-bold animate-fade-in">
				↓ 等式兩邊同乘 1000 ↓
			</div>
		{/if}

		{#if step >= 4}
			<!-- Result -->
			<div class="bg-indigo-500 text-white p-6 rounded-xl shadow-lg flex items-center justify-center animate-fade-in">
				<span class="text-3xl font-black">1000 kg/m³ = 1 g/cm³</span>
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
