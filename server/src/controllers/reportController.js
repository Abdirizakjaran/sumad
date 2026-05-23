import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import prisma from '../utils/prisma.js';

export const generateRevenueReport = async (req, res) => {
  const { format = 'json', from, to } = req.query;
  const dateFilter = {};
  if (from || to) {
    dateFilter.approvedAt = {};
    if (from) dateFilter.approvedAt.gte = new Date(from);
    if (to) dateFilter.approvedAt.lte = new Date(to);
  }

  const payments = await prisma.payment.findMany({
    where: dateFilter,
    include: {
      fine: { include: { vehicle: true } },
      createdBy: { select: { fullName: true } },
    },
    orderBy: { approvedAt: 'desc' },
  });

  const total = payments.reduce((s, p) => s + p.amount, 0);

  if (format === 'pdf') {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.pdf');
    doc.pipe(res);
    doc.fontSize(20).text('SUMAD TRAFFIC MGT - Revenue Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Total Revenue: $${total.toFixed(2)}`);
    doc.text(`Transactions: ${payments.length}`);
    doc.moveDown();
    payments.forEach((p) => {
      doc.text(
        `${p.receiptNumber} | ${p.fine.vehicle.plateNumber} | $${p.amount} | ${p.method}`
      );
    });
    doc.end();
    return;
  }

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Revenue');
    sheet.columns = [
      { header: 'Receipt', key: 'receipt', width: 20 },
      { header: 'Plate', key: 'plate', width: 15 },
      { header: 'Owner', key: 'owner', width: 25 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Method', key: 'method', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
    ];
    payments.forEach((p) => {
      sheet.addRow({
        receipt: p.receiptNumber,
        plate: p.fine.vehicle.plateNumber,
        owner: p.fine.vehicle.ownerFullName,
        amount: p.amount,
        method: p.method,
        date: p.approvedAt,
      });
    });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.xlsx');
    await workbook.xlsx.write(res);
    return;
  }

  res.json({ success: true, total, count: payments.length, payments });
};

export const generateFinesReport = async (req, res) => {
  const fines = await prisma.fine.findMany({
    include: { vehicle: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, fines, count: fines.length });
};

export const generateVehiclesReport = async (req, res) => {
  const vehicles = await prisma.vehicle.findMany({
    include: { _count: { select: { fines: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, vehicles, count: vehicles.length });
};
