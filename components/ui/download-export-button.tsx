import { exportTableToPdf, PdfColumn } from '@/utils/pdf-export';
import { exportTableToCsv, exportTableToExcel, TableColumn } from '@/utils/csv-export';
import { FileDown } from 'lucide-react';

export type ExportFormat = 'pdf' | 'csv' | 'excel';

interface DownloadExportButtonProps<T> {
	data: T[];
	columns: PdfColumn<T>[];
	fileName: string;
	format: ExportFormat;
	title?: string;
	subtitle?: string;
	orientation?: 'portrait' | 'landscape';
	label?: string;
	sheetName?: string; // only used for Excel
	className?: string;
}

export function DownloadExportButton<T>({
	data,
	columns,
	fileName,
	format,
	title,
	subtitle,
	orientation,
	label,
	sheetName,
	className,
}: DownloadExportButtonProps<T>) {
	const DEFAULT_LABELS: Record<ExportFormat, string> = {
		pdf: 'Descargar PDF',
		csv: 'Descargar CSV',
		excel: 'Descargar Excel',
	};

	const handleClick = () => {
		switch (format) {
			case 'pdf':
				exportTableToPdf<T>({ fileName, columns, data, title, subtitle, orientation });
				break;
			case 'csv':
				exportTableToCsv<T>({ fileName, columns, data });
				break;
			case 'excel':
				exportTableToExcel<T>({ fileName, columns, data, sheetName });
				break;
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
		>
			<FileDown className="h-4 w-4" />
			<span> {label ?? DEFAULT_LABELS[format]}</span>
		</button>
	);
}
