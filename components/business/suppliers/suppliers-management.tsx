'use client';

import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';
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

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PAGE_SIZE = 10;

export function SuppliersManagement() {
	const fetchSuppliers = useCallback(async () => {
		const { data, error } = await listSuppliers();
		if (error) throw error;
		return data ?? [];
	}, []);

	const {
		data: suppliers,
		loading,
		error,
		refresh,
	} = useOptimizedRealtime<Supplier>(
		'suppliers',
		async () => {
			return await fetchSuppliers();
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

	const [searchTerm, setSearchTerm] = useState('');
	const [page, setPage] = useState(0);

	const normalizedSearch = searchTerm.trim().toLowerCase();
	const filteredSuppliers = normalizedSearch
		? suppliers.filter((supplier) =>
				[
					supplier.name,
					supplier.cuit,
					supplier.phone,
					supplier.email,
					supplier.address,
					supplier.notes,
				].some((value) => (value ?? '').toLowerCase().includes(normalizedSearch))
			)
		: suppliers;

	const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / PAGE_SIZE));
	const currentPage = Math.min(page, totalPages - 1);
	const paginatedSuppliers = filteredSuppliers.slice(
		currentPage * PAGE_SIZE,
		currentPage * PAGE_SIZE + PAGE_SIZE
	);

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
			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-neutral-900">Proveedores</h1>
					<p className="mt-1 text-sm text-neutral-500">
						Administrá el listado de proveedores de la empresa.
						{!loading && (
							<span className="font-medium text-neutral-700">
								{' '}
								({suppliers.length} {suppliers.length === 1 ? 'proveedor' : 'proveedores'})
							</span>
						)}
					</p>
				</div>

				{!loading && (
					<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
						<DownloadExportButton
							data={suppliers}
							columns={columns}
							fileName="Proveedores"
							format="pdf"
							title="Listado de proveedores"
							className="w-full bg-red-800 hover:bg-red-700 sm:w-auto"
						/>

						<DownloadExportButton
							data={suppliers}
							columns={columns}
							fileName="Proveedores"
							format="csv"
							title="Listado de proveedores"
							sheetName="Proveedores"
							className="w-full bg-green-700 hover:bg-green-600 sm:w-auto"
						/>

						<button
							onClick={openCreateForm}
							className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 sm:w-auto"
						>
							Nuevo proveedor
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
			) : suppliers.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay proveedores cargados.</p>
			) : (
				<>
					<div className="mb-4 relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
						<Input
							type="text"
							placeholder="Buscar por nombre, CUIT, teléfono, email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							aria-label="Buscar proveedores"
							className="w-full pl-10 sm:max-w-sm"
						/>
					</div>

					{filteredSuppliers.length === 0 ? (
						<p className="text-sm text-neutral-500">
							No se encontraron proveedores para la búsqueda.
						</p>
					) : (
						<div className="overflow-x-auto rounded-lg border border-neutral-200">
							<Table>
								<TableHeader className="bg-slate-800">
									<TableRow className="border-b-0 hover:bg-slate-800 bg-neutral-500">
										<TableHead className="text-center font-semibold text-white">Nombre</TableHead>
										<TableHead className="text-center font-semibold text-white">CUIT</TableHead>
										<TableHead className="text-center font-semibold text-white">Teléfono</TableHead>
										<TableHead className="text-center font-semibold text-white">Email</TableHead>
										<TableHead className="text-center font-semibold text-white">
											Dirección
										</TableHead>
										<TableHead className="text-center font-semibold text-white">Notas</TableHead>
										<TableHead className="w-40 text-center font-semibold text-white">
											Acciones
										</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{paginatedSuppliers.map((supplier) => (
										<TableRow key={supplier.id}>
											<TableCell className="text-center font-medium">{supplier.name}</TableCell>

											<TableCell className="text-center text-muted-foreground">
												{supplier.cuit || '—'}
											</TableCell>

											<TableCell className="text-center">
												{supplier.phone ? (
													<WhatsAppLink phone={supplier.phone} className="text-sm" />
												) : (
													'—'
												)}
											</TableCell>

											<TableCell className="text-center text-muted-foreground">
												{supplier.email || '—'}
											</TableCell>

											<TableCell
												className="max-w-[220px] truncate text-center text-muted-foreground"
												title={supplier.address ?? ''}
											>
												{supplier.address || '—'}
											</TableCell>

											<TableCell
												className="max-w-[220px] truncate text-center text-muted-foreground"
												title={supplier.notes ?? ''}
											>
												{supplier.notes || '—'}
											</TableCell>

											<TableCell>
												<div className="flex items-center justify-center gap-2">
													<button
														onClick={() => openEditForm(supplier)}
														className="rounded-md bg-neutral-400 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
													>
														Editar
													</button>
													<button
														onClick={() => handleDelete(supplier)}
														className="rounded-md bg-red-600 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700"
														disabled={deletingId === supplier.id}
													>
														{deletingId === supplier.id ? 'Eliminando...' : 'Eliminar'}
													</button>
												</div>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}

					{filteredSuppliers.length > 0 && (
						<div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
							<p className="text-sm text-neutral-500">
								Mostrando {currentPage * PAGE_SIZE + 1}–
								{Math.min((currentPage + 1) * PAGE_SIZE, filteredSuppliers.length)} de{' '}
								{filteredSuppliers.length}
							</p>
							<Pagination className="!mx-0 !w-auto !ml-auto !justify-end">
								{' '}
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
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingSupplier ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
					</DialogHeader>
					<SuppliersForm
						form={form}
						onChange={setField}
						saving={saving}
						formError={formError}
						onSubmit={handleSubmit}
						onCancel={closeForm}
					/>
				</DialogContent>
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
