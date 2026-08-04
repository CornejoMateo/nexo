'use client';

import { useEffect, useState } from 'react';
import {
	createSupplier,
	deleteSupplier,
	listSuppliers,
	updateSupplier,
	type Supplier,
	type SupplierInput,
} from '@/lib/suppliers/suppliers';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DownloadExportButton } from '@/components/ui/download-export-button';
import { WhatsAppLink } from '@/components/ui/whatsapp-link';
import { columns } from '@/constants/suppliers/suppliers';
import { SuppliersForm, emptyForm, type SupplierForm } from './suppliers-form';
import { toast } from '@/components/ui/use-toast';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';
import { th } from 'date-fns/locale';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export function SuppliersManagement() {
	const {
		data: suppliers,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Supplier>(
		'suppliers',
		async () => {
			const { data, error } = await listSuppliers();
			if (error) throw error;
			return data ?? [];
		},
		'suppliers_cache'
	);

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
	const [form, setForm] = useState<SupplierForm>(emptyForm);
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Supplier | null>(null);

	const openCreateForm = () => {
		setEditingSupplier(null);
		setForm(emptyForm);
		setFormError(null);
		setIsFormOpen(true);
	};

	const openEditForm = (supplier: Supplier) => {
		setEditingSupplier(supplier);
		setForm({
			name: supplier.name ?? '',
			cuit: supplier.cuit ?? '',
			phone: supplier.phone ?? '',
			email: supplier.email ?? '',
			address: supplier.address ?? '',
			notes: supplier.notes ?? '',
		});
		setFormError(null);
		setIsFormOpen(true);
	};

	const closeForm = () => {
		if (saving) return;
		setIsFormOpen(false);
		setEditingSupplier(null);
	};

	const setField = (field: keyof SupplierForm, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const buildPayload = (): SupplierInput => {
		return {
			name: form.name.trim(),
			cuit: form.cuit.trim() || null,
			phone: form.phone.trim() || null,
			email: form.email.trim() || null,
			address: form.address.trim() || null,
			notes: form.notes.trim() || null,
		};
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.name.trim()) {
			setFormError('El nombre es obligatorio.');
			return;
		}
		if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
			setFormError('El correo electrónico no es válido.');
			return;
		}

		const payload = buildPayload();
		setSaving(true);
		setFormError(null);

		try {
			if (editingSupplier) {
				const { error } = await updateSupplier(editingSupplier.id, payload);
				if (error) {
					throw error;
				}
				toast({
					title: 'Proveedor actualizado',
					description: 'El proveedor se actualizó correctamente.',
				});
			} else {
				const { error } = await createSupplier(payload);
				if (error) {
					throw error;
				}
				toast({
					title: 'Proveedor creado',
					description: 'El proveedor se creó correctamente.',
				});
			}
			setIsFormOpen(false);
			setEditingSupplier(null);
		} catch (error: any) {
			toast({
				title: 'Error al guardar proveedor',
				description: translateError(error) || 'No se pudo guardar el proveedor. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = (supplier: Supplier) => {
		setPendingDelete(supplier);
	};

	const confirmDelete = async () => {
		if (!pendingDelete) return;

		const supplier = pendingDelete;
		setPendingDelete(null);
		setDeletingId(supplier.id);

		try {
			const { error } = await deleteSupplier(supplier.id);
			if (error) {
				throw error;
			}
		} catch (error: any) {
			toast({
				title: 'Error al eliminar proveedor',
				description: translateError(error) || 'No se pudo eliminar el proveedor. Intentá de nuevo.',
				variant: 'destructive',
			});
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="mx-auto w-full p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-neutral-900">Proveedores</h1>
				<button
					onClick={openCreateForm}
					className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
				>
					Nuevo proveedor
				</button>
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
			) : suppliers.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay proveedores cargados.</p>
			) : (
				<div className="overflow-x-auto rounded-md border border-neutral-200 overflow-y-auto max-h-[400px]">
					<table className="w-full text-left text-sm">
						<thead className="bg-neutral-50 text-neutral-500">
							<tr className="divide-x divide-neutral-200">
								<th className="text-center px-4 py-3 font-medium">Nombre</th>
								<th className="text-center px-4 py-3 font-medium">CUIT</th>
								<th className="text-center px-4 py-3 font-medium">Teléfono</th>
								<th className="text-center px-4 py-3 font-medium">Email</th>
								<th className="text-center px-4 py-3 font-medium">Dirección</th>
								<th className="text-center px-4 py-3 font-medium">Notas</th>
								<th className="text-center w-40 px-4 py-3 font-medium text-center">Acciones</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-200">
							{suppliers.map((supplier) => (
								<tr key={supplier.id} className="divide-x divide-neutral-200">
									<td className="text-center px-4 py-3 text-neutral-800">{supplier.name}</td>
									<td className="text-center px-4 py-3 text-neutral-600">{supplier.cuit || '—'}</td>
									<td className="text-center px-4 py-3 text-neutral-600">
										{supplier.phone ? (
											<WhatsAppLink
												phone={supplier.phone}
												className="text-sm text-neutral-600 hover:text-neutral-900"
											/>
										) : (
											'—'
										)}
									</td>
									<td className="text-center px-4 py-3 text-neutral-600">
										{supplier.email || '—'}
									</td>
									<td className="text-center px-4 py-3 text-neutral-600">
										{supplier.address || '—'}
									</td>
									<td className="text-center px-4 py-3 text-neutral-600 max-w-[200px]">
										{supplier.notes || '—'}
									</td>
									<td className="px-4 py-3 text-center justify-center items-center">
										<div className="flex gap-3 justify-center">
											<button
												onClick={() => openEditForm(supplier)}
												disabled={deletingId === supplier.id}
												className="rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
											>
												Editar
											</button>
											<button
												onClick={() => handleDelete(supplier)}
												disabled={deletingId === supplier.id}
												className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
											>
												{deletingId === supplier.id ? 'Eliminando…' : 'Eliminar'}
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
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingSupplier ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
					</DialogHeader>
					<SuppliersForm
						editingSupplier={editingSupplier}
						form={form}
						onChange={setField}
						saving={saving}
						formError={formError}
						onSubmit={handleSubmit}
						onCancel={closeForm}
					/>
				</DialogContent>
				{!loading && (
					<div className="mt-4 flex justify-end gap-2">
						<DownloadExportButton
							data={suppliers}
							columns={columns}
							fileName="Proveedores"
							format="pdf"
							title="Listado de proveedores"
							className="bg-red-400 hover:bg-red-700"
						/>
						<DownloadExportButton
							data={suppliers}
							columns={columns}
							fileName="Proveedores"
							format="csv"
							title="Listado de proveedores"
							sheetName="Proveedores"
							className="bg-green-600 hover:bg-green-700"
						/>
					</div>
				)}
			</Dialog>
			<div className="mt-6">
				<InfoBanner
					collapsible
					title="Proveedores"
					sections={[
						{
							title: 'Utilidad',
							children:
								'En esta sección podés crear, editar y eliminar proveedores. Los datos de contacto se usan para identificar a cada proveedor dentro del sistema.',
						},
						{
							title: 'Cómo usarlo',
							children:
								'Usá "Nuevo proveedor" para crear uno, y "Editar" para modificar sus datos. El nombre es obligatorio; el resto de los campos es opcional. Los proveedores se muestran ordenados alfabéticamente por nombre.',
						},
						{
							title: 'WhatsApp',
							children:
								'El teléfono de cada proveedor es un enlace directo: al tocarlo se abre WhatsApp con ese número listo para chatear.',
						},
						{
							title: 'Descargas',
							children:
								'Podés exportar el listado de proveedores en PDF o CSV usando los botones de descarga que aparecen debajo de la tabla.',
						},
						{
							title: 'Eliminar',
							children:
								'La eliminación es permanente y no se puede deshacer. Verificá que el proveedor no esté en uso antes de eliminarlo.',
						},
					]}
				/>
			</div>

			<AlertDialog open={!!pendingDelete} onOpenChange={() => setPendingDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Seguro que querés eliminar al proveedor &quot;{pendingDelete?.name}&quot;? Esta
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
