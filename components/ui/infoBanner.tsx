import { Info, AlertTriangle, CircleCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoBannerProps {
	title?: string;
	children: React.ReactNode;
	variant?: 'info' | 'warning' | 'success';
}

export function InfoBanner({ title = 'Información', children, variant = 'info' }: InfoBannerProps) {
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

	return (
		<div className={cn('flex gap-4 rounded-lg border p-4', style.container)}>
			<div
				className={cn(
					'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
					style.iconContainer
				)}
			>
				<Icon className={cn('h-5 w-5', style.icon)} />
			</div>

			<div className="space-y-1">
				<h3 className={cn('font-semibold', style.title)}>{title}</h3>

				<div className={cn('text-sm leading-6', style.text)}>{children}</div>
			</div>
		</div>
	);
}
