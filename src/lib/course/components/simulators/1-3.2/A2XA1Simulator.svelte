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
		<!-- A1 Recap -->
		<div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">A1</div>
				<div class="text-slate-600 font-bold">體積(V) 固定，質量(M) <span class="text-rose-500">增加</span></div>
			</div>
			<div class="text-lg font-black text-indigo-600">→ 緊密程度變大</div>
		</div>

		<!-- A2 Recap -->
		<div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">A2</div>
				<div class="text-slate-600 font-bold">質量(M) 固定，體積(V) <span class="text-blue-500">縮小</span></div>
			</div>
			<div class="text-lg font-black text-indigo-600">→ 緊密程度變大</div>
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
				<div class="text-lg font-bold text-indigo-800">
					共同規律：讓 <span class="text-rose-600">M 變大</span>，或讓 <span class="text-blue-600">V 變小</span>，都會讓緊密度上升！
				</div>
				<div class="mt-2 text-slate-600 font-bold">數學上，哪種運算符合這個特性？</div>
			</div>
		{/if}
	</div>
</div>
