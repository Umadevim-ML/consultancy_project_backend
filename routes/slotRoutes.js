
const express = require('express');
const router = express.Router();
const {
    getSlots,
    getAvailableSlots,
    addSlot,
    deleteSlot
} = require('../controllers/slotController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getSlots)
    .post(protect, admin, addSlot);

router.route('/available/:date')
    .get(protect, getAvailableSlots);

router.route('/:id')
    .delete(protect, admin, deleteSlot);

module.exports = router;
