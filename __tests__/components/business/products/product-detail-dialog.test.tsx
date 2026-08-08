import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetailDialog } from '@/components/business/products/product-details/product-detail-dialog';
import {
	listProductBarcodesByProduct,
	createProductBarcode,
	deleteProductBarcodeById,
	type ProductBarcodeWithSupplier,
} from '@/lib/products/barcodes/products-barcodes';
import type { Product } from '@/lib/products/products/products';
import type { Supplier } from '@/lib/suppliers/suppliers';
import { toast } from '@/components/ui/use-toast';
import { printBarcode } from '@/utils/print-barcode';

jest.mock('@/lib/products/barcodes/products-barcodes');
jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ open, children }: any) => (open ? <>{children}</> : null),
	DialogContent: ({ children }: any) => <>{children}</>,
	DialogHeader: ({ children }: any) => <>{children}</>,
	DialogTitle: ({ children }: any) => <h2>{children}</h2>,
	DialogDescription: ({ children }: any) => <p>{children}</p>,
}));

jest.mock('@/utils/print-barcode', () => ({
	printBarcode: jest.fn(),
}));

jest.mock('@/components/business/products/barcode-generator', () => ({
	BarcodeGenerator: () => <div data-testid="barcode-svg" />,
}));

const mockedList = listProductBarcodesByProduct as jest.Mock;
const mockedCreateBarcode = createProductBarcode as jest.Mock;
const mockedDeleteBarcode = deleteProductBarcodeById as jest.Mock;
const mockedToast = toast as jest.Mock;
const mockedPrint = printBarcode as jest.Mock;

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

const suppliers: Supplier[] = [
	{
		id: 1,
		name: 'Distribuidora X',
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
		name: 'Mayorista Y',
		cuit: null,
		phone: null,
		email: null,
		address: null,
		notes: null,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
	},
];

const buildBarcode = (
	overrides: Partial<ProductBarcodeWithSupplier> = {}
): ProductBarcodeWithSupplier => ({
	id: 10,
	product_id: 1,
	barcode: '7790000000001',
	supplier_id: 1,
	cost_price_usd: 5,
	cost_price_ars: 5000,
	suppliers: { name: 'Distribuidora X' },
	...overrides,
});

const onOpenChange = jest.fn();

const renderDialog = (overrides: { barcodes?: ProductBarcodeWithSupplier[] } = {}) => {
	mockedList.mockResolvedValue({ data: overrides.barcodes ?? [], error: null });
	return render(
		<ProductDetailDialog product={product} open onOpenChange={onOpenChange} suppliers={suppliers} />
	);
};

describe('ProductDetailDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedList.mockResolvedValue({ data: [buildBarcode()], error: null });
	});

	it('renders product info, prices and stock', async () => {
		renderDialog();

		expect(screen.getByText('Funda de silicona')).toBeInTheDocument();
		expect(screen.getByText('Apple')).toBeInTheDocument();
		expect(screen.getByText('Accesorios')).toBeInTheDocument();
		expect(screen.getByText(/Minorista USD/i)).toBeInTheDocument();
		expect(screen.getByText(/Mayorista ARS/i)).toBeInTheDocument();
		await waitFor(() => expect(mockedList).toHaveBeenCalledWith(1));
	});

	it('lists barcodes with supplier name and costs', async () => {
		renderDialog({ barcodes: [buildBarcode()] });

		await waitFor(() => {
			expect(screen.getByText('7790000000001')).toBeInTheDocument();
		});
		expect(screen.getByText(/Proveedor: Distribuidora X/)).toBeInTheDocument();
		expect(screen.getAllByText(/Costo USD: US\$ 5/).length).toBeGreaterThanOrEqual(1);
		expect(screen.getAllByText(/Costo ARS: \$ 5.000/).length).toBeGreaterThanOrEqual(1);
	});

	it('groups associated suppliers with code count', async () => {
		renderDialog({
			barcodes: [buildBarcode(), buildBarcode({ id: 11, barcode: '7790000000002' })],
		});

		await waitFor(() => {
			expect(screen.getByText('Distribuidora X')).toBeInTheDocument();
		});
		expect(screen.getByText('2 códigos')).toBeInTheDocument();
	});

	it('shows the profit percentage for each supplier', async () => {
		renderDialog({ barcodes: [buildBarcode()] });

		await waitFor(() => {
			expect(screen.getByText(/Ganancia: 150/)).toBeInTheDocument();
		});
	});

	it('hides the profit percentage when there is no cost and no price to compare', async () => {
		renderDialog({
			barcodes: [buildBarcode({ cost_price_usd: null, cost_price_ars: null })],
		});

		await waitFor(() => {
			expect(screen.getByText('Distribuidora X')).toBeInTheDocument();
		});
		expect(screen.queryByText(/Ganancia:/)).not.toBeInTheDocument();
	});

	it('shows empty states when there are no barcodes', async () => {
		renderDialog({ barcodes: [] });

		await waitFor(() => {
			expect(
				screen.getByText(/Todavía no hay proveedores asociados a este producto/)
			).toBeInTheDocument();
		});
		expect(
			screen.getByText(/Este producto no tiene códigos de barra cargados/)
		).toBeInTheDocument();
	});

	it('adds a barcode with a supplier', async () => {
		const user = userEvent.setup();
		mockedCreateBarcode.mockResolvedValue({ data: buildBarcode(), error: null });
		renderDialog({ barcodes: [] });

		await user.selectOptions(screen.getByLabelText('Proveedor'), '2');
		await user.type(screen.getByLabelText('Código de barra'), '7791234567890');
		await user.click(screen.getByRole('button', { name: /Agregar código/i }));

		await waitFor(() => {
			expect(mockedCreateBarcode).toHaveBeenCalledWith({
				product_id: 1,
				barcode: '7791234567890',
				supplier_id: 2,
				cost_price_usd: 0,
				cost_price_ars: 0,
			});
		});
		expect(mockedList).toHaveBeenCalled();
		expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Código agregado' }));
	});

	it('rejects adding a barcode without a code', async () => {
		const user = userEvent.setup();
		renderDialog({ barcodes: [] });

		await user.click(screen.getByRole('button', { name: /Agregar código/i }));

		expect(mockedCreateBarcode).not.toHaveBeenCalled();
		expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Código inválido' }));
	});

	it('deletes a barcode', async () => {
		const user = userEvent.setup();
		mockedDeleteBarcode.mockResolvedValue({ data: null, error: null });
		renderDialog({ barcodes: [buildBarcode()] });

		await waitFor(() => expect(screen.getByText('7790000000001')).toBeInTheDocument());
		await user.click(screen.getByRole('button', { name: /Eliminar código 7790000000001/i }));

		await waitFor(() => expect(mockedDeleteBarcode).toHaveBeenCalledWith(10));
		expect(mockedList).toHaveBeenCalled();
	});

	it('prints a barcode', async () => {
		const user = userEvent.setup();
		renderDialog({ barcodes: [buildBarcode()] });

		await waitFor(() => expect(screen.getByText('7790000000001')).toBeInTheDocument());
		await user.click(screen.getByRole('button', { name: /Imprimir/i }));

		expect(mockedPrint).toHaveBeenCalledWith('7790000000001', 'Funda de silicona');
	});
});
