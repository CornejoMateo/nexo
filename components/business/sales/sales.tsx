'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentMethodsManagement } from './payment-methods-management';
import { InfoBanner } from '@/components/ui/infoBanner';

export function Sales() {
	const [paymentMethodsOpen, setPaymentMethodsOpen] = useState(false);

	return (
		<div className="mx-auto w-full p-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900">Ventas</h1>
					<p className="mt-1 text-sm text-neutral-500">Administrá las ventas de la empresa.</p>
				</div>

				<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					<button
						type="button"
						onClick={() => setPaymentMethodsOpen(true)}
						className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
					>
						<CreditCard className="h-4 w-4" />
						Métodos de pago
					</button>
				</div>
			</div>

			<p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
				El módulo de ventas está en desarrollo.
			</p>

			<PaymentMethodsManagement open={paymentMethodsOpen} onOpenChange={setPaymentMethodsOpen} />

			<InfoBanner
				collapsible
				title="Productos"
				sections={[
					{
						title: 'Utilidad',
						children:
							'En esta sección podés gestionar las ventas. Crear, editar y eliminar ventas, así como ver el historial de ventas realizadas.',
					},
					{
						title: 'Métodos de pago',
						children:
							'Podés gestionar los métodos de pago disponibles para las ventas arriba a la derecha. Agregar, editar y eliminar métodos de pago, los cuales seran utilizados como detalle en las ventas.',
					},
				]}
			/>
		</div>
	);
}
