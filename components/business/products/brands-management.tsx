'use client';

import { useState } from 'react';
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

export function BrandsManagement() {
	const {
		data: brands,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Brand>(
		'brands',
		async () => {
			const { data, error } = await listBrands();
			if (error) throw error;
			return data ?? [];
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
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-neutral-900">Marcas</h1>
				<button
					onClick={openCreateForm}
					className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
				>
					Nueva marca
				</button>
			</div>

			{error && (
				<p role="alert" aria-live="polite" className="mb-4 text-sm text-red-600">
					No se pudo cargar el listado de marcas.
				</p>
			)}
			{!loading &&
				(brands.length === 0 ? (
					<p className="text-sm text-neutral-500">Todavía no hay marcas cargadas.</p>
				) : (
					<div className="overflow-hidden rounded-md border border-neutral-200 overflow-y-auto max-h-[400px]">
						<table className="w-full text-left text-sm">
							<thead className="bg-neutral-50 text-neutral-500">
								<tr className="divide-x divide-neutral-200">
									<th className="px-4 py-3 font-medium">Nombre</th>
									<th className="w-40 px-4 py-3 font-medium text-center">Acciones</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-neutral-200">
								{[...brands]
									.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
									.map((brand) => (
										<tr key={brand.id} className="divide-x divide-neutral-200">
											<td className="px-4 py-3 text-neutral-800">{brand.name}</td>
											<td className="px-4 py-3 items-center justify-center text-center">
												<div className="flex gap-3 justify-center">
													<button
														onClick={() => openEditForm(brand)}
														disabled={deletingId === brand.id}
														className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
													>
														Editar
													</button>
													<button
														onClick={() => handleDelete(brand)}
														disabled={deletingId === brand.id}
														className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
													>
														{deletingId === brand.id ? 'Eliminando…' : 'Eliminar'}
													</button>
												</div>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				))}

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
				{loading ? (
					<div className="flex items-center justify-center py-4">
						<div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
					</div>
				) : (
					<div className="mt-4 flex justify-end gap-2">
						<DownloadExportButton
							data={brands}
							columns={columns}
							fileName="Marcas"
							format="pdf"
							title="Listado de marcas"
							subtitle={`Total de marcas: ${brands.length}`}
							orientation="portrait"
							className="bg-red-400 hover:bg-red-700"
							label="Descargar PDF"
						/>
						<DownloadExportButton
							data={brands}
							columns={columns}
							fileName="Marcas"
							format="csv"
							title="Listado de marcas"
							subtitle={`Total de marcas: ${brands.length}`}
							className="bg-green-600 hover:bg-green-700"
						/>
					</div>
				)}
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
