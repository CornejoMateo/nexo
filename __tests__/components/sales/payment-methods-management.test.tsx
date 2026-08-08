import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentMethodsManagement } from '@/components/business/sales/payment-methods-management';
import {
	createPaymentMethod,
	updatePaymentMethod,
	deletePaymentMethod,
} from '@/lib/sales/payment-methods';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { toast } from '@/components/ui/use-toast';

jest.mock('@/lib/sales/payment-methods');
jest.mock('@/hooks/use-optimized-realtime');
jest.mock('@/lib/error-translator', () => ({
	translateError: jest.fn((e) => e || 'Error traducido'),
}));

jest.mock('@/components/ui/use-toast', () => ({
	toast: jest.fn(),
}));

jest.mock('@/components/ui/dialog', () => ({
	Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
	DialogContent: ({ children }: any) => <div>{children}</div>,
	DialogHeader: ({ children }: any) => <div>{children}</div>,
	DialogTitle: ({ children }: any) => <h2>{children}</h2>,
	DialogDescription: ({ children }: any) => <p>{children}</p>,
	DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/alert-dialog', () => ({
	AlertDialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
	AlertDialogContent: ({ children }: any) => <div>{children}</div>,
	AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
	AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
	AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
	AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
	AlertDialogCancel: (props: any) => <button {...props} />,
	AlertDialogAction: ({ onClick, ...props }: any) => <button onClick={onClick} {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
	Button: ({ children, onClick, disabled, type, ...props }: any) => (
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

jest.mock('@/components/ui/card', () => ({
	Card: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/table', () => ({
	Table: ({ children }: any) => <table>{children}</table>,
	TableBody: ({ children }: any) => <tbody>{children}</tbody>,
	TableCell: ({ children }: any) => <td>{children}</td>,
	TableHead: ({ children }: any) => <th>{children}</th>,
	TableHeader: ({ children }: any) => <thead>{children}</thead>,
	TableRow: ({ children }: any) => <tr>{children}</tr>,
}));

const mockedRealtime = useOptimizedRealtime as jest.Mock;
const mockedCreate = createPaymentMethod as jest.Mock;
const mockedUpdate = updatePaymentMethod as jest.Mock;
const mockedDelete = deletePaymentMethod as jest.Mock;
const mockedToast = toast as jest.Mock;

const method = (overrides: Partial<any> = {}) => ({ id: 1, name: 'Efectivo', ...overrides });

const renderDialog = (methods: any[] = []) => {
	mockedRealtime.mockReturnValue({
		data: methods,
		loading: false,
		error: null,
		refresh: jest.fn(),
	});
	return render(<PaymentMethodsManagement open onOpenChange={jest.fn()} />);
};

describe('PaymentMethodsManagement', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders the list of payment methods', () => {
		renderDialog([method(), method({ id: 2, name: 'Tarjeta' })]);

		expect(screen.getByText('Efectivo')).toBeInTheDocument();
		expect(screen.getByText('Tarjeta')).toBeInTheDocument();
	});

	it('shows an empty state when there are no methods', () => {
		renderDialog([]);

		expect(screen.getByText(/Todavía no hay métodos de pago cargados/)).toBeInTheDocument();
	});

	it('creates a payment method', async () => {
		const user = userEvent.setup();
		mockedCreate.mockResolvedValue({ data: method({ name: 'Transferencia' }), error: null });
		renderDialog([]);

		await user.click(screen.getByText('Agregar método de pago'));
		await user.type(screen.getByLabelText('Nombre'), 'Transferencia');
		await user.click(screen.getByText('Crear'));

		await waitFor(() => {
			expect(mockedCreate).toHaveBeenCalledWith({ name: 'Transferencia' });
		});
		expect(mockedToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Método creado' }));
	});

	it('requires a name when creating', async () => {
		const user = userEvent.setup();
		renderDialog([]);

		await user.click(screen.getByText('Agregar método de pago'));
		await user.click(screen.getByText('Crear'));

		expect(mockedCreate).not.toHaveBeenCalled();
		expect(mockedToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Nombre obligatorio' })
		);
	});

	it('updates a payment method', async () => {
		const user = userEvent.setup();
		mockedUpdate.mockResolvedValue({ data: method({ name: 'Efectivo ARS' }), error: null });
		renderDialog([method()]);

		await user.click(screen.getByText('Editar'));
		const input = screen.getByLabelText('Nombre');
		await user.clear(input);
		await user.type(input, 'Efectivo ARS');
		await user.click(screen.getByText('Actualizar'));

		await waitFor(() => {
			expect(mockedUpdate).toHaveBeenCalledWith(1, { name: 'Efectivo ARS' });
		});
		expect(mockedToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Método actualizado' })
		);
	});

	it('deletes a payment method after confirmation', async () => {
		const user = userEvent.setup();
		mockedDelete.mockResolvedValue({ data: null, error: null });
		renderDialog([method()]);

		await user.click(screen.getByText('Eliminar'));
		expect(screen.getByText(/¿Eliminar método de pago\?/)).toBeInTheDocument();

		await user.click(screen.getAllByText('Eliminar')[1]);

		await waitFor(() => {
			expect(mockedDelete).toHaveBeenCalledWith(1);
		});
		expect(mockedToast).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Método eliminado' })
		);
	});
});
