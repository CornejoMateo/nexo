import { useEffect, useRef, useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';

export type BarcodeFormat =
	| 'CODE128'
	| 'CODE128A'
	| 'CODE128B'
	| 'CODE128C'
	| 'EAN13'
	| 'EAN8'
	| 'EAN5'
	| 'EAN2'
	| 'UPC'
	| 'CODE39'
	| 'ITF14'
	| 'ITF'
	| 'MSI'
	| 'MSI10'
	| 'MSI11'
	| 'MSI1010'
	| 'MSI1110'
	| 'pharmacode'
	| 'codabar';

interface BarcodeGeneratorProps {
	value: string;
	format?: BarcodeFormat;
	width?: number;
	height?: number;
	displayValue?: boolean;
	fontSize?: number;
	background?: string;
	lineColor?: string;
	margin?: number;
	className?: string;
	showDownload?: boolean;
	fileName?: string;
	onError?: (error: string) => void;
}

export function BarcodeGenerator({
	value,
	format = 'CODE128',
	width = 2,
	height = 100,
	displayValue = true,
	fontSize = 16,
	background = '#ffffff',
	lineColor = '#000000',
	margin = 10,
	className,
	showDownload = false,
	fileName = 'barcode',
	onError,
}: BarcodeGeneratorProps) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!svgRef.current || !value) return;

		try {
			JsBarcode(svgRef.current, value, {
				format,
				width,
				height,
				displayValue,
				fontSize,
				background,
				lineColor,
				margin,
			});
			setError(null);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : 'Valor inválido para este formato de código de barras';
			setError(msg);
			onError?.(msg);
		}
	}, [
		value,
		format,
		width,
		height,
		displayValue,
		fontSize,
		background,
		lineColor,
		margin,
		onError,
	]);

	const handleDownload = useCallback(() => {
		if (!svgRef.current) return;

		const svgData = new XMLSerializer().serializeToString(svgRef.current);
		const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(svgBlob);

		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;

			ctx.fillStyle = background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(img, 0, 0);
			URL.revokeObjectURL(url);

			canvas.toBlob((blob) => {
				if (!blob) return;
				const link = document.createElement('a');
				link.href = URL.createObjectURL(blob);
				link.download = `${fileName}.png`;
				link.click();
				URL.revokeObjectURL(link.href);
			});
		};
		img.src = url;
	}, [background, fileName]);

	if (error) {
		return (
			<div className={className} role="alert" style={{ color: '#dc2626', fontSize: 14 }}>
				{error}
			</div>
		);
	}

	return (
		<div className={className}>
			<svg ref={svgRef} />
			{showDownload && (
				<button type="button" onClick={handleDownload} style={{ marginTop: 8 }}>
					Descargar PNG
				</button>
			)}
		</div>
	);
}
