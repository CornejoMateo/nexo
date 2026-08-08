import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InternalConsumptionDialog } from '@/components/business/internal-consumptions/internal-consumption-dialog';
import { createInternalConsumption } from '@/lib/internal-consumptions/internal-consumptions';
import { useAuth } from '@/components/provider/auth-provider';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import type { Product } from '@/lib/products/products/products';

jest.mock('@/lib/internal-consumptions/internal-consumptions');
jest.mock('@/lib/error-translator');

jest.mock('@/components/provider/auth-provider', () => ({
	useAuth: jest.fn(() => ({ user: { uid: 'user-1' } })),
}));

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

const mockedCreate = createInternalConsumption as jest.Mock;
const mockedTranslate = translateError as jest.Mock;
const mockedToast = toast as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;

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
	render(<InternalConsumptionDialog open products={products} onOpenChange={onOpenChange} />);
	return { onOpenChange };
};

beforeEach(() => {
	jest.clearAllMocks();
	mockedTranslate.mockReturnValue(null);
	mockedCreate.mockResolvedValue({ data: null, error: null });
	mockedUseAuth.mockReturnValue({ user: { uid: 'user-1' } });
});

describe('InternalConsumptionDialog', () => {
	it('lists the available products', () => {
		renderDialog([buildProduct(), buildProduct({ id: 2, name: 'Case' })]);

		expect(screen.getByRole('option', { name: 'Funda de silicona' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Case' })).toBeInTheDocument();
	});

	it('requires selecting a product', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByLabelText('Cantidad a descontar'), '5');
		await user.click(screen.getByRole('button', { name: /Registrar consumo/i }));

		expect(await screen.findByText('Seleccioná un producto.')).toBeInTheDocument();
		expect(mockedCreate).not.toHaveBeenCalled();
	});

	it('requires a quantity greater than zero', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.click(screen.getByRole('button', { name: /Registrar consumo/i }));

		expect(await screen.findByText('Ingresá una cantidad mayor a cero.')).toBeInTheDocument();
		expect(mockedCreate).not.toHaveBeenCalled();
	});

	it('registers the consumption with a negative movement', async () => {
		const user = userEvent.setup();
		const { onOpenChange } = renderDialog();

		mockedCreate.mockResolvedValue({
			data: {
				id: 1,
				product_id: 1,
				type: 'consumption',
				quantity: -5,
			},
			error: null,
		});

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a descontar'), '5');
		await user.click(screen.getByRole('button', { name: /Registrar consumo/i }));

		await waitFor(() => {
			expect(mockedCreate).toHaveBeenCalledWith(
				{
					product_id: 1,
					quantity: 5,
					description: '',
				},
				'user-1'
			);
		});
		expect(mockedToast).toHaveBeenCalledWith({
			title: 'Consumo registrado',
			description: 'Se descontaron 5 unidades de "Funda de silicona".',
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('registers the consumption with an optional description', async () => {
		const user = userEvent.setup();
		renderDialog();

		mockedCreate.mockResolvedValue({
			data: { id: 1, product_id: 1, type: 'consumption', quantity: -3 },
			error: null,
		});

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a descontar'), '3');
		await user.type(screen.getByLabelText(/Descripción/), 'Uso interno del local');
		await user.click(screen.getByRole('button', { name: /Registrar consumo/i }));

		await waitFor(() => {
			expect(mockedCreate).toHaveBeenCalledWith(
				{
					product_id: 1,
					quantity: 3,
					description: 'Uso interno del local',
				},
				'user-1'
			);
		});
	});

	it('shows an error toast when the consumption cannot be created', async () => {
		const user = userEvent.setup();
		const { onOpenChange } = renderDialog();

		mockedTranslate.mockReturnValue('No se pudo registrar el consumo.');
		mockedCreate.mockResolvedValue({
			data: null,
			error: { message: 'Insert failed' },
		});

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a descontar'), '5');
		await user.click(screen.getByRole('button', { name: /Registrar consumo/i }));

		await waitFor(() => {
			expect(mockedToast).toHaveBeenCalledWith({
				title: 'Error al registrar consumo',
				description: 'No se pudo registrar el consumo.',
				variant: 'destructive',
			});
		});
		expect(onOpenChange).not.toHaveBeenCalled();
	});
});
