import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InternalConsumptions } from '@/components/business/internal-consumptions/internal-consumptions';
import { useInternalConsumptions } from '@/hooks/internal-consumptions/use-internal-consumptions';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { listAllProducts } from '@/lib/products/products/products';
import {
	listAllInternalConsumptions,
	type InternalConsumption,
} from '@/lib/internal-consumptions/internal-consumptions';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import { exportTableToPdf } from '@/utils/pdf-export';
import { exportTableToCsv } from '@/utils/csv-export';

jest.mock('@/hooks/internal-consumptions/use-internal-consumptions');
jest.mock('@/hooks/use-optimized-realtime');
jest.mock('@/lib/products/products/products');
jest.mock('@/lib/internal-consumptions/internal-consumptions');
jest.mock('@/lib/error-translator');

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

jest.mock('@/components/business/internal-consumptions/internal-consumption-dialog', () => ({
	InternalConsumptionDialog: ({ open }: any) => (
		<div data-testid="internal-consumption-dialog">{open ? 'abierto' : 'cerrado'}</div>
	),
}));

const mockedUseHook = useInternalConsumptions as jest.Mock;
const mockedUseRealtime = useOptimizedRealtime as jest.Mock;
const mockedListAllProducts = listAllProducts as jest.Mock;
const mockedListAll = listAllInternalConsumptions as jest.Mock;
const mockedTranslate = translateError as jest.Mock;
const mockedToast = toast as jest.Mock;

const buildConsumption = (overrides: Partial<InternalConsumption> = {}): InternalConsumption => ({
	id: 1,
	created_at: '2024-01-01T10:00:00.000Z',
	description: 'Uso interno del local',
	user_id: 'user-1',
	product_id: 1,
	type: 'consumption',
	quantity: -5,
	products: { name: 'Funda de silicona' },
	users: { username: 'jperez', name: 'Juan', last_name: 'Pérez' },
	...overrides,
});

const mockHook = (
	options: {
		consumptions?: InternalConsumption[];
		totalCount?: number;
		loading?: boolean;
		error?: string | null;
		page?: number;
		totalPages?: number;
		changePage?: jest.Mock;
	} = {}
) => {
	const {
		consumptions = [],
		totalCount = consumptions.length,
		loading = false,
		error = null,
		page = 0,
		totalPages = Math.max(1, Math.ceil(totalCount / 50)),
		changePage = jest.fn(),
	} = options;

	mockedUseHook.mockReturnValue({
		consumptions,
		totalCount,
		loading,
		error,
		page,
		totalPages,
		changePage,
		refresh: jest.fn(),
	});

	return { changePage };
};

beforeEach(() => {
	jest.clearAllMocks();
	mockedTranslate.mockReturnValue(null);
	mockedListAll.mockResolvedValue({ data: [], error: null });
	mockedUseRealtime.mockReturnValue({ data: [], loading: false, error: null });
	mockedListAllProducts.mockResolvedValue({ data: [], error: null });
});

describe('InternalConsumptions', () => {
	it('renders the consumptions with negative quantity, product, user and description', () => {
		mockHook({ consumptions: [buildConsumption()], totalCount: 1 });

		render(<InternalConsumptions />);

		expect(screen.getByText('Funda de silicona')).toBeInTheDocument();
		expect(screen.getByText('-5')).toBeInTheDocument();
		expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
		expect(screen.getByText('Uso interno del local')).toBeInTheDocument();
		expect(screen.getByText(/1 consumo/)).toBeInTheDocument();
	});

	it('shows the empty state', () => {
		mockHook({ consumptions: [], totalCount: 0 });

		render(<InternalConsumptions />);

		expect(screen.getByText('Todavía no hay consumos internos cargados.')).toBeInTheDocument();
	});

	it('shows a loading spinner', () => {
		mockHook({ loading: true });

		render(<InternalConsumptions />);

		expect(document.querySelector('.animate-spin')).toBeInTheDocument();
	});

	it('shows the error message', () => {
		mockHook({ error: 'No se pudo cargar el listado de consumos.' });

		render(<InternalConsumptions />);

		expect(screen.getByText('No se pudo cargar el listado de consumos.')).toBeInTheDocument();
	});

	it('paginates from the backend via changePage', async () => {
		const user = userEvent.setup();
		const { changePage } = mockHook({
			consumptions: [buildConsumption()],
			totalCount: 120,
			page: 0,
			totalPages: 3,
		});

		render(<InternalConsumptions />);

		expect(screen.getByText(/Mostrando 1–50 de 120/)).toBeInTheDocument();

		await user.click(screen.getByRole('link', { name: /Ir a la página siguiente/ }));
		expect(changePage).toHaveBeenCalledWith(1);

		await user.click(screen.getByRole('link', { name: '3' }));
		expect(changePage).toHaveBeenCalledWith(2);
	});

	it('opens the creation dialog from the button', async () => {
		const user = userEvent.setup();
		mockHook({ consumptions: [buildConsumption()], totalCount: 1 });

		render(<InternalConsumptions />);

		expect(screen.getByTestId('internal-consumption-dialog')).toHaveTextContent('cerrado');

		await user.click(screen.getByRole('button', { name: /Nuevo consumo/i }));

		expect(screen.getByTestId('internal-consumption-dialog')).toHaveTextContent('abierto');
	});

	it('exports the full list to PDF', async () => {
		const user = userEvent.setup();

		mockHook({ consumptions: [buildConsumption()], totalCount: 1 });
		mockedListAll.mockResolvedValue({
			data: [buildConsumption(), buildConsumption({ id: 2 })],
			error: null,
		});

		render(<InternalConsumptions />);

		await user.click(screen.getByRole('button', { name: /Exportar/i }));
		await user.click(screen.getByRole('menuitem', { name: /PDF/i }));

		await waitFor(() =>
			expect(exportTableToPdf).toHaveBeenCalledWith(
				expect.objectContaining({
					fileName: 'Consumos internos',
					data: expect.any(Array),
				})
			)
		);
	});

	it('exports the full list to CSV', async () => {
		const user = userEvent.setup();

		mockHook({ consumptions: [buildConsumption()], totalCount: 1 });
		mockedListAll.mockResolvedValue({ data: [buildConsumption()], error: null });

		render(<InternalConsumptions />);

		await user.click(screen.getByRole('button', { name: /Exportar/i }));
		await user.click(screen.getByRole('menuitem', { name: /CSV/i }));

		await waitFor(() =>
			expect(exportTableToCsv).toHaveBeenCalledWith(
				expect.objectContaining({
					fileName: 'Consumos internos',
					data: expect.any(Array),
				})
			)
		);
	});

	it('shows an error toast when the export fails', async () => {
		const user = userEvent.setup();

		mockHook({ consumptions: [buildConsumption()], totalCount: 1 });
		mockedListAll.mockResolvedValue({ data: null, error: { message: 'Export failed' } });
		mockedTranslate.mockReturnValue('No se pudo exportar.');

		render(<InternalConsumptions />);

		await user.click(screen.getByRole('button', { name: /Exportar/i }));
		await user.click(screen.getByRole('menuitem', { name: /PDF/i }));

		await waitFor(() =>
			expect(mockedToast).toHaveBeenCalledWith({
				title: 'Error al exportar',
				description: 'No se pudo exportar.',
				variant: 'destructive',
			})
		);
	});

	it('sorts the loaded consumptions when clicking a header', async () => {
		const user = userEvent.setup();
		mockHook({
			consumptions: [
				buildConsumption({ id: 1, products: { name: 'Zapatilla' } }),
				buildConsumption({ id: 2, products: { name: 'Auriculares' } }),
			],
			totalCount: 2,
		});

		render(<InternalConsumptions />);

		await user.click(screen.getByRole('columnheader', { name: /Producto/ }));

		const rowsAsc = screen.getAllByRole('row');
		expect(within(rowsAsc[1]).getByText('Auriculares')).toBeInTheDocument();

		await user.click(screen.getByRole('columnheader', { name: /Producto/ }));

		const rowsDesc = screen.getAllByRole('row');
		expect(within(rowsDesc[1]).getByText('Zapatilla')).toBeInTheDocument();
	});
});
