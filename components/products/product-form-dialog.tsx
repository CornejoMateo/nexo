'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { categoryLabels } from '@/lib/mock-data';
import type {
	Product,
	ProductCategory,
	ProductCondition,
	CosmeticCondition,
	CarrierStatus,
} from '@/lib/types';
import { createProduct, updateProduct, iphone_product } from '@/lib/products/iphone_product';
import { toast } from 'sonner';

interface ProductFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	iphone_product?: iphone_product | null;
}

const defaultProduct: Partial<iphone_product> = {
	name: '',
	category: 'iphone',
	brand: 'Apple',
	condition: 'new',
	storage_capacity: '',
	color: '',
	serial_number: '',
	imei: '',
	stock_quantity: 1,
	purchase_price_USD: 0,
	wholesale_price_USD: 0,
	retail_price_USD: 0,
	notes: '',
};

export function ProductFormDialog({ open, onOpenChange, iphone_product }: ProductFormDialogProps) {
	const [formData, setFormData] = useState<Partial<iphone_product>>(defaultProduct);
	const [isSaving, setIsSaving] = useState(false);
	const isEditing = !!iphone_product;

	useEffect(() => {
		if (open) {
			setFormData(iphone_product ? { ...iphone_product } : defaultProduct);
		}
	}, [open, iphone_product]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData?.name || !formData?.category) {
			toast.error('Por favor completa los campos requeridos');
			return;
		}

		setIsSaving(true);

		try {
			const payload = { ...formData };

			if (isEditing && iphone_product) {
				const productId = Number(iphone_product.id);

				if (Number.isNaN(productId)) {
					throw new Error('Invalid product id');
				}

				await updateProduct(productId, payload as Partial<iphone_product>);
				toast.success('Producto actualizado correctamente');
			} else {
				await createProduct(payload as iphone_product);
				toast.success('Producto agregado correctamente');
			}

			onOpenChange(false);
			setFormData(defaultProduct);
		} catch (error) {
			console.error(error);
			toast.error('No se pudo guardar el producto');
		} finally {
			setIsSaving(false);
		}
	};

	const isUsedCategory = formData?.category === 'used-iphone';

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
					<DialogDescription>
						{isEditing
							? 'Modifica los datos del producto'
							: 'Completa los datos para agregar un nuevo producto'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Basic Info */}
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="name">Nombre del Producto *</Label>
							<Input
								id="name"
								value={formData?.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="iPhone 15 Pro Max"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="category">Categoria *</Label>
							<Select
								value={formData?.category}
								onValueChange={(value: ProductCategory) =>
									setFormData({ ...formData, category: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar categoria" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(categoryLabels).map(([value, label]) => (
										<SelectItem key={value} value={value}>
											{label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="condition">Condicion *</Label>
							<Select
								value={formData?.condition}
								onValueChange={(value: ProductCondition) =>
									setFormData({ ...formData, condition: value })
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar condicion" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="new">Nuevo</SelectItem>
									<SelectItem value="used">Usado</SelectItem>
									<SelectItem value="refurbished">Refurbished</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="storage">Almacenamiento</Label>
							<Select
								value={formData?.storage_capacity || ''}
								onValueChange={(value) => setFormData({ ...formData, storage_capacity: value })}
							>
								<SelectTrigger>
									<SelectValue placeholder="Seleccionar" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="64GB">64GB</SelectItem>
									<SelectItem value="128GB">128GB</SelectItem>
									<SelectItem value="256GB">256GB</SelectItem>
									<SelectItem value="512GB">512GB</SelectItem>
									<SelectItem value="1TB">1TB</SelectItem>
									<SelectItem value="2TB">2TB</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="color">Color</Label>
							<Input
								id="color"
								value={formData.color || ''}
								onChange={(e) => setFormData({ ...formData, color: e.target.value })}
								placeholder="Natural Titanium"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="serial">Numero de Serie</Label>
							<Input
								id="serial"
								value={formData.serial_number || ''}
								onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
								placeholder="DNQXH1234567"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="imei">IMEI</Label>
							<Input
								id="imei"
								value={formData.imei || ''}
								onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
								placeholder="353912110123456"
							/>
						</div>
					</div>

					{/* Stock & Pricing */}
					<div className="space-y-4">
						<h4 className="font-medium text-foreground">Stock y Precios</h4>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="stock">Cantidad en Stock *</Label>
								<Input
									id="stock"
									type="number"
									min={0}
									value={formData.stock_quantity || 0}
									onChange={(e) =>
										setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="purchase">Precio de Compra (USD) *</Label>
								<Input
									id="purchase"
									type="number"
									min={0}
									step={0.01}
									value={formData.purchase_price_USD || 0}
									onChange={(e) =>
										setFormData({
											...formData,
											purchase_price_USD: parseFloat(e.target.value) || 0,
										})
									}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="wholesale">Precio Mayorista (USD) *</Label>
								<Input
									id="wholesale"
									type="number"
									min={0}
									step={0.01}
									value={formData.wholesale_price_USD || 0}
									onChange={(e) =>
										setFormData({
											...formData,
											wholesale_price_USD: parseFloat(e.target.value) || 0,
										})
									}
									required
								/>
							</div>

							<div className="space-y-2 sm:col-span-2">
								<Label htmlFor="retail">Precio Minorista (USD) *</Label>
								<Input
									id="retail"
									type="number"
									min={0}
									step={0.01}
									value={formData.retail_price_USD || 0}
									onChange={(e) =>
										setFormData({ ...formData, retail_price_USD: parseFloat(e.target.value) })
									}
									required
								/>
							</div>
						</div>
					</div>

					{/* Notes */}
					<div className="space-y-2">
						<Label htmlFor="notes">Notas</Label>
						<Textarea
							id="notes"
							value={formData.notes || ''}
							onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
							placeholder="Notas adicionales sobre el producto..."
							rows={3}
						/>
					</div>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancelar
						</Button>
						<Button type="submit" disabled={isSaving}>
							{isSaving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Producto'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
