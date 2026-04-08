const PDFDocument = require('pdfkit');
const path = require('path');

const generatePDF = (first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', (chunk) => { buffers.push(chunk); });
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Font paths
        const regularFont = path.join(__dirname, '../assets/LeagueSpartan-Regular.ttf');
        const boldFont = path.join(__dirname, '../assets/LeagueSpartan-Bold.ttf');
        const logoPath = path.join(__dirname, '../assets/the website membership icon.png');

        // Brand colors
        const pink = '#FF206E';
        const black = '#0C0F0A';
        const yellow = '#FBFF12';
        const grey = '#555555';
        const white = '#FFFFFF';

        // Strip markdown formatting
        const cleanNarrative = narrativeReport
            ? narrativeReport
                .replace(/#{1,6}\s/g, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/•/g, '-')
                .replace(/---/g, '')
                .trim()
            : 'No report generated.';

        // ── HEADER ──────────────────────────────────────────
        doc.image(logoPath, 50, 30, { width: 40 });
        doc.font(boldFont).fontSize(14).fillColor(black)
            .text('Business Systems Pathway Assessment Tool', 100, 42, { align: 'left' });
        doc.moveTo(50, 80).lineTo(545, 80).strokeColor('#dddddd').lineWidth(1).stroke();
        doc.moveDown(2);

        // ── PATHWAY BADGE ────────────────────────────────────
        doc.roundedRect(50, 95, 200, 36, 18)
            .fillColor(pink)
            .fill();
        doc.font(boldFont).fontSize(16).fillColor(white)
            .text(pathway, 50, 104, { width: 200, align: 'center' });
        doc.moveDown(3);

        // ── NAME ─────────────────────────────────────────────
        doc.font(boldFont).fontSize(13).fillColor(black)
            .text(`${first_name} ${last_name}`, 50, 145);
        doc.moveTo(50, 165).lineTo(545, 165).strokeColor('#dddddd').lineWidth(1).stroke();
        doc.moveDown(2);

        // ── YOUR PERSONALIZED REPORT (Claude narrative) ──────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Your Personalized Report', 50, 178);
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(11).fillColor(black)
            .text(cleanNarrative, { lineGap: 4 });

        doc.y = doc.y + 20;

        // ── RECOMMENDED FOCUS AREAS (pink pills, white text) ─
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Recommended Focus Areas');
        doc.moveDown(0.8);

        const actions = Array.isArray(priority_actions) ? priority_actions : JSON.parse(priority_actions);

        actions.forEach((action) => {
            const yPos = doc.y;
            const textHeight = doc.heightOfString(action, { width: 475 });
            const pillHeight = Math.max(36, textHeight + 16);

            doc.roundedRect(50, yPos, 495, pillHeight, 6)
                .fillColor(pink)
                .fill();

            doc.font(regularFont).fontSize(11).fillColor(white)
                .text(action, 60, yPos + 10, { width: 475 });

            doc.y = yPos + pillHeight + 10;
        });

        doc.moveDown(2);

        // ── WHAT TO AVOID (yellow pills, black text) ─────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('What to Avoid Right Now');
        doc.moveDown(0.8);

        const warnings = Array.isArray(anti_priority_warnings) ? anti_priority_warnings : JSON.parse(anti_priority_warnings);

        warnings.forEach((warning) => {
            const yPos = doc.y;
            const textHeight = doc.heightOfString(warning, { width: 475 });
            const pillHeight = Math.max(36, textHeight + 16);

            doc.roundedRect(50, yPos, 495, pillHeight, 6)
                .fillColor(yellow)
                .fill();

            doc.font(regularFont).fontSize(11).fillColor(black)
                .text(warning, 60, yPos + 10, { width: 475 });

            doc.y = yPos + pillHeight + 10;
        });

        doc.moveDown(2);

        // ── GRADUATION OUTLOOK ───────────────────────────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Graduation Outlook');
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(11).fillColor(black)
            .text(graduation_outlook, { lineGap: 4 });

        doc.moveDown(2);

        // ── FOOTER ───────────────────────────────────────────
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#dddddd').lineWidth(1).stroke();
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(10).fillColor(grey)
            .text('Generated by The Website Membership — Business Systems Pathway Assessment',
                { align: 'center' });

        doc.end();
    });
};

module.exports = generatePDF;