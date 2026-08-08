import {
	createInternalConsumption,
	listAllInternalConsumptions,
	listInternalConsumptions,
	type InternalConsumption,
} from '@/lib/internal-consumptions/internal-consumptions';
import { getSupabaseClient } from '@/lib/supabase-client';
import { updateProduct } from '@/lib/products/products/products';
import {
	createStockMovement,
	listAllStockMovements,
	listStockMovements,
} from '@/lib/products/stock-movements/stock-movements';

jest.mock('@/lib/supabase-client', () => ({
	getSupabaseClient: jest.fn(),
}));
jest.mock('@/lib/products/products/products', () => ({
	updateProduct: jest.fn(),
}));
jest.mock('@/lib/products/stock-movements/stock-movements', () => ({
	createStockMovement: jest.fn(),
	listAllStockMovements: jest.fn(),
	listStockMovements: jest.fn(),
}));

const consumption = (overrides: Partial<InternalConsumption> = {}): InternalConsumption => ({
	id: 1,
	created_at: '2024-05-01T12:00:00Z',
	description: 'Uso interno',
	user_id: 'user-1',
	product_id: 2,
	type: 'consumption',
	quantity: -5,
	products: { name: 'Funda de silicona' },
	users: { username: 'jperez', name: 'Juan', last_name: 'Pérez' },
	...overrides,
});

describe('internal consumptions', () => {
	let supabase: any;
	let productQuery: any;

	const mockProductFetch = (result: any) => {
		productQuery = {
			select: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			single: jest.fn().mockResolvedValue(result),
		};
		supabase.from.mockReturnValue(productQuery);
	};

	beforeEach(() => {
		supabase = { from: jest.fn() };
		(getSupabaseClient as jest.Mock).mockReturnValue(supabase);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createInternalConsumption', () => {
		it('decrements stock and registers a negative consumption movement', async () => {
			mockProductFetch({ data: { stock_current: 50 }, error: null });
			(updateProduct as jest.Mock).mockResolvedValue({
				data: { id: 2, stock_current: 45 },
				error: null,
			});
			(createStockMovement as jest.Mock).mockResolvedValue({
				data: consumption(),
				error: null,
			});

			const { data, error } = await createInternalConsumption(
				{ product_id: 2, quantity: 5, description: '  Uso interno  ' },
				'user-1'
			);

			expect(supabase.from).toHaveBeenCalledWith('products');
			expect(productQuery.select).toHaveBeenCalledWith('stock_current');
			expect(productQuery.eq).toHaveBeenCalledWith('id', 2);
			expect(updateProduct).toHaveBeenCalledWith(2, { stock_current: 45 });
			expect(createStockMovement).toHaveBeenCalledWith({
				product_id: 2,
				user_id: 'user-1',
				type: 'consumption',
				quantity: -5,
				description: 'Uso interno',
			});
			expect(error).toBeNull();
			expect(data?.quantity).toBe(-5);
		});

		it('treats null stock as zero', async () => {
			mockProductFetch({ data: { stock_current: null }, error: null });
			(updateProduct as jest.Mock).mockResolvedValue({ data: {}, error: null });
			(createStockMovement as jest.Mock).mockResolvedValue({
				data: consumption(),
				error: null,
			});

			await createInternalConsumption({ product_id: 2, quantity: 3 }, 'user-1');

			expect(updateProduct).toHaveBeenCalledWith(2, { stock_current: -3 });
		});

		it('does not decrement when the product cannot be loaded', async () => {
			mockProductFetch({ data: null, error: { message: 'Not found' } });

			const { data, error } = await createInternalConsumption(
				{ product_id: 99, quantity: 5 },
				'user-1'
			);

			expect(updateProduct).not.toHaveBeenCalled();
			expect(createStockMovement).not.toHaveBeenCalled();
			expect(data).toBeNull();
			expect(error?.message).toBe('Not found');
		});

		it('skips the movement if the stock update fails', async () => {
			mockProductFetch({ data: { stock_current: 50 }, error: null });
			(updateProduct as jest.Mock).mockResolvedValue({
				data: null,
				error: { message: 'Update failed' },
			});

			const { data, error } = await createInternalConsumption(
				{ product_id: 2, quantity: 5 },
				'user-1'
			);

			expect(createStockMovement).not.toHaveBeenCalled();
			expect(data).toBeNull();
			expect(error?.message).toBe('Update failed');
		});
	});

	describe('listInternalConsumptions', () => {
		it('filters the movements by consumption type', async () => {
			(listStockMovements as jest.Mock).mockResolvedValue({
				data: [consumption()],
				count: 1,
				error: null,
			});

			const { data, count, error } = await listInternalConsumptions(0, 50);

			expect(listStockMovements).toHaveBeenCalledWith(0, 50, 'consumption');
			expect(data).toHaveLength(1);
			expect(count).toBe(1);
			expect(error).toBeNull();
		});
	});

	describe('listAllInternalConsumptions', () => {
		it('filters all movements by consumption type', async () => {
			(listAllStockMovements as jest.Mock).mockResolvedValue({
				data: [consumption()],
				error: null,
			});

			const { data, error } = await listAllInternalConsumptions();

			expect(listAllStockMovements).toHaveBeenCalledWith('consumption');
			expect(data).toHaveLength(1);
			expect(error).toBeNull();
		});
	});
});
