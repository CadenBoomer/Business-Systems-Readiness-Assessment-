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
// This must be later configured to send from Julie's email of choosing, not my own

const sendMail = async (toEmail, first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, pdfBuffer) => {

    // Parse if they come in as strings
    // Array.isArray checks if it's already an array — if yes use it directly, if no parse it from string
    const actions = Array.isArray(priority_actions) ? priority_actions : JSON.parse(priority_actions);
    const warnings = Array.isArray(anti_priority_warnings) ? anti_priority_warnings : JSON.parse(anti_priority_warnings);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,

        // Subject line includes the pathway so user sees their result immediately in inbox
        subject: `Your Business Systems Pathway Results — ${pathway}`,

        // All styles are inline because email clients like Gmail strip external CSS
        // Inline styles are the only reliable way to style HTML emails
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #FAFAFA; border: 1px solid #ddd;">
            
            <!-- Header — black background matching brand -->
            <div style="background-color: #0C0F0A; padding: 20px 32px;">
                <span style="color: #FFFFFF; font-size: 18px; font-weight: 700;">
                    Business Systems Pathway Assessment Tool
                </span>
            </div>

            <!-- Pathway Badge — pink pill showing the user their result immediately -->
            <div style="padding: 32px 32px 0 32px;">
                <div style="display: inline-block; background-color: #FF206E; color: #FFFFFF; font-size: 18px; font-weight: 700; padding: 10px 28px; border-radius: 50px;">
                    ${pathway}
                </div>
            </div>

            <!-- Greeting — personalized with first and last name -->
            <div style="padding: 24px 32px 0 32px;">
                <p style="font-size: 16px; color: #0C0F0A; margin: 0;">
                    Hi <strong>${first_name} ${last_name}</strong>,
                </p>
                <!-- confidence_score comes in as decimal e.g 0.94 
                     parseFloat converts it to number, * 100 makes it 94, toFixed(0) removes decimals -->
                <p style="font-size: 14px; color: #555555; margin: 8px 0 0 0;">
                    Confidence Score: ${(parseFloat(confidence_score) * 100).toFixed(0)}%
                </p>
            </div>

            <!-- Divider line -->
            <div style="border-top: 1px solid #ddd; margin: 24px 32px;"></div>

            <!-- Your Assessment — raw ML reasoning -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 10px 0;">Your Assessment</h2>
                <p style="font-size: 14px; color: #333333; line-height: 1.7; margin: 0;">${reasoning}</p>
            </div>

            <!-- Business Systems Narrative — ML summary paragraph -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 10px 0;">Business Systems Narrative</h2>
                <p style="font-size: 14px; color: #333333; line-height: 1.7; margin: 0;">${summary}</p>
            </div>

            <!-- Priority Actions 
                 .map() loops through the array and converts each item into an HTML div
                 .join('') combines them all into one string to drop into the template
                 index + 1 because arrays start at 0 but we want to display 1, 2, 3 -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 12px 0;">Recommended Focus Areas</h2>
                ${actions.map((action, index) => `
                    <div style="background-color: #41EAD4; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 14px; color: #0C0F0A;">
                        ${index + 1}. ${action}
                    </div>
                `).join('')}
            </div>

            <!-- Warnings — same pattern as priority actions but yellow background -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 12px 0;">What to Avoid Right Now</h2>
                ${warnings.map((warning, index) => `
                    <div style="background-color: #FBFF12; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 14px; color: #0C0F0A;">
                        ${index + 1}. ${warning}
                    </div>
                `).join('')}
            </div>

            <!-- Graduation Outlook — what becomes possible next -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 10px 0;">Graduation Outlook</h2>
                <p style="font-size: 14px; color: #333333; line-height: 1.7; margin: 0;">${graduation_outlook}</p>
            </div>

            <div style="border-top: 1px solid #ddd; margin: 0 32px;"></div>

            <!-- CTA Section — drives user to book a call or explore the membership -->
            <div style="padding: 24px 32px;">
                <p style="font-size: 14px; color: #555555; margin: 0 0 16px 0;">
                    Your full results report is attached as a PDF. Ready to take the next step?
                </p>
                <!-- href should be updated to Julie's actual booking/membership URL -->
                <a href="https://thewebsitemembership.com" 
                   style="display: inline-block; background-color: #FF206E; color: #FFFFFF; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 14px; font-weight: 700;">
                    Explore The Website Membership
                </a>
            </div>

            <!-- Footer — black background matching header -->
            <div style="background-color: #0C0F0A; padding: 16px 32px; text-align: center;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                    Generated by The Website Membership — Business Systems Pathway Assessment
                </p>
            </div>

        </div>
        `,

        // PDF attached as binary buffer — no file saved to disk
        // pdfBuffer is the PDF data held in memory, passed directly into the attachment
        attachments: [
            {
                filename: 'Assessment Results.pdf',
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;



// pdfBuffer
// A buffer is just raw binary data stored in memory. When generatePDF runs it doesn't save a file to your
// computer — it just holds the PDF data in memory as a buffer. You then pass that chunk of data directly
// into the email attachment. No file ever gets saved to disk, it just flows through memory straight into
// the email.

// Why .map().join('') instead of forEach?
// Inside an HTML template literal you can't use forEach directly. So instead:
// .map() converts each array item into an HTML string
// .join('') combines them all into one string that can be dropped into the HTML

// Why inline styles?
// Email clients like Gmail, Outlook etc strip out external stylesheets and <style> tags
// Inline styles are the only reliable way to ensure your email looks consistent across all email clients