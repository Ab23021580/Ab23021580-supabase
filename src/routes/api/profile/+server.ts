import { error, json, type RequestHandler } from '@sveltejs/kit';
import { ensureProfile, requireSupabaseUser } from '$lib/server/supabaseAuth';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ request }) => {
	const user = await requireSupabaseUser(request);
	const profile = await ensureProfile(user);

	return json({ user, profile });
};

export const POST: RequestHandler = async ({ request }) => {
	const user = await requireSupabaseUser(request);
	const body = await request.json().catch(() => ({}));
	const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : undefined;

	const profile = displayName
		? await prisma.profile.upsert({
				where: { id: user.id },
				update: { displayName },
				create: { id: user.id, displayName }
			})
		: await ensureProfile(user);

	return json({ user, profile });
};

export const PUT: RequestHandler = async ({ request }) => {
	const user = await requireSupabaseUser(request);
	const body = await request.json().catch(() => ({}));
	const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';

	if (!displayName) {
		throw error(400, 'displayName 不可為空');
	}

	const profile = await prisma.profile.update({
		where: { id: user.id },
		data: { displayName }
	});

	return json({ user, profile });
};
