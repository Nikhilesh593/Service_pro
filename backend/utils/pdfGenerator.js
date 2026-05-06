const PDFDocument = require('pdfkit');

exports.generateServiceReport = (request, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ServiceReport-${request._id}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(20).text('Service Completion Report', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Report ID: ${request._id}`);
  doc.text(`Date: ${new Date().toLocaleDateString()}`);
  doc.moveDown();

  doc.text(`Customer Name: ${request.userId.name}`);
  doc.text(`Customer Email: ${request.userId.email}`);
  doc.moveDown();

  doc.text(`Assigned Provider: ${request.assignedTo ? request.assignedTo.name : 'N/A'}`);
  doc.text(`Provider Role: ${request.assignedTo ? request.assignedTo.role : 'N/A'}`);
  doc.moveDown();

  doc.fontSize(14).text('Job Details:', { underline: true });
  doc.fontSize(12).text(`Service Type: ${request.serviceType}`);
  doc.text(`Urgency: ${request.urgency}`);
  doc.text(`Location: ${request.location}`);
  doc.text(`Description: ${request.description}`);
  doc.text(`Status: ${request.status}`);

  doc.end();
};
