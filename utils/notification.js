
const Notification = require('../models/Notification.js');
const User = require('../models/User.js');

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
        const admins = await User.find({ isAdmin: true });
        for (const admin of admins) {
            await createNotification(admin._id, title, message, type, link);
        }
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

module.exports = { createNotification, notifyAdmins };
