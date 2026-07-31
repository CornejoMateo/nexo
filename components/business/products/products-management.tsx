'use client';

import { useId, useState, type ReactNode } from 'react';
import { sections, ProductSection } from '@/constants/products/products';
import { BrandsManagement } from '@/components/business/products/brands-management';
import { CategoriesManagement } from '@/components/business/products/categories-management';

type ProductsManagementProps = {
	stock?: ReactNode;
	products?: ReactNode;
	gallery?: ReactNode;
	categories?: ReactNode;
	brands?: ReactNode;
	defaultSection?: ProductSection;
};

export function ProductsManagement({
	defaultSection = 'stock',
	stock,
	products,
	gallery,
	categories,
	brands,
}: ProductsManagementProps) {
	const [activeSection, setActiveSection] = useState<ProductSection>(defaultSection);
	const tabListId = useId();

	const panelContent: Record<ProductSection, ReactNode> = {
		stock,
		products,
		gallery,
		categories: categories ?? <CategoriesManagement />,
		brands: brands ?? <BrandsManagement />,
	};

	return (
		<section className="w-full">
			<div
				aria-label="Administración de productos"
				className="flex gap-1 overflow-x-auto border-b border-slate-200"
				id={tabListId}
				role="tablist"
			>
				{sections.map((section) => {
					const isActive = section.id === activeSection;

					return (
						<button
							aria-controls={`${tabListId}-${section.id}-panel`}
							aria-selected={isActive}
							className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 ${
								isActive
									? 'border-slate-900 text-slate-900'
									: 'border-transparent text-slate-500 hover:text-slate-900'
							}`}
							id={`${tabListId}-${section.id}-tab`}
							key={section.id}
							onClick={() => setActiveSection(section.id)}
							role="tab"
							type="button"
						>
							{section.label}
						</button>
					);
				})}
			</div>

			{sections.map((section) => (
				<div
					aria-labelledby={`${tabListId}-${section.id}-tab`}
					hidden={section.id !== activeSection}
					id={`${tabListId}-${section.id}-panel`}
					key={section.id}
					role="tabpanel"
					tabIndex={0}
				>
					{panelContent[section.id]}
				</div>
			))}
		</section>
	);
}
