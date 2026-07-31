'use client';

import { useEffect, useState } from 'react';
import { Brand, createBrand, listBrands } from '@/lib/products/brands/brands';
import { translateError } from '@/lib/error-translator';

export function BrandsManagement() {
	const [brands, setBrands] = useState<Brand[]>([]);
	const [loading, setLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [name, setName] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function fetchBrands() {
		setLoading(true);
		const { data, error } = await listBrands();
		if (error) {
			setError('No se pudo cargar el listado de marcas.');
		} else {
			setBrands(data ?? []);
		}
		setLoading(false);
	}

	useEffect(() => {
		fetchBrands();
	}, []);

	function openForm() {
		setName('');
		setError(null);
		setIsFormOpen(true);
	}

	function closeForm() {
		if (saving) return;
		setIsFormOpen(false);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmedName = name.trim();
		if (!trimmedName) {
			setError('El nombre es obligatorio.');
			return;
		}

		setSaving(true);
		setError(null);
		const { data, error } = await createBrand({ name: trimmedName });
		setSaving(false);

		if (error) {
			setError('No se pudo crear la marca. Intentá de nuevo.');
			return;
		}

		if (data) {
			setBrands((prev) =>
				[...prev, data].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
			);
		}
		setIsFormOpen(false);
	}

	return (
		<div className="mx-auto max-w-xl p-6">
			<div className="mb-6 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-neutral-900">Marcas</h1>
				<button
					onClick={openForm}
					className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
				>
					Nueva marca
				</button>
			</div>

			{loading ? (
				<p className="text-sm text-neutral-500">Cargando marcas…</p>
			) : brands.length === 0 ? (
				<p className="text-sm text-neutral-500">Todavía no hay marcas cargadas.</p>
			) : (
				<ul className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
					{brands.map((brand) => (
						<li key={brand.id} className="px-4 py-3 text-sm text-neutral-800">
							{brand.name}
						</li>
					))}
				</ul>
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
						<h2 className="mb-4 text-base font-semibold text-neutral-900">Nueva marca</h2>
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
								placeholder="Ej: Nike"
							/>
							{error && (
								<p className="mb-2 text-sm text-red-600">
									{translateError(error) || 'No se pudo crear la marca. Intentá de nuevo.'}
								</p>
							)}
							<div className="mt-4 flex justify-end gap-2">
								<button
									type="button"
									onClick={closeForm}
									disabled={saving}
									className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={saving}
									className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
								>
									{saving ? 'Guardando…' : 'Guardar'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
