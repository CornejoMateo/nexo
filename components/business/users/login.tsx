'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/provider/auth-provider';
import type { UserRole } from '@/constants/users/user-role';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
	const { signIn, user, loading } = useAuth();
	const router = useRouter();
	const [usuario, setUsuario] = useState('');
	const [contraseña, setContraseña] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isRedirecting, setIsRedirecting] = useState(false);

	const getHomeByRole = (role: UserRole) => {
		const map: Record<UserRole, string> = {
			Admin: '/',
			Taller: '/supplies',
		};
		return map[role] || '/';
	};

	// Redirect to dashboard after auth state resolved
	React.useEffect(() => {
		if (user && !isRedirecting) {
			setIsRedirecting(true);
			router.push('/');
		}
	}, [user, router, isRedirecting]);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);

		if (usuario.trim() === '' || contraseña.trim() === '') {
			setError('Por favor, complete todos los campos.');
			return;
		}

		setIsRedirecting(true);

		try {
			const userData = await signIn(usuario, contraseña);

			if (userData?.role) {
				router.replace(getHomeByRole(userData.role));
			} else {
				router.replace('/');
			}
		} catch (err: any) {
			setIsRedirecting(false);
			setError(err?.message || 'Error al iniciar sesión');
		}
	}

	// Mostrar pantalla de carga durante la redirección
	if (isRedirecting) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#171717] to-[#0a0a0a]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
					<p className="text-white text-lg">Cargando...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#171717] to-[#0a0a0a] p-4">
			<div className="w-full max-w-md p-8 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-neutral-200 relative overflow-hidden">
				{/* Glass pane effect */}
				<div className="absolute -top-10 -right-10 w-40 h-40 bg-neutral-400/20 rounded-full filter blur-3xl"></div>
				<div className="absolute -bottom-10 -left-10 w-60 h-60 bg-neutral-500/10 rounded-full filter blur-3xl"></div>

				{/* Logo and Title */}
				<div className="text-center mb-8">
					<Image
						src="/icons/icon-nexo.png"
						alt="Nexo Logo"
						width={100}
						height={100}
						className="mx-auto mb-4"
					/>
					<h1 className="text-3xl font-bold text-[#171717]">Nexo</h1>
					<h3 className="text-lg text-[#525252] mt-2">Iniciar sesión</h3>
				</div>

				{/* Login Form */}
				<form onSubmit={onSubmit} className="space-y-5">
					<div className="space-y-1">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<User className="text-gray-400" size={18} />
							</div>
							<Input
								value={usuario}
								onChange={(e) => setUsuario(e.target.value)}
								type="text"
								placeholder="Usuario"
								className="pl-10 bg-white text-black border-neutral-300 focus:ring-2 focus:ring-[#171717]/40 focus:border-[#171717] transition-all duration-200 placeholder-neutral-400"
							/>
						</div>
					</div>

					<div className="space-y-1">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Lock className="text-gray-400" size={18} />
							</div>
							<Input
								value={contraseña}
								onChange={(e) => setContraseña(e.target.value)}
								type={showPassword ? 'text' : 'password'}
								placeholder="Contraseña"
								className="pl-10 bg-white text-black border-neutral-300 focus:ring-2 focus:ring-[#171717]/40 focus:border-[#171717] transition-all duration-200 placeholder-neutral-400"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((p) => !p)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
								tabIndex={-1}
							>
								{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
							</button>
						</div>
					</div>

					{error && (
						<div className="p-3 bg-red-500/10 text-red-600 text-sm rounded-lg border border-red-500/30">
							{error}
						</div>
					)}

					<Button
						type="submit"
						disabled={loading}
						className="w-full py-2 bg-[#171717] hover:bg-[#0a0a0a] text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
					>
						{loading ? 'Iniciando sesión...' : 'Acceder al sistema'}
					</Button>
				</form>

				<div className="mt-6 text-center text-sm text-neutral-500">
					<p>Sistema de gestión para Nexo</p>
				</div>
			</div>
		</div>
	);
}
