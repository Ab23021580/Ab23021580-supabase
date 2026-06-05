<script lang="ts">
	import type { CourseState } from '$lib/course/courseState.svelte';

	let {
		courseState,
		onCorrect
	}: {
		courseState: CourseState;
		onCorrect: () => void;
	} = $props();

	let config = $derived(courseState.currentStage.simulator?.config);
	let baseRecords: number[] = $derived(config?.records ?? []);
	let includeOutlier: boolean = $derived(config?.includeOutlier ?? false);
	let outlierValue: number = $derived(config?.outlierValue ?? 15.0);

	// 全部記錄（含異常值）
	let allRecords = $derived(
		includeOutlier ? [...baseRecords, outlierValue] : [...baseRecords]
	);

	// 學生點選的記錄（選中=納入計算）
	let selected = $state<boolean[]>([]);
	$effect(() => {
		selected = allRecords.map(() => true);
	});

	let selectedRecords = $derived(allRecords.filter((_, i) => selected[i]));
	let average = $derived(
		selectedRecords.length > 0
			? selectedRecords.reduce((a, b) => a + b, 0) / selectedRecords.length
			: 0
	);

	// B2：正確答案是移除異常值後得到合理平均
	let correctAvg = $derived(
		baseRecords.reduce((a, b) => a + b, 0) / baseRecords.length
	);
	let isDone = $derived(
		includeOutlier
			? Math.abs(average - correctAvg) < 0.05 && selectedRecords.length === baseRecords.length
			: selectedRecords.length === allRecords.length
	);

	$effect(() => {
		if (isDone && !courseState.isUnlocked(courseState.currentStage.id)) {
			onCorrect();
		}
	});
</script>

<div class="flex flex-col gap-6 p-6 items-center w-full">
	<p class="text-sm text-gray-500 font-semibold">
		{includeOutlier ? '找出並取消勾選錯誤的測量記錄' : '點擊每筆記錄，觀察平均值的變化'}
	</p>

	<!-- 測量記錄表格 -->
	<div class="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 shadow-sm bg-white">
		<table class="w-full text-center">
			<thead>
				<tr class="bg-gray-100 text-gray-600 text-sm font-bold">
					<th class="py-3 px-4">測量者</th>
					<th class="py-3 px-4">測量結果 (cm)</th>
					<th class="py-3 px-4">納入計算</th>
				</tr>
			</thead>
			<tbody>
				{#each allRecords as record, i}
					{@const isOutlier = includeOutlier && record === outlierValue}
					{@const isDeselected = !selected[i]}
					<tr class="border-t border-gray-100 transition-colors {isDeselected ? 'bg-red-50' : isOutlier ? 'bg-amber-50' : 'hover:bg-blue-50'}">
						<td class="py-3 px-4 font-bold text-gray-700">第 {i + 1} 人</td>
						<td class="py-3 px-4 font-mono text-lg font-black
							{isOutlier ? 'text-amber-600' : 'text-gray-800'}
							{isDeselected ? 'line-through text-gray-400' : ''}">
							{record.toFixed(1)}
						</td>
						<td class="py-3 px-4">
							<button
								class="w-7 h-7 rounded-md border-2 font-black text-sm transition-all
									{selected[i] ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-300'}"
								onclick={() => { selected[i] = !selected[i]; }}
							>
								{selected[i] ? '✓' : '✗'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- 計算公式 -->
	<div class="w-full max-w-lg bg-blue-50 border border-blue-200 rounded-2xl p-5">
		<p class="text-xs text-blue-500 font-bold mb-2 uppercase tracking-widest">平均值計算過程</p>
		<p class="font-mono text-sm text-blue-800 leading-relaxed break-all">
			({selectedRecords.map(r => r.toFixed(1)).join(' + ')}) ÷ {selectedRecords.length}
		</p>
		<div class="mt-3 flex items-center gap-3">
			<span class="text-gray-500 font-bold">= </span>
			<span class="text-3xl font-black {isDone ? 'text-emerald-600' : 'text-blue-700'}">
				{average.toFixed(2)} cm
			</span>
			{#if isDone}
				<span class="text-emerald-500 font-bold text-sm">✓ 正確！</span>
			{/if}
		</div>
	</div>

	{#if includeOutlier && !isDone}
		<p class="text-amber-600 font-bold text-sm">
			⚠ 平均值偏差過大，請取消勾選與其他人差異很大的數值
		</p>
	{/if}
</div>
