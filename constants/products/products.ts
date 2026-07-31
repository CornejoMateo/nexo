export type ProductSection = 'stock' | 'products' | 'gallery' | 'categories' | 'brands';

export const sections: Array<{ id: ProductSection; label: string }> = [
	{ id: 'stock', label: 'Stock' },
	{ id: 'products', label: 'Productos' },
	{ id: 'gallery', label: 'Galería' },
	{ id: 'categories', label: 'Categorías' },
	{ id: 'brands', label: 'Marcas' },
];
