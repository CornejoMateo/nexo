'use client';

import { useCallback, useState } from 'react';
import {
	createCategory,
	deleteCategory,
	listCategories,
	updateCategory,
	Category,
} from '@/lib/products/categories/categories';
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
import { columns } from '@/constants/products/categories';
import { toast } from '@/components/ui/use-toast';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import {
	TableHead,
	TableRow,
	Table,
	TableBody,
	TableHeader,
	TableCell,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZE = 10;

export function CategoriesManagement() {
	const fetchCategories = useCallback(async () => {
		const { data, error } = await listCategories();
		if (error) throw error;
		return data ?? [];
	}, []);

	const {
		data: categories,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Category>(
		'categories',
		async () => {
			return await fetchCategories();
		},
		'categories_cache'
	);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);

	const sortedCategories = [...categories].sort((a, b) =>
		(a.name ?? '').localeCompare(b.name ?? '')
	);
	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredCategories = normalizedSearch
		? sortedCategories.filter((category) =>
				(category.name ?? '').toLowerCase().includes(normalizedSearch)
			)
		: sortedCategories;

	const totalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const paginatedCategories = filteredCategories.slice(
		currentPage * PAGE_SIZE,
		currentPage * PAGE_SIZE + PAGE_SIZE
	);

	const openCreateForm = () => {
		setEditingCategory(null);
		setName('');
		setFormError(null);
		setIsFormOpen(true);
	};

	const openEditForm = (category: Category) => {
		setEditingCategory(category);
		setName(category.name ?? '');
		setFormError(null);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		if (saving) return;
		setIsFormOpen(false);
		setEditingCategory(null);
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
			if (editingCategory) {
				const { error } = await updateCategory(editingCategory.id, { name: trimmedName });
				if (error) throw error;
				toast({
					title: 'Categoría actualizada',
					description: 'La categoría se actualizó correctamente.',
				});
			} else {
				const { error } = await createCategory({ name: trimmedName });
				if (error) throw error;
				toast({
					title: 'Categoría creada',
					description: 'La categoría se creó correctamente.',
				});
			}

			setIsFormOpen(false);
			setEditingCategory(null);
		} catch (error: any) {
			toast({
				title: 'Error al guardar categoría',
				description: translateError(error) || 'No se pudo guardar la categoría. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (category: Category) => {
		setPendingDelete(category);
	};

	const confirmDelete = async () => {
		if (!pendingDelete) return;

		const category = pendingDelete;
		setPendingDelete(null);
		setDeletingId(category.id);

		try {
			const { error } = await deleteCategory(category.id);
			if (error) {
				toast({
					title: 'Error al eliminar categoría',
					description:
						translateError(error) || 'No se pudo eliminar la categoría. Intentá de nuevo.',
					variant: 'destructive',
				});
				return;
			}

			toast({
				title: 'Categoría eliminada',
				description: 'La categoría se eliminó correctamente.',
			});
		} catch {
			toast({
				title: 'Error al eliminar categoría',
				description: 'No se pudo eliminar la categoría. Intentá de nuevo.',
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
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900">Categorías</h1>
					<p className="mt-1 text-sm text-neutral-500">
						Administrá el listado de categorías de productos.{' '}
						{!loading && (
							<span className="font-medium text-neutral-700">
								({categories.length} {categories.length === 1 ? 'categoría' : 'categorías'})
							</span>
						)}
					</p>
				</div>
				{!loading && (
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						<DownloadExportButton
							data={categories}
							columns={columns}
							fileName="Categorías"
							format="pdf"
							title="Listado de categorías"
							subtitle={`Total de categorías: ${categories.length}`}
							orientation="portrait"
							label="Descargar PDF"
							className="w-full bg-red-800 hover:bg-red-700 sm:w-auto"
						/>

						<DownloadExportButton
							data={categories}
							columns={columns}
							fileName="Categorías"
							format="csv"
							title="Listado de categorías"
							subtitle={`Total de categorías: ${categories.length}`}
							className="w-full bg-green-700 hover:bg-green-600 sm:w-auto"
						/>

						<button
							onClick={openCreateForm}
							className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:w-auto"
						>
							Nueva Categoría
						</button>
					</div>
				)}
			</div>

			{error && (
				<p role="alert" aria-live="polite" className="mb-4 text-sm text-red-600">
					No se pudo cargar el listado de categorías.
				</p>
			)}
			{loading ? (
				<div className="flex items-center justify-center py-4">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
				</div>
			) : categories.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay categorías cargadas.</p>
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
								{paginatedCategories.map((category) => (
									<TableRow key={category.id}>
										<TableCell className="text-center font-medium">{category.name}</TableCell>

										<TableCell>
											<div className="flex items-center justify-center gap-2">
												<button
													onClick={() => openEditForm(category)}
													disabled={deletingId === category.id}
													className="rounded-md bg-neutral-400 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
												>
													Editar
												</button>
												<button
													onClick={() => handleDelete(category)}
													className="rounded-md bg-red-600 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
													disabled={deletingId === category.id}
												>
													{deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
												</button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				</>
			)}

			{filteredCategories.length > 0 && (
				<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
					<p className="text-sm text-neutral-500">
						Mostrando {currentPage * PAGE_SIZE + 1}–
						{Math.min((currentPage + 1) * PAGE_SIZE, filteredCategories.length)} de{' '}
						{filteredCategories.length}
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
									className={currentPage >= totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}

			<Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle>{editingCategory ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit}>
						<label htmlFor="category-name" className="mb-1 block text-sm text-neutral-700">
							Nombre
						</label>
						<input
							id="category-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							aria-invalid={formError ? true : undefined}
							aria-describedby={formError ? 'supplier-form-error' : undefined}
							autoFocus
							className="mb-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
							placeholder="Ej: Relojes"
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
					title="Categorías"
					sections={[
						{
							title: 'Utilidad',
							children:
								'En esta sección podés crear, editar y eliminar categorías de productos. Las categorías se usan para organizar los productos en la tienda.',
						},
						{
							title: 'Cómo usarlo',
							children:
								'Usá "Nueva categoría" para crear una, y "Editar" para cambiar su nombre. Los nombres se muestran ordenados alfabéticamente.',
						},
						{
							title: 'Descargas',
							children:
								'Podés exportar el listado de categorías en PDF o CSV usando los botones de descarga que aparecen debajo de la tabla.',
						},
						{
							title: 'Eliminar',
							children:
								'La eliminación es permanente y no se puede deshacer. Verificá que la categoría no esté en uso antes de eliminarla.',
						},
					]}
				/>
			</div>
			<AlertDialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Seguro que querés eliminar la categoría &quot;{pendingDelete?.name}&quot;? Esta
							acción no se puede deshacer.
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
