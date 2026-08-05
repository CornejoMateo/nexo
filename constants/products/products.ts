import { PdfColumn } from '@/utils/pdf-export';
import { Product } from '@/lib/products/products/products';

export type ProductSection = 'stock' | 'products' | 'gallery' | 'categories' | 'brands';

export const sections: Array<{ id: ProductSection; label: string }> = [
	{ id: 'stock', label: 'Stock' },
	{ id: 'products', label: 'Productos' },
	{ id: 'gallery', label: 'Galería' },
	{ id: 'categories', label: 'Categorías' },
	{ id: 'brands', label: 'Marcas' },
];

export const columns: PdfColumn<Product>[] = [
	{ header: 'ID', accessor: 'id' },
	{ header: 'Nombre', accessor: 'name' },
	{ header: 'Precio minorista USD', accessor: 'retail_price_usd' },
	{ header: 'Precio minorista ARS', accessor: 'retail_price_ars' },
	{ header: 'Precio mayorista USD', accessor: 'wholesale_price_usd' },
	{ header: 'Precio mayorista ARS', accessor: 'wholesale_price_ars' },
	{ header: 'Marca', accessor: (row) => row.brands?.name ?? '—' },
	{ header: 'Categoría', accessor: (row) => row.categories?.name ?? '—' },
	{ header: 'Disponible', accessor: (row) => (row.is_available_for_sale ? 'Sí' : 'No') },
	{ header: 'Stock mínimo', accessor: 'stock_min' },
	{ header: 'Stock actual', accessor: 'stock_current' },
];
