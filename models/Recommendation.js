
const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    questionnaire: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Questionnaire',
    },
    recommendedProducts: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
            score: { type: Number }, // Match score
            reason: { type: String }, // 'Recommended for your back pain'
        },
    ],
}, { timestamps: true });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;
