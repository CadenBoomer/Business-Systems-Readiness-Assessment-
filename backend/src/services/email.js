const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendMail = async (toEmail, first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport, pdfBuffer, settings = {}) => {

    const ctaButtonText = settings.cta_button_text || 'Explore The Website Membership';
    const ctaButtonUrl = settings.cta_button_url || 'https://thewebsitemembership.com';

    const actions = Array.isArray(priority_actions) ? priority_actions : JSON.parse(priority_actions);
    const warnings = Array.isArray(anti_priority_warnings) ? anti_priority_warnings : JSON.parse(anti_priority_warnings);

    const cleanNarrative = narrativeReport
        ? narrativeReport
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            // .replace(/•/g, '-')
            .replace(/---/g, '')
            .replace(/^Personalized Intro\s*/gm, '')
            .replace(/^Business Systems Narrative\s*/gm, '')
            .replace(/^Recommended Focus Areas\s*/gm, '')
            .replace(/^Graduation Outlook\s*/gm, '')
            .trim()
        : '';

    const bulletIndex = cleanNarrative.indexOf('•');
    const narrativeProse = bulletIndex === -1 ? cleanNarrative : cleanNarrative.substring(0, bulletIndex).trim();
    const narrativeBullets = bulletIndex === -1 ? [] : cleanNarrative
        .substring(bulletIndex)
        .split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.replace('•', '').trim());

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: `Your Business Systems Pathway Results — ${pathway}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #FAFAFA; border: 1px solid #ddd;">
            
            <!-- Header -->
            <div style="background-color: #0C0F0A; padding: 20px 32px;">
                <span style="color: #FFFFFF; font-size: 18px; font-weight: 700;">
                    Business Systems Pathway Assessment Tool
                </span>
            </div>

            <!-- Pathway Badge -->
            <div style="padding: 32px 32px 0 32px;">
                <div style="display: inline-block; background-color: #FF206E; color: #FFFFFF; font-size: 18px; font-weight: 700; padding: 10px 28px; border-radius: 50px;">
                    ${pathway}
                </div>
            </div>

            <!-- Greeting -->
            <div style="padding: 24px 32px 0 32px;">
                <p style="font-size: 16px; color: #0C0F0A; margin: 0;">
                    Hi <strong>${first_name} ${last_name}</strong>,
                </p>
            </div>

            <!-- Divider -->
            <div style="border-top: 1px solid #ddd; margin: 24px 32px;"></div>

            <!-- Your Personalized Report (prose only) -->
                <div style="padding: 0 32px 24px 32px;">
                    <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 10px 0;">Your Personalized Report</h2>
                    <p style="font-size: 14px; color: #333333; line-height: 1.7; margin: 0; white-space: pre-wrap;">${narrativeProse}</p>
                </div>

                <!-- Recommended Focus Areas — Claude bullets as pink pills -->
                <div style="padding: 0 32px 24px 32px;">
                    <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 12px 0;">Recommended Focus Areas</h2>
                    ${narrativeBullets.map((bullet) => `
                        <div style="background-color: #FF206E; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 14px; color: #FFFFFF;">
                    ${bullet}
                </div>
            `).join('')}
            </div>

            <!-- What to Avoid — yellow pills with black text -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 12px 0;">What to Avoid Right Now</h2>
                ${warnings.map((warning) => `
                    <div style="background-color: #FBFF12; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 14px; color: #0C0F0A;">
                        ${warning}
                    </div>
                `).join('')}
            </div>

            <!-- Graduation Outlook -->
            <div style="padding: 0 32px 24px 32px;">
                <h2 style="font-size: 16px; color: #FF206E; margin: 0 0 10px 0;">Graduation Outlook</h2>
                <p style="font-size: 14px; color: #333333; line-height: 1.7; margin: 0;">${graduation_outlook}</p>
            </div>

            <div style="border-top: 1px solid #ddd; margin: 0 32px;"></div>

            <!-- CTA Section -->
            <div style="padding: 40px 32px;">
                <h2 style="font-size: 18px; font-weight: 700; color: #0C0F0A; margin: 0 0 12px 0;">Ready To Take The Next Step?</h2>
                <p style="font-size: 14px; color: #555555; margin: 0 0 16px 0;">
                    Download your full results report as a PDF — it's attached to this email.
                </p>
                <a href="${ctaButtonUrl}" 
                style="display: inline-block; background-color: #FF206E; color: #FFFFFF; padding: 12px 32px; border-radius: 50px; text-decoration: none; font-size: 14px; font-weight: 700;">
                    ${ctaButtonText}
                </a>
            </div>

            <!-- Footer -->
            <div style="background-color: #0C0F0A; padding: 16px 32px; text-align: center;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                    Generated by The Website Membership — Business Systems Pathway Assessment
                </p>
            </div>

        </div>
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
};

const sendNotification = async (toEmail, first_name, last_name, email, pathway, pdfBuffer) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: `New Assessment Submission — ${first_name} ${last_name}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #FAFAFA; border: 1px solid #ddd;">
            
            <div style="background-color: #0C0F0A; padding: 20px 32px;">
                <span style="color: #FFFFFF; font-size: 18px; font-weight: 700;">
                    New Assessment Submission
                </span>
            </div>

            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #0C0F0A; margin: 0 0 16px 0;">
                    A new assessment has been completed.
                </p>
                <p style="font-size: 15px; color: #333; margin: 0 0 8px 0;">
                    <strong>Name:</strong> ${first_name} ${last_name}
                </p>
                <p style="font-size: 15px; color: #333; margin: 0 0 8px 0;">
                    <strong>Email:</strong> ${email}
                </p>
                <p style="font-size: 15px; color: #333; margin: 0 0 8px 0;">
                    <strong>Pathway:</strong> ${pathway}
                </p>
                <p style="font-size: 14px; color: #555; margin: 16px 0 0 0;">
                    The full results PDF is attached.
                </p>
            </div>

            <div style="background-color: #0C0F0A; padding: 16px 32px; text-align: center;">
                <p style="color: #888888; font-size: 12px; margin: 0;">
                    The Website Membership — Business Systems Pathway Assessment
                </p>
            </div>

        </div>
        `,
        attachments: [
            {
                filename: `${first_name}_${last_name}_Assessment.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendMail, sendNotification };