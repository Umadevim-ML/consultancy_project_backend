
const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    sleepPosition: { type: String, required: true }, // Back, Side, Stomach, Combination
    backPain: { type: Boolean, required: true },
    shoulderPain: { type: Boolean, required: true },
    firmnessPreference: { type: String, required: true }, // Soft, Medium, Firm
    budgetRange: { type: String, required: true },
    mattressSize: { type: String, required: true },
    hasPartner: { type: Boolean, required: true },
    temperaturePreference: { type: String, required: true }, // Cool, Warm, Neutral
}, { timestamps: true });

const Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
module.exports = Questionnaire;
