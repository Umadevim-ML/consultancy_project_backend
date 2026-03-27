
const Notification = require('../models/Notification.js');
const User = require('../models/User.js');
const { sendSMS } = require('./sms.js');

const createNotification = async (userId, title, message, type, link = '') => {
    try {
        await Notification.create({
            user: userId,
            title,
            message,
            type,
            link,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

const notifyAdmins = async (title, message, type, link = '') => {
    try {
        // 1. Send inside system notifications
        const admins = await User.find({ isAdmin: true });
        for (const admin of admins) {
            await createNotification(admin._id, title, message, type, link);
        }

        // 2. Send SMS notification to the admin mobile number configured in .env
        const adminMobileNumber = process.env.ADMIN_MOBILE_NUMBER;
        if (adminMobileNumber) {
            // Respect the user's request: No raw ID and no link in the SMS message
            const smsMessage = `🔔 ${title}\n\n${message}`;
            console.log('Attempting to send SMS notification...');
            await sendSMS(adminMobileNumber, smsMessage);
        }

    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

module.exports = { createNotification, notifyAdmins };
