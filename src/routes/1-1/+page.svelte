<script lang="ts">
	import { courseData } from './data';
	import { CourseState } from '$lib/course/courseState.svelte';
	import { globalProgress } from '$lib/course/globalProgress.svelte';
	import QuestionArea from '$lib/course/components/QuestionArea.svelte';
	import SimulatorDispatcher from '$lib/course/components/SimulatorDispatcher.svelte';
	import LearningSidebar from '$lib/course/components/LearningSidebar.svelte';
	import { endLearningSession, startLearningSession } from '$lib/course/learningTimer';
	import { syncCourseProgress } from '$lib/course/progressSync';
	import { onMount } from 'svelte';

	const courseState = new CourseState(courseData.lessons);
	const CHAPTER_ID = '1';

	let currentDistance = $state(0);
	let accumulatedPulls = $state(0);
	let isCorrect = $state(false);
	let showFeedback = $state(false);
	let learningSessionId: string | null = null;
	let isChapterCompleted = $derived(globalProgress.getChapterStatus(CHAPTER_ID) === 'COMPLETED');

	function completeChapter() {
		if (!isChapterCompleted) {
			globalProgress.updateChapterStatus(CHAPTER_ID, 'COMPLETED');
		}
	}

	function handleCorrect() {
		isCorrect = true;
		showFeedback = true;
		courseState.unlock(courseState.currentStage.id);
		
		// 觸發方式 (3): 模擬器完成自動判定
		const isLastLesson = courseState.currentStageIndex === courseState.lessons.length - 1;
		void syncCourseProgress('/1-1', 100, courseState.currentStage.id);
		
		if (courseState.next()) {
			// 跳轉成功
		} else if (isLastLesson) {
			setTimeout(completeChapter, 1000);
		}
	}

	// 觸發方式 (2): 滑到底自動完成
	let bottomObserver = $state<HTMLElement>();
	onMount(() => {
		// 自動更新「目前學到哪」
		globalProgress.updateCurrentChapter(CHAPTER_ID);
		startLearningSession('/1-1').then((sessionId) => {
			learningSessionId = sessionId;
		});

		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting) {
				completeChapter();
			}
		}, { threshold: 0.1 });

		if (bottomObserver) observer.observe(bottomObserver);
		return () => {
			observer.disconnect();
			void endLearningSession(learningSessionId);
		};
	});

	// 監聽關卡變化以重置狀態
	$effect(() => {
		// 讀取 courseState.currentStageIndex 來追蹤變化
		const index = courseState.currentStageIndex;
		if (index >= 0) {
			currentDistance = 0;
			accumulatedPulls = 0;
			isCorrect = false;
			showFeedback = false;
		}
	});

	function handleBack() {
		if (courseState.currentStageIndex === 0) {
			window.location.href = '/main';
		} else {
			courseState.prev();
		}
	}
</script>

<div class="relative min-h-screen flex flex-col bg-gray-50">
	<!-- 返回箭頭 -->
	<button 
		onclick={handleBack}
		class="absolute top-8 left-8 z-50 p-2 text-gray-500 hover:text-[#4A3000] transition-colors cursor-pointer"
		aria-label="返回"
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<line x1="19" y1="12" x2="5" y2="12"></line>
			<polyline points="12 19 5 12 12 5"></polyline>
		</svg>
	</button>

	<main class="w-full flex-grow flex flex-col items-center justify-center p-8">
			<div class="w-full max-w-[1000px] flex flex-col gap-6">
				<QuestionArea 
					courseState={courseState} 
					{isCorrect} 
					{showFeedback} 
				/>

				<SimulatorDispatcher 
					courseState={courseState} 
					bind:currentDistance 
					bind:accumulatedPulls 
					onCorrect={handleCorrect}
				/>
			</div>

		</main>

	<!-- 用於觸發方式 (2) 的底標 -->
	<div bind:this={bottomObserver} class="h-4 w-full"></div>

	<LearningSidebar courseState={courseState} />
</div>

<style>
	main {
		width: 100%;
	}
</style>
