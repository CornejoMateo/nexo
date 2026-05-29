import { getSupabaseClient } from '../supabase-client';

const USERS_TABLE = 'users';

type UserRow = Omit<User, 'createdAt'> & {
	createdAt: string;
};

type UserInsert = Omit<User, 'id' | 'createdAt'> & {
	createdAt?: Date;
};

function toUser(row: UserRow): User {
	return {
		...row,
		createdAt: new Date(row.createdAt),
	};
}

function toUserPayload(user: UserInsert) {
	return {
		...user,
		createdAt: user.createdAt?.toISOString() ?? new Date().toISOString(),
	};
}

export type User = {
	id: number;
	name: string;
	email: string;
	role: string;
	createdAt: Date;
};

export async function getUsers(): Promise<User[]> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(USERS_TABLE)
		.select('*')
		.order('createdAt', { ascending: false });

	if (error) {
		throw error;
	}

	return (data ?? []).map((row) => toUser(row as UserRow));
}

export async function getUserById(id: number): Promise<User | null> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(USERS_TABLE)
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return null;
		}

		throw error;
	}

	return data ? toUser(data as UserRow) : null;
}

export async function createUser(user: UserInsert): Promise<User> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(USERS_TABLE)
		.insert(toUserPayload(user))
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return toUser(data as UserRow);
}

export async function updateUser(
	id: number,
	updates: Partial<UserInsert>,
): Promise<User> {
	const supabase = getSupabaseClient();
	const { data, error } = await supabase
		.from(USERS_TABLE)
		.update({ ...updates })
		.eq('id', id)
		.select('*')
		.single();

	if (error) {
		throw error;
	}

	return toUser(data as UserRow);
}

export async function deleteUser(id: number): Promise<void> {
	const supabase = getSupabaseClient();
	const { error } = await supabase.from(USERS_TABLE).delete().eq('id', id);

	if (error) {
		throw error;
	}
}
