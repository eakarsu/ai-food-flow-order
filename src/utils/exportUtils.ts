import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  accessor: string | ((row: any) => string);
}

function getValueFromRow(row: any, accessor: ExportColumn['accessor']): string {
  if (typeof accessor === 'function') {
    return accessor(row);
  }
  const val = row[accessor];
  if (val == null) return '';
  return String(val);
}

export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  filename: string
) {
  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = getValueFromRow(row, col.accessor);
      // Escape values containing commas, quotes, or newlines
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
  );

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join(
    '\n'
  );

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportToPDF(
  data: any[],
  columns: ExportColumn[],
  title: string,
  filename: string
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

  const headers = columns.map((col) => col.header);
  const rows = data.map((row) =>
    columns.map((col) => getValueFromRow(row, col.accessor))
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(`${filename}.pdf`);
}
