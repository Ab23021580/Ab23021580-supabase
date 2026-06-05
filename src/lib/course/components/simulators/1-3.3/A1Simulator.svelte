<script lang="ts">
	let { courseState, onCorrect } = $props();
	
	let selectedCategory = $state('solid');
	let selectedItem = $state(0);
	let isDone = $state(false);
	
	const categories = [
		{ id: 'solid', name: '固體' },
		{ id: 'liquid', name: '液體' },
		{ id: 'gas', name: '氣體' }
	];

	const materials = {
		solid: [
			{ name: '金', d: 19.3, icon: '🌟', color: 'bg-yellow-200' },
			{ name: '鐵', d: 7.8, icon: '🔩', color: 'bg-slate-300' },
			{ name: '鋁', d: 2.7, icon: '🥫', color: 'bg-slate-200' },
			{ name: '冰', d: 0.92, icon: '🧊', color: 'bg-cyan-100' }
		],
		liquid: [
			{ name: '水銀', d: 13.6, icon: '🌡️', color: 'bg-slate-300' },
			{ name: '海水', d: 1.03, icon: '🌊', color: 'bg-blue-200' },
			{ name: '水', d: 1.0, icon: '💧', color: 'bg-blue-100' },
			{ name: '沙拉油', d: 0.9, icon: '🛢️', color: 'bg-amber-100' }
		],
		gas: [
			{ name: '氧氣', d: 0.0014, icon: '☁️', color: 'bg-sky-50' },
			{ name: '空氣', d: 0.0012, icon: '💨', color: 'bg-slate-50' },
			{ name: '氫氣', d: 0.00009, icon: '🎈', color: 'bg-rose-50' }
		]
	};

	let currentList = $derived(materials[selectedCategory as keyof typeof materials]);
	let currentItem = $derived(currentList[selectedItem]);
	
	let seenCategories = $state(new Set(['solid']));

	function selectCategory(id: string) {
		selectedCategory = id;
		selectedItem = 0;
		seenCategories.add(id);
		
		if (seenCategories.size === 3 && !isDone) {
			isDone = true;
			setTimeout(onCorrect, 1000);
		}
	}
</script>

<div class="w-full max-w-[600px] mx-auto bg-slate-50 flex flex-col rounded-xl shadow-inner border overflow-hidden">
	
	<div class="text-base font-bold text-slate-700 pt-4 pb-1 text-center bg-white border-b">
		各種物質的密度 (常溫常壓)
	</div>

	<div class="flex h-[300px]">
		<!-- Categories -->
		<div class="w-1/4 bg-slate-100 border-r flex flex-col">
			{#each categories as cat}
				<button 
					class="flex-1 font-bold text-lg transition-all border-b {selectedCategory === cat.id ? 'bg-indigo-500 text-white shadow-inner' : 'text-slate-600 hover:bg-slate-200'}"
					onclick={() => selectCategory(cat.id)}
				>
					{cat.name}
				</button>
			{/each}
		</div>

		<!-- Items List -->
		<div class="w-1/3 bg-white border-r overflow-y-auto">
			{#each currentList as item, index}
				<button 
					class="w-full text-left px-4 py-4 border-b flex items-center justify-between transition-all {selectedItem === index ? item.color + ' border-l-4 border-l-indigo-500' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}"
					onclick={() => selectedItem = index}
				>
					<div class="flex items-center gap-3">
						<span class="text-2xl">{item.icon}</span>
						<span class="font-bold text-slate-700">{item.name}</span>
					</div>
					{#if selectedItem === index}
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><path d="m9 18 6-6-6-6"/></svg>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Detail View -->
		<div class="flex-1 bg-slate-50 flex flex-col items-center justify-center p-6 text-center relative">
			<div class="text-6xl mb-4 animate-bounce-short">{currentItem.icon}</div>
			<div class="text-2xl font-black text-slate-800 mb-2">{currentItem.name}</div>
			
			<div class="bg-white px-6 py-4 rounded-xl shadow-md border mt-2">
				<div class="text-sm font-bold text-slate-400 mb-1">密度 D</div>
				<div class="text-3xl font-black text-indigo-600 font-mono">
					{currentItem.d}
				</div>
				<div class="text-sm font-bold text-slate-500 mt-1">g/cm³</div>
			</div>

			{#if currentItem.name === '金'}
				<div class="absolute bottom-4 left-0 right-0 text-xs font-bold text-amber-600 bg-amber-100 mx-4 py-1 rounded">超重！</div>
			{/if}
			{#if currentItem.name === '氫氣'}
				<div class="absolute bottom-4 left-0 right-0 text-xs font-bold text-rose-500 bg-rose-100 mx-4 py-1 rounded">超輕！氣球能飛</div>
			{/if}
		</div>
	</div>

	<!-- Hint -->
	<div class="p-3 bg-indigo-50 border-t border-indigo-100 text-center">
		<span class="text-indigo-800 font-bold text-sm">
			觀察：同種狀態下，不同物質密度不同。金和氫氣差了數十萬倍！
		</span>
	</div>
</div>

<style>
	.animate-bounce-short {
		animation: bounceShort 0.5s ease-out;
	}
	@keyframes bounceShort {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
</style>
