import {
	PUBLIC_SUPABASE_PUBLISHABLE_KEY,
	PUBLIC_SUPABASE_URL
} from '$env/static/public';
import { error } from '@sveltejs/kit';
import { prisma } from './prisma';

const supabaseUrl = PUBLIC_SUPABASE_URL.replace(/\/$/, '');
const supabaseKey = PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export interface SupabaseUser {
	id: string;
	email?: string;
	user_metadata?: Record<string, unknown>;
}

function readBearerToken(request: Request) {
	const authorization = request.headers.get('authorization');
	if (!authorization?.toLowerCase().startsWith('bearer ')) return null;
	return authorization.slice('bearer '.length).trim();
}

export async function getSupabaseUser(request: Request) {
	const token = readBearerToken(request);
	if (!token) return null;

	const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
		headers: {
			apikey: supabaseKey,
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) return null;
	return (await response.json()) as SupabaseUser;
}

export async function requireSupabaseUser(request: Request) {
	const user = await getSupabaseUser(request);
	if (!user?.id) {
		throw error(401, '請先登入');
	}
	return user;
}

export async function ensureProfile(user: SupabaseUser) {
	const displayName =
		typeof user.user_metadata?.display_name === 'string'
			? user.user_metadata.display_name
			: user.email?.split('@')[0] ?? null;

	return prisma.profile.upsert({
		where: { id: user.id },
		update: {},
		create: {
			id: user.id,
			displayName
		}
	});
}
