'use client';

import { InfoBanner } from '@/components/ui/infoBanner';

export function StockManagement() {
	return (
		<div className="w-full p-6">
			<div className="mb-6">
				<h1 className="text-xl font-semibold text-neutral-900">Stock</h1>
			</div>

			<InfoBanner
				collapsible
				title="Stock"
				sections={[
					{
						title: '¿Qué es?',
						children: 'Desde esta sección se visualiza el stock disponible de cada producto.',
					},
					{
						title: 'Estado',
						children:
							'El visualizador de stock se está desarrollando. Próximamente se mostrará la disponibilidad de cada producto.',
					},
				]}
			/>
		</div>
	);
}
