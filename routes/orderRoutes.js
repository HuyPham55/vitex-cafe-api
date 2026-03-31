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
const { protect } = require('../middleware/authMiddleware');

router.get('/active', getOrders); // Public route for live status
router.get('/lookup/:orderNumber', getOrderByNumber);

router.route('/')
    .get(protect, getOrders)
    .post(createOrder);

router.post('/admin', protect, createOrderByAdmin);

router.route('/:id').get(getOrderById);
router.post('/:id/self-pay', selfPay);
router.patch('/:id/payment', protect, updatePaymentStatus);
router.patch('/:id/status', protect, updateOrderStatus);
router.patch('/:id/items', protect, updateOrderItems);

module.exports = router;
