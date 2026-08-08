import { PdfColumn } from '@/utils/pdf-export';
import { Product } from '@/lib/products/products/products';

export type ProductSection = 'products' | 'gallery' | 'categories' | 'brands';

export const sections: Array<{ id: ProductSection; label: string }> = [
	{ id: 'products', label: 'Productos' },
	{ id: 'gallery', label: 'Galería' },
	{ id: 'categories', label: 'Categorías' },
	{ id: 'brands', label: 'Marcas' },
];

export type ProductColumnId =
	| 'name'
	| 'retail_usd'
	| 'retail_ars'
	| 'wholesale_usd'
	| 'wholesale_ars'
	| 'brand'
	| 'category'
	| 'available'
	| 'stock_min'
	| 'stock_current';

export const productTableColumns: Array<{ id: ProductColumnId; label: string }> = [
	{ id: 'name', label: 'Nombre' },
	{ id: 'retail_usd', label: 'Minorista USD' },
	{ id: 'retail_ars', label: 'Minorista ARS' },
	{ id: 'wholesale_usd', label: 'Mayorista USD' },
	{ id: 'wholesale_ars', label: 'Mayorista ARS' },
	{ id: 'brand', label: 'Marca' },
	{ id: 'category', label: 'Categoría' },
	{ id: 'available', label: 'Disponible' },
	{ id: 'stock_min', label: 'Stock mín.' },
	{ id: 'stock_current', label: 'Stock actual' },
];

export type StockFilter = 'all' | 'no_stock' | 'with_stock' | 'low_stock';

export const stockFilterOptions: Array<{ value: StockFilter; label: string }> = [
	{ value: 'all', label: 'Todos' },
	{ value: 'no_stock', label: 'Sin stock' },
	{ value: 'with_stock', label: 'Con stock' },
	{ value: 'low_stock', label: 'Stock mínimo' },
];

export type CurrencyFilter = 'all' | 'both' | 'ars' | 'usd';

export const currencyFilterOptions: Array<{ value: CurrencyFilter; label: string }> = [
	{ value: 'all', label: 'Todas' },
	{ value: 'both', label: 'Ambas' },
	{ value: 'ars', label: 'Solo ARS' },
	{ value: 'usd', label: 'Solo USD' },
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
