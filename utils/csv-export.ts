import * as XLSX from 'xlsx';
import { PdfColumn } from '@/utils/pdf-export';

export type TableColumn<T> = PdfColumn<T>;

function getValue<T>(row: T, col: TableColumn<T>): string | number {
	const value = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
	return value === null || value === undefined ? '' : (value as string | number);
}

function downloadBlob(blob: Blob, fileName: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export interface ExportCsvOptions<T> {
	fileName: string;
	columns: TableColumn<T>[];
	data: T[];
	separator?: string;
}

export function exportTableToCsv<T>({
	fileName,
	columns,
	data,
	separator = ',',
}: ExportCsvOptions<T>): void {
	const escape = (value: string | number) => {
		const str = String(value);
		if (str.includes(separator) || str.includes('"') || str.includes('\n')) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	const header = columns.map((c) => escape(c.header)).join(separator);
	const rows = data.map((row) => columns.map((col) => escape(getValue(row, col))).join(separator));
	const csvContent = [header, ...rows].join('\n');

	// \uFEFF (BOM) para que Excel reconozca tildes/ñ correctamente
	const blob = new Blob(['\uFEFF' + csvContent], {
		type: 'text/csv;charset=utf-8;',
	});
	downloadBlob(blob, fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
}

export interface ExportExcelOptions<T> {
	fileName: string;
	columns: TableColumn<T>[];
	data: T[];
	sheetName?: string;
}

export function exportTableToExcel<T>({
	fileName,
	columns,
	data,
	sheetName = 'Datos',
}: ExportExcelOptions<T>): void {
	const rows = data.map((row) => {
		const obj: Record<string, string | number> = {};
		columns.forEach((col) => {
			obj[col.header] = getValue(row, col);
		});
		return obj;
	});

	const worksheet = XLSX.utils.json_to_sheet(rows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
	XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}
