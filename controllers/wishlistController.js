
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:id
// @access  Private
const addToWishlist = async (req, res) => {
    try {
        const productId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Product added to wishlist',
            wishlist: updatedUser.wishlist
        });
    } catch (error) {
        console.error('ADD TO WISHLIST ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = async (req, res) => {
    try {
        const productId = req.params.id;

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { wishlist: productId } },
            { new: true }
        ).populate('wishlist');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Product removed from wishlist',
            wishlist: updatedUser.wishlist
        });
    } catch (error) {
        console.error('REMOVE FROM WISHLIST ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.wishlist || []);
    } catch (error) {
        console.error('GET WISHLIST ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
