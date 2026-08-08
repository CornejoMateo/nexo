'use client';

import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import type { ProductBarcodeWithSupplier } from '@/lib/products/barcodes/products-barcodes';
import type { Product } from '@/lib/products/products/products';
import type { Supplier } from '@/lib/suppliers/suppliers';
import { printBarcode } from '@/utils/print-barcode';
import { useProductBarcodes } from '@/hooks/barcodes/use-product-barcodes';
import { ProductOverview } from './product-overview';
import { AssociatedSuppliersList } from '@/components/business/products/associated-suppliers-list';
import { BarcodesList } from './barcodes-list';
import { AddBarcodeForm } from './add-barcode-form';

interface ProductDetailDialogProps {
	product: Product | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	suppliers: Supplier[];
}

export function ProductDetailDialog({
	product,
	open,
	onOpenChange,
	suppliers = [],
}: ProductDetailDialogProps) {
	const { barcodes, loadingBarcodes, saving, deletingId, loadBarcodes, addBarcode, deleteBarcode } =
		useProductBarcodes(product);
	const [formResetKey, setFormResetKey] = useState(0);

	useEffect(() => {
		if (open && product) {
			setFormResetKey((key) => key + 1);
			loadBarcodes();
		}
	}, [open, product, loadBarcodes]);

	const handlePrint = (code: ProductBarcodeWithSupplier) => {
		printBarcode(code.barcode, product?.name ?? 'Código de barra');
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-full max-h-[95dvh] overflow-y-auto rounded-lg p-6 sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Package className="h-5 w-5" />
						{product?.name ?? 'Producto'}
					</DialogTitle>
					<DialogDescription>
						Detalle del producto, proveedores y códigos de barra
					</DialogDescription>
				</DialogHeader>

				{product && (
					<div className="space-y-6">
						<ProductOverview product={product} />
						<AssociatedSuppliersList barcodes={barcodes} suppliers={suppliers} />
						<BarcodesList
							barcodes={barcodes}
							loading={loadingBarcodes}
							deletingId={deletingId}
							product={product}
							onPrint={handlePrint}
							onDelete={deleteBarcode}
						/>
						<AddBarcodeForm
							key={formResetKey}
							suppliers={suppliers}
							saving={saving}
							onSubmit={addBarcode}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
