const Consultation = require('../models/Consultation');
const Slot = require('../models/Slot');
const { createNotification, notifyAdmins } = require('../utils/notification');

// @desc    Book a consultation
// @route   POST /api/consultations
// @access  Private
const bookConsultation = async (req, res) => {
    const { date, time, issueDescription, slotId } = req.body;

    try {
        const consultation = await Consultation.create({
            user: req.user._id,
            date,
            time,
            issueDescription,
        });

        // Mark slot as booked if slotId is provided
        if (slotId) {
            await Slot.findByIdAndUpdate(slotId, { isBooked: true });
        }

        // Notify User
        await createNotification(
            req.user._id,
            'Consultation Booked',
            `Your consultation for ${new Date(date).toLocaleDateString()} at ${time} has been booked.`,
            'Consultation',
            '/my-consultations'
        );

        // Notify Admins
        await notifyAdmins(
            'New Consultation Booked',
            `${req.user.name} has booked a consultation for ${new Date(date).toLocaleDateString()} at ${time}.`,
            'Consultation',
            '/admin/consultations'
        );

        res.status(201).json(consultation);
    } catch (error) {
        res.status(400).json({ message: 'Invalid consultation data', error: error.message });
    }
};

// @desc    Admin book a consultation for a user
// @route   POST /api/consultations/admin
// @access  Private/Admin
const adminBookConsultation = async (req, res) => {
    const { userId, date, time, issueDescription } = req.body;

    try {
        const consultation = await Consultation.create({
            user: userId, // Admin specifies the user
            date,
            time,
            issueDescription,
        });

        // Notify User
        await createNotification(
            userId,
            'Appointment Booked',
            `An appointment has been booked for you on ${new Date(date).toLocaleDateString()} at ${time} by an administrator.`,
            'Consultation',
            '/my-consultations'
        );

        // Notify Admins
        await notifyAdmins(
            'Appointment Booked (Admin)',
            `An appointment has been booked for user ID: ${userId} on ${new Date(date).toLocaleDateString()} at ${time}.`,
            'Consultation',
            '/admin/consultations'
        );

        res.status(201).json(consultation);
    } catch (error) {
        res.status(400).json({ message: 'Invalid consultation data', error: error.message });
    }
};

// @desc    Get user consultations
// @route   GET /api/consultations/myconsultations
// @access  Private
const getMyConsultations = async (req, res) => {
    const consultations = await Consultation.find({ user: req.user._id });
    res.json(consultations);
};

// @desc    Get all consultations
// @route   GET /api/consultations
// @access  Private/Admin
const getConsultations = async (req, res) => {
    const consultations = await Consultation.find({}).populate('user', 'id name email');
    res.json(consultations);
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id
// @access  Private/Admin
const updateConsultationStatus = async (req, res) => {
    const consultation = await Consultation.findById(req.params.id);

    if (consultation) {
        consultation.status = req.body.status || consultation.status;
        const updatedConsultation = await consultation.save();

        // Notify User
        await createNotification(
            consultation.user,
            'Consultation Update',
            `Your consultation status has been updated to ${consultation.status}.`,
            'Consultation',
            '/my-consultations'
        );

        res.json(updatedConsultation);
    } else {
        res.status(404).json({ message: 'Consultation not found' });
    }
};

// @desc    Delete a consultation
// @route   DELETE /api/consultations/:id
// @access  Private/Admin
const deleteConsultation = async (req, res) => {
    const consultation = await Consultation.findById(req.params.id);

    if (consultation) {
        // Find the corresponding slot and mark it as NOT booked
        const start = new Date(consultation.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(consultation.date);
        end.setHours(23, 59, 59, 999);

        await Slot.findOneAndUpdate(
            { date: { $gte: start, $lte: end }, time: consultation.time },
            { isBooked: false }
        );

        await Consultation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Consultation removed' });
    } else {
        res.status(404).json({ message: 'Consultation not found' });
    }
};

// @desc    Cancel a consultation
// @route   PUT /api/consultations/:id/cancel
// @access  Private
const cancelConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }

        // Check if the consultation belongs to the user
        if (consultation.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (consultation.status === 'Completed' || consultation.status === 'Cancelled' || consultation.status === 'Rejected') {
            return res.status(400).json({ message: `Cannot cancel a ${consultation.status} appointment` });
        }

        consultation.status = 'Cancelled';
        const updatedConsultation = await consultation.save();

        // Find the corresponding slot and mark it as NOT booked
        const start = new Date(consultation.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(consultation.date);
        end.setHours(23, 59, 59, 999);
        await Slot.findOneAndUpdate(
            { date: { $gte: start, $lte: end }, time: consultation.time },
            { isBooked: false }
        );

        // Notify User
        await createNotification(
            req.user._id,
            'Consultation Cancelled',
            `Your consultation for ${new Date(consultation.date).toLocaleDateString()} has been cancelled.`,
            'Consultation',
            '/my-consultations'
        );

        // Notify Admins
        await notifyAdmins(
            'Consultation Cancelled by User',
            `${req.user.name} has cancelled their consultation for ${new Date(consultation.date).toLocaleDateString()}.`,
            'Consultation',
            '/admin/consultations'
        );

        res.json(updatedConsultation);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    bookConsultation,
    adminBookConsultation,
    getMyConsultations,
    getConsultations,
    updateConsultationStatus,
    deleteConsultation,
    cancelConsultation,
};
