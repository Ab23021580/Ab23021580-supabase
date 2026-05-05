<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { uiTheme } from '$lib/course/uiTheme.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { authFetch, clearStoredSession, getStoredSession, signOut } from '$lib/supabase/auth';

	type CourseCard = {
		id: string;
		title: string;
		progress: number;
		lastStudy: string;
		icon: string;
		href?: string;
	};

	type ExamScore = {
		id: string;
		title: string;
		score: number;
		passed: boolean;
		date: string;
	};

	type DailyTask = {
		id: string;
		text: string;
		completed: boolean;
	};

	type DashboardStats = {
		totalStudyTime: string;
		todayStudyTime: string;
		wrongAnswerCount: number;
		wrongAnswerLabel: string;
	};

	let activeTab = $state('dashboard');
	let styles = $derived(uiTheme.styles);
	let isDashboardLoading = $state(true);
	let apiError = $state('');
	let currentUserEmail = $state('user@gmail.com');

	async function handleLogout() {
		await signOut();
		goto('/login');
	}



	const mainNavItems = [
		{ id: 'dashboard', label: '個人儀錶板', icon: 'dashboard' },
		{ id: 'physics-chemistry', label: '理化課程', icon: 'science' },
		{ id: 'exam-progress', label: '考試專區', icon: 'assignment' }
	];

	const bottomNavItems = [
		{ id: 'settings', label: '設定', icon: 'settings' },
		{ id: 'logout', label: '登出', icon: 'logout', href: '/login' }
	];

	let activeCourses = $state<CourseCard[]>([]);
	let displayedCourses = $state<CourseCard[]>([]);
	let examProgressData = $state<CourseCard[]>([]);
	let dashboardProgress = $state({
		currentLocation: '1-1 長度與體積的測量',
		currentChapterId: '1',
		currentChapterLabel: '1-1.1',
		continueHref: '/1-1',
		overallStatus: '穩定推進中'
	});
	let dashboardStats = $state<DashboardStats>({
		totalStudyTime: '0分鐘',
		todayStudyTime: '0分鐘',
		wrongAnswerCount: 0,
		wrongAnswerLabel: '目前沒有錯題'
	});
	let examScores = $state<ExamScore[]>([]);
	let dailyTasks = $state<DailyTask[]>([]);

	function toggleTask(id: string) {
		const task = dailyTasks.find(t => t.id === id);
		if (task) task.completed = !task.completed;
	}

	function localProgressForCourse(course: CourseCard) {
		return course.progress;
	}

	function lastStudyForCourse(course: CourseCard, progress: number) {
		if (course.lastStudy !== '尚未開始' || progress <= 0) return course.lastStudy;
		return progress >= 100 ? '已完成' : '進行中';
	}

	function applyCourseProgress(courses: CourseCard[]) {
		const withProgress = courses.map((course) => {
			const progress = localProgressForCourse(course);

			return {
				...course,
				progress,
				lastStudy: lastStudyForCourse(course, progress)
			};
		});

		activeCourses = withProgress;
		displayedCourses = withProgress.map((course) => ({ ...course, progress: 0 }));

		requestAnimationFrame(() => {
			displayedCourses = withProgress;
		});
	}

	async function loadDashboard() {
		const session = getStoredSession();
		if (!session?.access_token) {
			goto('/login');
			return;
		}

		currentUserEmail = session.user?.email || localStorage.getItem('user_email') || currentUserEmail;
		isDashboardLoading = true;
		apiError = '';

		try {
			const response = await authFetch('/api/dashboard');
			if (response.status === 401) {
				clearStoredSession();
				goto('/login');
				return;
			}
			if (!response.ok) {
				throw new Error('資料同步失敗');
			}

			const data = await response.json();
			applyCourseProgress(data.activeCourses ?? []);
			examProgressData = data.examProgressData ?? [];
			examScores = data.examScores ?? [];
			dailyTasks = data.dailyTasks ?? [];
			dashboardProgress = {
				...dashboardProgress,
				...(data.dashboardProgress ?? {})
			};
			dashboardStats = {
				...dashboardStats,
				...(data.dashboardStats ?? {})
			};
			currentUserEmail = data.user?.email ?? currentUserEmail;
			localStorage.setItem('user_email', currentUserEmail);
		} catch (err: any) {
			apiError = err.message || '資料同步失敗';
		} finally {
			isDashboardLoading = false;
		}
	}

	onMount(() => {
		loadDashboard();
	});
</script>

	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

	<div class="min-h-screen bg-[#F0E6D8] flex flex-col font-sans text-[#4A3000] selection:bg-[#8B6F47] selection:text-[#EADBC8]">

	<!-- 全域頂部導航 -->
	<nav class="px-8 py-4 flex items-center justify-between z-50 bg-[#FFF9F0]/80 backdrop-blur-md border-b-2 border-[#4A3000]/10 sticky top-0">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 bg-[#4A3000] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
				<span class="material-icons text-[#EADBC8]">school</span>
			</div>
			<div class="flex flex-col">
				<span class="font-black text-xl tracking-tighter uppercase leading-none">智學系統</span>
				<span class="text-[8px] font-black tracking-widest opacity-40 uppercase">Smart Learning System v2.0</span>
			</div>
		</div>
		<div class="flex items-center gap-6 font-black tracking-widest">
			<div class="flex flex-col items-end">
				<span class="text-[10px] opacity-40 leading-none mb-1 uppercase">目前登入</span>
				<span class="text-xs text-[#4A3000] normal-case">{currentUserEmail}</span>
			</div>
			<div class="w-10 h-10 bg-[#EADBC8] overflow-hidden rounded-full">
				<img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="avatar" class="w-full h-full object-cover" />
			</div>
		</div>
	</nav>

	<div class="max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

		<!-- 左側導航欄 -->
		<aside class="lg:col-span-3 space-y-8">
			<div class="bg-[#FFF9F0] p-6 rounded-2xl shadow-[0_8px_20px_rgba(74,48,0,0.05)] border border-[#4A3000]/5">
				<p class="text-[16px] font-black uppercase opacity-60 mb-6 tracking-widest text-center">功能選單</p>
				<nav class="flex flex-col gap-4">
					{#each mainNavItems as item}
						<button
							onclick={() => activeTab = item.id}
							class="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:translate-y-[1px] cursor-pointer select-none w-full border-none shadow-none
							{activeTab === item.id 
								? 'bg-[#8B6F47] text-white' 
								: 'bg-[#EADBC8] text-[#4b3324] hover:bg-[#DCCAB3]'}"
						>
							<div class="w-8 h-8 flex items-center justify-center shrink-0 {activeTab === item.id ? 'text-white' : 'text-[#4b3324]/40'}">
								<span class="material-icons text-xl">{item.icon}</span>
							</div>
							<span class="tracking-widest font-black uppercase text-sm">{item.label}</span>
						</button>
					{/each}
				</nav>

				<div class="mt-8 pt-6 border-t-2 border-[#4A3000]/10 flex flex-col gap-4">
					{#each bottomNavItems as item}
						{#if item.id === 'logout'}
							<button 
								onclick={handleLogout}
								class="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:translate-y-[1px] cursor-pointer select-none w-full border-none shadow-none
								bg-[#EADBC8] text-[#4b3324] hover:bg-[#DCCAB3]"
							>
								<div class="w-8 h-8 flex items-center justify-center shrink-0 text-[#4b3324]/40">
									<span class="material-icons text-xl">{item.icon}</span>
								</div>
								<span class="tracking-widest font-black uppercase text-sm">{item.label}</span>
							</button>
						{:else}
							<button 
								onclick={() => activeTab = item.id}
								class="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:translate-y-[1px] cursor-pointer select-none w-full border-none shadow-none
								{activeTab === item.id 
									? 'bg-[#8B6F47] text-white' 
									: 'bg-[#EADBC8] text-[#4b3324] hover:bg-[#DCCAB3]'}"
							>
								<div class="w-8 h-8 flex items-center justify-center shrink-0 {activeTab === item.id ? 'text-white' : 'text-[#4b3324]/40'}">
									<span class="material-icons text-xl">{item.icon}</span>
								</div>
								<span class="tracking-widest font-black uppercase text-sm">{item.label}</span>
							</button>
						{/if}
					{/each}
				</div>
			</div>
		</aside>

		<!-- 中央主內容區 -->
		<main class="lg:col-span-9 space-y-12">



			<!-- 課程內容切換區 -->
			<section class="space-y-6">
				{#if apiError}
					<div class="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
						{apiError}
					</div>
				{:else if isDashboardLoading}
					<div class="rounded-2xl border border-[#4A3000]/10 bg-[#FFF9F0] px-5 py-4 text-sm font-black opacity-60">
						資料同步中...
					</div>
				{/if}

				{#if activeTab === 'exam-progress'}
					<div class="flex items-center justify-between">
						<h3 class="text-3xl font-black uppercase tracking-tighter" in:fade={{ duration: 300 }}>當前考試進度</h3>
						<div class="flex gap-4">
							<button class="text-sm font-black uppercase tracking-widest opacity-40 hover:opacity-100 border-none border-transparent shadow-none bg-transparent p-0 m-0 focus:outline-none focus:ring-0 focus:border-transparent">查看全部</button>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6" in:fly={{ y: 20, duration: 400 }}>
						{#each examProgressData as course}
							<div class="bg-[#FFF9F0] rounded-2xl p-6 shadow-[0_8px_20px_rgba(74,48,0,0.05)] flex flex-col md:flex-row items-center gap-8 group hover:translate-y-[-2px] hover:shadow-[0_12px_25px_rgba(74,48,0,0.08)] transition-all">
								<div class="w-16 h-16 bg-[#EADBC8] rounded-xl flex items-center justify-center shrink-0">
									<span class="material-icons text-3xl">{course.icon}</span>
								</div>
								<div class="flex-grow space-y-2 w-full">
									<div class="flex justify-between items-end">
										<h4 class="text-xl font-black uppercase">{course.title}</h4>
										<span class="text-xs font-black opacity-40 italic">最近考試：{course.lastStudy}</span>
									</div>
									<!-- 圓弧進度條 (加粗) -->
									<div class="h-5 w-full bg-[#EADBC8] relative overflow-hidden rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)]">
										<div 
											class="h-full bg-[#8B6F47] rounded-full transition-all duration-1000"
											style="width: {course.progress}%"
										>
											<div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(45deg, #FFF 25%, transparent 25%, transparent 50%, #FFF 50%, #FFF 75%, transparent 75%, transparent); background-size: 10px 10px;"></div>
										</div>
										<span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#4A3000] drop-shadow-sm">{course.progress}%</span>
									</div>
								</div>
								<button class="bg-[#8B6F47] text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:bg-[#745B3A] hover:translate-y-[-2px] transition-all whitespace-nowrap">
									進入考試
								</button>
							</div>
						{/each}
					</div>
				{:else if activeTab === 'dashboard'}
					<div class="flex items-center justify-between">
						<h3 class="text-3xl font-black uppercase tracking-tighter" in:fade={{ duration: 300 }}>個人學習摘要</h3>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-8" in:fly={{ y: 20, duration: 400 }}>
						<!-- 今日任務 -->
						<div class="bg-[#FFF9F0] border border-[#4A3000]/5 rounded-2xl p-8 shadow-[0_8px_20px_rgba(74,48,0,0.05)] space-y-4">
							<h4 class="text-lg font-black uppercase tracking-widest flex items-center gap-2">
								<span class="material-icons text-xl text-[#8B6F47]">auto_awesome</span>
								今日任務
							</h4>
							<div class="flex flex-col gap-3">
								{#each dailyTasks as task}
									<button 
										onclick={() => toggleTask(task.id)}
										class="flex items-center gap-3 p-3 rounded-xl border-2 shadow-[0_4px_12px_rgba(74,48,0,0.05)] transition-all active:scale-[0.98] text-left w-full
										{task.completed ? 'bg-[#5F6349]/10 border-[#5F6349]/20 opacity-60' : 'bg-[#EADBC8]/60 border-transparent hover:bg-[#EADBC8]/80'}"
									>
										<span class="text-sm font-black {task.completed ? 'text-[#5F6349] line-through italic' : 'text-[#4A3000]'}">
											{task.text}
										</span>
									</button>
								{/each}
							</div>
						</div>

						<!-- 目前學到哪 -->
						<div class="bg-[#FFF9F0] border border-[#4A3000]/5 rounded-2xl p-8 shadow-[0_8px_20px_rgba(74,48,0,0.05)] space-y-4">
							<h4 class="text-lg font-black uppercase tracking-widest flex items-center gap-2">
								<span class="material-icons text-xl text-[#8B6F47]">near_me</span>
								目前學到哪
							</h4>
							<p class="text-xl font-black text-[#8B6F47]">目前學到：{dashboardProgress.currentChapterLabel}</p>
							<p class="text-sm font-bold opacity-60">單元：{dashboardProgress.currentLocation}</p>
							<a href={dashboardProgress.continueHref} class="inline-flex items-center gap-2 text-xs font-black uppercase text-[#4A3000] hover:text-[#8B6F47] transition-colors mt-2">
								繼續課程
								<span class="material-icons text-xs">arrow_forward</span>
							</a>
						</div>

						<!-- 學習計時 -->
						<div class="bg-[#FFF9F0] border border-[#4A3000]/5 rounded-2xl p-8 shadow-[0_8px_20px_rgba(74,48,0,0.05)] space-y-4">
							<h4 class="text-lg font-black uppercase tracking-widest flex items-center gap-2">
								<span class="material-icons text-xl text-[#8B6F47]">timer</span>
								學習計時
							</h4>
							<div class="flex items-end justify-between gap-4">
								<div>
									<p class="text-3xl font-black text-[#8B6F47]">{dashboardStats.totalStudyTime}</p>
									<p class="text-sm font-bold opacity-60 mt-1">累積學習時間</p>
								</div>
								<div class="text-right">
									<p class="text-lg font-black text-[#4A3000]">{dashboardStats.todayStudyTime}</p>
									<p class="text-xs font-black opacity-40 uppercase tracking-widest">今日</p>
								</div>
							</div>
						</div>

						<!-- 錯題統計 -->
						<div class="bg-[#FFF9F0] border border-[#4A3000]/5 rounded-2xl p-8 shadow-[0_8px_20px_rgba(74,48,0,0.05)] space-y-4">
							<h4 class="text-lg font-black uppercase tracking-widest flex items-center gap-2">
								<span class="material-icons text-xl text-[#8B6F47]">error_outline</span>
								錯題複習
							</h4>
							<div class="flex items-end justify-between gap-4">
								<div>
									<p class="text-3xl font-black text-[#8B6F47]">{dashboardStats.wrongAnswerCount}題</p>
									<p class="text-sm font-bold opacity-60 mt-1">{dashboardStats.wrongAnswerLabel}</p>
								</div>
								<span class="material-icons text-4xl text-[#4A3000]/20">assignment_late</span>
							</div>
						</div>

						<!-- 考試成績 -->
						<div class="md:col-span-2 bg-[#FFF9F0] border border-[#4A3000]/5 rounded-2xl p-8 shadow-[0_8px_20px_rgba(74,48,0,0.05)] space-y-6">
							<h4 class="text-lg font-black uppercase tracking-widest flex items-center gap-2">
								<span class="material-icons text-xl text-[#8B6F47]">grade</span>
								近期考試成績
							</h4>
							<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each examScores as exam}
									<div class="bg-[#EADBC8]/60 p-4 rounded-xl border-2 border-transparent hover:bg-[#EADBC8]/80 shadow-[0_4px_12px_rgba(74,48,0,0.05)] transition-all group">
										<div class="flex justify-between items-start mb-2">
											<span class="text-[10px] font-black opacity-40 uppercase tracking-widest">{exam.date}</span>
											<div class="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center">
												<span class="material-icons text-sm text-[#4A3000]/40">assignment</span>
											</div>
										</div>
										<h5 class="font-black text-base mb-3 line-clamp-1 text-[#4A3000]">{exam.title}</h5>
										<div class="flex items-baseline gap-1">
								<span class="text-xl font-black text-[#8B6F47]">{exam.passed ? '通過' : '未通過'}</span>
								<span class="text-sm font-black opacity-50">{exam.score}分</span>
										</div>
									</div>
								{/each}
							</div>
						</div>

						<!-- 基本進度顯示 -->
						<div class="md:col-span-2 bg-[#9E825F] p-8 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.15)] space-y-6">
							<div class="flex justify-between items-center text-[#EADBC8]">
								<h4 class="text-lg font-black uppercase tracking-widest flex items-center gap-2">
									<span class="material-icons text-xl opacity-80">trending_up</span>
									基本進度顯示
								</h4>
								<span class="text-xs font-black tracking-widest uppercase px-3 py-1 bg-[#EADBC8] text-[#4A3000] rounded-full">{dashboardProgress.overallStatus}</span>
							</div>
							
							<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
								{#each displayedCourses as course}
									<div class="space-y-3">
										<div class="flex justify-between text-[#EADBC8]">
											<span class="text-sm font-black uppercase tracking-tight">{course.title}</span>
											<span class="text-xs font-black">{course.progress}%</span>
										</div>
										<div class="h-2 w-full bg-[#EADBC8]/20 rounded-full overflow-hidden">
											<div 
												class="h-full bg-[#EADBC8] transition-all duration-1000"
												style="width: {course.progress}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else if activeTab === 'settings'}
					<div class="min-h-[400px] flex items-center justify-center border-2 border-dashed border-[#4A3000]/10 rounded-3xl" in:fade={{ duration: 300 }}>
						<p class="text-sm font-black uppercase tracking-widest opacity-20 italic">設定專區開發中...</p>
					</div>
				{:else}
					<!-- 理化課程 (原始設計) -->
					<div class="flex items-center justify-between">
						<h3 class="text-3xl font-black uppercase tracking-tighter" in:fade={{ duration: 300 }}>當前課程進度</h3>
						<button class="text-sm font-black uppercase tracking-widest opacity-40 hover:opacity-100 border-none border-transparent shadow-none bg-transparent p-0 m-0 focus:outline-none focus:ring-0 focus:border-transparent">查看全部</button>
					</div>

					<div class="grid grid-cols-1 gap-6" in:fly={{ y: 20, duration: 400 }}>
						{#each displayedCourses as course}
							<div class="bg-[#FFF9F0] rounded-2xl p-6 shadow-[0_8px_20px_rgba(74,48,0,0.05)] flex flex-col md:flex-row items-center gap-8 group hover:translate-y-[-2px] hover:shadow-[0_12px_25px_rgba(74,48,0,0.08)] transition-all">
								<div class="w-16 h-16 bg-[#EADBC8] rounded-xl flex items-center justify-center shrink-0">
									<span class="material-icons text-3xl">{course.icon}</span>
								</div>
								<div class="flex-grow space-y-2 w-full">
									<div class="flex justify-between items-end">
										<h4 class="text-xl font-black uppercase">{course.title}</h4>
										<span class="text-xs font-black opacity-40 italic">上次學習：{course.lastStudy}</span>
									</div>
									<!-- 圓弧進度條 (加粗) -->
									<div class="h-5 w-full bg-[#EADBC8] relative overflow-hidden rounded-full shadow-[0_0_10px_rgba(0,0,0,0.05)]">
										<div 
											class="h-full bg-[#8B6F47] rounded-full transition-all duration-1000"
											style="width: {course.progress}%"
										>
											<!-- 進度條內部斜紋 -->
											<div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(45deg, #FFF 25%, transparent 25%, transparent 50%, #FFF 50%, #FFF 75%, transparent 75%, transparent); background-size: 10px 10px;"></div>
										</div>
										<span class="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-[#4A3000] drop-shadow-sm">{course.progress}%</span>
									</div>
								</div>
						<a href={course.href ?? '/1-1'} class="bg-[#8B6F47] text-white px-8 py-3 rounded-xl font-black text-xs uppercase shadow-[0_0_15px_rgba(0,0,0,0.1)] hover:bg-[#745B3A] hover:translate-y-[-2px] transition-all whitespace-nowrap">
							繼續學習
						</a>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</main>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background-color: #EADBC8;
	}

	/* 增加像素顆粒感 */
	.min-h-screen::before {
		content: "";
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		background-image: url("https://www.transparenttextures.com/patterns/p6.png");
		opacity: 0.1;
		z-index: 100;
	}

	/* 自定義像素字體或排版 */
	:global(h1), :global(h2), :global(h3), :global(h4), button, a {
		letter-spacing: 0;
	}
</style>
