const PDFDocument = require('pdfkit');

const generatePDF = (first_name, last_name, pathway, reasoning, confidence_score) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', (chunk) => {buffers.push(chunk);});
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
            
        //Header
        doc.fontSize(24).text('Business Systems Readiness Assessment', { align: 'center'})
        doc.moveDown();

        //User Info
        doc.fontSize(16).text (`Name: ${first_name} ${last_name}`);
        doc.moveDown();

        //Results
        doc.fontSize(20).text (`Pathway: ${pathway}`)
        doc.moveDown();

        doc.fontSize(14).text ('Reasoning:')
        doc.fontSize(12).text (reasoning)
        doc.moveDown();
        doc.fontSize(14).text (`Confidence Score: ${(parseFloat(confidence_score) * 100).toFixed(0)}%`);

        doc.end()
    });
};

module.exports = generatePDF;