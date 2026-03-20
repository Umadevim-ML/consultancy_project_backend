
const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    isBooked: {
        type: Boolean,
        required: true,
        default: false,
    }
}, { timestamps: true });

// Ensure unique slot per date/time
slotSchema.index({ date: 1, time: 1 }, { unique: true });

const Slot = mongoose.model('Slot', slotSchema);

module.exports = Slot;
