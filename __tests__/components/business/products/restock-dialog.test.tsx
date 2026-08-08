import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RestockDialog } from '@/components/business/products/stock/restock-dialog';
import { updateProduct, type Product } from '@/lib/products/products/products';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/lib/products/products/products');
jest.mock('@/lib/error-translator');

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ open, children }: any) => (open ? <>{children}</> : null),
	DialogContent: ({ children }: any) => <>{children}</>,
	DialogHeader: ({ children }: any) => <>{children}</>,
	DialogTitle: ({ children }: any) => <>{children}</>,
	DialogFooter: ({ children }: any) => <>{children}</>,
}));

const mockedUpdate = updateProduct as jest.Mock;
const mockedTranslate = translateError as jest.Mock;
const mockedToast = toast as jest.Mock;

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
	id: 1,
	name: 'Funda de silicona',
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
	stock_current: 50,
	brands: null,
	categories: null,
	...overrides,
});

const renderDialog = (products: Product[] = [buildProduct()]) => {
	const onOpenChange = jest.fn();
	render(<RestockDialog open products={products} onOpenChange={onOpenChange} />);
	return { onOpenChange };
};

beforeEach(() => {
	jest.clearAllMocks();
	mockedTranslate.mockReturnValue(null);
});

describe('RestockDialog', () => {
	it('lists the available products', () => {
		renderDialog([buildProduct(), buildProduct({ id: 2, name: 'Case' })]);

		expect(screen.getByRole('option', { name: 'Funda de silicona' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Case' })).toBeInTheDocument();
	});

	it('requires selecting a product', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByLabelText('Cantidad a sumar'), '10');
		await user.click(screen.getByRole('button', { name: /Sumar stock/i }));

		expect(await screen.findByText('Seleccioná un producto.')).toBeInTheDocument();
		expect(mockedUpdate).not.toHaveBeenCalled();
	});

	it('requires a quantity greater than zero', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.click(screen.getByRole('button', { name: /Sumar stock/i }));

		expect(await screen.findByText('Ingresá una cantidad mayor a cero.')).toBeInTheDocument();
		expect(mockedUpdate).not.toHaveBeenCalled();
	});

	it('shows current and new stock when a product is selected', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a sumar'), '10');

		expect(screen.getByText('Stock actual:')).toBeInTheDocument();
		expect(screen.getByText('Nuevo stock:')).toBeInTheDocument();
		expect(screen.getByText('60')).toBeInTheDocument();
	});

	it('adds stock to an existing product', async () => {
		const user = userEvent.setup();
		const { onOpenChange } = renderDialog();

		mockedUpdate.mockResolvedValue({
			data: buildProduct({ stock_current: 60 }),
			error: null,
		});

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a sumar'), '10');
		await user.click(screen.getByRole('button', { name: /Sumar stock/i }));

		await waitFor(() => {
			expect(mockedUpdate).toHaveBeenCalledWith(1, { stock_current: 60 });
		});
		expect(mockedToast).toHaveBeenCalledWith({
			title: 'Stock actualizado',
			description: 'Se sumaron 10 unidades a "Funda de silicona".',
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('shows an error toast when the update fails', async () => {
		const user = userEvent.setup();
		renderDialog();

		mockedTranslate.mockReturnValue('No se pudo actualizar el stock.');
		mockedUpdate.mockResolvedValue({
			data: null,
			error: { message: 'Update failed' },
		});

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a sumar'), '10');
		await user.click(screen.getByRole('button', { name: /Sumar stock/i }));

		await waitFor(() => {
			expect(mockedToast).toHaveBeenCalledWith({
				title: 'Error al actualizar stock',
				description: 'No se pudo actualizar el stock.',
				variant: 'destructive',
			});
		});
	});

	it('handles products with null stock', async () => {
		const user = userEvent.setup();
		renderDialog([buildProduct({ stock_current: null })]);

		mockedUpdate.mockResolvedValue({
			data: buildProduct({ stock_current: 10 }),
			error: null,
		});

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a sumar'), '10');
		await user.click(screen.getByRole('button', { name: /Sumar stock/i }));

		await waitFor(() => {
			expect(mockedUpdate).toHaveBeenCalledWith(1, { stock_current: 10 });
		});
	});
});
