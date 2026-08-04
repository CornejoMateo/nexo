import { PdfColumn } from '@/utils/pdf-export';
import { Supplier } from '@/lib/suppliers/suppliers';

export const columns: PdfColumn<Supplier>[] = [
	{ header: 'Nombre', accessor: 'name' },
	{ header: 'CUIT', accessor: 'cuit' },
	{ header: 'Teléfono', accessor: 'phone' },
	{ header: 'Email', accessor: 'email' },
	{ header: 'Dirección', accessor: 'address' },
	{ header: 'Notas', accessor: 'notes' },
];
