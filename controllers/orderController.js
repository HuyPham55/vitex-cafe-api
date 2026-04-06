const Order = require('../models/Order');
const Product = require('../models/Product');
const StoreSettings = require('../models/StoreSettings');
const Discount = require('../models/Discount');

// Helper: get next available date for a product given its availableDays and store hours
function getNextAvailableDate(availableDays, openTime, closeTime) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const currentDay = now.getDay(); // 0=Sun, 6=Sat
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    // Check if today is available and still within store hours
    if (availableDays.includes(currentDay) && currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
        return null; // Available right now
    }

    // Find the next available day
    for (let offset = 0; offset <= 7; offset++) {
        const checkDay = (currentDay + offset) % 7;
        if (availableDays.includes(checkDay)) {
            // If it's today but we're past close time or before open, skip to next occurrence
            if (offset === 0 && (currentMinutes > closeMinutes || currentMinutes < openMinutes)) {
                // If before open time today, it's available later today
                if (currentMinutes < openMinutes) {
                    const nextDate = new Date(now);
                    nextDate.setHours(openH, openM, 0, 0);
                    return nextDate;
                }
                continue; // Past close time, skip to next day
            }
            if (offset === 0) continue; // Already checked above
            const nextDate = new Date(now);
            nextDate.setDate(nextDate.getDate() + offset);
            nextDate.setHours(openH, openM, 0, 0);
            return nextDate;
        }
    }
    return null;
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const settings = await StoreSettings.findOne();
        const { customerName, items, note, total, isAnonymous, discountCode } = req.body;

        // Check stock status for all items
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        for (const item of items) {
            const product = productMap[item.product];
            if (!product) {
                return res.status(400).json({ message: `Product not found: ${item.name || item.product}` });
            }
            if (!product.inStock) {
                return res.status(400).json({ message: `${product.name} is currently out of stock` });
            }
        }

        // Check availability (day + time) for pre-order detection
        let isPreOrder = false;
        let latestDeliveryDate = null;

        if (settings) {
            for (const item of items) {
                const product = productMap[item.product];
                const availableDays = product.availableDays && product.availableDays.length > 0
                    ? product.availableDays
                    : [1, 2, 3, 4, 5]; // Default Mon-Fri

                const nextDate = getNextAvailableDate(availableDays, settings.openTime, settings.closeTime);
                if (nextDate) {
                    isPreOrder = true;
                    if (!latestDeliveryDate || nextDate > latestDeliveryDate) {
                        latestDeliveryDate = nextDate;
                    }
                }
            }
        }

        let validDiscount = null;
        if (discountCode) {
            const discount = await Discount.findOne({ code: discountCode.trim().toUpperCase() });
            if (!discount || !discount.isActive) return res.status(400).json({ message: 'Invalid or inactive discount code' });
            if (discount.expiresAt && new Date() > discount.expiresAt) return res.status(400).json({ message: 'Discount code has expired' });
            if (discount.quantity !== null && discount.quantity !== undefined && discount.usedCount >= discount.quantity) return res.status(400).json({ message: 'Discount code limit reached' });
            
            let applies = false;
            const applicableIds = discount.applicableProducts.map(id => id.toString());
            if (applicableIds.length === 0) applies = true;
            else {
                for (const item of items) {
                    if (applicableIds.includes(item.product.toString())) applies = true;
                }
            }
            if (!applies) return res.status(400).json({ message: 'Discount code not applicable to this order' });

            validDiscount = discount;
        }

        const order = new Order({
            customerName,
            items,
            note,
            total,
            isAnonymous: !!isAnonymous,
            discountCode: validDiscount ? validDiscount.code : undefined,
            isPreOrder,
            estimatedDeliveryDate: latestDeliveryDate,
            paymentDescription: settings ? settings.paymentDescription : '',
        });

        const createdOrder = await order.save();

        if (validDiscount) {
            validDiscount.usedCount += 1;
            await validDiscount.save();
        }

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

// @desc    Update order items (admin only)
// @route   PATCH /api/orders/:id/items
// @access  Private/Admin
const updateOrderItems = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const { items, note, total, customerName, isAnonymous } = req.body;
        const settings = await StoreSettings.findOne();

        // Recalculate isPreOrder and estimatedDeliveryDate if items changed
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        let isPreOrder = false;
        let latestDeliveryDate = null;

        if (settings) {
            for (const item of items) {
                const product = productMap[item.product];
                if (!product) continue;
                const availableDays = product.availableDays && product.availableDays.length > 0
                    ? product.availableDays
                    : [1, 2, 3, 4, 5];

                const nextDate = getNextAvailableDate(availableDays, settings.openTime, settings.closeTime);
                if (nextDate) {
                    isPreOrder = true;
                    if (!latestDeliveryDate || nextDate > latestDeliveryDate) {
                        latestDeliveryDate = nextDate;
                    }
                }
            }
        }

        order.items = items;
        order.note = note !== undefined ? note : order.note;
        order.customerName = isAnonymous ? 'Anonymous' : customerName || order.customerName;
        order.isAnonymous = isAnonymous !== undefined ? isAnonymous : order.isAnonymous;
        order.total = total;
        order.isPreOrder = isPreOrder;
        order.estimatedDeliveryDate = latestDeliveryDate;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Create new order by admin (bypasses stock check)
// @route   POST /api/orders/admin
// @access  Private/Admin
const createOrderByAdmin = async (req, res) => {
    try {
        const settings = await StoreSettings.findOne();
        const { customerName, items, note, total, isAnonymous } = req.body;

        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => { productMap[p._id.toString()] = p; });

        // Check availability (day + time) for pre-order detection
        let isPreOrder = false;
        let latestDeliveryDate = null;

        if (settings) {
            for (const item of items) {
                const product = productMap[item.product];
                if (!product) {
                    return res.status(400).json({ message: `Product not found: ${item.name || item.product}` });
                }
                const availableDays = product.availableDays && product.availableDays.length > 0
                    ? product.availableDays
                    : [1, 2, 3, 4, 5];

                const nextDate = getNextAvailableDate(availableDays, settings.openTime, settings.closeTime);
                if (nextDate) {
                    isPreOrder = true;
                    if (!latestDeliveryDate || nextDate > latestDeliveryDate) {
                        latestDeliveryDate = nextDate;
                    }
                }
            }
        }

        const order = new Order({
            customerName,
            items,
            note,
            total,
            isAnonymous: !!isAnonymous,
            isPreOrder,
            estimatedDeliveryDate: latestDeliveryDate,
            paymentDescription: settings ? settings.paymentDescription : '',
            paymentStatus: 'paid', // Admin orders usually assumed paid or handled manually
            status: 'pending'
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
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
    updateOrderItems,
    createOrderByAdmin,
};
