'use client';

import { useCallback, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { CreditCard, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import {
	createPaymentMethod,
	deletePaymentMethod,
	listPaymentMethods,
	updatePaymentMethod,
	type PaymentMethod,
} from '@/lib/sales/payment-methods';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';
import { useOptimizedRealtime } from '@/hooks/use-optimized-realtime';

interface PaymentMethodsManagementProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PaymentMethodsManagement({ open, onOpenChange }: PaymentMethodsManagementProps) {
	const fetchMethods = useCallback(async () => {
		const { data, error } = await listPaymentMethods();
		if (error) throw error;
		return data ?? [];
	}, []);

	const {
		data: methods,
		loading,
		error,
	} = useOptimizedRealtime<PaymentMethod>('payment_methods', fetchMethods, 'payment_methods_cache');

	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);
	const [deleting, setDeleting] = useState(false);

	const resetForm = () => {
		setName('');
		setEditingId(null);
		setIsAdding(false);
	};

	const handleAdd = () => {
		setName('');
		setEditingId(null);
		setIsAdding(true);
	};

	const handleEdit = (method: PaymentMethod) => {
		setName(method.name);
		setEditingId(method.id);
		setIsAdding(true);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			toast({
				title: 'Nombre obligatorio',
				description: 'Ingresá el nombre del método de pago.',
				variant: 'destructive',
			});
			return;
		}

		setSaving(true);
		try {
			if (editingId) {
				const { error } = await updatePaymentMethod(editingId, { name: trimmedName });
				if (error) throw error;
				toast({
					title: 'Método actualizado',
					description: 'El método de pago se actualizó correctamente.',
				});
			} else {
				const { error } = await createPaymentMethod({ name: trimmedName });
				if (error) throw error;
				toast({
					title: 'Método creado',
					description: 'El método de pago se creó correctamente.',
				});
			}
			resetForm();
		} catch (error: any) {
			toast({
				title: 'Error al guardar',
				description: translateError(error) || 'No se pudo guardar el método de pago.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	const confirmDelete = async () => {
		if (!deletingMethod) return;

		setDeleting(true);
		try {
			const { error } = await deletePaymentMethod(deletingMethod.id);
			if (error) throw error;
			toast({
				title: 'Método eliminado',
				description: 'El método de pago se eliminó correctamente.',
			});
		} catch (error: any) {
			toast({
				title: 'Error al eliminar',
				description: translateError(error) || 'No se pudo eliminar el método de pago.',
				variant: 'destructive',
			});
		} finally {
			setDeleting(false);
			setDeletingMethod(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card !max-w-2xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-foreground">
						<CreditCard className="h-5 w-5" />
						Métodos de pago
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Administrá los métodos de pago disponibles para las ventas
					</DialogDescription>
				</DialogHeader>

				{!isAdding && (
					<Button onClick={handleAdd} className="w-full gap-2">
						<Plus className="h-4 w-4" />
						Agregar método de pago
					</Button>
				)}

				{isAdding && (
					<Card className="border-border bg-card p-4">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="payment-method-name">Nombre</Label>
								<Input
									id="payment-method-name"
									placeholder="Ej: Efectivo"
									value={name}
									onChange={(e) => setName(e.target.value)}
									autoFocus
								/>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={saving} className="flex-1">
									{saving ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Guardando...
										</>
									) : editingId ? (
										'Actualizar'
									) : (
										'Crear'
									)}
								</Button>
								<Button type="button" variant="outline" onClick={resetForm}>
									Cancelar
								</Button>
							</div>
						</form>
					</Card>
				)}

				{error && (
					<p role="alert" aria-live="polite" className="text-sm text-red-600">
						No se pudo cargar el listado de métodos de pago.
					</p>
				)}
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : methods.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						Todavía no hay métodos de pago cargados.
					</p>
				) : (
					<div className="overflow-x-auto rounded-lg border border-neutral-200">
						<Table>
							<TableHeader className="bg-slate-800">
								<TableRow className="border-b-0 bg-neutral-500 hover:bg-slate-800">
									<TableHead className="text-center font-semibold text-white">Nombre</TableHead>
									<TableHead className="w-40 text-center font-semibold text-white">
										Acciones
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{methods.map((method) => (
									<TableRow key={method.id}>
										<TableCell className="text-center font-medium">{method.name}</TableCell>
										<TableCell>
											<div className="flex items-center justify-center gap-2">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleEdit(method)}
													disabled={isAdding || deleting}
												>
													<Pencil className="mr-1 h-4 w-4" />
													Editar
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => setDeletingMethod(method)}
													className="text-destructive hover:text-destructive"
													disabled={isAdding || deleting}
												>
													<Trash2 className="mr-1 h-4 w-4" />
													Eliminar
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cerrar
					</Button>
				</DialogFooter>
			</DialogContent>

			<AlertDialog open={!!deletingMethod} onOpenChange={(o) => !o && setDeletingMethod(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar método de pago?</AlertDialogTitle>
						<AlertDialogDescription>
							¿Seguro que querés eliminar el método de pago &quot;{deletingMethod?.name}&quot;? Esta
							acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={confirmDelete}
							disabled={deleting}
							className="bg-red-600 hover:bg-red-700"
						>
							{deleting ? 'Eliminando...' : 'Eliminar'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Dialog>
	);
}
