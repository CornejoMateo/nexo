import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsDialog } from '@/components/business/settings/settings-dialog';
import {
	listUsers,
	createUser,
	deleteUser,
	updateUser,
	updateUserPassword,
} from '@/lib/users/users';
import { updateBusinessSettings } from '@/lib/settings/business-settings';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/components/provider/auth-provider';
import { useSettings } from '@/components/provider/settings-provider';

jest.mock('@/lib/users/users', () => ({
	listUsers: jest.fn(),
	createUser: jest.fn(),
	deleteUser: jest.fn(),
	updateUser: jest.fn(),
	updateUserPassword: jest.fn(),
}));

jest.mock('@/lib/settings/business-settings', () => ({
	updateBusinessSettings: jest.fn(),
}));

const mockToast = jest.fn();

jest.mock('@/components/ui/use-toast', () => ({
	useToast: jest.fn(() => ({ toast: mockToast })),
	toast: (...args: any[]) => mockToast(...args),
}));

jest.mock('@/components/provider/auth-provider', () => ({
	useAuth: jest.fn(),
}));

jest.mock('@/components/provider/settings-provider', () => ({
	useSettings: jest.fn(),
}));

jest.mock('@/lib/error-translator', () => ({
	translateError: jest.fn((e) => e || 'Error traducido'),
}));

jest.mock('@/lib/utils', () => ({
	cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

jest.mock('@/constants/users/user-role', () => ({
	roles: ['Admin', 'Taller'],
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
	DialogContent: ({ children }: any) => <div>{children}</div>,
	DialogHeader: ({ children }: any) => <div>{children}</div>,
	DialogTitle: ({ children }: any) => <h2>{children}</h2>,
	DialogDescription: ({ children }: any) => <p>{children}</p>,
	DialogFooter: ({ children }: any) => <div>{children}</div>,
	DialogClose: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/components/ui/alert-dialog', () => ({
	AlertDialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
	AlertDialogContent: ({ children }: any) => <div>{children}</div>,
	AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
	AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
	AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
	AlertDialogCancel: (props: any) => <button {...props} />,
	AlertDialogAction: ({ onClick, ...props }: any) => <button onClick={onClick} {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, onClick, disabled, type, variant, size, ...props }: any) => (
		<button type={type || 'button'} onClick={onClick} disabled={disabled} {...props}>
			{children}
		</button>
	),
}));

jest.mock('@/components/ui/input', () => ({
	Input: (props: any) => <input {...props} />,
}));

jest.mock('@/components/ui/label', () => ({
	Label: (props: any) => <label {...props} />,
}));

jest.mock('@/components/ui/table', () => ({
	Table: ({ children }: any) => <table>{children}</table>,
	TableBody: ({ children }: any) => <tbody>{children}</tbody>,
	TableCell: ({ children }: any) => <td>{children}</td>,
	TableHead: ({ children }: any) => <th>{children}</th>,
	TableHeader: ({ children }: any) => <thead>{children}</thead>,
	TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

jest.mock('@/components/ui/select', () => ({
	Select: ({ children, onValueChange, value }: any) => (
		<select
			data-testid="select-role"
			value={value}
			onChange={(e) => onValueChange?.(e.target.value)}
		>
			{children}
		</select>
	),
	SelectContent: ({ children }: any) => <>{children}</>,
	SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
	SelectTrigger: () => null,
	SelectValue: () => null,
}));

function setup(users: any[] = [], settings: any = null) {
	(listUsers as jest.Mock).mockResolvedValue({ data: users, error: null });
	(useAuth as jest.Mock).mockReturnValue({
		user: { username: 'admin1', role: 'Admin', name: 'Admin', last_name: 'User' },
	});
	(useSettings as jest.Mock).mockReturnValue({
		settings: settings ?? {
			id: 1,
			updated_at: '2024-01-01T00:00:00Z',
			usd_rate: 1000,
			address: null,
			number_phone: null,
		},
		loading: false,
		error: null,
		refreshSettings: jest.fn(),
	});
	render(<SettingsDialog open onOpenChange={jest.fn()} />);
	return {
		waitForUsers: () =>
			waitFor(() => expect(screen.getByText('Configuración')).toBeInTheDocument()),
	};
}

describe('SettingsDialog', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		(useToast as jest.Mock).mockReturnValue({ toast: mockToast });
	});

	it('loads and displays users on open', async () => {
		setup([
			{ uid_user: '1', username: 'admin1', role: 'Admin' },
			{ uid_user: '2', username: 'taller1', role: 'Taller' },
		]);

		await waitFor(() => {
			expect(screen.getByText('admin1')).toBeInTheDocument();
		});
		expect(screen.getByText('taller1')).toBeInTheDocument();
	});

	it('shows create user form when clicking Nuevo usuario', async () => {
		setup();
		await screen.findByText('+ Nuevo usuario');

		fireEvent.click(screen.getByText('+ Nuevo usuario'));

		expect(screen.getByLabelText('Nombre de usuario')).toBeInTheDocument();
		expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
		expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
		expect(screen.getByLabelText('Apellido')).toBeInTheDocument();
	});

	it('creates a new user', async () => {
		setup();
		(createUser as jest.Mock).mockResolvedValue({ data: { success: true }, error: null });

		fireEvent.click(await screen.findByText('+ Nuevo usuario'));
		fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
			target: { value: 'nuevouser' },
		});
		fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Pérez' } });
		fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Juan' } });
		fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '123456' } });
		fireEvent.change(screen.getByTestId('select-role'), { target: { value: 'Taller' } });
		fireEvent.click(screen.getByText('Crear usuario'));

		await waitFor(() => {
			expect(createUser).toHaveBeenCalledWith({
				username: 'nuevouser',
				password: '123456',
				role: 'Taller',
				name: 'Juan',
				last_name: 'Pérez',
			});
		});
		expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Usuario creado' }));
	});

	it('updates user role', async () => {
		setup([{ uid_user: '1', username: 'user1', role: 'Taller' }]);
		(updateUser as jest.Mock).mockResolvedValue({ data: null, error: null });

		await screen.findByText('user1');

		fireEvent.change(screen.getByTestId('select-role'), { target: { value: 'Admin' } });

		await waitFor(() => {
			expect(updateUser).toHaveBeenCalledWith('1', { role: 'Admin' });
		});
		expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Rol actualizado' }));
	});

	it('deletes a user', async () => {
		setup([{ uid_user: '1', username: 'user1', role: 'Taller' }]);
		(deleteUser as jest.Mock).mockResolvedValue({ error: null });

		await screen.findByText('user1');
		fireEvent.click(screen.getByRole('button', { name: /eliminar user1/i }));

		await screen.findByText('¿Eliminar usuario?');
		fireEvent.click(screen.getByText('Eliminar'));

		await waitFor(() => {
			expect(deleteUser).toHaveBeenCalledWith('1');
		});
		expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Usuario eliminado' }));
	});

	it('shows edit form when clicking Editar button', async () => {
		setup([{ uid_user: '1', username: 'user1', role: 'Taller' }]);

		await screen.findByText('user1');
		fireEvent.click(screen.getByRole('button', { name: /editar user1/i }));

		expect(screen.getByDisplayValue('user1')).toBeInTheDocument();
		expect(screen.getByText('Guardar cambios')).toBeInTheDocument();
		expect(screen.getByText('Editar usuario')).toBeInTheDocument();
	});

	it('edits username and role without changing password', async () => {
		setup([{ uid_user: '1', username: 'user1', role: 'Taller' }]);
		(updateUser as jest.Mock).mockResolvedValue({ data: null, error: null });

		await screen.findByText('user1');
		fireEvent.click(screen.getByRole('button', { name: /editar user1/i }));

		fireEvent.change(screen.getByLabelText('Nombre de usuario'), {
			target: { value: 'user1-editado' },
		});
		fireEvent.change(screen.getByTestId('select-role'), { target: { value: 'Admin' } });
		fireEvent.click(screen.getByText('Guardar cambios'));

		await waitFor(() => {
			expect(updateUser).toHaveBeenCalledWith('1', {
				username: 'user1-editado',
				role: 'Admin',
				name: '',
				last_name: '',
			});
		});
		expect(updateUserPassword).not.toHaveBeenCalled();
		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Usuario actualizado' })
		);
	});

	it('edits user and changes password', async () => {
		setup([{ uid_user: '1', username: 'user1', role: 'Taller' }]);
		(updateUser as jest.Mock).mockResolvedValue({ data: null, error: null });
		(updateUserPassword as jest.Mock).mockResolvedValue({ error: null });

		await screen.findByText('user1');
		fireEvent.click(screen.getByRole('button', { name: /editar user1/i }));

		fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'user1' } });
		fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'newpass123' } });
		fireEvent.click(screen.getByText('Guardar cambios'));

		await waitFor(() => {
			expect(updateUser).toHaveBeenCalledWith('1', {
				username: 'user1',
				role: 'Taller',
				name: '',
				last_name: '',
			});
		});
		expect(updateUserPassword).toHaveBeenCalledWith('1', 'newpass123');
		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Usuario actualizado' })
		);
	});

	it('shows the company form prefilled with business settings data', async () => {
		const user = userEvent.setup();
		setup([], {
			id: 1,
			updated_at: '2024-01-01T00:00:00Z',
			usd_rate: 1000,
			address: 'Av. Siempre Viva 123',
			number_phone: '11 5555 1234',
		});

		await user.click(screen.getByRole('tab', { name: /Empresa/i }));

		expect(screen.getByDisplayValue('Av. Siempre Viva 123')).toBeInTheDocument();
		expect(screen.getByDisplayValue('11 5555 1234')).toBeInTheDocument();
	});

	it('saves company settings', async () => {
		const user = userEvent.setup();
		setup();
		(updateBusinessSettings as jest.Mock).mockResolvedValue({ data: null, error: null });
		const refreshSettings = jest.fn();
		(useSettings as jest.Mock).mockReturnValue({
			settings: {
				id: 1,
				updated_at: '2024-01-01T00:00:00Z',
				usd_rate: 1000,
				address: null,
				number_phone: null,
			},
			loading: false,
			error: null,
			refreshSettings,
		});

		await user.click(screen.getByRole('tab', { name: /Empresa/i }));

		await user.type(screen.getByLabelText('Dirección'), 'Av. Corrientes 500');
		await user.type(screen.getByLabelText('Teléfono'), '11 2222 3333');
		await user.click(screen.getByText('Guardar cambios'));

		await waitFor(() => {
			expect(updateBusinessSettings).toHaveBeenCalledWith({
				address: 'Av. Corrientes 500',
				number_phone: '11 2222 3333',
			});
		});
		expect(refreshSettings).toHaveBeenCalled();
		expect(mockToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Empresa actualizada' })
		);
	});
});
