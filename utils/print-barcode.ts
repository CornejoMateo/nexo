import JsBarcode from 'jsbarcode';

const escapeHtml = (value: string): string =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');

export function printBarcode(value: string, title = 'Código de barra'): void {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	let bodyContent: string;

	try {
		JsBarcode(svg, value, {
			format: 'CODE128',
			width: 2,
			height: 100,
			displayValue: true,
			fontSize: 18,
			margin: 10,
		});
		const svgString = new XMLSerializer().serializeToString(svg);
		bodyContent = `<div class="barcode-wrap">${svgString}</div>`;
	} catch {
		bodyContent = `<div class="barcode-fallback"><strong>${escapeHtml(value)}</strong></div>`;
	}

	const win = window.open('', '_blank');
	if (!win) return;

	win.document.open();
	win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 32px; }
  h3 { text-align: center; margin: 0 0 16px; font-size: 18px; }
  .barcode-wrap { display: flex; justify-content: center; }
  .barcode-wrap svg { height: auto; }
  .barcode-fallback { display: flex; justify-content: center; padding: 32px; border: 2px dashed #999; font-size: 24px; letter-spacing: 4px; }
  .hint { text-align: center; color: #888; font-size: 13px; margin-bottom: 24px; }
  @media print {
    body { padding: 0; }
    .hint { display: none; }
  }
</style>
</head>
<body>
  <p class="hint">Se abrirá el diálogo de impresión. Podés cerrar esta ventana al terminar.</p>
  <h3>${escapeHtml(title)}</h3>
  ${bodyContent}
  <script>
    window.onload = function () { setTimeout(function () { window.print(); }, 250); };
  </script>
</body>
</html>`);
	win.document.close();
}
