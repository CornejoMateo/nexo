'use client';

import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { translateError } from '@/lib/error-translator';
import {
	User,
	listUsers,
	createUser,
	deleteUser,
	updateUser,
	updateUserPassword,
} from '@/lib/users/users';
import { UserRole } from '@/constants/users/user-role';
import { useAuth } from '@/components/provider/auth-provider';
import { UsersTable } from '../users/users-table';
import { UsersDialogForm } from '../users/users-dialog-form';
import { CompanySettingsForm } from './company-settings-form';

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	const { toast } = useToast();
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(false);
	const [showForm, setShowForm] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [formData, setFormData] = useState({
		username: '',
		password: '',
		role: '',
		name: '',
		last_name: '',
	});
	const [saving, setSaving] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [userToDelete, setUserToDelete] = useState<User | null>(null);
	const [deleting, setDeleting] = useState(false);
	const { user: currentUser } = useAuth();

	const isCurrentUser = (user: User) => user.username === currentUser?.username;

	const loadUsers = async () => {
		setLoading(true);
		try {
			const { data, error } = await listUsers();
			if (error) {
				toast({
					title: 'Error al cargar usuarios',
					description: translateError(error) || 'Ocurrió un error al cargar los usuarios',
					variant: 'destructive',
				});
				return;
			} else {
				setUsers(data ?? []);
			}
		} catch (error: any) {
			toast({
				title: 'Error al cargar usuarios',
				description: translateError(error?.message) || 'Ocurrió un error al cargar los usuarios',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (open) {
			loadUsers();
			setShowForm(false);
			setEditingUser(null);
			setFormData({ username: '', password: '', role: '', name: '', last_name: '' });
		}
	}, [open]);

	const handleEdit = (user: User) => {
		setEditingUser(user);
		setFormData({
			username: user.username,
			password: '',
			role: user.role,
			name: user.name || '',
			last_name: user.last_name || '',
		});
		setShowForm(true);
	};

	const handleSave = async () => {
		if (!formData.username || !formData.role) {
			toast({ title: 'Completá todos los campos', variant: 'destructive' });
			return;
		}

		setSaving(true);

		if (editingUser) {
			const { error: updateError } = await updateUser(editingUser.uid_user!, {
				username: formData.username,
				role: formData.role as UserRole,
				name: formData.name,
				last_name: formData.last_name,
			});

			if (updateError) {
				toast({
					title: 'Error al actualizar usuario',
					description: translateError(updateError) || 'Ocurrió un error al actualizar el usuario',
					variant: 'destructive',
				});
				setSaving(false);
				return;
			}

			if (formData.password) {
				const { error: pwError } = await updateUserPassword(
					editingUser.uid_user!,
					formData.password
				);

				if (pwError) {
					toast({
						title: 'Error al actualizar contraseña',
						description: translateError(pwError) || 'Ocurrió un error al actualizar la contraseña',
						variant: 'destructive',
					});
					setSaving(false);
					return;
				}
			}

			toast({
				title: 'Usuario actualizado',
				description: `${formData.username} ha sido actualizado correctamente.`,
			});
		} else {
			if (!formData.password) {
				toast({ title: 'La contraseña es obligatoria', variant: 'destructive' });
				setSaving(false);
				return;
			}

			const { error } = await createUser({
				username: formData.username,
				password: formData.password,
				role: formData.role as UserRole,
				name: formData.name,
				last_name: formData.last_name,
			});

			if (error) {
				toast({
					title: 'Error al crear usuario',
					description: translateError(error) || 'Ocurrió un error al crear el usuario',
					variant: 'destructive',
				});
				setSaving(false);
				return;
			}

			toast({
				title: 'Usuario creado',
				description: `${formData.username} ha sido creado correctamente.`,
			});
		}

		setShowForm(false);
		setEditingUser(null);
		setFormData({ username: '', password: '', role: '', name: '', last_name: '' });
		await loadUsers();
		setSaving(false);
	};

	const handleUpdateRole = async (user: User, newRole: string) => {
		if (!user.uid_user) return;

		const { error } = await updateUser(user.uid_user, { role: newRole as UserRole });

		if (error) {
			toast({
				title: 'Error al actualizar rol',
				description: translateError(error) || 'Ocurrió un error al actualizar el rol',
				variant: 'destructive',
			});
		} else {
			toast({
				title: 'Rol actualizado',
				description: `El rol de ${user.username} ahora es ${newRole}.`,
			});
			await loadUsers();
		}
	};

	const confirmDelete = async () => {
		const user = userToDelete;
		if (!user?.uid_user) {
			toast({
				title: 'Error al eliminar usuario',
				description: 'El usuario no tiene un ID válido.',
				variant: 'destructive',
			});
			setUserToDelete(null);
			return;
		}
		setDeleting(true);
		const { error } = await deleteUser(user.uid_user);
		setDeleting(false);
		setUserToDelete(null);
		if (error) {
			toast({
				title: 'Error al eliminar usuario',
				description: translateError(error) || 'Ocurrió un error al eliminar el usuario',
				variant: 'destructive',
			});
			return;
		} else {
			toast({
				title: 'Usuario eliminado',
				description: `${user.username} ha sido eliminado correctamente.`,
			});
			await loadUsers();
		}
	};

	const cancelForm = () => {
		setShowForm(false);
		setEditingUser(null);
		setFormData({ username: '', password: '', role: '', name: '', last_name: '' });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="bg-card !max-w-3xl max-h-[80vh] overflow-y-auto"
			>
				<DialogHeader>
					<DialogTitle className="text-foreground">Configuración</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Administrá los datos de la empresa y de los usuarios del sistema
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="users" className="w-full">
					<TabsList>
						<TabsTrigger value="business">Empresa</TabsTrigger>
						<TabsTrigger value="users">Usuarios</TabsTrigger>
					</TabsList>

					<TabsContent value="business">
						<CompanySettingsForm />
					</TabsContent>

					<TabsContent value="users" className="mt-4">
						{!showForm ? (
							<div className="space-y-4">
								{/* Header */}
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h2 className="text-lg font-semibold text-foreground">Usuarios</h2>
										<p className="text-sm text-muted-foreground">
											Gestioná los usuarios y sus permisos de acceso.
										</p>
									</div>

									<button
										type="button"
										onClick={() => setShowForm(true)}
										className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 sm:w-auto"
									>
										+ Nuevo usuario
									</button>
								</div>

								<p className="text-xs text-muted-foreground">
									Un usuario no puede editar sus propios datos
								</p>

								<div className="rounded-lg border bg-background">
									<UsersTable
										users={users}
										loading={loading}
										currentUser={currentUser}
										isCurrentUser={isCurrentUser}
										onEdit={handleEdit}
										onDelete={(user) => setUserToDelete(user)}
										onUpdateRole={handleUpdateRole}
									/>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h2 className="text-lg font-semibold text-foreground">
											{editingUser ? 'Editar usuario' : 'Nuevo usuario'}
										</h2>
										<p className="text-sm text-muted-foreground">
											{editingUser
												? 'Modificá la información y los permisos del usuario.'
												: 'Completá los datos para crear un nuevo usuario.'}
										</p>
									</div>

									<button
										type="button"
										onClick={cancelForm}
										className="w-full rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 sm:w-auto"
									>
										Volver
									</button>
								</div>

								<div className="rounded-lg border bg-background p-4 sm:p-6">
									<UsersDialogForm
										editingUser={editingUser}
										formData={formData}
										setFormData={setFormData}
										saving={saving}
										showPassword={showPassword}
										setShowPassword={setShowPassword}
										handleSave={handleSave}
										onCancel={cancelForm}
									/>
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>

				<div className="flex justify-end">
					<DialogClose asChild>
						<Button variant="outline">Cerrar</Button>
					</DialogClose>
				</div>
			</DialogContent>
			<AlertDialog open={!!userToDelete} onOpenChange={(o) => !o && setUserToDelete(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
					</AlertDialogHeader>
					<p className="text-sm text-muted-foreground">
						Esta acción no se puede deshacer. Se eliminará el usuario{' '}
						<strong>{userToDelete?.username}</strong> y no podrá iniciar sesión.
					</p>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
						<Button onClick={confirmDelete} disabled={deleting} variant="destructive">
							{deleting ? 'Eliminando...' : 'Eliminar'}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Dialog>
	);
}
