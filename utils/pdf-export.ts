import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PdfColumn<T> {
	header: string;
	accessor: keyof T | ((row: T) => string | number);
	width?: number;
}

export interface ExportPdfOptions<T> {
	fileName: string;
	columns: PdfColumn<T>[];
	data: T[];
	title?: string;
	subtitle?: string;
	orientation?: 'portrait' | 'landscape';
}

export function exportTableToPdf<T>({
	fileName,
	columns,
	data,
	title,
	subtitle,
	orientation = 'portrait',
}: ExportPdfOptions<T>): void {
	const doc = new jsPDF({ orientation });
	let startY = 15;

	if (title) {
		doc.setFontSize(14);
		doc.text(title, 14, startY);
		startY += 7;
	}

	if (subtitle) {
		doc.setFontSize(10);
		doc.setTextColor(100);
		doc.text(subtitle, 14, startY);
		startY += 6;
	}

	const head = [columns.map((col) => col.header)];
	const body = data.map((row) =>
		columns.map((col) => {
			const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
			return value === null || value === undefined ? '' : String(value);
		})
	);

	autoTable(doc, {
		startY,
		head,
		body,
		theme: 'grid',
		tableWidth: 'auto',

		styles: {
			fontSize: 8,
			cellPadding: 2,
			overflow: 'linebreak',
			valign: 'middle',
			halign: 'center',
			lineColor: [220, 220, 220],
			lineWidth: 0.2,
		},

		headStyles: {
			fillColor: [41, 128, 185],
			textColor: 255,
			fontStyle: 'bold',
			halign: 'center',
		},

		bodyStyles: {
			textColor: 40,
		},

		alternateRowStyles: {
			fillColor: [245, 245, 245],
		},

		columnStyles: columns.reduce(
			(acc, col, i) => {
				if (col.width) {
					acc[i] = { cellWidth: col.width };
				} else {
					acc[i] = { cellWidth: 'wrap' };
				}
				return acc;
			},
			{} as Record<number, any>
		),

		didDrawPage: (data) => {
			const pageCount = doc.getNumberOfPages();
			doc.setFontSize(9);
			doc.setTextColor(120);

			doc.text(
				`Página ${data.pageNumber} de ${pageCount}`,
				doc.internal.pageSize.getWidth() - 20,
				doc.internal.pageSize.getHeight() - 8,
				{ align: 'center' }
			);
		},
	});

	doc.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
