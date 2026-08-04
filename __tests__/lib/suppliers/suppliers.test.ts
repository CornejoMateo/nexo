import {
	createSupplier,
	listSuppliers,
	updateSupplier,
	deleteSupplier,
	type Supplier,
} from '@/lib/suppliers/suppliers';
import { getSupabaseClient } from '@/lib/supabase-client';

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(),
}));

describe('suppliers', () => {
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

	describe('createSupplier', () => {
		it('should create a supplier', async () => {
			const supplier: Supplier = {
				id: 1,
				name: 'Papelera Central',
				cuit: '20-12345678-9',
				phone: '11 1234-5678',
				email: 'ventas@papelera.com',
				address: 'Av. Corrientes 1234',
				notes: 'Entrega los lunes',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
			};

			const single = jest.fn().mockResolvedValue({
				data: supplier,
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

			const result = await createSupplier({
				name: 'Papelera Central',
				cuit: '20-12345678-9',
				phone: '11 1234-5678',
				email: 'ventas@papelera.com',
				address: 'Av. Corrientes 1234',
				notes: 'Entrega los lunes',
			});

			expect(supabase.from).toHaveBeenCalledWith('suppliers');
			expect(insert).toHaveBeenCalledWith({
				name: 'Papelera Central',
				cuit: '20-12345678-9',
				phone: '11 1234-5678',
				email: 'ventas@papelera.com',
				address: 'Av. Corrientes 1234',
				notes: 'Entrega los lunes',
			});
			expect(result).toEqual({
				data: supplier,
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

			const result = await createSupplier({
				name: 'Papelera Central',
				cuit: null,
				phone: null,
				email: null,
				address: null,
				notes: null,
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('listSuppliers', () => {
		it('should return all suppliers ordered by name', async () => {
			const suppliers: Supplier[] = [
				{
					id: 1,
					name: 'Distribuidora Sur',
					cuit: null,
					phone: null,
					email: null,
					address: null,
					notes: null,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
				},
				{
					id: 2,
					name: 'Papelera Central',
					cuit: '20-12345678-9',
					phone: null,
					email: null,
					address: null,
					notes: null,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z',
				},
			];

			const order = jest.fn().mockResolvedValue({
				data: suppliers,
				error: null,
			});

			const select = jest.fn(() => ({
				order,
			}));

			supabase.from.mockReturnValue({
				select,
			});

			const result = await listSuppliers();

			expect(supabase.from).toHaveBeenCalledWith('suppliers');
			expect(select).toHaveBeenCalledWith('*');
			expect(order).toHaveBeenCalledWith('name', {
				ascending: true,
			});
			expect(result).toEqual({
				data: suppliers,
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

			const result = await listSuppliers();

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('updateSupplier', () => {
		it('should update a supplier', async () => {
			const updated: Supplier = {
				id: 1,
				name: 'Papelera Central S.A.',
				cuit: '20-12345678-9',
				phone: '11 1234-5678',
				email: null,
				address: null,
				notes: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
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

			const result = await updateSupplier(1, {
				name: 'Papelera Central S.A.',
			});

			expect(update).toHaveBeenCalledWith({
				name: 'Papelera Central S.A.',
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

			const result = await updateSupplier(1, {
				name: 'Papelera Central S.A.',
			});

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});

	describe('deleteSupplier', () => {
		it('should delete a supplier', async () => {
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

			const result = await deleteSupplier(1);

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

			const result = await deleteSupplier(1);

			expect(result).toEqual({
				data: null,
				error,
			});
		});
	});
});
