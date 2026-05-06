const Order = require('../models/Order');
const LunchMenu = require('../models/LunchMenu');
const LunchSettings = require('../models/LunchSettings');

// Use Asia/Ho_Chi_Minh timezone (set via process.env.TZ in index.js)
function todayStr() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function nowMinutes() {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

function timeToMinutes(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
}

function minutesToTime(total) {
    const wrapped = ((total % 1440) + 1440) % 1440;
    const h = Math.floor(wrapped / 60);
    const m = wrapped % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

async function getOrCreateSettings() {
    let settings = await LunchSettings.findOne();
    if (!settings) {
        settings = await LunchSettings.create({});
    }
    return settings;
}

function parseRawMenu(rawText) {
    const lines = (rawText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const separatorRegex = /^rau(\s|:|$)/i; // matches "Rau có", "Rau:", "Rau"
    let separatorIndex = lines.findIndex(l => separatorRegex.test(l));
    const stripLeadingNumber = (s) => s.replace(/^\s*\d+\s*[\.\)\-:]\s*/, '').trim();

    let mainLines = lines;
    let vegLines = [];
    if (separatorIndex >= 0) {
        mainLines = lines.slice(0, separatorIndex);
        vegLines = lines.slice(separatorIndex + 1);
    }

    const mainDishes = mainLines.map(stripLeadingNumber).filter(Boolean).map(name => ({ name }));
    const vegetables = vegLines.map(stripLeadingNumber).filter(Boolean).map(name => ({ name }));
    return { mainDishes, vegetables };
}

// @desc    Get today's menu
// @route   GET /api/lunch/menu/today
// @access  Public
const getTodayMenu = async (req, res) => {
    try {
        const date = todayStr();
        const menu = await LunchMenu.findOne({ date });
        res.json(menu || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Parse raw menu text without saving
// @route   POST /api/lunch/menu/parse
// @access  Private/Admin
const parseMenu = async (req, res) => {
    try {
        const { rawText } = req.body || {};
        const parsed = parseRawMenu(rawText);
        res.json(parsed);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Save today's menu (parses on the server)
// @route   POST /api/lunch/menu
// @access  Private/Admin
const saveMenu = async (req, res) => {
    try {
        const { rawText, mainDishes, vegetables, cutoffTime } = req.body || {};
        const date = todayStr();

        let dishes = { mainDishes: mainDishes || [], vegetables: vegetables || [] };
        if (rawText && (!mainDishes || mainDishes.length === 0)) {
            dishes = parseRawMenu(rawText);
        }

        const menu = await LunchMenu.findOneAndUpdate(
            { date },
            {
                $set: {
                    rawText: rawText || '',
                    mainDishes: dishes.mainDishes,
                    vegetables: dishes.vegetables,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Reset cutoff date when a new menu is saved
        const settings = await getOrCreateSettings();
        settings.cutoffDate = date;
        if (cutoffTime) settings.cutoffTime = cutoffTime;
        await settings.save();

        res.status(201).json(menu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get lunch settings (cutoff, QR, pricing)
// @route   GET /api/lunch/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update lunch settings; supports +N minute extension via extendBy
// @route   PATCH /api/lunch/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        const settings = await getOrCreateSettings();
        const {
            cutoffTime,
            paymentQRImage,
            paymentInstructions,
            basePrice,
            extraMainPrice,
            baseMainsLimit,
            extendBy,
        } = req.body || {};

        if (cutoffTime !== undefined) settings.cutoffTime = cutoffTime;
        if (paymentQRImage !== undefined) settings.paymentQRImage = paymentQRImage;
        if (paymentInstructions !== undefined) settings.paymentInstructions = paymentInstructions;
        if (basePrice !== undefined) settings.basePrice = Number(basePrice);
        if (extraMainPrice !== undefined) settings.extraMainPrice = Number(extraMainPrice);
        if (baseMainsLimit !== undefined) settings.baseMainsLimit = Number(baseMainsLimit);

        if (typeof extendBy === 'number' && extendBy !== 0) {
            const current = timeToMinutes(settings.cutoffTime) ?? nowMinutes();
            settings.cutoffTime = minutesToTime(current + extendBy);
        }

        // Tie to today
        if (!settings.cutoffDate) settings.cutoffDate = todayStr();

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    List today's lunch orders
// @route   GET /api/lunch/orders/today
// @access  Public
const getTodayOrders = async (req, res) => {
    try {
        const date = todayStr();
        const orders = await Order.find({ type: 'lunch', lunchDate: date })
            .sort({ queueNumber: 1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lunch order history grouped by date
// @route   GET /api/lunch/orders/history
// @access  Private/Admin
const getOrdersHistory = async (req, res) => {
    try {
        const days = Math.min(parseInt(req.query.days || '7', 10) || 7, 90);
        const since = new Date();
        since.setDate(since.getDate() - days);

        const orders = await Order.find({
            type: 'lunch',
            createdAt: { $gte: since },
        }).sort({ createdAt: -1 });

        const grouped = {};
        for (const o of orders) {
            const date = o.lunchDate || o.createdAt.toISOString().slice(0, 10);
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(o);
        }

        res.json(grouped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create lunch order with daily queue number
// @route   POST /api/lunch/orders
// @access  Public
const createLunchOrder = async (req, res) => {
    try {
        const {
            customerName,
            mains,
            vegetable,
            paymentMethod = 'pay_later',
            paidConfirmation = false,
            note,
            isAnonymous,
        } = req.body || {};

        if (!customerName || !customerName.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!Array.isArray(mains) || mains.length === 0) {
            return res.status(400).json({ message: 'Select at least one main dish' });
        }
        if (!vegetable) {
            return res.status(400).json({ message: 'Select one vegetable' });
        }

        const settings = await getOrCreateSettings();
        const date = todayStr();

        // Cutoff enforcement (only enforce when settings.cutoffDate matches today)
        if (settings.cutoffDate === date) {
            const cutoffMin = timeToMinutes(settings.cutoffTime);
            if (cutoffMin !== null && nowMinutes() > cutoffMin) {
                return res.status(400).json({ message: 'Order cutoff has passed for today' });
            }
        }

        // Pricing
        const mainsCount = mains.length;
        const extras = Math.max(0, mainsCount - settings.baseMainsLimit);
        const total = settings.basePrice + extras * settings.extraMainPrice;

        // Build items[] entries: dishes (price 0) + combo line + optional extras line
        const items = [];
        for (const m of mains) {
            items.push({ name: m, quantity: 1, price: 0, subtotal: 0 });
        }
        items.push({ name: vegetable, quantity: 1, price: 0, subtotal: 0 });
        items.push({ name: 'Lunch Combo', quantity: 1, price: settings.basePrice, subtotal: settings.basePrice });
        if (extras > 0) {
            items.push({
                name: 'Extra Main',
                quantity: extras,
                price: settings.extraMainPrice,
                subtotal: extras * settings.extraMainPrice,
            });
        }

        // Atomic queue number assignment with retry on duplicate
        let attempt = 0;
        let createdOrder = null;
        while (attempt < 5) {
            const last = await Order.findOne({ type: 'lunch', lunchDate: date })
                .sort({ queueNumber: -1 })
                .select('queueNumber');
            const queueNumber = last && last.queueNumber ? last.queueNumber + 1 : 1;

            try {
                const order = new Order({
                    customerName: customerName.trim(),
                    items,
                    note,
                    total,
                    isAnonymous: !!isAnonymous,
                    type: 'lunch',
                    queueNumber,
                    lunchDate: date,
                    paymentMethod,
                    paymentStatus: paymentMethod === 'pay_now' && paidConfirmation ? 'paid' : 'unpaid',
                    paymentDescription: settings.paymentInstructions || '',
                    lunchSelection: { mains, vegetable },
                });
                createdOrder = await order.save();
                break;
            } catch (err) {
                if (err && err.code === 11000) {
                    attempt += 1;
                    continue;
                }
                throw err;
            }
        }

        if (!createdOrder) {
            return res.status(500).json({ message: 'Could not assign queue number, please try again' });
        }

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getTodayMenu,
    parseMenu,
    saveMenu,
    getSettings,
    updateSettings,
    getTodayOrders,
    getOrdersHistory,
    createLunchOrder,
};
