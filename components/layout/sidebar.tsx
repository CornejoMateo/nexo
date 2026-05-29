'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import {
	LayoutDashboard,
	Package,
	ShoppingCart,
	Settings,
	DollarSign,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const mainNavItems = [
	{
		title: 'Panel',
		href: '/',
		icon: LayoutDashboard,
	},
	{
		title: 'Productos',
		href: '/products',
		icon: Package,
	},
	{
		title: 'Ventas',
		href: '/sales',
		icon: ShoppingCart,
	},
	{
		title: 'Configuracion',
		href: '/settings',
		icon: Settings,
	},
];

export function Sidebar() {
	const pathname = usePathname();
	const { sidebarOpen, setSidebarOpen, exchangeRate } = useStore();

	return (
		<aside
			className={cn(
				'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
				sidebarOpen ? 'w-64' : 'w-16'
			)}
		>
			<div className="flex h-full flex-col">
				{/* Header */}
				<div className="flex h-16 items-center justify-between border-b border-border px-4">
					{sidebarOpen && (
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
								<Image src="/nexo-icon.png" alt="Nexo" width={32} height={32} />
							</div>
							<span className="font-semibold text-foreground">Nexo</span>
						</div>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="h-8 w-8 text-muted-foreground hover:text-foreground"
					>
						{sidebarOpen ? (
							<ChevronLeft className="h-4 w-4" />
						) : (
							<ChevronRight className="h-4 w-4" />
						)}
					</Button>
				</div>

				{/* Exchange Rate Widget */}
				{sidebarOpen && (
					<div className="border-b border-border p-4">
						<div className="rounded-lg bg-accent/10 p-3">
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<DollarSign className="h-3 w-3" />
								<span>Tipo de Cambio</span>
							</div>
							<div className="mt-1 flex items-baseline gap-1">
								<span className="text-xl font-bold text-foreground">
									${exchangeRate.rate.toLocaleString()}
								</span>
								<span className="text-xs text-muted-foreground">ARS</span>
							</div>
						</div>
					</div>
				)}

				{/* Main Navigation */}
				<nav className="flex-1 overflow-y-auto p-2">
					<div className="space-y-1">
						{mainNavItems.map((item) => {
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
										isActive
											? 'bg-sidebar-accent text-sidebar-accent-foreground'
											: 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
									)}
								>
									<item.icon className="h-4 w-4 shrink-0" />
									{sidebarOpen && <span>{item.title}</span>}
								</Link>
							);
						})}
					</div>
				</nav>

				{/* User Info */}
				{sidebarOpen && (
					<div className="border-t border-border p-4">
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
								<span className="text-sm font-medium">CA</span>
							</div>
							<div className="flex-1 overflow-hidden">
								<p className="truncate text-sm font-medium text-foreground">Ramiro</p>
								<p className="truncate text-xs text-muted-foreground">Administrador</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
