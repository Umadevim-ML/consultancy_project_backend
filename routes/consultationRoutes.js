
const express = require('express');
const router = express.Router();
const {
    bookConsultation,
    adminBookConsultation,
    getMyConsultations,
    getConsultations,
    updateConsultationStatus,
    deleteConsultation,
    cancelConsultation,
} = require('../controllers/consultationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, bookConsultation).get(protect, admin, getConsultations);
router.route('/myconsultations').get(protect, getMyConsultations);
router.route('/:id/cancel').put(protect, cancelConsultation);
router.route('/admin/book').post(protect, admin, adminBookConsultation);
router.route('/:id').put(protect, admin, updateConsultationStatus).delete(protect, admin, deleteConsultation);

module.exports = router;
