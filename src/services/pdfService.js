const PDFDocument = require('pdfkit');

const generatePDF = (first_name, last_name, pathway, reasoning, confidence_score) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument(); //Creates a new blank PDF document. Like opening a new Word document.
        const buffers = [];   //An empty array that will collect the PDF data in chunks as it's being built.

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

        doc.end() //Tells PDFKit "I'm done adding content, finish building the PDF now." This is what triggers 
        // the end event above.
    });
};

module.exports = generatePDF;



// return new Promise((resolve, reject)
// PDFKit generates the PDF asynchronously — meaning it doesn't finish instantly. A Promise is how JavaScript
//  handles "I'll give you the result when it's done."

// resolve = success, here's the result
// reject = something went wrong


// doc.on('data', (chunk) => { buffers.push(chunk); })PDFKit doesn't build the entire PDF at once.
//  It builds it in small pieces called chunks. Every time it finishes a piece it fires this data event. 
// You're just saying "every time a chunk is ready, push it into the buffers array." Think of it like filling
//  a bucket one cup at a time.


// doc.on('end', () => resolve(Buffer.concat(buffers)))
// When PDFKit is completely done building the PDF it fires the end event. At that point you take 
// all the chunks in the buffers array and combine them into one complete PDF with Buffer.concat. Then 
// resolve hands that completed PDF back to whoever called generatePDF.

// doc.on('error', reject)
// If something goes wrong while building the PDF, reject fires which gets caught by 
// your try/catch in the controller.




//Flow
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