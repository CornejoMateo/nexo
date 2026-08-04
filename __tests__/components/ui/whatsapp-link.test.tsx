import { render, screen } from '@testing-library/react';
import { WhatsAppLink } from '@/components/ui/whatsapp-link';

it('builds a wa.me URL from a local Argentine mobile number', () => {
	render(<WhatsAppLink phone="11 1234-5678" />);

	const link = screen.getByRole('link', { name: /11 1234-5678/i });
	expect(link).toHaveAttribute('href', 'https://wa.me/5491112345678');
});

it('keeps an already internationalized number as is', () => {
	render(<WhatsAppLink phone="+54 9 11 1234-5678" />);

	const link = screen.getByRole('link');
	expect(link).toHaveAttribute('href', 'https://wa.me/5491112345678');
});

it('keeps a landline number with country code as is', () => {
	render(<WhatsAppLink phone="54 3586 123456" />);

	const link = screen.getByRole('link');
	expect(link).toHaveAttribute('href', 'https://wa.me/543586123456');
});

it('strips a leading 0 from the area code', () => {
	render(<WhatsAppLink phone="011 1234-5678" />);

	const link = screen.getByRole('link');
	expect(link).toHaveAttribute('href', 'https://wa.me/5491112345678');
});

it('strips the legacy 15 mobile prefix', () => {
	render(<WhatsAppLink phone="155555-1234" />);

	const link = screen.getByRole('link');
	expect(link).toHaveAttribute('href', 'https://wa.me/54955551234');
});

it('appends an encoded message when provided', () => {
	render(<WhatsAppLink phone="11 1234-5678" message="Hola, ¿tenés stock?" />);

	const link = screen.getByRole('link');
	expect(link).toHaveAttribute(
		'href',
		'https://wa.me/5491112345678?text=Hola%2C%20%C2%BFten%C3%A9s%20stock%3F'
	);
});

it('opens the link in a new tab', () => {
	render(<WhatsAppLink phone="11 1234-5678" />);

	const link = screen.getByRole('link');
	expect(link).toHaveAttribute('target', '_blank');
	expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});
