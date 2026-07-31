import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { InfoBanner } from '@/components/ui/infoBanner';

describe('InfoBanner', () => {
	it('renders the default title and children', () => {
		render(<InfoBanner>Contenido informativo</InfoBanner>);

		expect(screen.getByText('Información')).toBeInTheDocument();
		expect(screen.getByText('Contenido informativo')).toBeInTheDocument();
	});

	it('renders a custom title', () => {
		render(<InfoBanner title="Aviso">Contenido</InfoBanner>);

		expect(screen.getByText('Aviso')).toBeInTheDocument();
	});

	it('renders sections with their titles and content', () => {
		render(
			<InfoBanner
				sections={[
					{ title: 'Sección 1', children: 'Contenido 1' },
					{ title: 'Sección 2', children: 'Contenido 2' },
				]}
			/>
		);

		expect(screen.getByText('Sección 1')).toBeInTheDocument();
		expect(screen.getByText('Contenido 1')).toBeInTheDocument();
		expect(screen.getByText('Sección 2')).toBeInTheDocument();
		expect(screen.getByText('Contenido 2')).toBeInTheDocument();
	});

	it('renders sections without titles', () => {
		render(<InfoBanner sections={[{ children: 'Solo contenido' }]} />);

		expect(screen.getByText('Solo contenido')).toBeInTheDocument();
	});

	describe('collapsible', () => {
		it('hides the content by default and shows it when toggled', () => {
			render(<InfoBanner collapsible sections={[{ children: 'Contenido oculto' }]} />);

			const toggle = screen.getByRole('button');
			expect(toggle).toHaveAttribute('aria-expanded', 'false');
			expect(screen.queryByText('Contenido oculto')).not.toBeInTheDocument();

			fireEvent.click(toggle);

			expect(toggle).toHaveAttribute('aria-expanded', 'true');
			expect(screen.getByText('Contenido oculto')).toBeInTheDocument();
		});
	});

	describe('pagination', () => {
		const sections = Array.from({ length: 5 }, (_, i) => ({
			title: `Sección ${i + 1}`,
			children: `Contenido ${i + 1}`,
		}));

		it('shows the first 3 sections with the page counter', () => {
			render(<InfoBanner sections={sections} />);

			expect(screen.getByText('Sección 1')).toBeInTheDocument();
			expect(screen.getByText('Sección 2')).toBeInTheDocument();
			expect(screen.getByText('Sección 3')).toBeInTheDocument();
			expect(screen.queryByText('Sección 4')).not.toBeInTheDocument();
			expect(screen.getByText('1 / 2')).toBeInTheDocument();
		});

		it('navigates to the next page and back', () => {
			render(<InfoBanner sections={sections} />);

			fireEvent.click(screen.getByRole('button', { name: 'Siguientes secciones' }));

			expect(screen.getByText('Sección 4')).toBeInTheDocument();
			expect(screen.getByText('Sección 5')).toBeInTheDocument();
			expect(screen.queryByText('Sección 1')).not.toBeInTheDocument();
			expect(screen.getByText('2 / 2')).toBeInTheDocument();

			fireEvent.click(screen.getByRole('button', { name: 'Secciones anteriores' }));

			expect(screen.getByText('Sección 1')).toBeInTheDocument();
			expect(screen.queryByText('Sección 4')).not.toBeInTheDocument();
			expect(screen.getByText('1 / 2')).toBeInTheDocument();
		});

		it('disables the pagination buttons at the boundaries', () => {
			render(<InfoBanner sections={sections} />);

			expect(screen.getByRole('button', { name: 'Secciones anteriores' })).toBeDisabled();

			fireEvent.click(screen.getByRole('button', { name: 'Siguientes secciones' }));

			expect(screen.getByRole('button', { name: 'Siguientes secciones' })).toBeDisabled();
		});

		it('does not paginate when there are 3 or fewer sections', () => {
			render(<InfoBanner sections={sections.slice(0, 3)} />);

			expect(screen.getByText('Sección 3')).toBeInTheDocument();
			expect(screen.queryByText('1 / 1')).not.toBeInTheDocument();
			expect(
				screen.queryByRole('button', { name: 'Siguientes secciones' })
			).not.toBeInTheDocument();
		});
	});
});
