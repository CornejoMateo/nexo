import { fireEvent, render, screen } from '@testing-library/react';
import { ProductsManagement } from '@/components/business/products/products-management';

jest.mock('@/constants/products/products', () => ({
	sections: [
		{ id: 'stock', label: 'Stock' },
		{ id: 'products', label: 'Productos' },
		{ id: 'gallery', label: 'Galería' },
		{ id: 'categories', label: 'Categorías' },
		{ id: 'brands', label: 'Marcas' },
	],
}));

jest.mock('@/components/business/products/stock-management', () => ({
	StockManagement: () => <div>Default Stock</div>,
}));

jest.mock('@/components/business/products/products', () => ({
	Products: () => <div>Default Products</div>,
}));

jest.mock('@/components/business/products/images-products-management', () => ({
	ImagesProductsManagement: () => <div>Default Gallery</div>,
}));

jest.mock('@/components/business/products/categories-management', () => ({
	CategoriesManagement: () => <div>Default Categories</div>,
}));

jest.mock('@/components/business/products/brands-management', () => ({
	BrandsManagement: () => <div>Default Brands</div>,
}));

describe('ProductsManagement', () => {
	it('renders StockManagement by default', () => {
		render(<ProductsManagement />);

		expect(screen.getByText('Default Stock')).toBeVisible();
		expect(screen.getByRole('tab', { name: 'Stock' })).toHaveAttribute('aria-selected', 'true');
	});

	it('uses the defaultSection prop', () => {
		render(<ProductsManagement defaultSection="products" />);

		expect(screen.getByText('Default Products')).toBeVisible();
		expect(screen.getByRole('tab', { name: 'Productos' })).toHaveAttribute('aria-selected', 'true');
	});

	it('changes tabs when clicking another section', () => {
		render(<ProductsManagement />);

		fireEvent.click(screen.getByRole('tab', { name: 'Galería' }));

		expect(screen.getByText('Default Gallery')).toBeVisible();
		expect(screen.getByRole('tab', { name: 'Galería' })).toHaveAttribute('aria-selected', 'true');
	});

	it('renders all default management components', () => {
		render(<ProductsManagement />);

		fireEvent.click(screen.getByRole('tab', { name: 'Categorías' }));
		expect(screen.getByText('Default Categories')).toBeVisible();

		fireEvent.click(screen.getByRole('tab', { name: 'Marcas' }));
		expect(screen.getByText('Default Brands')).toBeVisible();
	});

	it('renders custom content instead of default components', () => {
		render(
			<ProductsManagement
				stock={<div>Custom Stock</div>}
				products={<div>Custom Products</div>}
				gallery={<div>Custom Gallery</div>}
				categories={<div>Custom Categories</div>}
				brands={<div>Custom Brands</div>}
			/>
		);

		expect(screen.getByText('Custom Stock')).toBeVisible();
		expect(screen.queryByText('Default Stock')).not.toBeInTheDocument();

		fireEvent.click(screen.getByRole('tab', { name: 'Productos' }));
		expect(screen.getByText('Custom Products')).toBeVisible();

		fireEvent.click(screen.getByRole('tab', { name: 'Galería' }));
		expect(screen.getByText('Custom Gallery')).toBeVisible();

		fireEvent.click(screen.getByRole('tab', { name: 'Categorías' }));
		expect(screen.getByText('Custom Categories')).toBeVisible();

		fireEvent.click(screen.getByRole('tab', { name: 'Marcas' }));
		expect(screen.getByText('Custom Brands')).toBeVisible();
	});
});
