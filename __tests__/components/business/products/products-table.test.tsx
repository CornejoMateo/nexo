import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ProductsTable } from '@/components/business/products/products-table';
import { Product } from '@/lib/products/products/products';
import { CurrencyFilter, StockFilter } from '@/constants/products/products';

const buildProduct = (overrides: Partial<Product> = {}): Product => ({
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
	...overrides,
});

const renderTable = (
	overrides: {
		products?: Product[];
		totalCount?: number;
		page?: number;
		pageSize?: number;
		searchTerm?: string;
		stockFilter?: StockFilter;
		currencyFilter?: CurrencyFilter;
		deletingId?: number | null;
	} = {}
) => {
	const onSearchChange = jest.fn();
	const onPageChange = jest.fn();
	const onStockFilterChange = jest.fn();
	const onCurrencyFilterChange = jest.fn();
	const onEdit = jest.fn();
	const onDelete = jest.fn();
	const onView = jest.fn();

	const Wrapper = () => {
		const [searchTerm, setSearchTerm] = useState(overrides.searchTerm ?? '');
		const [stockFilter, setStockFilter] = useState<StockFilter>(overrides.stockFilter ?? 'all');
		const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>(
			overrides.currencyFilter ?? 'all'
		);

		return (
			<ProductsTable
				products={overrides.products ?? [buildProduct()]}
				totalCount={overrides.totalCount ?? 1}
				page={overrides.page ?? 0}
				pageSize={overrides.pageSize ?? 30}
				searchTerm={searchTerm}
				stockFilter={stockFilter}
				currencyFilter={currencyFilter}
				onSearchChange={(value) => {
					onSearchChange(value);
					setSearchTerm(value);
				}}
				onStockFilterChange={(value) => {
					onStockFilterChange(value);
					setStockFilter(value);
				}}
				onCurrencyFilterChange={(value) => {
					onCurrencyFilterChange(value);
					setCurrencyFilter(value);
				}}
				onPageChange={onPageChange}
				onEdit={onEdit}
				onDelete={onDelete}
				onView={onView}
				deletingId={overrides.deletingId ?? null}
			/>
		);
	};

	render(<Wrapper />);

	return {
		onSearchChange,
		onPageChange,
		onStockFilterChange,
		onCurrencyFilterChange,
		onEdit,
		onDelete,
		onView,
	};
};

describe('ProductsTable', () => {
	it('renders product rows with all data', () => {
		renderTable();

		const row = screen.getByText('Funda de silicona').closest('tr') as HTMLElement;

		expect(screen.getByText('Funda de silicona')).toBeInTheDocument();
		expect(within(row).getByText('$ 12,5')).toBeInTheDocument();
		expect(within(row).getByText('$ 15.000')).toBeInTheDocument();
		expect(within(row).getByText('$ 9,8')).toBeInTheDocument();
		expect(within(row).getByText('$ 12.000')).toBeInTheDocument();
		expect(within(row).getByText('Apple')).toBeInTheDocument();
		expect(within(row).getByText('Accesorios')).toBeInTheDocument();
		expect(within(row).getByText('Sí')).toBeInTheDocument();
		expect(within(row).getByText('5')).toBeInTheDocument();
		expect(within(row).getByText('50')).toBeInTheDocument();
	});

	it('renders a dash when relations or values are missing', () => {
		renderTable({
			products: [
				buildProduct({
					name: 'Sin datos',
					brands: null,
					categories: null,
					retail_price_usd: null,
					stock_min: null,
				}),
			],
		});

		const row = screen.getByText('Sin datos').closest('tr') as HTMLElement;

		expect(within(row).getAllByText('—').length).toBeGreaterThan(0);
	});

	it('shows empty message when there are no products to show', () => {
		renderTable({
			products: [],
			totalCount: 0,
		});

		expect(screen.getByText(/No se encontraron productos para la búsqueda/)).toBeInTheDocument();
	});

	it('shows pagination info based on the backend count', () => {
		renderTable({
			products: Array.from({ length: 30 }, (_, i) =>
				buildProduct({ id: i + 1, name: `Producto ${i + 1}` })
			),
			totalCount: 65,
		});

		expect(screen.getByText(/Mostrando 1–30 de 65/)).toBeInTheDocument();
		expect(screen.getByText('1')).toBeInTheDocument();
		expect(screen.getByText('2')).toBeInTheDocument();
		expect(screen.getByText('3')).toBeInTheDocument();
	});

	it('calls onPageChange when clicking a page number', async () => {
		const user = userEvent.setup();
		const { onPageChange } = renderTable({
			products: Array.from({ length: 30 }, (_, i) =>
				buildProduct({ id: i + 1, name: `Producto ${i + 1}` })
			),
			totalCount: 65,
		});

		await user.click(screen.getByText('2'));

		expect(onPageChange).toHaveBeenCalledWith(1);
	});

	it('calls onPageChange with next page', async () => {
		const user = userEvent.setup();
		const { onPageChange } = renderTable({
			products: Array.from({ length: 30 }, (_, i) =>
				buildProduct({ id: i + 1, name: `Producto ${i + 1}` })
			),
			totalCount: 65,
		});

		await user.click(screen.getByRole('link', { name: /Ir a la página siguiente/i }));

		expect(onPageChange).toHaveBeenCalledWith(1);
	});

	it('calls onPageChange with previous page', async () => {
		const user = userEvent.setup();
		const { onPageChange } = renderTable({
			products: Array.from({ length: 30 }, (_, i) =>
				buildProduct({ id: i + 1, name: `Producto ${i + 1}` })
			),
			totalCount: 65,
			page: 1,
		});

		await user.click(screen.getByRole('link', { name: /Ir a la página anterior/i }));

		expect(onPageChange).toHaveBeenCalledWith(0);
	});

	it('calls onView when clicking the product name or Ver', async () => {
		const user = userEvent.setup();
		const { onView } = renderTable();

		await user.click(screen.getByText('Funda de silicona'));
		expect(onView).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Funda de silicona' })
		);

		onView.mockClear();
		await user.click(screen.getByText('Ver'));
		expect(onView).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Funda de silicona' })
		);
	});

	it('calls onEdit when clicking edit', async () => {
		const user = userEvent.setup();
		const { onEdit } = renderTable();

		await user.click(screen.getByText('Editar'));

		expect(onEdit).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Funda de silicona' })
		);
	});

	it('calls onDelete when clicking delete', async () => {
		const user = userEvent.setup();
		const { onDelete } = renderTable();

		await user.click(screen.getByText('Eliminar'));

		expect(onDelete).toHaveBeenCalledWith(
			expect.objectContaining({ id: 1, name: 'Funda de silicona' })
		);
	});

	it('disables action buttons while deleting', () => {
		renderTable({ deletingId: 1 });

		expect(screen.getByText('Editar')).toBeDisabled();
		expect(screen.getByText('Eliminando...')).toBeDisabled();
	});

	it('calls onStockFilterChange when changing the stock filter', async () => {
		const user = userEvent.setup();
		const { onStockFilterChange } = renderTable();

		await user.click(screen.getByRole('combobox', { name: /Filtrar por stock/i }));
		await user.click(screen.getByRole('option', { name: 'Sin stock' }));

		expect(onStockFilterChange).toHaveBeenCalledWith('no_stock');
	});

	it('toggles column visibility from the dropdown', async () => {
		const user = userEvent.setup();
		renderTable();

		expect(screen.getByRole('columnheader', { name: 'Marca' })).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /Columnas/i }));
		await user.click(screen.getByRole('menuitemcheckbox', { name: 'Marca' }));

		expect(screen.queryByRole('columnheader', { name: 'Marca' })).not.toBeInTheDocument();
		expect(screen.queryByText('Apple')).not.toBeInTheDocument();
	});
});
