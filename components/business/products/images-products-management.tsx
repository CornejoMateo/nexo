'use client';

import { InfoBanner } from '@/components/ui/infoBanner';

export function ImagesProductsManagement() {
	return (
		<div className="w-full p-6">
			<div className="mb-6">
				<h1 className="text-xl font-semibold text-neutral-900">Galería de imágenes</h1>
			</div>

			<InfoBanner
				collapsible
				title="Galería de imágenes"
				sections={[
					{
						title: '¿Qué es?',
						children:
							'Desde esta sección se administran las imágenes de los productos: subirlas, visualizarlas y eliminarlas.',
					},
					{
						title: 'Estado',
						children:
							'La galería se está desarrollando. Próximamente se podrá cargar y gestionar imágenes por producto.',
					},
				]}
			/>
		</div>
	);
}
