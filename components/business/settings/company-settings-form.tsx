'use client';

import { useEffect, useState } from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useSettings } from '@/components/provider/settings-provider';
import { updateBusinessSettings } from '@/lib/settings/business-settings';
import { translateError } from '@/lib/error-translator';
import { toast } from '@/components/ui/use-toast';

export function CompanySettingsForm() {
	const { settings, loading, refreshSettings } = useSettings();
	const [address, setAddress] = useState('');
	const [numberPhone, setNumberPhone] = useState('');
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (settings) {
			setAddress(settings.address ?? '');
			setNumberPhone(settings.number_phone ?? '');
		}
	}, [settings]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const { error } = await updateBusinessSettings({
				address: address.trim(),
				number_phone: numberPhone.trim(),
			});
			if (error) throw error;
			await refreshSettings();
			toast({
				title: 'Empresa actualizada',
				description: 'Los datos de la empresa se guardaron correctamente.',
			});
		} catch (error: any) {
			toast({
				title: 'Error al guardar',
				description: translateError(error) || 'No se pudieron guardar los datos de la empresa.',
				variant: 'destructive',
			});
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4 py-4">
			<div className="grid gap-2">
				<Label htmlFor="company-address" className="text-foreground">
					Dirección
				</Label>
				<Input
					id="company-address"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className="bg-background"
					placeholder="Ej: Av. Siempre Viva 123"
				/>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="company-phone" className="text-foreground">
					Teléfono
				</Label>
				<Input
					id="company-phone"
					value={numberPhone}
					onChange={(e) => setNumberPhone(e.target.value)}
					className="bg-background"
					placeholder="Ej: 11 5555 1234"
				/>
			</div>
			<DialogFooter className="gap-2">
				<Button type="submit" disabled={saving}>
					{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					{saving ? 'Guardando...' : 'Guardar cambios'}
				</Button>
			</DialogFooter>
		</form>
	);
}
