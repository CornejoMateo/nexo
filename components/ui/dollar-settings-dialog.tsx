'use client';

import { useEffect, useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Loader2 } from 'lucide-react';
import { useSettings } from '@/components/provider/settings-provider';
import { updateBusinessSettings } from '@/lib/settings/business-settings';
import { translateError } from '@/lib/error-translator';
import { formatNumber, formatCurrencyUSD, parseArsToNumber } from '@/utils/formats-money';
import { toast } from '@/components/ui/use-toast';
import { formatCurrencyWithoutSymbol } from '@/utils/formats-money';

interface DollarSettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DollarSettingsDialog({ open, onOpenChange }: DollarSettingsDialogProps) {
	const { settings, refreshSettings } = useSettings();
	const [value, setValue] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open) {
			setValue(
				settings?.usd_rate != null
					? formatNumber(formatCurrencyWithoutSymbol(settings.usd_rate))
					: ''
			);
		}
	}, [open, settings?.usd_rate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const usdRate = parseArsToNumber(value);
		if (usdRate <= 0) {
			toast({
				title: 'Valor inválido',
				description: 'Ingresá un valor mayor a cero para la cotización del dólar.',
				variant: 'destructive',
			});
			return;
		}

		setSaving(true);
		try {
			const { error } = await updateBusinessSettings({ usd_rate: usdRate });
			if (error) throw error;
			await refreshSettings();
			toast({
				title: 'Cotización actualizada',
				description: 'El valor del dólar se actualizó correctamente.',
			});
			onOpenChange(false);
		} catch (error) {
			toast({
				title: 'Error al actualizar',
				description: translateError(error) || 'No se pudo actualizar la cotización.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<DollarSign className="h-5 w-5" />
						Cotización del dólar
					</DialogTitle>
					<DialogDescription>
						Actualizá el valor de la cotización usado en toda la aplicación
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="dollar-rate">Valor del dólar</Label>
						<Input
							id="dollar-rate"
							type="text"
							inputMode="decimal"
							value={value}
							onChange={(e) => setValue(formatNumber(e.target.value))}
							placeholder="Ej: 1000"
							autoFocus
						/>
					</div>

					{settings?.usd_rate != null && value && (
						<p className="text-xs text-muted-foreground">
							Valor actual: {formatCurrencyUSD(settings.usd_rate)}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={saving}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={saving}>
							{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{saving ? 'Guardando...' : 'Guardar'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
