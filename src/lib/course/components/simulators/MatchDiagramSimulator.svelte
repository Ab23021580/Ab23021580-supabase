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
	let zones: string[] = $derived(config?.zones ?? []);
	let tags: string[] = $derived(config?.tags ?? []);
	let answers: Record<string, string> = $derived(config?.answers ?? {});

	// 每個 zone 目前放了哪個 tag
	let zoneContents = $state<Record<string, string | null>>({});
	// 還未放置的 tags
	let freeTags = $state<string[]>([]);

	$effect(() => {
		zoneContents = Object.fromEntries(zones.map(z => [z, null]));
		freeTags = [...tags];
	});

	let allCorrect = $derived(
		zones.every(z => zoneContents[z] === answers[z])
	);

	$effect(() => {
		if (allCorrect && !courseState.isUnlocked(courseState.currentStage.id)) {
			onCorrect();
		}
	});

	// ── 拖曳邏輯 ──────────────────────────────────────────────────────────────
	let draggingTag = $state<string | null>(null);

	function onDragStart(tag: string) {
		draggingTag = tag;
	}

	function onDropZone(zone: string) {
		if (!draggingTag) return;

		// 如果 zone 已有內容，把舊的放回 freeTags
		const existing = zoneContents[zone];
		if (existing) freeTags = [...freeTags, existing];

		// 把拖來的從 freeTags 移除（若來自 freeTags）
		freeTags = freeTags.filter(t => t !== draggingTag);

		// 如果來自另一個 zone，清空那個 zone（搜尋並清除）
		for (const z of zones) {
			if (zoneContents[z] === draggingTag && z !== zone) {
				zoneContents[z] = null;
			}
		}

		zoneContents[zone] = draggingTag;
		draggingTag = null;
	}

	function onDropFree() {
		if (!draggingTag) return;
		// 把 tag 從 zone 收回 freeTags
		for (const z of zones) {
			if (zoneContents[z] === draggingTag) {
				zoneContents[z] = null;
			}
		}
		if (!freeTags.includes(draggingTag)) {
			freeTags = [...freeTags, draggingTag];
		}
		draggingTag = null;
	}
</script>

<div class="flex flex-col gap-8 p-6 items-center w-full select-none">
	<!-- 測量結果示例 -->
	<div class="text-center">
		<p class="text-gray-500 text-sm mb-2">測量結果範例</p>
		<div class="flex gap-0 items-center justify-center text-4xl font-black border-2 border-gray-200 rounded-2xl px-8 py-4 bg-white shadow-sm">
			<span class="text-blue-700">11.</span>
			<span class="text-orange-500">7</span>
			<span class="text-emerald-600 ml-1">cm</span>
		</div>
		<p class="text-xs text-gray-400 mt-2">（倒敘法：從單位開始判斷）</p>
	</div>

	<!-- 配對區 -->
	<div class="flex gap-4 flex-wrap justify-center">
		{#each zones as zone}
			{@const content = zoneContents[zone]}
			{@const correct = content !== null && content === answers[zone]}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="flex flex-col items-center gap-2"
				ondragover={(e) => e.preventDefault()}
				ondrop={() => onDropZone(zone)}
			>
				<!-- Zone 放置槽 -->
				<div class="w-28 h-14 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl font-black transition-all
					{correct ? 'border-emerald-400 bg-emerald-50' : content ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-300'}">
					{#if content}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<span
							class="font-black text-2xl cursor-grab {correct ? 'text-emerald-600' : 'text-blue-700'}"
							draggable="true"
							ondragstart={() => onDragStart(content)}
						>
							{content}
						</span>
					{:else}
						<span class="text-gray-300 text-sm">拖曳至此</span>
					{/if}
				</div>
				<!-- Zone 標籤 -->
				<span class="text-xs font-bold text-gray-600 text-center max-w-[7rem]">{zone}</span>
			</div>
		{/each}
	</div>

	<!-- 可拖曳標籤池 -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="flex gap-3 flex-wrap justify-center min-h-[56px] p-3 bg-gray-50 rounded-xl border border-gray-200 w-full max-w-sm"
		ondragover={(e) => e.preventDefault()}
		ondrop={onDropFree}
	>
		{#if freeTags.length === 0}
			<span class="text-gray-300 text-sm self-center">所有標籤已放置</span>
		{:else}
			{#each freeTags as tag}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span
					class="px-4 py-2 bg-white border-2 border-blue-300 text-blue-700 rounded-lg font-black text-xl cursor-grab shadow-sm hover:shadow-md hover:border-blue-500 transition-all"
					draggable="true"
					ondragstart={() => onDragStart(tag)}
				>
					{tag}
				</span>
			{/each}
		{/if}
	</div>

	{#if allCorrect}
		<p class="text-emerald-600 font-black text-base">✓ 正確！測量結果 = 準確值 + 估計值 + 單位</p>
	{/if}
</div>
