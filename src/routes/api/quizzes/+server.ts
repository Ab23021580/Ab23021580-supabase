import { json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ url }) => {
	const chapterId = url.searchParams.get('chapterId') ?? undefined;

	const quizzes = await prisma.quiz.findMany({
		where: {
			isActive: true,
			...(chapterId ? { chapterId } : {})
		},
		orderBy: { createdAt: 'asc' },
		select: {
			id: true,
			chapterId: true,
			title: true,
			timeLimit: true,
			passingScore: true,
			questions: {
				orderBy: { orderIndex: 'asc' },
				select: {
					id: true,
					quizId: true,
					questionText: true,
					questionImageUrl: true,
					questionType: true,
					options: true,
					score: true,
					orderIndex: true
				}
			}
		}
	});

	return json({ quizzes });
};
