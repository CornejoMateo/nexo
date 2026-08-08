'use client';

import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
import {
	Brand,
	createBrand,
	deleteBrand,
	listBrands,
	updateBrand,
} from '@/lib/products/brands/brands';
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
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { DownloadExportButton } from '@/components/ui/download-export-button';
import { columns } from '@/constants/products/brands';
import { toast } from '@/components/ui/use-toast';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;

export function BrandsManagement() {
	const fetchBrands = useCallback(async () => {
		const { data, error } = await listBrands();
		if (error) throw error;
		return data ?? [];
	}, []);

	const {
		data: brands,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Brand>(
		'brands',
		async () => {
			return await fetchBrands();
		},
		'brands_cache'
	);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);

	const sortedBrands = [...brands].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredBrands = normalizedSearch
		? sortedBrands.filter((brand) => (brand.name ?? '').toLowerCase().includes(normalizedSearch))
		: sortedBrands;

	const totalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const paginatedBrands = filteredBrands.slice(
		currentPage * PAGE_SIZE,
		currentPage * PAGE_SIZE + PAGE_SIZE
	);

	const openCreateForm = () => {
		setEditingBrand(null);
		setName('');
		setFormError(null);
		setIsFormOpen(true);
	};

	const openEditForm = (brand: Brand) => {
		setEditingBrand(brand);
		setName(brand.name ?? '');
		setFormError(null);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		if (saving) return;
		setIsFormOpen(false);
		setEditingBrand(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setFormError('El nombre es obligatorio.');
			return;
		}

		setSaving(true);
		setFormError(null);

		try {
			if (editingBrand) {
				const { error } = await updateBrand(editingBrand.id, { name: trimmedName });
				if (error) throw error;
				toast({
					title: 'Marca actualizada',
					description: 'La marca se actualizó correctamente.',
				});
			} else {
				const { error } = await createBrand({ name: trimmedName });
				if (error) throw error;
				toast({
					title: 'Marca creada',
					description: 'La marca se creó correctamente.',
				});
			}

			setIsFormOpen(false);
			setEditingBrand(null);
		} catch (error: any) {
			toast({
				title: 'Error al guardar marca',
				description: translateError(error) || 'No se pudo guardar la marca. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (brand: Brand) => {
		setPendingDelete(brand);
	};

	const confirmDelete = async () => {
		if (!pendingDelete) return;

		const brand = pendingDelete;
		setPendingDelete(null);
		setDeletingId(brand.id);

		try {
			const { error } = await deleteBrand(brand.id);
			if (error) throw error;

			toast({
				title: 'Marca eliminada',
				description: 'La marca se eliminó correctamente.',
			});
		} catch (error: any) {
			toast({
				title: 'Error al eliminar marca',
				description: translateError(error) || 'No se pudo eliminar la marca. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="mx-auto w-full p-6">
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900">Marcas</h1>
					<p className="mt-1 text-sm text-neutral-500">
						Administrá el listado de marcas de productos.
						{!loading && (
							<span className="font-medium text-neutral-700">
								{' '}
								({brands.length} {brands.length === 1 ? 'marca' : 'marcas'})
							</span>
						)}
					</p>
				</div>

				{!loading && (
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						<DownloadExportButton
							data={brands}
							columns={columns}
							fileName="Marcas"
							format="pdf"
							title="Listado de marcas"
							subtitle={`Total de marcas: ${brands.length}`}
							orientation="portrait"
							label="Descargar PDF"
							className="w-full bg-red-800 hover:bg-red-700 sm:w-auto"
						/>

						<DownloadExportButton
							data={brands}
							columns={columns}
							fileName="Marcas"
							format="csv"
							title="Listado de marcas"
							subtitle={`Total de marcas: ${brands.length}`}
							className="w-full bg-green-700 hover:bg-green-600 sm:w-auto"
						/>

						<button
							onClick={openCreateForm}
							className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:w-auto"
						>
							Nueva marca
						</button>
					</div>
				)}
			</div>

			{error && (
				<p role="alert" aria-live="polite" className="mb-4 text-sm text-red-600">
					No se pudo cargar el listado de marcas.
				</p>
			)}
			{loading ? (
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
				</div>
			) : brands.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay marcas cargadas.</p>
			) : (
				<>
					<div className="mb-4 relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
						<Input
							type="text"
							placeholder="Buscar por nombre..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							aria-label="Buscar marcas"
							className="w-full pl-10 sm:max-w-sm"
						/>
					</div>

					{filteredBrands.length === 0 ? (
						<p className="text-sm text-neutral-500">No se encontraron marcas para la búsqueda.</p>
					) : (
						<div className="overflow-x-auto rounded-lg border border-neutral-200">
							<Table>
								<TableHeader className="bg-slate-800">
									<TableRow className="border-b-0 hover:bg-slate-800 bg-neutral-500">
										<TableHead className="text-center font-semibold text-white">Nombre</TableHead>
										<TableHead className="w-40 text-center font-semibold text-white">
											Acciones
										</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paginatedBrands.map((brand) => (
										<TableRow key={brand.id}>
											<TableCell className="text-center font-medium">{brand.name}</TableCell>

											<TableCell>
												<div className="flex items-center justify-center gap-2">
													<button
														onClick={() => openEditForm(brand)}
														disabled={deletingId === brand.id}
														className="rounded-md bg-neutral-400 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
													>
														Editar
													</button>
													<button
														onClick={() => handleDelete(brand)}
														className="rounded-md bg-red-600 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
														disabled={deletingId === brand.id}
													>
														{deletingId === brand.id ? 'Eliminando...' : 'Eliminar'}
													</button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{filteredBrands.length > 0 && (
						<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
							<p className="text-sm text-neutral-500">
								Mostrando {currentPage * PAGE_SIZE + 1}–
								{Math.min((currentPage + 1) * PAGE_SIZE, filteredBrands.length)} de{' '}
								{filteredBrands.length}
							</p>
							<Pagination className="!mx-0 !w-auto !ml-auto !justify-end">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => {
												e.preventDefault();
												setPage(Math.max(0, currentPage - 1));
											}}
											className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
										/>
									</PaginationItem>
									{Array.from({ length: totalPages }, (_, index) => (
										<PaginationItem key={index}>
											<PaginationLink
												href="#"
												onClick={(e) => {
													e.preventDefault();
													setPage(index);
												}}
												isActive={index === currentPage}
											>
												{index + 1}
											</PaginationLink>
										</PaginationItem>
									))}
									<PaginationItem>
										<PaginationNext
											href="#"
											onClick={(e) => {
												e.preventDefault();
												setPage(Math.min(totalPages - 1, currentPage + 1));
											}}
											className={
												currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</>
			)}

			<Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>{editingBrand ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<label htmlFor="brand-name" className="mb-1 block text-sm text-neutral-700">
							Nombre
						</label>
						<input
							id="brand-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							aria-invalid={formError ? true : undefined}
							aria-describedby={formError ? 'supplier-form-error' : undefined}
							autoFocus
							className="mb-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
							placeholder="Ej: Apple"
						/>
						{formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}
						<DialogFooter className="mt-4 gap-2">
							<button
								type="button"
								onClick={closeForm}
								disabled={saving}
								className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={saving}
								className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
							>
								{saving ? 'Guardando…' : 'Guardar'}
							</button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
			<div className="mt-6">
				<InfoBanner
					collapsible
					title="Marcas"
					sections={[
						{
							title: 'Utilidad',
							children: 'En esta sección podés crear, editar y eliminar marcas de productos.',
						},
						{
							title: 'Cómo usarlo',
							children:
								'Usá "Nueva marca" para crear una, y "Editar" para cambiar su nombre. Los nombres se muestran ordenados alfabéticamente.',
						},
						{
							title: 'Descargas',
							children:
								'Podés exportar el listado de marcas en PDF o CSV usando los botones de descarga que aparecen debajo de la tabla.',
						},
						{
							title: 'Eliminar',
							children:
								'La eliminación es permanente y no se puede deshacer. Verificá que la marca no esté en uso antes de eliminarla.',
						},
					]}
				/>
			</div>

			<AlertDialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar marca?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Seguro que querés eliminar la marca &quot;{pendingDelete?.name}&quot;? Esta acción no
							se puede deshacer.
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
