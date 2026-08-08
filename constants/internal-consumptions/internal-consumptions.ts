import { PdfColumn } from '@/utils/pdf-export';
import { InternalConsumption } from '@/lib/internal-consumptions/internal-consumptions';

export type InternalConsumptionSortColumn =
	'created_at' | 'product' | 'quantity' | 'user' | 'description';

export const internalConsumptionColumns: PdfColumn<InternalConsumption>[] = [
	{ header: 'ID', accessor: 'id' },
	{ header: 'Fecha', accessor: (row) => formatConsumptionDate(row.created_at) },
	{ header: 'Producto', accessor: (row) => row.products?.name ?? '—' },
	{ header: 'Cantidad', accessor: (row) => (row.quantity != null ? String(row.quantity) : '—') },
	{
		header: 'Usuario',
		accessor: (row) => formatConsumptionUser(row.users),
	},
	{ header: 'Descripción', accessor: (row) => row.description ?? '—' },
];

export function formatConsumptionDate(value: string) {
	if (!value) return '—';
	try {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return '—';
		return date.toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return '—';
	}
}

export function formatConsumptionUser(users: InternalConsumption['users']): string {
	if (!users) return '—';
	const name = `${users.name ?? ''} ${users.last_name ?? ''}`.trim();
	return name || users.username || '—';
}
