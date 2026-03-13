// utils/sendEmail.js
import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Brevo client
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send transactional email via Brevo
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - Email message content
 */
export const sendEmail = async (to, subject, message) => {
  try {
    const response = await emailApi.sendTransacEmail({
      sender: {
        email: "ajy020605@gmail.com",
        name: "Civic Setu"
      },
      to: [{ email: to }],
      subject: subject,
      textContent: message, // plain-text fallback
      htmlContent: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2 style="color: #2E86C1;">${subject}</h2>
          <p>${message}</p>
          <p>Regards,<br/><strong>Civic Setu Team</strong></p>
        </div>
      ` // HTML email content
    });

    console.log("Email request sent. Brevo response:", response);
  } catch (error) {
    console.error("Email failed:", error.response?.body || error);
  }
};