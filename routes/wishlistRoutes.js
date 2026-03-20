
const express = require('express');
const router = express.Router();
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getWishlist);

router.route('/:id')
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

module.exports = router;
