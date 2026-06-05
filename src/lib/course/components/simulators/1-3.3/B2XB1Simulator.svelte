<script lang="ts">
	let { courseState, onCorrect } = $props();
	let isDone = $state(false);

	function handleComplete() {
		isDone = true;
		onCorrect();
	}
</script>

<div class="w-full max-w-[600px] mx-auto bg-slate-50 flex flex-col items-center justify-center p-8 rounded-xl shadow-inner border min-h-[300px]">
	<div class="w-full flex flex-col gap-6">
		<!-- B1 Recap -->
		<div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">B1</div>
				<div class="text-slate-600 font-bold">固定V時，糖水的 <span class="text-rose-500">M 更高</span></div>
			</div>
			<div class="text-lg font-black text-amber-600">→ 糖水斜率更大</div>
		</div>

		<!-- B2 Recap -->
		<div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">B2</div>
				<div class="text-slate-600 font-bold">固定M時，糖水的 <span class="text-blue-500">V 更小</span></div>
			</div>
			<div class="text-lg font-black text-amber-600">→ 糖水斜率更大</div>
		</div>
		
		<div class="w-full h-px bg-slate-300 my-2"></div>

		{#if !isDone}
			<button 
				class="w-full py-4 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white font-bold text-lg rounded-xl shadow-md transition-all"
				onclick={handleComplete}
			>
				找出共同規律
			</button>
		{:else}
			<div class="text-center p-4 bg-indigo-50 border border-indigo-200 rounded-xl animate-pulse">
				<div class="text-lg font-bold text-indigo-800 mb-2">
					共同規律：在 M-V 圖上，代表密度較大的物質，其斜線都會比較<span class="text-rose-600 font-black">陡峭</span>！
				</div>
				<div class="text-slate-600 font-bold">斜率大小 = 密度大小</div>
			</div>
		{/if}
	</div>
</div>
