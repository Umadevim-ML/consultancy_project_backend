
const twilio = require('twilio');

/**
 * Sends an SMS message using Twilio
 * @param {string} to - The recipient's phone number (with country code, e.g., '+911234567890')
 * @param {string} message - The message content
 */
const sendSMS = async (to, message) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER; // Format: '+1234567890' (Twilio number)

    if (!accountSid || !authToken || !fromNumber || !to) {
        console.warn('Twilio credentials or recipient number missing. SMS notification skipped.');
        return;
    }

    try {
        const client = twilio(accountSid, authToken);
        
        const response = await client.messages.create({
            body: message,
            from: fromNumber,
            to: to
        });

        console.log(`SMS message sent! SID: ${response.sid}`);
    } catch (error) {
        console.error('Error sending SMS message:', error);
    }
};

module.exports = { sendSMS };
