import {
	createProduct,
	listAllProducts,
	updateProduct,
	deleteProduct,
	type Product,
} from '@/lib/products/products/products';
import { getSupabaseClient } from '@/lib/supabase-client';

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(),
}));

describe('products', () => {
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

	describe('createProduct', () => {
		it('should create a product', async () => {
			const product: Product = {
				id: 1,
				name: 'Funda de silicona',
				retail_price_usd: 12.5,
				retail_price_ars: 15000,
				wholesale_price_usd: 9.8,
				wholesale_price_ars: 12000,
				brand_id: 1,
				category_id: 2,
				is_available_for_sale: true,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				stock_min: 5,
				stock_current: 50,
				brands: { name: 'Apple' },
				categories: { name: 'Accesorios' },
			};

			const single = jest.fn().mockResolvedValue({
				data: product,
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

			const result = await createProduct({
				name: 'Funda de silicona',
				retail_price_usd: 12.5,
				retail_price_ars: 15000,
				wholesale_price_usd: 9.8,
				wholesale_price_ars: 12000,
				brand_id: 1,
				category_id: 2,
				is_available_for_sale: true,
				stock_min: 5,
				stock_current: 50,
			});

			expect(supabase.from).toHaveBeenCalledWith('products');
			expect(insert).toHaveBeenCalledWith({
				name: 'Funda de silicona',
				retail_price_usd: 12.5,
				retail_price_ars: 15000,
				wholesale_price_usd: 9.8,
				wholesale_price_ars: 12000,
				brand_id: 1,
				category_id: 2,
				is_available_for_sale: true,
				stock_min: 5,
				stock_current: 50,
			});
			expect(select).toHaveBeenCalledWith('*, brands(name), categories(name)');
			expect(result).toEqual({
				data: product,
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

			const result = await createProduct({
				name: 'Funda de silicona',
				retail_price_usd: null,
				retail_price_ars: null,
				wholesale_price_usd: null,
				wholesale_price_ars: null,
				brand_id: null,
				category_id: null,
				is_available_for_sale: true,
				stock_min: null,
				stock_current: null,
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('listAllProducts', () => {
		it('should return all products ordered by created_at desc', async () => {
			const products: Product[] = [
				{
					id: 1,
					name: 'Case',
					retail_price_usd: null,
					retail_price_ars: null,
					wholesale_price_usd: null,
					wholesale_price_ars: null,
					brand_id: null,
					category_id: null,
					is_available_for_sale: true,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
					stock_min: null,
					stock_current: null,
					brands: null,
					categories: null,
				},
			];

			const order = jest.fn().mockResolvedValue({
				data: products,
				error: null,
			});

			const select = jest.fn(() => ({
				order,
			}));

			supabase.from.mockReturnValue({
				select,
			});

			const result = await listAllProducts();

			expect(supabase.from).toHaveBeenCalledWith('products');
			expect(select).toHaveBeenCalledWith('*, brands(name), categories(name)');
			expect(order).toHaveBeenCalledWith('created_at', {
				ascending: false,
			});
			expect(result).toEqual({
				data: products,
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

			const result = await listAllProducts();

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('updateProduct', () => {
		it('should update a product', async () => {
			const updated: Product = {
				id: 1,
				name: 'Funda de silicona Pro',
				retail_price_usd: null,
				retail_price_ars: null,
				wholesale_price_usd: null,
				wholesale_price_ars: null,
				brand_id: null,
				category_id: null,
				is_available_for_sale: false,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				stock_min: null,
				stock_current: null,
				brands: null,
				categories: null,
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

			const result = await updateProduct(1, {
				name: 'Funda de silicona Pro',
				is_available_for_sale: false,
			});

			expect(update).toHaveBeenCalledWith({
				name: 'Funda de silicona Pro',
				is_available_for_sale: false,
			});
			expect(eq).toHaveBeenCalledWith('id', 1);
			expect(select).toHaveBeenCalledWith('*, brands(name), categories(name)');
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

			const result = await updateProduct(1, {
				name: 'Funda de silicona Pro',
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('deleteProduct', () => {
		it('should delete a product', async () => {
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

			const result = await deleteProduct(1);

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

			const result = await deleteProduct(1);

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});
});
