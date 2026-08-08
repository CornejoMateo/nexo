'use client';

import { useState } from 'react';
import { FileDown, FileSpreadsheet, FileText, PackagePlus } from 'lucide-react';
import {
	createProduct,
	deleteProduct,
	listAllProducts,
	updateProduct,
	type Product,
	type ProductInput,
} from '@/lib/products/products/products';
import { listBrands, type Brand } from '@/lib/products/brands/brands';
import { listCategories, type Category } from '@/lib/products/categories/categories';
import {
	createProductBarcode,
	deleteProductBarcodes,
} from '@/lib/products/barcodes/products-barcodes';
import { listSuppliers, type Supplier } from '@/lib/suppliers/suppliers';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { translateError } from '@/lib/error-translator';
import { InfoBanner } from '@/components/ui/infoBanner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportTableToPdf } from '@/utils/pdf-export';
import { exportTableToCsv } from '@/utils/csv-export';
import { columns } from '@/constants/products/products';
import type { CurrencyFilter, StockFilter } from '@/constants/products/products';
import { ProductsForm, emptyForm, type PriceCurrency, type ProductForm } from './products-form';
import { ProductsTable } from './products-table';
import { ProductDetailDialog } from '@/components/business/products/product-details/product-detail-dialog';
import { RestockDialog } from '@/components/business/products/stock/restock-dialog';
import { toast } from '@/components/ui/use-toast';
import {
	formatCurrencyWithoutSymbol,
	formatInteger,
	parseArsToNumber,
} from '@/utils/formats-money';

const PAGE_SIZE = 30;

export function Products() {
	const {
		data: products,
		loading,
		error,
	} = useOptimizedRealtime<Product>(
		'products',
		async () => {
			const { data, error } = await listAllProducts();
			if (error) throw error;
			return data ?? [];
		},
		'products_cache'
	);

	const [page, setPage] = useState(0);
	const [searchTerm, setSearchTerm] = useState('');
	const [stockFilter, setStockFilter] = useState<StockFilter>('all');
	const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>('all');

	const { data: brands } = useOptimizedRealtime<Brand>(
		'brands',
		async () => {
			const { data, error } = await listBrands();
			if (error) throw error;
			return data ?? [];
		},
		'brands_cache'
	);

	const { data: categories } = useOptimizedRealtime<Category>(
		'categories',
		async () => {
			const { data, error } = await listCategories();
			if (error) throw error;
			return data ?? [];
		},
		'categories_cache'
	);

	const { data: suppliers } = useOptimizedRealtime<Supplier>(
		'suppliers',
		async () => {
			const { data, error } = await listSuppliers();
			if (error) throw error;
			return data ?? [];
		},
		'suppliers_cache'
	);

	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredBySearch = normalizedSearch
		? products.filter((product) =>
				[product.name, product.brands?.name ?? '', product.categories?.name ?? ''].some((value) =>
					value.toLowerCase().includes(normalizedSearch)
				)
			)
		: products;
	const hasCurrency = (product: Product, currency: 'ars' | 'usd') =>
		currency === 'ars'
			? (product.retail_price_ars ?? 0) > 0 || (product.wholesale_price_ars ?? 0) > 0
			: (product.retail_price_usd ?? 0) > 0 || (product.wholesale_price_usd ?? 0) > 0;

	const filteredByStock =
		stockFilter === 'all'
			? filteredBySearch
			: filteredBySearch.filter((product) => {
					switch (stockFilter) {
						case 'no_stock':
							return (product.stock_current ?? 0) <= 0;
						case 'with_stock':
							return (product.stock_current ?? 0) > 0;
						case 'low_stock':
							return (product.stock_current ?? 0) <= (product.stock_min ?? 0);
						default:
							return true;
					}
				});

	const filteredProducts =
		currencyFilter === 'all'
			? filteredByStock
			: filteredByStock.filter((product) => {
					const hasArs = hasCurrency(product, 'ars');
					const hasUsd = hasCurrency(product, 'usd');
					switch (currencyFilter) {
						case 'both':
							return hasArs && hasUsd;
						case 'ars':
							return hasArs && !hasUsd;
						case 'usd':
							return hasUsd && !hasArs;
						default:
							return true;
					}
				});

	const totalCount = filteredProducts.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const paginatedProducts = filteredProducts.slice(
		currentPage * PAGE_SIZE,
		currentPage * PAGE_SIZE + PAGE_SIZE
	);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [form, setForm] = useState<ProductForm>(emptyForm);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

	const [detailProduct, setDetailProduct] = useState<Product | null>(null);
	const [isDetailOpen, setIsDetailOpen] = useState(false);

	const [isRestockOpen, setIsRestockOpen] = useState(false);

	const openDetail = (product: Product) => {
		setDetailProduct(product);
		setIsDetailOpen(true);
	};

	const openCreateForm = () => {
		setEditingProduct(null);
		setForm(emptyForm);
		setFormError(null);
		setIsFormOpen(true);
	};

	const openEditForm = (product: Product) => {
		const hasUsdPrice = product.retail_price_usd != null || product.wholesale_price_usd != null;
		const hasArsPrice = product.retail_price_ars != null || product.wholesale_price_ars != null;
		const price_currency: PriceCurrency =
			hasUsdPrice && hasArsPrice ? 'both' : hasUsdPrice ? 'usd' : hasArsPrice ? 'ars' : 'both';

		setEditingProduct(product);
		setForm({
			name: product.name ?? '',
			price_currency,
			retail_price_usd:
				product.retail_price_usd != null
					? formatCurrencyWithoutSymbol(product.retail_price_usd)
					: '',
			retail_price_ars:
				product.retail_price_ars != null
					? formatCurrencyWithoutSymbol(product.retail_price_ars)
					: '',
			wholesale_price_usd:
				product.wholesale_price_usd != null
					? formatCurrencyWithoutSymbol(product.wholesale_price_usd)
					: '',
			wholesale_price_ars:
				product.wholesale_price_ars != null
					? formatCurrencyWithoutSymbol(product.wholesale_price_ars)
					: '',
			brand_id: product.brand_id != null ? String(product.brand_id) : '',
			category_id: product.category_id != null ? String(product.category_id) : '',
			is_available_for_sale: product.is_available_for_sale,
			stock_min: product.stock_min != null ? formatInteger(product.stock_min) : '',
			stock_current: product.stock_current != null ? formatInteger(product.stock_current) : '',
			supplier_id: '',
			barcode: '',
			cost_price_usd: '',
			cost_price_ars: '',
			usd_rate: '',
			wholesale_margin: '',
			retail_margin: '',
		});
		setFormError(null);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		if (saving) return;
		setIsFormOpen(false);
		setEditingProduct(null);
	};

	const setField = (field: keyof ProductForm, value: string | boolean) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const buildPayload = (): ProductInput => {
		return {
			name: form.name.trim(),
			retail_price_usd: parseArsToNumber(form.retail_price_usd),
			retail_price_ars: parseArsToNumber(form.retail_price_ars),
			wholesale_price_usd: parseArsToNumber(form.wholesale_price_usd),
			wholesale_price_ars: parseArsToNumber(form.wholesale_price_ars),
			brand_id: form.brand_id ? Number(form.brand_id) : null,
			category_id: form.category_id ? Number(form.category_id) : null,
			is_available_for_sale: form.is_available_for_sale,
			stock_min: form.stock_min ? parseArsToNumber(form.stock_min) : null,
			stock_current: form.stock_current ? parseArsToNumber(form.stock_current) : null,
		};
	};

	const buildBarcodePayload = () => {
		if (!form.supplier_id) return null;
		return {
			barcode: form.barcode.trim(),
			supplier_id: Number(form.supplier_id),
			cost_price_ars: parseArsToNumber(form.cost_price_ars),
			cost_price_usd: parseArsToNumber(form.cost_price_usd),
		};
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) {
			setFormError('El nombre es obligatorio.');
			return;
		}
		if (form.supplier_id && !form.barcode.trim()) {
			setFormError('El código de barra es obligatorio cuando se selecciona un proveedor.');
			return;
		}

		const payload = buildPayload();
		const barcodePayload = buildBarcodePayload();
		setSaving(true);
		setFormError(null);

		try {
			if (editingProduct) {
				const { error } = await updateProduct(editingProduct.id, payload);
				if (error) throw error;

				if (barcodePayload) {
					const { error: deleteError } = await deleteProductBarcodes(editingProduct.id);
					if (deleteError) throw deleteError;
					const { error: barcodeError } = await createProductBarcode({
						product_id: editingProduct.id,
						...barcodePayload,
					});
					if (barcodeError) throw barcodeError;
				}

				toast({
					title: 'Producto actualizado',
					description: 'El producto se actualizó correctamente.',
				});
			} else {
				const { data, error } = await createProduct(payload);
				if (error) throw error;

				if (barcodePayload && data?.id) {
					const { error: barcodeError } = await createProductBarcode({
						product_id: data.id,
						...barcodePayload,
					});
					if (barcodeError) throw barcodeError;
				}

				toast({
					title: 'Producto creado',
					description: 'El producto se creó correctamente.',
				});
			}
			setIsFormOpen(false);
			setEditingProduct(null);
		} catch (error: any) {
			toast({
				title: 'Error al guardar producto',
				description: translateError(error) || 'No se pudo guardar el producto. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (product: Product) => {
		setPendingDelete(product);
	};

	const confirmDelete = async () => {
		if (!pendingDelete) return;

		const product = pendingDelete;
		setPendingDelete(null);
		setDeletingId(product.id);

		try {
			const { error } = await deleteProduct(product.id);
			if (error) throw error;
		} catch (error: any) {
			toast({
				title: 'Error al eliminar producto',
				description: translateError(error) || 'No se pudo eliminar el producto. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setDeletingId(null);
		}
	};

	const handleExportPdf = async () => {
		try {
			exportTableToPdf<Product>({
				fileName: 'Productos',
				columns,
				data: products,
				title: 'Listado de productos',
				orientation: 'landscape',
			});
		} catch (error: any) {
			toast({
				title: 'Error al exportar',
				description: translateError(error) || 'No se pudo exportar el listado de productos.',
				variant: 'destructive',
			});
		}
	};

	const handleExportCsv = async () => {
		try {
			exportTableToCsv<Product>({
				fileName: 'Productos',
				columns,
				data: products,
			});
		} catch (error: any) {
			toast({
				title: 'Error al exportar',
				description: translateError(error) || 'No se pudo exportar el listado de productos.',
				variant: 'destructive',
			});
		}
	};

	return (
		<div className="mx-auto w-full p-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900">Productos</h1>
					<p className="mt-1 text-sm text-neutral-500">
						Administrá el listado de productos de la empresa.
						{!loading && (
							<span className="font-medium text-neutral-700">
								{' '}
								({products.length} {products.length === 1 ? 'producto' : 'productos'})
							</span>
						)}
					</p>
				</div>

				{!loading && (
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="inline-flex justify-center items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 active:scale-[0.98]"
								>
									<FileDown className="h-4 w-4" />
									<span>Exportar</span>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleExportPdf}>
									<FileText className="h-4 w-4" />
									<span>PDF</span>
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleExportCsv}>
									<FileSpreadsheet className="h-4 w-4" />
									<span>CSV</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<button
							onClick={openCreateForm}
							className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:w-auto"
						>
							Nuevo producto
						</button>

						<button
							onClick={() => setIsRestockOpen(true)}
							className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:w-auto"
						>
							<PackagePlus className="h-4 w-4" />
							<span>Abastecimiento</span>
						</button>
					</div>
				)}
			</div>

			{error && (
				<p role="alert" aria-live="polite" className="mb-4 text-sm text-red-600">
					{error}
				</p>
			)}
			{loading ? (
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
				</div>
			) : products.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay productos cargados.</p>
			) : (
				<ProductsTable
					products={paginatedProducts}
					totalCount={totalCount}
					page={currentPage}
					pageSize={PAGE_SIZE}
					searchTerm={searchTerm}
					stockFilter={stockFilter}
					currencyFilter={currencyFilter}
					onSearchChange={setSearchTerm}
					onStockFilterChange={setStockFilter}
					onCurrencyFilterChange={setCurrencyFilter}
					onPageChange={setPage}
					onEdit={openEditForm}
					onDelete={handleDelete}
					onView={openDetail}
					deletingId={deletingId}
				/>
			)}

			<RestockDialog open={isRestockOpen} onOpenChange={setIsRestockOpen} products={products} />

			<Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
				<DialogContent className="w-full overflow-y-auto max-h-[95dvh] rounded-lg p-6">
					<DialogHeader>
						<DialogTitle>{editingProduct ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
					</DialogHeader>
					<ProductsForm
						form={form}
						onChange={setField}
						saving={saving}
						formError={formError}
						onSubmit={handleSubmit}
						onCancel={closeForm}
						brands={brands}
						categories={categories}
						suppliers={suppliers}
					/>
				</DialogContent>
			</Dialog>

			<ProductDetailDialog
				product={detailProduct}
				open={isDetailOpen}
				onOpenChange={setIsDetailOpen}
				suppliers={suppliers}
			/>

			<div className="mt-6">
				<InfoBanner
					collapsible
					title="Productos"
					sections={[
						{
							title: 'Utilidad',
							children:
								'En esta sección podés crear, editar y eliminar productos. Cada producto puede tener precios de venta por menor y por mayor, en dólares y en pesos',
						},
						{
							title: 'Stock minimo',
							children:
								'Las filas que estan en rojo representan productos cuyo stock es menor o igual al stock minimo',
						},
						{
							title: 'Cómo usarlo',
							children:
								'Usá "Nuevo producto" para crear uno y "Editar" para modificar sus datos. El nombre es obligatorio; el resto de los campos es opcional. La marca y la categoría se eligen desde listas desplegables.',
						},
						{
							title: 'Búsqueda y paginación',
							children:
								'El listado se actualiza en tiempo real y se muestra de a 30 productos por página. Usá la barra de búsqueda para filtrar por nombre, marca o categoría y la paginación para recorrer los resultados.',
						},
						{
							title: 'Descargas',
							children:
								'Podés exportar el listado completo de productos en PDF o Excel usando los botones de descarga.',
						},
						{
							title: 'Eliminar',
							children:
								'La eliminación es permanente y no se puede deshacer. Verificá que el producto no esté en uso antes de eliminarlo.',
						},
					]}
				/>
			</div>

			<AlertDialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Seguro que querés eliminar el producto &quot;{pendingDelete?.name}&quot;? Esta acción
							no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={deletingId !== null}
							className="bg-red-600 hover:bg-red-700"
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
