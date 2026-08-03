'use client';

import { InfoBanner } from '@/components/ui/infoBanner';

export function Products() {
	return (
		<div className="w-full p-6">
			<div className="mb-6">
				<h1 className="text-xl font-semibold text-neutral-900">Productos</h1>
			</div>

			<InfoBanner
				collapsible
				title="Productos"
				sections={[
					{
						title: '¿Qué es?',
						children:
							'Desde esta sección se administran los productos del sistema: crearlos, editarlos y eliminarlos.',
					},
					{
						title: 'Estado',
						children:
							'El listado y las acciones de administración se están desarrollando. Próximamente se mostrará la tabla de productos.',
					},
				]}
			/>
		</div>
	);
}
