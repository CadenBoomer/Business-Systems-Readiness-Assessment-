const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// transporter
// Think of it like setting up your email client. You're telling nodemailer "use Gmail, and here 
// are the credentials to log in with." It's like configuring Outlook before you can send emails.
//This must be later configured to send from Julie's email of choosing, not my own

//  strings don't have a .map() method, only arrays do.

const sendMail = async (toEmail, first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, pdfBuffer) => {

    //     This checks before trying to use it:
    // Array.isArray(priority_actions) — is it already an array?
    // If YES → use it directly
    // If NO → it must be a string, so JSON.parse() converts it back into an array
    // So now it handles both cases and .map() always gets a proper array to work with.
    // Think of it as a safety check — "make sure this is actually an array before I try to loop through it."
    // The ? is the ternary operator — it's basically a shorthand if/else on one line.

    const actions = Array.isArray(priority_actions) ? priority_actions : JSON.parse(priority_actions);
    const warnings = Array.isArray(anti_priority_warnings) ? anti_priority_warnings : JSON.parse(anti_priority_warnings);

    //     - `Array.isArray(priority_actions)` → is `priority_actions` an array?
    // - `?` → if YES...
    // - `priority_actions` → just use it as is
    // - `:` → if NO...
    // - `JSON.parse(priority_actions)` → convert it from a string back into an array

    // So it's basically saying:
    // ```
    // Is priority_actions already an array?
    //   YES → great, use it directly as actions
    //   NO  → it must be a string, parse it into an array first
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Assessment Results',
        html: `
        <h1>Hi ${first_name} ${last_name},</h1>
      <h2>Your Pathway: ${pathway}</h2>
      <p><strong>Reasoning:</strong> ${reasoning}</p>
      <p><strong>Confidence Score:</strong> ${(parseFloat(confidence_score) * 100).toFixed(0)}%</p>
        <h3>Summary</h3>
        <p>${summary}</p>

        <h3>Priority Actions</h3>
        <ol>
            ${actions.map(action => `<li>${action}</li>`).join('')}
        </ol>

        <h3>Warnings</h3>
        <ul>
             ${warnings.map(warning => `<li>${warning}</li>`).join('')}
        </ul>

        <h3>Graduation Outlook</h3>
        <p>${graduation_outlook}</p>
      <br/>
      <p>Thank you for completing the assessment!</p>
    `,
        attachments: [
            {
                filename: 'Assessment Results.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]

    };
    await transporter.sendMail(mailOptions);

}

module.exports = sendMail;



// 1. Call ML API → get pathway/reasoning/confidence
// 2. Save to database
// 3. Send email to user
// 4. Send response back to frontend



// pdfBuffer
// A buffer is just raw binary data stored in memory. When generatePDF runs it doesn't save a file to your
// computer — it just holds the PDF data in memory as a buffer. You then pass that chunk of data directly
// into the email attachment. No file ever gets saved to disk, it just flows through memory straight into
// the email.


// Good question. Think of it this way:
// Without pdfBuffer:
// generatePDF runs → PDF saved as a file on disk → email reads file → sends it
// With pdfBuffer:
// generatePDF runs → PDF held in memory → passed directly to email → sends it
// The buffer is just the PDF data living in memory temporarily. We use it because:

// No disk storage needed — you don't want to save thousands of PDF files on your server, one per user submission
// Faster — reading from memory is faster than reading from disk
// Cleaner — data flows straight from generation to email without leaving any files behind

// So pdfBuffer is basically the PDF in transit — generated, handed to the email, sent, then gone.



// ${(parseFloat(confidence_score) * 100).toFixed(0)}%
// Breaking it down piece by piece:

// parseFloat(confidence_score) → converts "0.95" to the actual number 0.95 in case it came in as a string
// * 100 → turns 0.95 into 95
// .toFixed(0) → removes any decimal places so it shows 95 not 95.0000
// % → just adds the percent sign after

// So 0.95 becomes 95% in the email. Clean and readable for the user instead of showing a raw decimal.



// ${} vs {}
// The ${} is used inside template literals (the backtick strings). It lets you embed JavaScript expressions directly into a string. Regular {} is just an object or code block.
// So:
// javascript// Regular string - can't do this:
// "Hi " + first_name + " your score is " + score

// // Template literal - cleaner:
// `Hi ${first_name} your score is ${score}`
// Same result, template literals are just way more readable.


// Why .map().join('') instead of forEach?
// Inside an HTML template literal you can't use forEach directly. So instead:

// .map() converts each array item into an <li> string
// .join('') combines them all into one string that can be dropped into the HTML