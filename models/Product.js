
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0, min: 0, max: 100 }, // Percentage off (0-100)
    countInStock: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    firmness: { type: String, required: true }, // e.g., Soft, Medium, Firm
    size: { type: String, required: true }, // e.g., Queen, King
    features: [{ type: String }],
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
