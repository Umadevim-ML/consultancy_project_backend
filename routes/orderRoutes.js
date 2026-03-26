
const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderToShipped,
    cancelOrder,
    getMyOrders,
    getOrders,
    createRazorpayOrder,
    verifyRazorpayPayment,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/ship').put(protect, admin, updateOrderToShipped);
router.route('/:id/cancel').put(protect, admin, cancelOrder);
router.route('/:id/razorpay').post(protect, createRazorpayOrder);
router.route('/:id/verify-payment').post(protect, verifyRazorpayPayment);

module.exports = router;
