const express = require('express');
const router = express.Router();
const {
    getTodayMenu,
    parseMenu,
    saveMenu,
    getSettings,
    updateSettings,
    getTodayOrders,
    getOrdersHistory,
    createLunchOrder,
} = require('../controllers/lunchController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/menu/today', getTodayMenu);
router.post('/menu/parse', protect, parseMenu);
router.post('/menu', protect, saveMenu);

router.get('/settings', getSettings);
router.patch('/settings', protect, updateSettings);

router.get('/orders/today', optionalAuth, getTodayOrders);
router.get('/orders/history', protect, getOrdersHistory);
router.post('/orders', optionalAuth, createLunchOrder);

module.exports = router;
