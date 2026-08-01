// categories.test.ts

import {
	createCategory,
	listCategories,
	updateCategory,
	deleteCategory,
	type Category,
} from '@/lib/products/categories/categories';
import { getSupabaseClient } from '@/lib/supabase-client';

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(),
}));

describe('categories', () => {
	let supabase: any;

	beforeEach(() => {
		supabase = {
			from: jest.fn(),
		};

		(getSupabaseClient as jest.Mock).mockReturnValue(supabase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createCategory', () => {
		it('should create a category', async () => {
			const category: Category = {
				id: 1,
				name: 'Electronics',
			};

			const single = jest.fn().mockResolvedValue({
				data: category,
				error: null,
			});

			const select = jest.fn(() => ({
				single,
			}));

			const insert = jest.fn(() => ({
				select,
			}));

			supabase.from.mockReturnValue({
				insert,
			});

			const result = await createCategory({
				name: 'Electronics',
			});

			expect(supabase.from).toHaveBeenCalledWith('categories');
			expect(insert).toHaveBeenCalledWith({
				name: 'Electronics',
			});
			expect(result).toEqual({
				data: category,
				error: null,
			});
		});

		it('should return an error when creation fails', async () => {
			const error = { message: 'Insert failed' };

			const single = jest.fn().mockResolvedValue({
				data: null,
				error,
			});

			const select = jest.fn(() => ({
				single,
			}));

			const insert = jest.fn(() => ({
				select,
			}));

			supabase.from.mockReturnValue({
				insert,
			});

			const result = await createCategory({
				name: 'Electronics',
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('listCategories', () => {
		it('should return all categories ordered by name', async () => {
			const categories: Category[] = [
				{ id: 1, name: 'Electronics' },
				{ id: 2, name: 'Phones' },
			];

			const order = jest.fn().mockResolvedValue({
				data: categories,
				error: null,
			});

			const select = jest.fn(() => ({
				order,
			}));

			supabase.from.mockReturnValue({
				select,
			});

			const result = await listCategories();

			expect(supabase.from).toHaveBeenCalledWith('categories');
			expect(select).toHaveBeenCalledWith('*');
			expect(order).toHaveBeenCalledWith('name', {
				ascending: true,
			});
			expect(result).toEqual({
				data: categories,
				error: null,
			});
		});

		it('should return an error when listing fails', async () => {
			const error = { message: 'List failed' };

			const order = jest.fn().mockResolvedValue({
				data: null,
				error,
			});

			const select = jest.fn(() => ({
				order,
			}));

			supabase.from.mockReturnValue({
				select,
			});

			const result = await listCategories();

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('updateCategory', () => {
		it('should update a category', async () => {
			const updated: Category = {
				id: 1,
				name: 'Watch',
			};

			const single = jest.fn().mockResolvedValue({
				data: updated,
				error: null,
			});

			const select = jest.fn(() => ({
				single,
			}));

			const eq = jest.fn(() => ({
				select,
			}));

			const update = jest.fn(() => ({
				eq,
			}));

			supabase.from.mockReturnValue({
				update,
			});

			const result = await updateCategory(1, {
				name: 'Watch',
			});

			expect(update).toHaveBeenCalledWith({
				name: 'Watch',
			});
			expect(eq).toHaveBeenCalledWith('id', 1);
			expect(result).toEqual({
				data: updated,
				error: null,
			});
		});

		it('should return an error when update fails', async () => {
			const error = { message: 'Update failed' };

			const single = jest.fn().mockResolvedValue({
				data: null,
				error,
			});

			const select = jest.fn(() => ({
				single,
			}));

			const eq = jest.fn(() => ({
				select,
			}));

			const update = jest.fn(() => ({
				eq,
			}));

			supabase.from.mockReturnValue({
				update,
			});

			const result = await updateCategory(1, {
				name: 'Watch',
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('deleteCategory', () => {
		it('should delete a category', async () => {
			const eq = jest.fn().mockResolvedValue({
				data: null,
				error: null,
			});

			const del = jest.fn(() => ({
				eq,
			}));

			supabase.from.mockReturnValue({
				delete: del,
			});

			const result = await deleteCategory(1);

			expect(del).toHaveBeenCalled();
			expect(eq).toHaveBeenCalledWith('id', 1);
			expect(result).toEqual({
				data: null,
				error: null,
			});
		});

		it('should return an error when delete fails', async () => {
			const error = { message: 'Delete failed' };

			const eq = jest.fn().mockResolvedValue({
				data: null,
				error,
			});

			const del = jest.fn(() => ({
				eq,
			}));

			supabase.from.mockReturnValue({
				delete: del,
			});

			const result = await deleteCategory(1);

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});
});
