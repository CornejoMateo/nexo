'use client';

import { useEffect, useState } from 'react';
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

export function BrandsManagement() {
	const [brands, setBrands] = useState<Brand[]>([]);
	const [loading, setLoading] = useState(true);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);
	const [listError, setListError] = useState<string | null>(null);

	async function fetchBrands() {
		setLoading(true);
		const { data, error } = await listBrands();
		if (error) {
			setListError('No se pudo cargar el listado de marcas.');
		} else {
			setListError(null);
			setBrands(data ?? []);
		}
		setLoading(false);
	}

	useEffect(() => {
		fetchBrands();
	}, []);

	function openCreateForm() {
		setEditingBrand(null);
		setName('');
		setFormError(null);
		setIsFormOpen(true);
	}

	function openEditForm(brand: Brand) {
		setEditingBrand(brand);
		setName(brand.name ?? '');
		setFormError(null);
		setIsFormOpen(true);
	}

	function closeForm() {
		if (saving) return;
		setIsFormOpen(false);
		setEditingBrand(null);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setFormError('El nombre es obligatorio.');
			return;
		}

		setSaving(true);
		setFormError(null);

		if (editingBrand) {
			const { data, error } = await updateBrand(editingBrand.id, { name: trimmedName });
			setSaving(false);

			if (error) {
				setFormError(translateError(error) || 'No se pudo actualizar la marca. Intentá de nuevo.');
				return;
			}

			if (data) {
				setBrands((prev) =>
					prev
						.map((b) => (b.id === data.id ? data : b))
						.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
				);
			}
		} else {
			const { data, error } = await createBrand({ name: trimmedName });
			setSaving(false);

			if (error) {
				setFormError(translateError(error) || 'No se pudo crear la marca. Intentá de nuevo.');
				return;
			}

			if (data) {
				setBrands((prev) =>
					[...prev, data].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
				);
			}
		}

		setIsFormOpen(false);
		setEditingBrand(null);
	}

	function handleDelete(brand: Brand) {
		setPendingDelete(brand);
	}

	async function confirmDelete() {
		if (!pendingDelete) return;

		const brand = pendingDelete;
		setPendingDelete(null);
		setDeletingId(brand.id);
		setListError(null);
		const { error } = await deleteBrand(brand.id);
		setDeletingId(null);

		if (error) {
			setListError(translateError(error) || 'No se pudo eliminar la marca. Intentá de nuevo.');
			return;
		}

		setBrands((prev) => prev.filter((b) => b.id !== brand.id));
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-neutral-900">Marcas</h1>
				<button
					onClick={openCreateForm}
					className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
				>
					Nueva marca
				</button>
			</div>

			{listError && <p className="mb-4 text-sm text-red-600">{listError}</p>}

			{loading ? (
				<p className="text-sm text-neutral-500">Cargando marcas…</p>
			) : brands.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay marcas cargadas.</p>
			) : (
				<div className="overflow-hidden rounded-md border border-neutral-200">
					<table className="w-full text-left text-sm">
						<thead className="bg-neutral-50 text-neutral-500">
							<tr className="divide-x divide-neutral-200">
								<th className="px-4 py-3 font-medium">Nombre</th>
								<th className="w-40 px-4 py-3 font-medium text-center">Acciones</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-200">
							{brands.map((brand) => (
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
			)}

			{isFormOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
					onClick={closeForm}
				>
					<div
						className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg"
						onClick={(e) => e.stopPropagation()}
					>
						<h2 className="mb-4 text-base font-semibold text-neutral-900">
							{editingBrand ? 'Editar marca' : 'Nueva marca'}
						</h2>
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
							<div className="mt-4 flex justify-end gap-2">
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
									className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
								>
									{saving ? 'Guardando…' : 'Guardar'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
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
