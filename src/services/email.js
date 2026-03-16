const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (toEmail, first_name, pathway, reasoning, confidence_score, pdfBuffer) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'Assessment Results',
        html: `
        <h1>Hi ${first_name},</h1>
      <h2>Your Pathway: ${pathway}</h2>
      <p><strong>Reasoning:</strong> ${reasoning}</p>
      <p><strong>Confidence Score:</strong> ${(parseFloat(confidence_score) * 100).toFixed(0)}%</p>
      <br/>
      <p>Thank you for completing the assessment!</p>
    `,
        attachments:[
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