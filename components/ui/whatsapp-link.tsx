'use client';

import { cn } from '@/lib/utils';
import { Phone } from 'lucide-react';
import Link from 'next/link';

interface WhatsAppLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	phone: string;
	message?: string;
	children?: React.ReactNode;
	className?: string;
	iconClassName?: string;
}

export function WhatsAppLink({
	phone,
	message = '',
	children,
	className = '',
	iconClassName = 'h-3 w-3 mr-1 text-muted-foreground flex-shrink-0',
	...props
}: WhatsAppLinkProps) {
	const whatsappNumber = toWhatsAppNumber(phone);
	const whatsappUrl = `https://wa.me/${whatsappNumber}${
		message ? `?text=${encodeURIComponent(message)}` : ''
	}`;

	return (
		<Link
			href={whatsappUrl}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'inline-flex items-center text-xs text-foreground hover:text-primary transition-colors',
				className
			)}
			{...props}
		>
			<Phone className={iconClassName} />
			{children || phone}
		</Link>
	);
}

const toWhatsAppNumber = (phone: string): string => {
	const digits = phone.replace(/\D/g, '');
	if (!digits) return '';
	if (digits.startsWith('549')) return digits;
	if (digits.startsWith('54')) return digits;
	const local = digits.replace(/^0+/, '').replace(/^15/, '');
	return `549${local}`;
};
