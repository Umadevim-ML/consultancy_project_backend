const Questionnaire = require('../models/Questionnaire');
const Recommendation = require('../models/Recommendation');
const Product = require('../models/Product');

// @desc    Submit questionnaire & generate recommendation
// @route   POST /api/recommendations
// @access  Private
const generateRecommendation = async (req, res) => {
    try {
        console.log('Incoming Questionnaire Data:', req.body);
        const {
            age,
            weight,
            height,
            sleepPosition,
            backPain,
            shoulderPain,
            firmnessPreference,
            budgetRange,
            mattressSize,
            hasPartner,
            temperaturePreference,
        } = req.body;

        const questionnaire = await Questionnaire.create({
            user: req.user._id,
            age,
            weight,
            height,
            sleepPosition,
            backPain,
            shoulderPain,
            firmnessPreference,
            budgetRange,
            mattressSize,
            hasPartner,
            temperaturePreference,
        });

        // Recommendation Logic (Rule-based)
        let query = {};

        // 1. Firmness Match
        if (sleepPosition === 'Back' || backPain) {
            // Orthopedic / Firm recommended
            if (weight > 90) {
                query.firmness = { $in: ['Firm', 'Extra Firm'] };
            } else {
                query.firmness = { $in: ['Medium', 'Firm', 'Medium-Firm', 'Extra Firm', 'Adjustable'] };
            }
        } else if (sleepPosition === 'Side') {
            // Side sleepers need pressure relief
            query.firmness = { $in: ['Soft', 'Medium-Soft', 'Medium', 'Adjustable'] };
        } else {
            // Stomach or Combination
            if (firmnessPreference === 'Soft') {
                query.firmness = { $in: ['Soft', 'Medium-Soft'] };
            } else if (firmnessPreference === 'Medium') {
                query.firmness = { $in: ['Medium', 'Medium-Firm', 'Medium-Soft'] };
            } else {
                query.firmness = { $in: ['Firm', 'Extra Firm', 'Medium-Firm'] };
            }
        }

        // 2. Size
        if (mattressSize) {
            query.size = mattressSize;
        }

        // Find products matching basic criteria
        console.log('Recommendation Query:', query);
        let products = await Product.find(query);
        console.log(`Found ${products.length} products with initial query.`);

        // FALLBACK 1: If no products found with exact size, try without size constraint
        if (products.length === 0 && query.size) {
            delete query.size;
            products = await Product.find(query);
        }

        // FALLBACK 2: If still no products, fetch all products
        if (!products || products.length === 0) {
            products = await Product.find({});
        }

        // Scoring & Filtering
        const scoredProducts = products.map(p => {
            let score = 0;
            let reasons = [];

            // Base match
            score += 50;

            // Pain relief match
            if (backPain && (p.category === 'Orthopedic' || p.firmness === 'Firm' || p.firmness === 'Extra Firm')) {
                score += 20;
                reasons.push('Excellent for back pain support');
            }

            // Shoulder pain match
            if (shoulderPain && (p.firmness === 'Soft' || p.firmness === 'Medium-Soft')) {
                score += 15;
                reasons.push('Great pressure relief for shoulders');
            }

            // Temperature match
            if (
                temperaturePreference === 'Cool' &&
                ((p.features && (p.features.includes('Cooling') || p.features.includes('Cooling Gel'))) || p.category === 'Cooling')
            ) {
                score += 15;
                reasons.push('Cooling technology included');
            }

            // Size match bonus
            if (mattressSize && p.size === mattressSize) {
                score += 10;
                reasons.push('Available in your preferred size');
            }

            // Partner match
            if (hasPartner && p.features && p.features.includes('Motion Isolation')) {
                score += 10;
                reasons.push('Motion isolation for couples');
            }

            return {
                product: p._id,
                score,
                reason: reasons.join('. ') || 'Matches your preferences',
            };
        });

        // Sort by score descending
        scoredProducts.sort((a, b) => b.score - a.score);

        // Keep top 3
        const top3 = scoredProducts.slice(0, 3);

        const recommendation = await Recommendation.create({
            user: req.user._id,
            questionnaire: questionnaire._id,
            recommendedProducts: top3,
        });

        // Populate the products before sending response
        const populatedRecommendation = await Recommendation.findById(recommendation._id)
            .populate('recommendedProducts.product');

        res.status(201).json(populatedRecommendation);
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ message: 'Error generating recommendation', error: error.message });
    }
};

// @desc    Get user recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const recommendations = await Recommendation.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('recommendedProducts.product');

        res.json(recommendations);
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Error fetching recommendations', error: error.message });
    }
};

module.exports = { generateRecommendation, getRecommendations };
