import { error, json, type RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { requireSupabaseUser } from '$lib/server/supabaseAuth';

function answerToText(answer: unknown) {
	if (typeof answer === 'string') return answer;
	return JSON.stringify(answer);
}

function normalizeAnswer(value: unknown) {
	if (Array.isArray(value)) {
		return value.map(String).map((item) => item.trim()).sort().join('|');
	}

	if (typeof value !== 'string') {
		return String(value ?? '').trim();
	}

	const trimmed = value.trim();
	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) return normalizeAnswer(parsed);
	} catch {
		// Plain-text answers are expected for most current questions.
	}

	if (trimmed.includes(',')) {
		return trimmed.split(',').map((item) => item.trim()).sort().join('|');
	}

	return trimmed;
}

export const POST: RequestHandler = async ({ request }) => {
	const user = await requireSupabaseUser(request);
	const body = await request.json().catch(() => ({}));
	const questionId = typeof body.questionId === 'string' ? body.questionId : '';
	const quizId = typeof body.quizId === 'string' ? body.quizId : undefined;

	if (!questionId) {
		throw error(400, 'questionId 是必填欄位');
	}

	const question = await prisma.question.findUnique({
		where: { id: questionId },
		include: { quiz: true }
	});

	if (!question) {
		throw error(404, '找不到題目');
	}

	if (quizId && quizId !== question.quizId) {
		throw error(400, 'quizId 與 questionId 不一致');
	}

	const existing = await prisma.userAnswer.findUnique({
		where: {
			userId_questionId: {
				userId: user.id,
				questionId
			}
		}
	});

	if (existing) {
		return json(
			{
				message: '此題已經作答過',
				answer: existing
			},
			{ status: 409 }
		);
	}

	const submittedAnswer = body.answer;
	const isCorrect = normalizeAnswer(submittedAnswer) === normalizeAnswer(question.correctAnswer);
	const score = isCorrect ? question.score : 0;

	const answer = await prisma.userAnswer.create({
		data: {
			userId: user.id,
			quizId: question.quizId,
			questionId,
			answer: answerToText(submittedAnswer),
			isCorrect,
			score
		}
	});

	return json(
		{
			answer,
			result: {
				isCorrect,
				score,
				explanation: question.explanation,
				explanationImageUrl: question.explanationImageUrl
			}
		},
		{ status: 201 }
	);
};
