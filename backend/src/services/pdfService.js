const PDFDocument = require('pdfkit');
const path = require('path');

const generatePDF = (first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        // Creates a new PDF document with 50px margins on all sides. buffers is an empty array 
        // that will collect the data chunks as they stream out.

        doc.on('data', (chunk) => { buffers.push(chunk); });
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Three event listeners — every time a chunk of PDF data is ready, push it into the array. 
        // When the document finishes, stitch all chunks into one complete buffer and resolve the promise with it. If anything goes wrong, reject.

        // Font paths
        const regularFont = path.join(__dirname, '../assets/LeagueSpartan-Regular.ttf');
        const boldFont = path.join(__dirname, '../assets/LeagueSpartan-Bold.ttf');
        const logoPath = path.join(__dirname, '../assets/the website membership icon.png');

        // Brand colors
        const pink = '#FF206E';
        const black = '#0C0F0A';
        const teal = '#41EAD4';
        const yellow = '#FBFF12';
        const grey = '#555555';
        const offWhite = '#FAFAFA';

        // Strip markdown formatting for PDF
        const cleanNarrative = narrativeReport
            ? narrativeReport
                .replace(/#{1,6}\s/g, '')        // remove ## headings
                .replace(/\*\*(.*?)\*\*/g, '$1') // remove **bold**
                .replace(/\*(.*?)\*/g, '$1')     // remove *italic*
                .replace(/•/g, '-')              // replace bullets
                .replace(/---/g, '')  // remove horizontal rules
                .trim()
            : 'No report generated.';


        // ── HEADER ──────────────────────────────────────────
        doc.image(logoPath, 50, 30, { width: 40 });
        // Places the logo at x=50, y=30, scaled to 40px wide. Height scales automatically to keep the proportions.

        doc.font(boldFont).fontSize(14).fillColor(black)
            .text('Business Systems Pathway Assessment Tool', 100, 42, { align: 'left' });
        // Sets the font to bold, size 14, color black, then writes the header title at x=100, y=42 — sitting to the right
        // of the logo. align: 'left' aligns the text to the left within the available width.

        doc.moveTo(50, 80).lineTo(545, 80).strokeColor('#dddddd').lineWidth(1).stroke();
        doc.moveDown(2);

        // moveTo lifts the pen to x=50, y=80. lineTo draws across to x=545, y=80. strokeColor sets it light grey,
        // lineWidth(1) makes it 1px, stroke() renders it.
        // doc.moveDown moves the cursor down 2 line-heights to create space before the next element.

        // ── PATHWAY BADGE ────────────────────────────────────
        doc.roundedRect(50, 95, 200, 36, 18)
            .fillColor(pink)
            .fill();

        // Draws a rectangle at x=50, y=95 that is 200px wide and 36px tall. Corner radius of 18 
        // (half the height) makes it a pill shape. fillColor sets it pink, fill() paints it.

        doc.font(boldFont).fontSize(16).fillColor('#FFFFFF')
            .text(pathway, 50, 104, { width: 200, align: 'center' });

        // Writes the pathway name in white bold 16px. x=50 and width: 200 define a text box matching the 
        // badge width exactly so align: 'center' centres the text inside it. y=104 vertically centres the text inside 
        // the 36px tall badge.

        doc.moveDown(3);

        // ── NAME ─────────────────────────────────────────────
        doc.font(boldFont).fontSize(13).fillColor(black)
            .text(`${first_name} ${last_name}`, 50, 145);
        doc.font(regularFont).fontSize(11).fillColor(grey)
            .text(`Confidence Score: ${(parseFloat(confidence_score) * 100).toFixed(0)}%`, 50, 162);

        doc.moveTo(50, 182).lineTo(545, 182).strokeColor('#dddddd').lineWidth(1).stroke();
        doc.moveDown(2);

        // ── YOUR ASSESSMENT ──────────────────────────────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Your Assessment', 50, 195);
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(11).fillColor(black)
            .text(reasoning, { lineGap: 4 });

        // Writes the reasoning text in regular black. No x/y coordinates so it flows from the current cursor
        // position. lineGap: 4 adds 4px extra spacing between lines.

        doc.moveDown(1.5);

        // Narrative Report
        doc.moveDown(1.5);
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Your Personalized Report');
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(11).fillColor(black)
            .text(cleanNarrative, { lineGap: 4 });

        doc.y = doc.y + 20; // add space after narrative

        // ── BUSINESS SYSTEMS NARRATIVE ───────────────────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Business Systems Narrative');
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(11).fillColor(black)
            .text(summary, { lineGap: 4 });

        doc.moveDown(1.5);

        // ── PRIORITY ACTIONS ─────────────────────────────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Recommended Focus Areas');
        doc.moveDown(0.8);

        const actions = Array.isArray(priority_actions) ? priority_actions : JSON.parse(priority_actions);
        // Safety check — if priority_actions is already an array use it directly, if it's a string parse it back 
        // into an array first.

        actions.forEach((action, index) => {
            // Loops through every action. action is the text, index is the position (0, 1, 2...).

            const yPos = doc.y;
            // Captures the current Y position before drawing so both the rectangle and the text inside it 
            // start at exactly the same spot.

            doc.roundedRect(50, yPos, 495, 36, 6)
                .fillColor(pink)
                .fill();
            // Draws a teal pill at the captured y position, 495px wide, 36px tall, 6px corner radius.

            doc.font(regularFont).fontSize(11).fillColor(black)
                .text(`${index + 1}.  ${action}`, 60, yPos + 12, { width: 475 });
            // Writes the numbered action text. x=60 indents it 10px from the pill's left edge. yPos + 12 drops 
            // it 12px from the top of the pill to vertically centre it. width: 475 keeps it inside the pill boundaries.

            doc.y = yPos + 46;
            // Instead of moveDown (which PDFKit miscalculates after drawing shapes), we directly set the
            // cursor to 46px below where this pill started. 36px is the pill height, 10px is the white gap
            // between pills. Increase the 10 to make gaps bigger.
        });

        doc.moveDown(2);
        // Gap between the teal block and the warnings section.

        // ── WARNINGS ─────────────────────────────────────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('What to Avoid Right Now');
        doc.moveDown(0.8);

        const warnings = Array.isArray(anti_priority_warnings) ? anti_priority_warnings : JSON.parse(anti_priority_warnings);
        // Same safety check as actions — ensures it's an array before looping.

        warnings.forEach((warning, index) => {
            // Loops through every warning. Same pattern as the teal pills, just yellow instead.

            const yPos = doc.y;
            // Captures current Y position before drawing.

            doc.roundedRect(50, yPos, 495, 36, 6)
                .fillColor(yellow)
                .fill();
            // Draws a yellow pill at the captured y position, 495px wide, 36px tall, 6px corner radius.

            doc.font(regularFont).fontSize(11).fillColor(black)
                .text(`${index + 1}.  ${warning}`, 60, yPos + 12, { width: 475 });
            // Same text positioning as teal pills.

            doc.y = yPos + 46;
            // Same manual cursor logic as teal pills — 36px pill + 10px gap.
        });

        doc.moveDown(2);
        // Gap before Graduation Outlook.

        // ── GRADUATION OUTLOOK ───────────────────────────────
        doc.font(boldFont).fontSize(14).fillColor(pink)
            .text('Graduation Outlook');
        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(11).fillColor(black)
            .text(graduation_outlook, { lineGap: 4 });

        doc.moveDown(2);

        // ── FOOTER ───────────────────────────────────────────
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#dddddd').lineWidth(1).stroke();
        // Footer divider line. Uses doc.y instead of a hardcoded number so it draws wherever 
        // the content above ended.

        doc.moveDown(0.5);
        doc.font(regularFont).fontSize(10).fillColor(grey)
            .text('Generated by The Website Membership — Business Systems Pathway Assessment',
                { align: 'center' });
        // Footer text in small grey, centred across the full page width.

        doc.end();
        // Tells PDFKit the document is finished, which triggers the end event and fires resolve 
        // with the complete buffer.
    });
};

module.exports = generatePDF;
// Exports the function so other files like your controller can import and call it.


// return new Promise((resolve, reject)
// PDFKit generates the PDF asynchronously — meaning it doesn't finish instantly. A Promise is how JavaScript
// handles "I'll give you the result when it's done."
// resolve = success, here's the result
// reject = something went wrong


// doc.on('data', (chunk) => { buffers.push(chunk); })
// PDFKit doesn't build the entire PDF at once. It builds it in small pieces called chunks. Every time it
// finishes a piece it fires this data event. You're just saying "every time a chunk is ready, push it into
// the buffers array." Think of it like filling a bucket one cup at a time.


// doc.on('end', () => resolve(Buffer.concat(buffers)))
// When PDFKit is completely done building the PDF it fires the end event. At that point you take
// all the chunks in the buffers array and combine them into one complete PDF with Buffer.concat. Then
// resolve hands that completed PDF back to whoever called generatePDF.

// doc.on('error', reject)
// If something goes wrong while building the PDF, reject fires which gets caught by
// your try/catch in the controller.


// Flow
// generatePDF is called
// → blank PDF created
// → content added line by line
// → doc.end() called
// → end event fires
// → all chunks combined into one PDF
// → resolve hands it back to the controller
// → controller sends it to the browser as a download


// PDFKit just fires its own custom events (data, end, error) instead of browser events like click or
// submit. Same concept though.


// priority_actions and anti_priority_warnings are arrays not strings. So you can't just do doc.text(priority_actions)
// because it would print something ugly. All on one line, no numbering, messy.
// So instead forEach loops through the array and prints each item on its own line.