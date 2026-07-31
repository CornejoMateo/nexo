'use client';

import { useState } from 'react';
import {
	Info,
	AlertTriangle,
	CircleCheck,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoSection {
	title?: string;
	children: React.ReactNode;
}

interface InfoBannerProps {
	title?: string;
	children?: React.ReactNode;
	variant?: 'info' | 'warning' | 'success';
	collapsible?: boolean;
	sections?: InfoSection[];
}

export function InfoBanner({
	title = 'Información',
	children,
	variant = 'info',
	collapsible = false,
	sections,
}: InfoBannerProps) {
	const [open, setOpen] = useState(!collapsible);
	const [page, setPage] = useState(0);

	const totalSections = sections?.length ?? 0;
	const pageSize = 3;
	const totalPages = Math.ceil(totalSections / pageSize);
	const isPaged = totalPages > 1;
	const visibleSections = sections?.slice(page * pageSize, page * pageSize + pageSize) ?? [];

	const config = {
		info: {
			icon: Info,
			container: 'border-blue-200 bg-blue-50',
			iconContainer: 'bg-blue-100',
			title: 'text-blue-900',
			text: 'text-blue-800',
		},
		warning: {
			icon: AlertTriangle,
			container: 'border-yellow-200 bg-yellow-50',
			iconContainer: 'bg-yellow-100',
			title: 'text-yellow-900',
			text: 'text-yellow-800',
		},
		success: {
			icon: CircleCheck,
			container: 'border-green-200 bg-green-50',
			iconContainer: 'bg-green-100',
			title: 'text-green-900',
			text: 'text-green-800',
		},
	};

	const style = config[variant];
	const Icon = style.icon;
	const showContent = !collapsible || open;

	return (
		<div className={cn('rounded-lg border p-4', style.container)}>
			<div className="flex items-start gap-4">
				<div
					className={cn(
						'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
						style.iconContainer
					)}
				>
					<Icon className={cn('h-5 w-5', style.title)} />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<h3 className={cn('font-semibold', style.title)}>{title}</h3>
						{collapsible && (
							<button
								type="button"
								onClick={() => setOpen((prev) => !prev)}
								aria-expanded={open}
								className={cn(
									'rounded-md p-1 transition-transform',
									style.title,
									open && 'rotate-180'
								)}
							>
								<ChevronDown className="h-4 w-4" />
							</button>
						)}
					</div>

					{showContent && (
						<div className="mt-2 space-y-3">
							{sections
								? isPaged
									? (() => (
											<>
												{visibleSections.map((section, index) => (
													<div key={index} className="space-y-1">
														{section.title && (
															<h4 className={cn('text-sm font-semibold', style.title)}>
																{section.title}
															</h4>
														)}
														<div className={cn('text-sm leading-6', style.text)}>
															{section.children}
														</div>
													</div>
												))}
												<div className="flex items-center justify-between pt-2">
													<button
														type="button"
														onClick={() => setPage((prev) => Math.max(0, prev - 1))}
														disabled={page === 0}
														aria-label="Secciones anteriores"
														className={cn('rounded-md p-1 disabled:opacity-40', style.title)}
													>
														<ChevronLeft className="h-4 w-4" />
													</button>
													<span className={cn('text-xs font-medium', style.title)}>
														{page + 1} / {totalPages}
													</span>
													<button
														type="button"
														onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
														disabled={page === totalPages - 1}
														aria-label="Siguientes secciones"
														className={cn('rounded-md p-1 disabled:opacity-40', style.title)}
													>
														<ChevronRight className="h-4 w-4" />
													</button>
												</div>
											</>
										))()
									: sections.map((section, index) => (
											<div key={index} className="space-y-1">
												{section.title && (
													<h4 className={cn('text-sm font-semibold', style.title)}>
														{section.title}
													</h4>
												)}
												<div className={cn('text-sm leading-6', style.text)}>
													{section.children}
												</div>
											</div>
										))
								: children && <div className={cn('text-sm leading-6', style.text)}>{children}</div>}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
