import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrandsManagement } from '@/components/business/products/brands-management';
import { listBrands, createBrand, updateBrand, deleteBrand } from '@/lib/products/brands/brands';
import { translateError } from '@/lib/error-translator';

jest.mock('@/lib/products/brands/brands');
jest.mock('@/lib/error-translator');

jest.mock('@/components/ui/infoBanner', () => ({
	InfoBanner: () => <div data-testid="info-banner" />,
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

const mockedList = listBrands as jest.Mock;
const mockedCreate = createBrand as jest.Mock;
const mockedUpdate = updateBrand as jest.Mock;
const mockedDelete = deleteBrand as jest.Mock;
const mockedTranslate = translateError as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
	mockedTranslate.mockReturnValue(null);
});

it('loads brands', async () => {
	mockedList.mockResolvedValue({
		data: [
			{ id: 1, name: 'Apple' },
			{ id: 2, name: 'Samsung' },
		],
		error: null,
	});

	render(<BrandsManagement />);

	expect(await screen.findByText('Apple')).toBeInTheDocument();
	expect(screen.getByText('Samsung')).toBeInTheDocument();
});

it('shows empty state', async () => {
	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<BrandsManagement />);

	expect(await screen.findByText(/Todavía no hay marcas cargadas/i)).toBeInTheDocument();
});

it('shows list error', async () => {
	mockedList.mockResolvedValue({
		data: null,
		error: {},
	});

	render(<BrandsManagement />);

	expect(await screen.findByText(/No se pudo cargar el listado/)).toBeInTheDocument();
});

it('creates a brand', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: {
			id: 10,
			name: 'Sony',
		},
		error: null,
	});

	render(<BrandsManagement />);

	await screen.findByText(/Nueva marca/i);

	await user.click(screen.getByText(/Nueva marca/i));

	await user.type(screen.getByPlaceholderText(/Apple/i), 'Sony');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() => {
		expect(mockedCreate).toHaveBeenCalledWith({
			name: 'Sony',
		});
	});
});

it('validates required name', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<BrandsManagement />);

	await user.click(screen.getByText(/Nueva marca/i));

	await user.click(screen.getByText('Guardar'));

	expect(await screen.findByText(/El nombre es obligatorio/)).toBeInTheDocument();
});

it('updates a brand', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [{ id: 1, name: 'Apple' }],
		error: null,
	});

	mockedUpdate.mockResolvedValue({
		data: { id: 1, name: 'Apple Inc.' },
		error: null,
	});

	render(<BrandsManagement />);

	await screen.findByText('Apple');

	await user.click(screen.getByText('Editar'));

	const input = screen.getByDisplayValue('Apple');

	await user.clear(input);
	await user.type(input, 'Apple Inc.');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() =>
		expect(mockedUpdate).toHaveBeenCalledWith(1, {
			name: 'Apple Inc.',
		})
	);
});

it('deletes a brand', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [{ id: 1, name: 'Apple' }],
		error: null,
	});

	mockedDelete.mockResolvedValue({
		data: null,
		error: null,
	});

	render(<BrandsManagement />);

	await screen.findByText('Apple');

	await user.click(screen.getAllByText('Eliminar')[0]);

	await user.click(screen.getAllByText('Eliminar')[1]);

	await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
});

it('shows translated error when create fails', async () => {
	const user = userEvent.setup();

	mockedTranslate.mockReturnValue('Marca duplicada');

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: null,
		error: {},
	});

	render(<BrandsManagement />);

	await user.click(screen.getByText(/Nueva marca/i));

	await user.type(screen.getByPlaceholderText(/Apple/i), 'Sony');

	await user.click(screen.getByText('Guardar'));

	expect(await screen.findByText('Marca duplicada')).toBeInTheDocument();
});
