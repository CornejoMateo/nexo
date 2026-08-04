'use client';

import { DialogFooter } from '@/components/ui/dialog';
import type { Supplier } from '@/lib/suppliers/suppliers';

export type SupplierForm = {
	name: string;
	cuit: string;
	phone: string;
	email: string;
	address: string;
	notes: string;
};

export const emptyForm: SupplierForm = {
	name: '',
	cuit: '',
	phone: '',
	email: '',
	address: '',
	notes: '',
};

interface SuppliersFormProps {
	editingSupplier: Supplier | null;
	form: SupplierForm;
	onChange: (field: keyof SupplierForm, value: string) => void;
	saving: boolean;
	formError: string | null;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
}

const fieldClass =
	'mb-5 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500';
const labelClass = 'mb-1 block text-sm text-neutral-700';

export function SuppliersForm({
	editingSupplier,
	form,
	onChange,
	saving,
	formError,
	onSubmit,
	onCancel,
}: SuppliersFormProps) {
	return (
		<form onSubmit={onSubmit}>
			<label htmlFor="supplier-name" className={labelClass}>
				Nombre
			</label>
			<input
				id="supplier-name"
				type="text"
				value={form.name}
				onChange={(e) => onChange('name', e.target.value)}
				autoFocus
				className={fieldClass}
				placeholder="Ej: Fundas S.A."
			/>

			<label htmlFor="supplier-cuit" className={labelClass}>
				CUIT
			</label>
			<input
				id="supplier-cuit"
				type="text"
				value={form.cuit}
				onChange={(e) => onChange('cuit', e.target.value)}
				className={fieldClass}
				placeholder="Ej: 20-12345678-9"
			/>

			<label htmlFor="supplier-phone" className={labelClass}>
				Teléfono
			</label>
			<input
				id="supplier-phone"
				type="text"
				value={form.phone}
				onChange={(e) => onChange('phone', e.target.value)}
				className={fieldClass}
				placeholder="Ej: 3586 123456"
			/>

			<label htmlFor="supplier-email" className={labelClass}>
				Email
			</label>
			<input
				id="supplier-email"
				type="text"
				inputMode="email"
				autoComplete="email"
				value={form.email}
				onChange={(e) => onChange('email', e.target.value)}
				className={fieldClass}
				placeholder="Ej: ventas@fundas.com"
			/>

			<label htmlFor="supplier-address" className={labelClass}>
				Dirección
			</label>
			<input
				id="supplier-address"
				type="text"
				value={form.address}
				onChange={(e) => onChange('address', e.target.value)}
				className={fieldClass}
				placeholder="Ej: Av. San Martín 1234"
			/>

			<label htmlFor="supplier-notes" className={labelClass}>
				Notas
			</label>
			<textarea
				id="supplier-notes"
				value={form.notes}
				onChange={(e) => onChange('notes', e.target.value)}
				rows={3}
				className={fieldClass}
				placeholder="Ej: Entrega los lunes"
			/>

			{formError && <p className="mb-2 text-sm text-red-600">{formError}</p>}
			<DialogFooter className="mt-4 gap-2">
				<button
					type="button"
					onClick={onCancel}
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
	);
}
