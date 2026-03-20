
const Slot = require('../models/Slot');

// @desc    Get all slots
// @route   GET /api/slots
// @access  Private/Admin
const getSlots = async (req, res) => {
    try {
        const slots = await Slot.find({}).sort({ date: 1, time: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get available slots for a date
// @route   GET /api/slots/available/:date
// @access  Private
const getAvailableSlots = async (req, res) => {
    try {
        const date = new Date(req.params.date);
        // Start of day and end of day for the date
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));

        const slots = await Slot.find({
            date: { $gte: start, $lte: end }
        }).sort({ time: 1 });

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a new slot
// @route   POST /api/slots
// @access  Private/Admin
const addSlot = async (req, res) => {
    const { date, time } = req.body;

    try {
        const slotExists = await Slot.findOne({ date: new Date(date), time });

        if (slotExists) {
            return res.status(400).json({ message: 'Slot already exists' });
        }

        const slot = await Slot.create({
            date: new Date(date),
            time,
            isBooked: false
        });

        res.status(201).json(slot);
    } catch (error) {
        res.status(400).json({ message: 'Invalid slot data', error: error.message });
    }
};

// @desc    Delete a slot
// @route   DELETE /api/slots/:id
// @access  Private/Admin
const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        if (slot.isBooked) {
            return res.status(400).json({ message: 'Cannot delete a booked slot' });
        }

        await Slot.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getSlots,
    getAvailableSlots,
    addSlot,
    deleteSlot
};
