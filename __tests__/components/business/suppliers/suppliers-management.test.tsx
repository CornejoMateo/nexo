import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuppliersManagement } from '@/components/business/suppliers/suppliers-management';
import {
	listSuppliers,
	createSupplier,
	updateSupplier,
	deleteSupplier,
} from '@/lib/suppliers/suppliers';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';

jest.mock('@/lib/suppliers/suppliers');
jest.mock('@/lib/error-translator');
jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

jest.mock('@/components/ui/infoBanner', () => ({
	InfoBanner: () => <div data-testid="info-banner" />,
}));

jest.mock('@/components/ui/download-export-button', () => ({
	DownloadExportButton: () => <div data-testid="download-export-button" />,
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

jest.mock('@/hooks/use-optimized-realtime', () => ({
	useOptimizedRealtime: jest.fn(),
}));

const mockedList = listSuppliers as jest.Mock;
const mockedCreate = createSupplier as jest.Mock;
const mockedUpdate = updateSupplier as jest.Mock;
const mockedDelete = deleteSupplier as jest.Mock;
const mockedTranslate = translateError as jest.Mock;
const mockedRealtime = useOptimizedRealtime as jest.Mock;

const emptyPayload = {
	cuit: null,
	phone: null,
	email: null,
	address: null,
	notes: null,
};

beforeEach(() => {
	jest.clearAllMocks();

	mockedTranslate.mockReturnValue(null);

	mockedRealtime.mockReturnValue({
		data: [],
		loading: false,
		error: null,
		refresh: jest.fn(),
	});
});

it('loads suppliers', async () => {
	mockedRealtime.mockReturnValue({
		data: [
			{
				id: 1,
				name: 'Papelera Central',
				cuit: '20-12345678-9',
				phone: '11 1234-5678',
				email: 'ventas@papelera.com',
				address: 'Av. Corrientes 1234',
				notes: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
			},
			{
				id: 2,
				name: 'Distribuidora Sur',
				cuit: null,
				phone: null,
				email: null,
				address: null,
				notes: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
			},
		],
		loading: false,
		error: null,
		refresh: jest.fn(),
	});

	render(<SuppliersManagement />);

	expect(await screen.findByText('Papelera Central')).toBeInTheDocument();
	expect(screen.getByText('Distribuidora Sur')).toBeInTheDocument();
	expect(screen.getByText('20-12345678-9')).toBeInTheDocument();
	expect(screen.getByText('ventas@papelera.com')).toBeInTheDocument();

	const whatsappLink = screen.getByRole('link', { name: /11 1234-5678/i });
	expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/5491112345678');
});

it('shows empty state', async () => {
	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<SuppliersManagement />);

	expect(await screen.findByText(/Todavía no hay proveedores cargados/i)).toBeInTheDocument();
});

it('shows list error', async () => {
	mockedRealtime.mockReturnValue({
		data: [],
		loading: false,
		error: 'No se pudo cargar el listado de proveedores.',
		refresh: jest.fn(),
	});

	render(<SuppliersManagement />);

	expect(await screen.findByText(/No se pudo cargar el listado/)).toBeInTheDocument();
});

it('creates a supplier', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: {
			id: 10,
			name: 'Sony',
			cuit: null,
			phone: null,
			email: null,
			address: null,
			notes: null,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z',
		},
		error: null,
	});

	render(<SuppliersManagement />);

	await screen.findByText(/Nuevo proveedor/i);

	await user.click(screen.getByText(/Nuevo proveedor/i));

	await user.type(screen.getByPlaceholderText(/Fundas S.A./i), 'Sony');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() => {
		expect(mockedCreate).toHaveBeenCalledWith({
			name: 'Sony',
			...emptyPayload,
		});
	});
});

it('creates a supplier with optional fields', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: {
			id: 11,
			name: 'Papelera Central',
			cuit: '20-12345678-9',
			phone: '11 1234-5678',
			email: 'ventas@papelera.com',
			address: 'Av. Corrientes 1234',
			notes: 'Entrega los lunes',
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z',
		},
		error: null,
	});

	render(<SuppliersManagement />);

	await screen.findByText(/Nuevo proveedor/i);

	await user.click(screen.getByText(/Nuevo proveedor/i));

	await user.type(screen.getByPlaceholderText(/Fundas S.A./i), 'Papelera Central');
	await user.type(screen.getByPlaceholderText(/20-12345678-9/i), '20-12345678-9');
	await user.type(screen.getByPlaceholderText(/3586 123456/i), '11 1234-5678');
	await user.type(screen.getByPlaceholderText(/ventas@fundas.com/i), 'ventas@papelera.com');
	await user.type(screen.getByPlaceholderText(/Av. San Martín 1234/i), 'Av. Corrientes 1234');
	await user.type(screen.getByPlaceholderText(/Entrega los lunes/i), 'Entrega los lunes');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() => {
		expect(mockedCreate).toHaveBeenCalledWith({
			name: 'Papelera Central',
			cuit: '20-12345678-9',
			phone: '11 1234-5678',
			email: 'ventas@papelera.com',
			address: 'Av. Corrientes 1234',
			notes: 'Entrega los lunes',
		});
	});
});

it('validates required name', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<SuppliersManagement />);

	await user.click(screen.getByText(/Nuevo proveedor/i));

	await user.click(screen.getByText('Guardar'));

	expect(await screen.findByText(/El nombre es obligatorio/)).toBeInTheDocument();
});

it('validates invalid email', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<SuppliersManagement />);

	await user.click(screen.getByText(/Nuevo proveedor/i));

	await user.type(screen.getByPlaceholderText(/Fundas S.A./i), 'Sony');
	await user.type(screen.getByPlaceholderText(/ventas@fundas.com/i), 'mail-invalido');

	await user.click(screen.getByText('Guardar'));

	expect(await screen.findByText(/El correo electrónico no es válido/)).toBeInTheDocument();
});

it('updates a supplier', async () => {
	const user = userEvent.setup();

	mockedRealtime.mockReturnValue({
		data: [
			{
				id: 1,
				name: 'Papelera Central',
				cuit: null,
				phone: null,
				email: null,
				address: null,
				notes: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
			},
		],
		loading: false,
		error: null,
		refresh: jest.fn(),
	});

	mockedUpdate.mockResolvedValue({
		data: {
			id: 1,
			name: 'Papelera Central S.A.',
			cuit: null,
			phone: null,
			email: null,
			address: null,
			notes: null,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z',
		},
		error: null,
	});

	render(<SuppliersManagement />);

	await screen.findByText('Papelera Central');

	await user.click(screen.getByText('Editar'));

	const input = screen.getByDisplayValue('Papelera Central');

	await user.clear(input);
	await user.type(input, 'Papelera Central S.A.');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() =>
		expect(mockedUpdate).toHaveBeenCalledWith(1, {
			name: 'Papelera Central S.A.',
			...emptyPayload,
		})
	);
});

it('deletes a supplier', async () => {
	const user = userEvent.setup();

	mockedRealtime.mockReturnValue({
		data: [
			{
				id: 1,
				name: 'Papelera Central',
				cuit: null,
				phone: null,
				email: null,
				address: null,
				notes: null,
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
			},
		],
		loading: false,
		error: null,
		refresh: jest.fn(),
	});

	mockedDelete.mockResolvedValue({
		data: null,
		error: null,
	});

	render(<SuppliersManagement />);

	await screen.findByText('Papelera Central');

	const row = screen.getByText('Papelera Central').closest('tr') as HTMLElement;
	await user.click(within(row).getByRole('button', { name: 'Eliminar' }));

	await user.click(screen.getAllByRole('button', { name: 'Eliminar' })[1]);

	await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
});

it('shows translated error when create fails', async () => {
	const user = userEvent.setup();

	mockedTranslate.mockReturnValue('Ya existe un proveedor con ese CUIT');

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: null,
		error: {},
	});

	render(<SuppliersManagement />);

	await user.click(screen.getByText(/Nuevo proveedor/i));

	await user.type(screen.getByPlaceholderText(/Fundas S.A./i), 'Sony');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() =>
		expect(toast).toHaveBeenCalledWith(
			expect.objectContaining({
				title: 'Error al guardar proveedor',
				description: 'Ya existe un proveedor con ese CUIT',
				variant: 'destructive',
			})
		)
	);
});
