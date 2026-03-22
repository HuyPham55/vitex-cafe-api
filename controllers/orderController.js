const Order = require('../models/Order');
const StoreSettings = require('../models/StoreSettings');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const settings = await StoreSettings.findOne();
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Check if store is open
        if (settings) {
            const [openH, openM] = settings.openTime.split(':').map(Number);
            const [closeH, closeM] = settings.closeTime.split(':').map(Number);
            const openMinutes = openH * 60 + openM;
            const closeMinutes = closeH * 60 + closeM;

            if (currentTime < openMinutes || currentTime > closeMinutes) {
                return res.status(400).json({ message: 'Store is currently closed' });
            }
        }

        const { customerName, items, note, total, isAnonymous } = req.body;
        const order = new Order({
            customerName,
            items,
            note,
            total,
            isAnonymous: !!isAnonymous,
            paymentDescription: settings ? settings.paymentDescription : '',
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = { $in: req.query.status.split(',') };
        }
        const orders = await Order.find(filter).sort({ createdAt: -1 });

        // Mask names for unauthenticated requests (public live status)
        if (!req.user) {
            const maskedOrders = orders.map(order => {
                if (order.isAnonymous) {
                    const orderObj = order.toObject();
                    return { ...orderObj, customerName: 'Anonymous' };
                }
                return order;
            });
            return res.json(maskedOrders);
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Mask name if anonymous and not admin
        if (order.isAnonymous && !req.user) {
            const orderObj = order.toObject();
            return res.json({ ...orderObj, customerName: 'Anonymous' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order payment status
// @route   PATCH /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.paymentStatus = req.body.paymentStatus;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = req.body.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get order by number
// @route   GET /api/orders/lookup/:orderNumber
// @access  Public
const getOrderByNumber = async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Mask name if anonymous and not admin
        if (order.isAnonymous && !req.user) {
            const orderObj = order.toObject();
            return res.json({ ...orderObj, customerName: 'Anonymous' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Customer self-report payment
// @route   POST /api/orders/:id/self-pay
// @access  Public
const selfPay = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.paymentStatus === 'paid') {
            return res.json(order); // Already paid, just return
        }

        order.paymentStatus = 'paid';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByNumber,
    updatePaymentStatus,
    updateOrderStatus,
    selfPay,
};
