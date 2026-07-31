// brands.test.ts

import {
	createBrand,
	listBrands,
	updateBrand,
	deleteBrand,
	type Brand,
} from '@/lib/products/brands/brands';
import { getSupabaseClient } from '@/lib/supabase-client';

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(),
}));

describe('brands', () => {
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

	describe('createBrand', () => {
		it('should create a brand', async () => {
			const brand: Brand = {
				id: 1,
				name: 'Samsung',
			};

			const single = jest.fn().mockResolvedValue({
				data: brand,
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

			const result = await createBrand({
				name: 'Samsung',
			});

			expect(supabase.from).toHaveBeenCalledWith('brands');
			expect(insert).toHaveBeenCalledWith({
				name: 'Samsung',
			});
			expect(result).toEqual({
				data: brand,
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

			const result = await createBrand({
				name: 'Samsung',
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('listBrands', () => {
		it('should return all brands ordered by name', async () => {
			const brands: Brand[] = [
				{ id: 1, name: 'Apple' },
				{ id: 2, name: 'Samsung' },
			];

			const order = jest.fn().mockResolvedValue({
				data: brands,
				error: null,
			});

			const select = jest.fn(() => ({
				order,
			}));

			supabase.from.mockReturnValue({
				select,
			});

			const result = await listBrands();

			expect(supabase.from).toHaveBeenCalledWith('brands');
			expect(select).toHaveBeenCalledWith('*');
			expect(order).toHaveBeenCalledWith('name', {
				ascending: true,
			});
			expect(result).toEqual({
				data: brands,
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

			const result = await listBrands();

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('updateBrand', () => {
		it('should update a brand', async () => {
			const updated: Brand = {
				id: 1,
				name: 'LG',
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

			const result = await updateBrand(1, {
				name: 'LG',
			});

			expect(update).toHaveBeenCalledWith({
				name: 'LG',
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

			const result = await updateBrand(1, {
				name: 'LG',
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('deleteBrand', () => {
		it('should delete a brand', async () => {
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

			const result = await deleteBrand(1);

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

			const result = await deleteBrand(1);

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});
});
