const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByNumber,
    updatePaymentStatus,
    updateOrderStatus,
    selfPay,
    updateOrderItems,
    createOrderByAdmin,
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/active', optionalAuth, getOrders); // Public route for live status
router.get('/lookup/:orderNumber', optionalAuth, getOrderByNumber);

router.route('/')
    .get(protect, getOrders)
    .post(optionalAuth, createOrder);

router.post('/admin', protect, createOrderByAdmin);

router.route('/:id').get(optionalAuth, getOrderById);
router.post('/:id/self-pay', optionalAuth, selfPay);
router.patch('/:id/payment', protect, updatePaymentStatus);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/items', protect, updateOrderItems);

module.exports = router;
