import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sales } from '@/components/business/sales/sales';

jest.mock('@/components/business/sales/payment-methods-management', () => ({
	PaymentMethodsManagement: ({ open }: any) =>
		open ? <div data-testid="payment-methods-dialog">Métodos de pago</div> : null,
}));

describe('Sales', () => {
	it('renders the sales header with the payment methods button', () => {
		render(<Sales />);

		expect(screen.getByRole('heading', { name: 'Ventas' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Métodos de pago/i })).toBeInTheDocument();
	});

	it('opens the payment methods dialog when clicking the button', async () => {
		const user = userEvent.setup();
		render(<Sales />);

		expect(screen.queryByTestId('payment-methods-dialog')).not.toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: /Métodos de pago/i }));

		expect(screen.getByTestId('payment-methods-dialog')).toBeInTheDocument();
	});
});
