import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoriesManagement } from '@/components/business/products/categories-management';
import {
	listCategories,
	createCategory,
	updateCategory,
	deleteCategory,
} from '@/lib/products/categories/categories';
import { translateError } from '@/lib/error-translator';

jest.mock('@/lib/products/categories/categories');
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

const mockedList = listCategories as jest.Mock;
const mockedCreate = createCategory as jest.Mock;
const mockedUpdate = updateCategory as jest.Mock;
const mockedDelete = deleteCategory as jest.Mock;
const mockedTranslate = translateError as jest.Mock;

beforeEach(() => {
	jest.clearAllMocks();
	mockedTranslate.mockReturnValue(null);
});

it('loads categories', async () => {
	mockedList.mockResolvedValue({
		data: [
			{ id: 1, name: 'Watch' },
			{ id: 2, name: 'Electronics' },
		],
		error: null,
	});

	render(<CategoriesManagement />);

	expect(await screen.findByText('Watch')).toBeInTheDocument();
	expect(screen.getByText('Electronics')).toBeInTheDocument();
});

it('shows empty state', async () => {
	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<CategoriesManagement />);

	expect(await screen.findByText(/Todavía no hay categorías cargadas/i)).toBeInTheDocument();
});

it('shows list error', async () => {
	mockedList.mockResolvedValue({
		data: null,
		error: {},
	});

	render(<CategoriesManagement />);

	expect(await screen.findByText(/No se pudo cargar el listado/)).toBeInTheDocument();
});

it('creates a category', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: {
			id: 10,
			name: 'Phones',
		},
		error: null,
	});

	render(<CategoriesManagement />);

	await screen.findByText(/Nueva categoría/i);

	await user.click(screen.getByText(/Nueva categoría/i));

	await user.type(screen.getByPlaceholderText(/Ej: Relojes/i), 'Phones');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() => {
		expect(mockedCreate).toHaveBeenCalledWith({
			name: 'Phones',
		});
	});
});

it('validates required name', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	render(<CategoriesManagement />);

	await user.click(screen.getByText(/Nueva categoría/i));

	await user.click(screen.getByText('Guardar'));

	expect(await screen.findByText(/El nombre es obligatorio/)).toBeInTheDocument();
});

it('updates a category', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [{ id: 1, name: 'Watch' }],
		error: null,
	});

	mockedUpdate.mockResolvedValue({
		data: { id: 1, name: 'Watch Inc.' },
		error: null,
	});

	render(<CategoriesManagement />);

	await screen.findByText('Watch');

	await user.click(screen.getByText('Editar'));

	const input = screen.getByDisplayValue('Watch');

	await user.clear(input);
	await user.type(input, 'Watch Inc.');

	await user.click(screen.getByText('Guardar'));

	await waitFor(() =>
		expect(mockedUpdate).toHaveBeenCalledWith(1, {
			name: 'Watch Inc.',
		})
	);
});

it('deletes a category', async () => {
	const user = userEvent.setup();

	mockedList.mockResolvedValue({
		data: [{ id: 1, name: 'Watch' }],
		error: null,
	});

	mockedDelete.mockResolvedValue({
		data: null,
		error: null,
	});

	render(<CategoriesManagement />);

	await screen.findByText('Watch');

	await user.click(screen.getAllByText('Eliminar')[0]);

	await user.click(screen.getAllByText('Eliminar')[1]);

	await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(1));
});

it('shows translated error when create fails', async () => {
	const user = userEvent.setup();

	mockedTranslate.mockReturnValue('Categoría duplicada');

	mockedList.mockResolvedValue({
		data: [],
		error: null,
	});

	mockedCreate.mockResolvedValue({
		data: null,
		error: {},
	});

	render(<CategoriesManagement />);

	await user.click(screen.getByText(/Nueva categoría/i));

	await user.type(screen.getByPlaceholderText(/Ej: Relojes/i), 'Phones');

	await user.click(screen.getByText('Guardar'));

	expect(await screen.findByText('Categoría duplicada')).toBeInTheDocument();
});
