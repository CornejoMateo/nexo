import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
	ProductsForm,
	emptyForm,
	type ProductForm,
} from '@/components/business/products/products-form';
import type { Supplier } from '@/lib/suppliers/suppliers';
import { useSettings } from '@/components/provider/settings-provider';

jest.mock('@/components/ui/dialog', () => ({
	DialogFooter: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/business/products/barcode-generator', () => ({
	BarcodeGenerator: ({ value }: any) => <div data-testid="barcode-generator">{value}</div>,
}));

jest.mock('@/components/provider/settings-provider', () => ({
	useSettings: jest.fn(() => ({
		settings: null,
		loading: false,
		error: null,
		refreshSettings: jest.fn(),
	})),
}));

const brands = [
	{ id: 1, name: 'Apple' },
	{ id: 2, name: 'Samsung' },
];

const categories = [
	{ id: 1, name: 'Accesorios' },
	{ id: 2, name: 'Relojes' },
];

const suppliers: Supplier[] = [
	{
		id: 1,
		name: 'Distribuidora X',
		cuit: null,
		phone: null,
		email: null,
		address: null,
		notes: null,
		created_at: '',
		updated_at: '',
	},
	{
		id: 2,
		name: 'Mayorista Y',
		cuit: null,
		phone: null,
		email: null,
		address: null,
		notes: null,
		created_at: '',
		updated_at: '',
	},
];

const renderForm = (overrides?: {
	form?: ProductForm;
	onChange?: jest.Mock;
	formError?: string | null;
	suppliers?: Supplier[];
}) => {
	const onChange = overrides?.onChange ?? jest.fn();
	const onSubmit = jest.fn((e: React.FormEvent) => e.preventDefault());
	const onCancel = jest.fn();

	const Wrapper = ({ initialForm }: { initialForm: ProductForm }) => {
		const [form, setForm] = useState(initialForm);

		const handleChange = (field: keyof ProductForm, value: string | boolean) => {
			onChange(field, value);
			setForm((prev) => ({ ...prev, [field]: value }));
		};

		return (
			<ProductsForm
				form={form}
				onChange={handleChange}
				saving={false}
				formError={overrides?.formError ?? null}
				onSubmit={onSubmit}
				onCancel={onCancel}
				brands={brands}
				categories={categories}
				suppliers={overrides?.suppliers ?? suppliers}
			/>
		);
	};

	render(<Wrapper initialForm={overrides?.form ?? emptyForm} />);

	return { onChange, onSubmit, onCancel };
};

describe('ProductsForm', () => {
	it('renders all fields', () => {
		renderForm();

		expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
		expect(screen.getByLabelText('Moneda de precios')).toHaveValue('both');
		expect(screen.getByLabelText('Precio para minorista (USD)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio para minorista (ARS)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio mayorista (USD)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio mayorista (ARS)')).toBeInTheDocument();
		expect(screen.getByLabelText('Marca')).toBeInTheDocument();
		expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
		expect(screen.getByLabelText('Stock mínimo')).toBeInTheDocument();
		expect(screen.getByLabelText('Stock actual')).toBeInTheDocument();
		expect(screen.getByLabelText('Disponible para la venta')).toBeChecked();
		expect(screen.getByText('Guardar')).toBeInTheDocument();
		expect(screen.getByText('Cancelar')).toBeInTheDocument();
	});

	it('calls onChange when changing the price currency', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		await user.selectOptions(screen.getByLabelText('Moneda de precios'), 'usd');

		expect(onChange).toHaveBeenCalledWith('price_currency', 'usd');
	});

	it('only shows USD price inputs when currency is USD', () => {
		renderForm({ form: { ...emptyForm, price_currency: 'usd' } });

		expect(screen.getByLabelText('Precio para minorista (USD)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio mayorista (USD)')).toBeInTheDocument();
		expect(screen.queryByLabelText('Precio para minorista (ARS)')).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Precio mayorista (ARS)')).not.toBeInTheDocument();
	});

	it('only shows ARS price inputs when currency is ARS', () => {
		renderForm({ form: { ...emptyForm, price_currency: 'ars' } });

		expect(screen.getByLabelText('Precio para minorista (ARS)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio mayorista (ARS)')).toBeInTheDocument();
		expect(screen.queryByLabelText('Precio para minorista (USD)')).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Precio mayorista (USD)')).not.toBeInTheDocument();
	});

	it('shows only the selected currency inputs when changing it', async () => {
		const user = userEvent.setup();

		renderForm();

		expect(screen.getByLabelText('Precio para minorista (ARS)')).toBeInTheDocument();

		await user.selectOptions(screen.getByLabelText('Moneda de precios'), 'usd');

		expect(screen.getByLabelText('Precio para minorista (USD)')).toBeInTheDocument();
		expect(screen.queryByLabelText('Precio para minorista (ARS)')).not.toBeInTheDocument();
	});

	it('calls onChange when typing the name', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		await user.type(screen.getByLabelText('Nombre'), 'Funda');

		expect(onChange).toHaveBeenLastCalledWith('name', 'Funda');
	});

	it('calls onChange for numeric prices', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		await user.type(screen.getByLabelText('Precio para minorista (USD)'), '12,5');

		expect(onChange).toHaveBeenLastCalledWith('retail_price_usd', '12,5');
	});

	it('toggles the availability checkbox', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		const checkbox = screen.getByLabelText('Disponible para la venta');

		await user.click(checkbox);

		expect(onChange).toHaveBeenCalledWith('is_available_for_sale', false);
	});

	it('selects a brand', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		await user.selectOptions(screen.getByLabelText('Marca'), '2');

		expect(onChange).toHaveBeenCalledWith('brand_id', '2');
	});

	it('selects a category', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		await user.selectOptions(screen.getByLabelText('Categoría'), '1');

		expect(onChange).toHaveBeenCalledWith('category_id', '1');
	});

	it('renders brand and category options', () => {
		renderForm();

		expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Samsung' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Accesorios' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Relojes' })).toBeInTheDocument();
	});

	it('shows the form error', () => {
		renderForm({ formError: 'El nombre es obligatorio.' });

		expect(screen.getByText(/El nombre es obligatorio/)).toBeInTheDocument();
	});

	it('calls onCancel when cancelling', async () => {
		const user = userEvent.setup();
		const { onCancel } = renderForm();

		await user.click(screen.getByText('Cancelar'));

		expect(onCancel).toHaveBeenCalled();
	});

	it('renders the supplier select and hides the supplier form when no supplier is selected', () => {
		renderForm();

		expect(screen.getByLabelText('Proveedor')).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Distribuidora X' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Mayorista Y' })).toBeInTheDocument();
		expect(screen.queryByLabelText('Precio de costo (USD)')).not.toBeInTheDocument();
		expect(screen.queryByLabelText('Código de barra')).not.toBeInTheDocument();
	});

	it('shows the supplier form when a supplier is selected', () => {
		renderForm({ form: { ...emptyForm, supplier_id: '1' } });

		expect(screen.getByLabelText('Código de barra')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio de costo (USD)')).toBeInTheDocument();
		expect(screen.getByLabelText('Precio de costo (ARS)')).toBeInTheDocument();
		expect(screen.getByLabelText('Cotización del USD')).toBeInTheDocument();
		expect(screen.getByLabelText(/% ganancia mayorista/i)).toBeInTheDocument();
		expect(screen.getByLabelText(/% ganancia minorista/i)).toBeInTheDocument();
	});

	it('selects a supplier', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm();

		await user.selectOptions(screen.getByLabelText('Proveedor'), '2');

		expect(onChange).toHaveBeenCalledWith('supplier_id', '2');
	});

	it('calculates the ARS cost from the USD cost and the exchange rate', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm({ form: { ...emptyForm, supplier_id: '1' } });

		await user.type(screen.getByLabelText('Precio de costo (USD)'), '100');
		await user.type(screen.getByLabelText('Cotización del USD'), '1000');

		expect(onChange).toHaveBeenCalledWith('cost_price_ars', '100.000');
	});

	it('calculates sale prices in both currencies when currency is "both"', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm({ form: { ...emptyForm, supplier_id: '1' } });

		await user.type(screen.getByLabelText(/% ganancia mayorista/i), '20');
		await user.type(screen.getByLabelText(/% ganancia minorista/i), '50');
		await user.type(screen.getByLabelText('Precio de costo (USD)'), '10');
		await user.type(screen.getByLabelText('Cotización del USD'), '1000');

		expect(onChange).toHaveBeenCalledWith('wholesale_price_ars', '12.000');
		expect(onChange).toHaveBeenCalledWith('wholesale_price_usd', '12');
		expect(onChange).toHaveBeenCalledWith('retail_price_ars', '15.000');
		expect(onChange).toHaveBeenCalledWith('retail_price_usd', '15');
	});

	it('calculates only ARS sale prices when currency is "ars"', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm({
			form: { ...emptyForm, supplier_id: '1', price_currency: 'ars' },
		});

		await user.type(screen.getByLabelText(/% ganancia mayorista/i), '20');
		await user.type(screen.getByLabelText(/% ganancia minorista/i), '50');
		await user.type(screen.getByLabelText('Precio de costo (USD)'), '10');
		await user.type(screen.getByLabelText('Cotización del USD'), '1000');

		expect(onChange).toHaveBeenCalledWith('wholesale_price_ars', '12.000');
		expect(onChange).toHaveBeenCalledWith('retail_price_ars', '15.000');
		expect(onChange).not.toHaveBeenCalledWith('wholesale_price_usd', expect.any(String));
		expect(onChange).not.toHaveBeenCalledWith('retail_price_usd', expect.any(String));
	});

	it('calculates only USD sale prices when currency is "usd"', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm({
			form: { ...emptyForm, supplier_id: '1', price_currency: 'usd' },
		});

		await user.type(screen.getByLabelText(/% ganancia mayorista/i), '20');
		await user.type(screen.getByLabelText(/% ganancia minorista/i), '50');
		await user.type(screen.getByLabelText('Precio de costo (USD)'), '10');
		await user.type(screen.getByLabelText('Cotización del USD'), '1000');

		expect(onChange).toHaveBeenCalledWith('wholesale_price_usd', '12');
		expect(onChange).toHaveBeenCalledWith('retail_price_usd', '15');
		expect(onChange).not.toHaveBeenCalledWith('wholesale_price_ars', expect.any(String));
		expect(onChange).not.toHaveBeenCalledWith('retail_price_ars', expect.any(String));
	});

	it('generates a valid EAN13 barcode when clicking "Generar código"', async () => {
		const user = userEvent.setup();
		const { onChange } = renderForm({ form: { ...emptyForm, supplier_id: '1' } });

		const input = screen.getByLabelText('Código de barra');

		await user.click(screen.getByText('Generar código'));

		const barcodeCalls = onChange.mock.calls.filter(([field]) => field === 'barcode');
		expect(barcodeCalls.length).toBeGreaterThan(0);
		const generated = barcodeCalls[barcodeCalls.length - 1][1] as string;
		expect(generated).toMatch(/^\d{13}$/);
		expect(input).toHaveValue(generated);
	});

	it('renders the barcode image when the barcode input has a value', () => {
		renderForm({
			form: { ...emptyForm, supplier_id: '1', barcode: '7790000000001' },
		});

		expect(screen.getByTestId('barcode-generator')).toHaveTextContent('7790000000001');
	});

	it('prefills the exchange rate with the business setting when empty', () => {
		(useSettings as jest.Mock).mockReturnValueOnce({
			settings: {
				id: 1,
				usd_rate: 1000,
				updated_at: '',
				address: null,
				number_phone: null,
			},
			loading: false,
			error: null,
			refreshSettings: jest.fn(),
		});

		renderForm({ form: { ...emptyForm, supplier_id: '1' } });

		expect(screen.getByLabelText('Cotización del USD')).toHaveValue('1.000');
	});
});
