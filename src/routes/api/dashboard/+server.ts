import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { ensureProfile, requireSupabaseUser } from '$lib/server/supabaseAuth';
import { getLegacyCourses, type ApiCourse } from '$lib/server/legacyCourse';

type LessonProgress = {
	status: string;
	progressPercentage: number;
	startedAt: Date | null;
	completedAt: Date | null;
	lastAccessedAt: Date | null;
};

type LessonCardSource = {
	id: string;
	title: string;
	contentUrl: string | null;
	userProgress: LessonProgress[];
	chapter: {
		id: string;
		title: string;
		chapterKey?: string | null;
		section?: string | null;
		orderIndex: number;
	};
};

function iconForTitle(title: string) {
	if (title.includes('長度')) return 'straighten';
	if (title.includes('質量')) return 'balance';
	if (title.includes('密度')) return 'view_in_ar';
	if (title.includes('物質')) return 'bubble_chart';
	if (title.includes('水') || title.includes('溶液')) return 'opacity';
	if (title.includes('氣體')) return 'air';
	return 'science';
}

function latestDate(dates: Array<Date | null | undefined>) {
	return dates.filter(Boolean).sort((a, b) => b!.getTime() - a!.getTime())[0] ?? null;
}

function timeAgo(date: Date | null) {
	if (!date) return '尚未開始';

	const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
	if (seconds < 60) return '剛剛';

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}分鐘前`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}小時前`;

	const days = Math.floor(hours / 24);
	if (days === 1) return '昨天';
	if (days < 7) return `${days}天前`;

	return date.toLocaleDateString('zh-TW');
}

function formatDate(date: Date) {
	return date.toLocaleDateString('zh-TW', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}

function formatDuration(seconds: number) {
	if (seconds <= 0) return '0分鐘';

	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes}分鐘`;

	const hours = Math.floor(minutes / 60);
	const restMinutes = minutes % 60;
	return restMinutes ? `${hours}小時${restMinutes}分鐘` : `${hours}小時`;
}

function progressAverage(lessons: LessonCardSource[]) {
	if (!lessons.length) return 0;
	const total = lessons.reduce((sum, lesson) => {
		return sum + (lesson.userProgress[0]?.progressPercentage ?? 0);
	}, 0);
	return Math.round(total / lessons.length);
}

function chapterStatus(lessons: LessonCardSource[]) {
	if (!lessons.length) return 'not_started';
	const progress = progressAverage(lessons);
	if (progress >= 100) return 'completed';
	if (progress > 0 || lessons.some((lesson) => lesson.userProgress[0]?.status === 'in_progress')) {
		return 'in_progress';
	}
	return 'not_started';
}

async function attachProgressByContentUrl(courses: ApiCourse[], userId: string) {
	const contentUrls = [
		...new Set(
			courses.flatMap((course) =>
				course.chapters.flatMap((chapter) =>
					chapter.lessons.map((lesson) => lesson.contentUrl).filter(Boolean)
				)
			)
		)
	] as string[];

	if (!contentUrls.length) return courses;

	const progressRows = await prisma.userProgress.findMany({
		where: {
			userId,
			lesson: {
				contentUrl: { in: contentUrls }
			}
		},
		include: { lesson: true }
	});
	const progressByContentUrl = new Map(
		progressRows
			.filter((progress) => progress.lesson.contentUrl)
			.map((progress) => [
				progress.lesson.contentUrl!,
				{
					status: progress.status,
					progressPercentage: progress.progressPercentage,
					startedAt: progress.startedAt,
					completedAt: progress.completedAt,
					lastAccessedAt: progress.lastAccessedAt
				}
			])
	);

	return courses.map((course) => ({
		...course,
		chapters: course.chapters.map((chapter) => ({
			...chapter,
			lessons: chapter.lessons.map((lesson) => {
				const progress = lesson.contentUrl ? progressByContentUrl.get(lesson.contentUrl) : undefined;
				return progress ? { ...lesson, userProgress: [progress] } : lesson;
			})
		}))
	}));
}

export const GET: RequestHandler = async ({ request }) => {
	const user = await requireSupabaseUser(request);
	const profile = await ensureProfile(user);

	let courses = (await prisma.course.findMany({
		where: { isActive: true },
		orderBy: { createdAt: 'asc' },
		include: {
			chapters: {
				where: { isActive: true },
				orderBy: { orderIndex: 'asc' },
				include: {
					lessons: {
						where: { isActive: true },
						orderBy: { orderIndex: 'asc' },
						include: {
							userProgress: {
								where: { userId: user.id },
								take: 1
							}
						}
					}
				}
			}
		}
	})) as ApiCourse[];

	if (!courses.length) {
		courses = await attachProgressByContentUrl(await getLegacyCourses(), user.id);
	}

	const chapterCards = courses.flatMap((course) =>
		course.chapters.map((chapter) => {
			const lessons = chapter.lessons.map((lesson) => ({
				...lesson,
				chapter: {
					id: chapter.id,
					title: chapter.title,
					chapterKey: chapter.chapterKey,
					section: chapter.section,
					orderIndex: chapter.orderIndex
				}
			}));
			const lastStudy = latestDate(
				lessons.flatMap((lesson) => [
					lesson.userProgress[0]?.lastAccessedAt,
					lesson.userProgress[0]?.completedAt,
					lesson.userProgress[0]?.startedAt
				])
			);

			return {
				id: chapter.id,
				title: chapter.title,
				progress: progressAverage(lessons),
				lastStudy: timeAgo(lastStudy),
				icon: iconForTitle(chapter.title || course.title),
				href: lessons[0]?.contentUrl ?? '/1-1',
				status: chapterStatus(lessons)
			};
		})
	);

	const lessons = courses.flatMap((course) =>
		course.chapters.flatMap((chapter) =>
			chapter.lessons.map((lesson) => ({
				...lesson,
				chapter: {
					id: chapter.id,
					title: chapter.title,
					chapterKey: chapter.chapterKey,
					section: chapter.section,
					orderIndex: chapter.orderIndex
				}
			}))
		)
	);

	const currentLesson =
		lessons
			.filter((lesson) => lesson.userProgress.length > 0)
			.sort((a, b) => {
				const aDate = latestDate([
					a.userProgress[0]?.lastAccessedAt,
					a.userProgress[0]?.completedAt,
					a.userProgress[0]?.startedAt
				]);
				const bDate = latestDate([
					b.userProgress[0]?.lastAccessedAt,
					b.userProgress[0]?.completedAt,
					b.userProgress[0]?.startedAt
				]);
				return (bDate?.getTime() ?? 0) - (aDate?.getTime() ?? 0);
			})[0] ?? lessons[0];

	const quizzes = await prisma.quiz.findMany({
		where: { isActive: true },
		orderBy: { createdAt: 'asc' },
		include: {
			chapter: true,
			questions: {
				orderBy: { orderIndex: 'asc' },
				include: {
					userAnswers: {
						where: { userId: user.id }
					}
				}
			}
		}
	});

	const examProgressData = quizzes.map((quiz) => {
		const answered = quiz.questions.filter((question) => question.userAnswers.length > 0);
		const lastAnswered = latestDate(answered.map((question) => question.userAnswers[0]?.answeredAt));

		return {
			id: quiz.id,
			title: quiz.title,
			progress: quiz.questions.length ? Math.round((answered.length / quiz.questions.length) * 100) : 0,
			lastStudy: timeAgo(lastAnswered),
			icon: iconForTitle(quiz.chapter.title)
		};
	});

	const answers = await prisma.userAnswer.findMany({
		where: { userId: user.id },
		orderBy: { answeredAt: 'desc' },
		include: {
			quiz: true,
			question: true
		},
		take: 100
	});

	const scoreGroups = new Map<
		string,
		{
			id: string;
			title: string;
			score: number;
			maxScore: number;
			passingScore: number;
			answeredAt: Date;
		}
	>();

	for (const answer of answers) {
		const existing = scoreGroups.get(answer.quizId);
		const score = answer.score ?? 0;
		const maxScore = answer.question.score ?? 1;

		if (existing) {
			existing.score += score;
			existing.maxScore += maxScore;
			if (answer.answeredAt > existing.answeredAt) existing.answeredAt = answer.answeredAt;
		} else {
			scoreGroups.set(answer.quizId, {
				id: answer.quizId,
				title: answer.quiz.title,
				score,
				maxScore,
				passingScore: answer.quiz.passingScore,
				answeredAt: answer.answeredAt
			});
		}
	}

	const examScores = [...scoreGroups.values()]
		.sort((a, b) => b.answeredAt.getTime() - a.answeredAt.getTime())
		.slice(0, 3)
		.map((group) => {
			const percent = group.maxScore ? Math.round((group.score / group.maxScore) * 100) : 0;
			return {
				id: group.id,
				title: group.title,
				score: percent,
				passed: percent >= group.passingScore,
				date: formatDate(group.answeredAt)
			};
		});

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);

	const [totalSessionDuration, todaySessionDuration, wrongAnswerCount] = await Promise.all([
		prisma.learningSession.aggregate({
			where: { userId: user.id },
			_sum: { duration: true }
		}),
		prisma.learningSession.aggregate({
			where: {
				userId: user.id,
				startTime: { gte: todayStart }
			},
			_sum: { duration: true }
		}),
		prisma.userAnswer.count({
			where: {
				userId: user.id,
				isCorrect: false
			}
		})
	]);

	const totalDurationSeconds = totalSessionDuration._sum.duration ?? 0;
	const todayDurationSeconds = todaySessionDuration._sum.duration ?? 0;
	const dashboardStats = {
		totalStudyTime: formatDuration(totalDurationSeconds),
		todayStudyTime: formatDuration(todayDurationSeconds),
		wrongAnswerCount,
		wrongAnswerLabel: wrongAnswerCount > 0 ? `${wrongAnswerCount}題待複習` : '目前沒有錯題'
	};

	const firstIncomplete = chapterCards.find((chapter) => chapter.status !== 'completed');
	const firstQuizTodo = examProgressData.find((quiz) => quiz.progress < 100);
	const dailyTasks = [
		firstIncomplete
			? { id: 'lesson-next', text: `完成 ${firstIncomplete.title}`, completed: false }
			: { id: 'lesson-review', text: '複習已完成課程', completed: false },
		firstQuizTodo
			? { id: 'quiz-next', text: `完成 ${firstQuizTodo.title}`, completed: false }
			: { id: 'quiz-review', text: '整理錯題與解析', completed: false }
	];

	const completedCount = chapterCards.filter((chapter) => chapter.status === 'completed').length;
	const overallStatus =
		chapterCards.length === 0
			? '尚未建立課程'
			: completedCount === chapterCards.length
				? '已完成'
				: completedCount > 0
					? '穩定推進中'
					: '準備開始';

	const currentChapterLabel =
		currentLesson?.chapter.section ?? currentLesson?.chapter.chapterKey ?? currentLesson?.chapter.title ?? '1-1.1';
	const dashboardProgress = {
		currentLocation: currentLesson?.chapter.title ?? '尚未開始課程',
		currentChapterId: currentLesson?.chapter.id ?? '',
		currentChapterLabel,
		continueHref: currentLesson?.contentUrl ?? '/1-1',
		overallStatus
	};

	return json({
		user,
		profile,
		activeCourses: chapterCards,
		examProgressData,
		examScores,
		dailyTasks,
		dashboardProgress,
		dashboardStats,
		courses
	});
};
