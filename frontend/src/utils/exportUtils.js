import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = (orders, title = 'Orders Report') => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  const rows = orders.map(o => [
    o.orderNumber, o.customer?.name || 'N/A',
    o.items?.map(i => `${i.name} x${i.quantity}`).join(', '),
    formatCurrency(o.totalAmount), o.status, o.paymentMethod,
    formatDate(o.createdAt),
  ]);

  doc.autoTable({
    startY: 36,
    head: [['Order #', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [249, 115, 22] },
  });

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToExcel = (orders, filename = 'orders') => {
  const data = orders.map(o => ({
    'Order #': o.orderNumber,
    'Customer': o.customer?.name || 'N/A',
    'Phone': o.customer?.phone || 'N/A',
    'Items': o.items?.map(i => `${i.name} x${i.quantity}`).join(', '),
    'Total': o.totalAmount,
    'Status': o.status,
    'Payment': o.paymentMethod,
    'Date': new Date(o.createdAt).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
