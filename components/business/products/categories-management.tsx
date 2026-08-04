'use client';

import { useEffect, useState } from 'react';
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

export function CategoriesManagement() {
	const [categories, setCategories] = useState<Category[]>([]);
	const [loading, setLoading] = useState(true);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<Category | null>(null);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
	const [listError, setListError] = useState<string | null>(null);

	const fetchCategories = async () => {
		try {
			const { data, error } = await listCategories();
			if (error) {
				setListError('No se pudo cargar el listado de categorías.');
			} else {
				setListError(null);
				setCategories(data ?? []);
			}
		} catch {
			setListError('No se pudo cargar el listado de categorías.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

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
				const { data, error } = await updateCategory(editingCategory.id, { name: trimmedName });
				if (error) {
					setFormError(
						translateError(error) || 'No se pudo actualizar la categoría. Intentá de nuevo.'
					);
					return;
				}
				if (data) {
					setCategories((prev) =>
						prev
							.map((c) => (c.id === data.id ? data : c))
							.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
					);
				}
			} else {
				const { data, error } = await createCategory({ name: trimmedName });
				if (error) {
					setFormError(translateError(error) || 'No se pudo crear la categoría. Intentá de nuevo.');
					return;
				}
				if (data) {
					setCategories((prev) =>
						[...prev, data].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
					);
				}
			}
			setIsFormOpen(false);
			setEditingCategory(null);
		} catch {
			setFormError('No se pudo guardar la categoría. Intentá de nuevo.');
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
		setListError(null);

		try {
			const { error } = await deleteCategory(category.id);
			if (error) {
				setListError(
					translateError(error) || 'No se pudo eliminar la categoría. Intentá de nuevo.'
				);
				return;
			}

			setCategories((prev) => prev.filter((c) => c.id !== category.id));
		} catch {
			setListError('No se pudo eliminar la categoría. Intentá de nuevo.');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="mx-auto w-full p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-neutral-900">Categorías</h1>
				<button
					onClick={openCreateForm}
					className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
				>
					Nueva categoría
				</button>
			</div>

			{listError && (
				<p role="alert" aria-live="polite" className="mb-4 text-sm text-red-600">
					{listError}
				</p>
			)}
			{loading ? (
				<p className="text-sm text-neutral-500">Cargando categorías…</p>
			) : categories.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay categorías cargadas.</p>
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
							{categories.map((category) => (
								<tr key={category.id} className="divide-x divide-neutral-200">
									<td className="px-4 py-3 text-neutral-800">{category.name}</td>
									<td className="px-4 py-3 text-center justify-center items-center">
										<div className="flex gap-3 justify-center">
											<button
												onClick={() => openEditForm(category)}
												disabled={deletingId === category.id}
												className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
											>
												Editar
											</button>

											<button
												onClick={() => handleDelete(category)}
												disabled={deletingId === category.id}
												className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
											>
												{deletingId === category.id ? 'Eliminando…' : 'Eliminar'}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
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
				<div className="mt-4 flex justify-end gap-2">
					<DownloadExportButton
						data={categories}
						columns={columns}
						fileName="Categorias"
						format="pdf"
						title="Listado de categorías"
						subtitle={`Total de categorías: ${categories.length}`}
						orientation="portrait"
						className="bg-red-400 hover:bg-red-700"
						label="Descargar PDF"
					/>
					<DownloadExportButton
						data={categories}
						columns={columns}
						fileName="Categorias"
						format="csv"
						title="Listado de categorías"
						subtitle={`Total de categorías: ${categories.length}`}
						className="bg-green-600 hover:bg-green-700"
					/>
				</div>
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
