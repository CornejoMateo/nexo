import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Products } from '@/components/business/products/products';
import {
	createProduct,
	updateProduct,
	deleteProduct,
	type Product,
} from '@/lib/products/products/products';
import { listBrands } from '@/lib/products/brands/brands';
import { listCategories } from '@/lib/products/categories/categories';
import {
	createProductBarcode,
	deleteProductBarcodes,
} from '@/lib/products/barcodes/products-barcodes';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import { exportTableToPdf } from '@/utils/pdf-export';
import { exportTableToCsv } from '@/utils/csv-export';

jest.mock('@/lib/products/products/products');
jest.mock('@/lib/products/brands/brands');
jest.mock('@/lib/products/categories/categories');
jest.mock('@/lib/products/barcodes/products-barcodes');
jest.mock('@/lib/suppliers/suppliers');
jest.mock('@/hooks/use-optimized-realtime');
jest.mock('@/lib/error-translator');

jest.mock('@/components/provider/settings-provider', () => ({
	useSettings: jest.fn(() => ({
		settings: null,
		loading: false,
		error: null,
		refreshSettings: jest.fn(),
	})),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

jest.mock('@/components/ui/infoBanner', () => ({
	InfoBanner: () => <div data-testid="info-banner" />,
}));

jest.mock('@/utils/pdf-export', () => ({
	exportTableToPdf: jest.fn(),
}));

jest.mock('@/utils/csv-export', () => ({
	exportTableToCsv: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ open, children }: any) => (open ? <>{children}</> : null),
	DialogContent: ({ children }: any) => <>{children}</>,
	DialogHeader: ({ children }: any) => <>{children}</>,
	DialogTitle: ({ children }: any) => <>{children}</>,
	DialogFooter: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/ui/alert-dialog', () => ({
	AlertDialog: ({ open, children }: any) => (open ? <>{children}</> : null),
	AlertDialogContent: ({ children }: any) => <>{children}</>,
	AlertDialogHeader: ({ children }: any) => <>{children}</>,
	AlertDialogTitle: ({ children }: any) => <>{children}</>,
	AlertDialogDescription: ({ children }: any) => <>{children}</>,
	AlertDialogFooter: ({ children }: any) => <>{children}</>,
	AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
	AlertDialogAction: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

const mockedCreate = createProduct as jest.Mock;
const mockedUpdate = updateProduct as jest.Mock;
const mockedDelete = deleteProduct as jest.Mock;
const mockedCreateBarcode = createProductBarcode as jest.Mock;
const mockedDeleteBarcodes = deleteProductBarcodes as jest.Mock;
const mockedTranslate = translateError as jest.Mock;
const mockedToast = toast as jest.Mock;
const mockedRealtime = useOptimizedRealtime as jest.Mock;

const mockRealtime = (
	options: {
		products?: any[];
		brands?: any[];
		categories?: any[];
		suppliers?: any[];
		error?: string | null;
	} = {}
) => {
	const { products = [], brands = [], categories = [], suppliers = [], error = null } = options;

	mockedRealtime.mockImplementation((table: string) => {
		const data =
			table === 'products'
				? products
				: table === 'brands'
					? brands
					: table === 'categories'
						? categories
						: suppliers;
		return {
			data,
			loading: false,
			error,
			refresh: jest.fn(),
		};
	});
};

const productFixture = (overrides: Partial<Product> = {}): Product => ({
	...buildProduct(),
	...overrides,
});

const buildProduct = (): Product => ({
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
});

beforeEach(() => {
	jest.clearAllMocks();

	mockRealtime();

	mockedTranslate.mockReturnValue(null);

	(listBrands as jest.Mock).mockResolvedValue({
		data: [],
		error: null,
	});

	(listCategories as jest.Mock).mockResolvedValue({
		data: [],
		error: null,
	});
});

describe('Products', () => {
	it('loads products', async () => {
		mockRealtime({
			products: [
				productFixture(),
				productFixture({ id: 2, name: 'Case', brands: null, categories: null }),
			],
		});

		render(<Products />);

		expect(await screen.findByText('Funda de silicona')).toBeInTheDocument();
		expect(screen.getByText('Case')).toBeInTheDocument();
		expect(screen.getByText('Apple')).toBeInTheDocument();
		expect(screen.getByText('Accesorios')).toBeInTheDocument();
		expect(screen.getByText(/2 productos/)).toBeInTheDocument();
	});

	it('reads products, brands and categories from cache', async () => {
		mockRealtime({
			products: [productFixture()],
			brands: [{ id: 1, name: 'Apple' }],
			categories: [{ id: 2, name: 'Accesorios' }],
		});

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		expect(mockedRealtime).toHaveBeenCalledWith('products', expect.any(Function), 'products_cache');
		expect(mockedRealtime).toHaveBeenCalledWith('brands', expect.any(Function), 'brands_cache');
		expect(mockedRealtime).toHaveBeenCalledWith(
			'categories',
			expect.any(Function),
			'categories_cache'
		);
	});

	it('shows empty state', async () => {
		render(<Products />);

		expect(await screen.findByText(/Todavía no hay productos cargados/i)).toBeInTheDocument();
	});

	it('shows list error', async () => {
		mockRealtime({ error: 'No se pudo cargar el listado de productos.' });

		render(<Products />);

		expect(await screen.findByText(/No se pudo cargar el listado/)).toBeInTheDocument();
	});

	it('creates a product', async () => {
		const user = userEvent.setup();

		mockedCreate.mockResolvedValue({
			data: productFixture({ id: 10, name: 'Sony' }),
			error: null,
		});

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		await user.click(screen.getByText(/Nuevo producto/i));

		await user.type(screen.getByLabelText('Nombre'), 'Sony');

		await user.click(screen.getByText('Guardar'));

		await waitFor(() => {
			expect(mockedCreate).toHaveBeenCalledWith({
				name: 'Sony',
				retail_price_usd: 0,
				retail_price_ars: 0,
				wholesale_price_usd: 0,
				wholesale_price_ars: 0,
				brand_id: null,
				category_id: null,
				is_available_for_sale: true,
				stock_min: null,
				stock_current: null,
			});
		});
	});

	it('creates a product with optional fields', async () => {
		const user = userEvent.setup();

		mockedCreate.mockResolvedValue({
			data: productFixture({ id: 11 }),
			error: null,
		});

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		await user.click(screen.getByText(/Nuevo producto/i));

		await user.type(screen.getByLabelText('Nombre'), 'Funda Pro');
		await user.type(screen.getByLabelText('Precio para minorista (USD)'), '15');
		await user.type(screen.getByLabelText('Precio para minorista (ARS)'), '18000');
		await user.type(screen.getByLabelText('Precio mayorista (USD)'), '11');
		await user.type(screen.getByLabelText('Precio mayorista (ARS)'), '14000');
		await user.type(screen.getByPlaceholderText('Ej: 5'), '10');
		await user.type(screen.getByPlaceholderText('Ej: 50'), '100');

		await user.click(screen.getByText('Guardar'));

		await waitFor(() => {
			expect(mockedCreate).toHaveBeenCalledWith({
				name: 'Funda Pro',
				retail_price_usd: 15,
				retail_price_ars: 18000,
				wholesale_price_usd: 11,
				wholesale_price_ars: 14000,
				brand_id: null,
				category_id: null,
				is_available_for_sale: true,
				stock_min: 10,
				stock_current: 100,
			});
		});
	});

	it('validates required name', async () => {
		const user = userEvent.setup();

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		await user.click(screen.getByText(/Nuevo producto/i));

		await user.click(screen.getByText('Guardar'));

		expect(await screen.findByText(/El nombre es obligatorio/)).toBeInTheDocument();
	});

	it('creates a product with a supplier barcode', async () => {
		const user = userEvent.setup();

		mockRealtime({
			suppliers: [{ id: 1, name: 'Distribuidora X' }],
		});

		mockedCreate.mockResolvedValue({
			data: productFixture({ id: 10, name: 'Sony' }),
			error: null,
		});

		mockedCreateBarcode.mockResolvedValue({
			data: { id: 1 },
			error: null,
		});

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		await user.click(screen.getByText(/Nuevo producto/i));

		await user.type(screen.getByLabelText('Nombre'), 'Sony');
		await user.selectOptions(screen.getByLabelText('Proveedor'), '1');
		await user.type(screen.getByLabelText('Código de barra'), '7790000000001');
		await user.type(screen.getByLabelText('Precio de costo (USD)'), '10');
		await user.type(screen.getByLabelText('Cotización del USD'), '1000');

		await user.click(screen.getByText('Guardar'));

		await waitFor(() => {
			expect(mockedCreate).toHaveBeenCalledWith({
				name: 'Sony',
				retail_price_usd: 10,
				retail_price_ars: 10000,
				wholesale_price_usd: 10,
				wholesale_price_ars: 10000,
				brand_id: null,
				category_id: null,
				is_available_for_sale: true,
				stock_min: null,
				stock_current: null,
			});
		});

		await waitFor(() => {
			expect(mockedCreateBarcode).toHaveBeenCalledWith({
				product_id: 10,
				barcode: '7790000000001',
				supplier_id: 1,
				cost_price_ars: 10000,
				cost_price_usd: 10,
			});
		});
	});

	it('requires a barcode when a supplier is selected', async () => {
		const user = userEvent.setup();

		mockRealtime({
			suppliers: [{ id: 1, name: 'Distribuidora X' }],
		});

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		await user.click(screen.getByText(/Nuevo producto/i));

		await user.type(screen.getByLabelText('Nombre'), 'Sony');
		await user.selectOptions(screen.getByLabelText('Proveedor'), '1');

		await user.click(screen.getByText('Guardar'));

		expect(await screen.findByText(/El código de barra es obligatorio/)).toBeInTheDocument();
		expect(mockedCreate).not.toHaveBeenCalled();
	});

	it('updates a product', async () => {
		const user = userEvent.setup();

		mockRealtime({ products: [productFixture()] });

		mockedUpdate.mockResolvedValue({
			data: productFixture({ name: 'Funda de silicona Pro' }),
			error: null,
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByText('Editar'));

		const input = screen.getByDisplayValue('Funda de silicona');

		await user.clear(input);
		await user.type(input, 'Funda de silicona Pro');

		await user.click(screen.getByText('Guardar'));

		await waitFor(() =>
			expect(mockedUpdate).toHaveBeenCalledWith(1, {
				name: 'Funda de silicona Pro',
				retail_price_usd: 12.5,
				retail_price_ars: 15000,
				wholesale_price_usd: 9.8,
				wholesale_price_ars: 12000,
				brand_id: 1,
				category_id: 2,
				is_available_for_sale: true,
				stock_min: 5,
				stock_current: 50,
			})
		);
	});

	it('shows only ARS price inputs when editing a product with ARS prices only', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [
				productFixture({
					retail_price_usd: null,
					wholesale_price_usd: null,
				}),
			],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByText('Editar'));

		expect(screen.getByLabelText('Moneda de precios')).toHaveValue('ars');
		expect(screen.getByLabelText('Precio para minorista (ARS)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio mayorista (ARS)')).toBeInTheDocument();
		expect(screen.queryByLabelText('Precio para minorista (USD)')).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Precio mayorista (USD)')).not.toBeInTheDocument();
	});

	it('deletes a product', async () => {
		const user = userEvent.setup();

		mockRealtime({ products: [productFixture()] });

		mockedDelete.mockResolvedValue({
			data: null,
			error: null,
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		const row = screen.getByText('Funda de silicona').closest('tr') as HTMLElement;
		await user.click(within(row).getByRole('button', { name: 'Eliminar' }));

		await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

		await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
	});

	it('shows translated error when create fails', async () => {
		const user = userEvent.setup();

		mockedTranslate.mockReturnValue('Ya existe un producto con ese nombre');

		mockedCreate.mockResolvedValue({
			data: null,
			error: {},
		});

		render(<Products />);

		await screen.findByText(/Nuevo producto/i);

		await user.click(screen.getByText(/Nuevo producto/i));

		await user.type(screen.getByLabelText('Nombre'), 'Sony');

		await user.click(screen.getByText('Guardar'));

		await waitFor(() =>
			expect(mockedToast).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Error al guardar producto',
					description: 'Ya existe un producto con ese nombre',
					variant: 'destructive',
				})
			)
		);
	});

	it('paginates products client-side', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: Array.from({ length: 31 }, (_, i) =>
				productFixture({
					id: i + 1,
					name: `Producto ${String(i + 1).padStart(2, '0')}`,
				})
			),
		});

		render(<Products />);

		await screen.findByText('Producto 01');

		expect(screen.getByText(/Mostrando 1–30 de 31/)).toBeInTheDocument();
		expect(screen.getByText('Producto 01')).toBeInTheDocument();
		expect(screen.queryByText('Producto 31')).not.toBeInTheDocument();

		await user.click(screen.getByText('2'));

		expect(screen.getByText('Producto 31')).toBeInTheDocument();
		expect(screen.queryByText('Producto 01')).not.toBeInTheDocument();
	});

	it('filters products by search', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [
				productFixture(),
				productFixture({ id: 2, name: 'Case', brands: null, categories: null }),
			],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.type(screen.getByPlaceholderText(/Buscar por nombre/i), 'case');

		expect(screen.getByText('Case')).toBeInTheDocument();
		expect(screen.queryByText('Funda de silicona')).not.toBeInTheDocument();
	});

	it('shows no results message when search has no matches', async () => {
		const user = userEvent.setup();

		mockRealtime({ products: [productFixture()] });

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.type(screen.getByPlaceholderText(/Buscar por nombre/i), 'inexistente');

		expect(screen.getByText(/No se encontraron productos para la búsqueda/)).toBeInTheDocument();
	});

	it('exports all products to PDF from the Exportar menu', async () => {
		const user = userEvent.setup();

		mockRealtime({ products: [productFixture()] });

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('button', { name: /Exportar/i }));
		await user.click(screen.getByRole('menuitem', { name: /PDF/i }));

		await waitFor(() =>
			expect(exportTableToPdf).toHaveBeenCalledWith(
				expect.objectContaining({
					fileName: 'Productos',
					data: expect.any(Array),
				})
			)
		);
	});

	it('exports all products to CSV from the Exportar menu', async () => {
		const user = userEvent.setup();

		mockRealtime({ products: [productFixture()] });

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('button', { name: /Exportar/i }));
		await user.click(screen.getByRole('menuitem', { name: /CSV/i }));

		await waitFor(() =>
			expect(exportTableToCsv).toHaveBeenCalledWith(
				expect.objectContaining({
					fileName: 'Productos',
					data: expect.any(Array),
				})
			)
		);
	});

	it('adds stock to a product through Abastecimiento', async () => {
		const user = userEvent.setup();

		mockRealtime({ products: [productFixture()] });

		mockedUpdate.mockResolvedValue({
			data: productFixture({ stock_current: 60 }),
			error: null,
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('button', { name: /Abastecimiento/i }));

		await user.selectOptions(screen.getByLabelText('Producto'), '1');
		await user.type(screen.getByLabelText('Cantidad a sumar'), '10');
		await user.click(screen.getByRole('button', { name: /Sumar stock/i }));

		await waitFor(() => {
			expect(mockedUpdate).toHaveBeenCalledWith(1, { stock_current: 60 });
		});
	});

	it('filters products by stock', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [productFixture(), productFixture({ id: 2, name: 'Case', stock_current: 0 })],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('combobox', { name: /Filtrar por stock/i }));
		await user.click(screen.getByRole('option', { name: 'Sin stock' }));

		expect(screen.getByText('Case')).toBeInTheDocument();
		expect(screen.queryByText('Funda de silicona')).not.toBeInTheDocument();
	});

	it('filters products below minimum stock including out-of-stock', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [
				productFixture(),
				productFixture({ id: 2, name: 'Case', stock_min: 10, stock_current: 3 }),
				productFixture({ id: 3, name: 'Cable', stock_min: null, stock_current: 0 }),
			],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('combobox', { name: /Filtrar por stock/i }));
		await user.click(screen.getByRole('option', { name: 'Stock mínimo' }));

		expect(screen.getByText('Case')).toBeInTheDocument();
		expect(screen.getByText('Cable')).toBeInTheDocument();
		expect(screen.queryByText('Funda de silicona')).not.toBeInTheDocument();
	});

	it('filters products by loaded currency (only ARS)', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [
				productFixture(),
				productFixture({
					id: 2,
					name: 'Case',
					retail_price_usd: null,
					wholesale_price_usd: null,
				}),
			],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('combobox', { name: /Filtrar por moneda/i }));
		await user.click(screen.getByRole('option', { name: 'Solo ARS' }));

		expect(screen.getByText('Case')).toBeInTheDocument();
		expect(screen.queryByText('Funda de silicona')).not.toBeInTheDocument();
	});

	it('filters products by loaded currency (only USD)', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [
				productFixture(),
				productFixture({
					id: 2,
					name: 'Case',
					retail_price_ars: null,
					wholesale_price_ars: null,
				}),
			],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('combobox', { name: /Filtrar por moneda/i }));
		await user.click(screen.getByRole('option', { name: 'Solo USD' }));

		expect(screen.getByText('Case')).toBeInTheDocument();
		expect(screen.queryByText('Funda de silicona')).not.toBeInTheDocument();
	});

	it('filters products by loaded currency (both)', async () => {
		const user = userEvent.setup();

		mockRealtime({
			products: [
				productFixture(),
				productFixture({
					id: 2,
					name: 'Case',
					retail_price_usd: null,
					wholesale_price_usd: null,
				}),
			],
		});

		render(<Products />);

		await screen.findByText('Funda de silicona');

		await user.click(screen.getByRole('combobox', { name: /Filtrar por moneda/i }));
		await user.click(screen.getByRole('option', { name: 'Ambas' }));

		expect(screen.getByText('Funda de silicona')).toBeInTheDocument();
		expect(screen.queryByText('Case')).not.toBeInTheDocument();
	});
});
