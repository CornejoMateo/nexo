import { PdfColumn } from '@/utils/pdf-export';
import { Brand } from '@/lib/products/brands/brands';

export const columns: PdfColumn<Brand>[] = [
	{ header: 'ID', accessor: 'id' },
	{ header: 'Nombre', accessor: 'name' },
];
