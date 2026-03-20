
const express = require('express');
const router = express.Router();
const { generateRecommendation, getRecommendations } = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, generateRecommendation).get(protect, getRecommendations);

module.exports = router;
