import { PdfColumn } from '@/utils/pdf-export';
import { Category } from '@/lib/products/categories/categories';

export const columns: PdfColumn<Category>[] = [
	{ header: 'ID', accessor: 'id' },
	{ header: 'Nombre', accessor: 'name' },
];
