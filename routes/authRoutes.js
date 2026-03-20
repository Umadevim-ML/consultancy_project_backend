
const express = require('express');
const router = express.Router();
const { authUser, registerUser, getUserProfile, getUsers } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, admin, getUsers);

module.exports = router;
