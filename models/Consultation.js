
const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    issueDescription: { type: String, required: true },
    status: {
        type: String,
        required: true,
        default: 'Pending', // Pending, Approved, Rejected, Completed
    },
}, { timestamps: true });

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;
