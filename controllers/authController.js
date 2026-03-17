const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const StoreSettings = require('../models/StoreSettings');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const settings = await StoreSettings.findOne({ adminUsername: username });

        if (settings && (await bcrypt.compare(password, settings.adminPasswordHash))) {
            res.json({
                token: generateToken(settings._id),
                username: settings.adminUsername,
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Init admin (one-time setup)
// @route   POST /api/auth/init
// @access  Public
const initAdmin = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingSettings = await StoreSettings.findOne();
        if (existingSettings) {
            return res.status(400).json({ message: 'Admin already initialized' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const settings = new StoreSettings({
            adminUsername: username,
            adminPasswordHash: hashedPassword,
        });

        await settings.save();
        res.status(201).json({ message: 'Admin initialized successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, initAdmin };
