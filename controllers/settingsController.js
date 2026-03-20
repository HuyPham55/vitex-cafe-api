const StoreSettings = require('../models/StoreSettings');
const { put } = require('@vercel/blob');

// @desc    Get store settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        const settings = await StoreSettings.findOne().select('-adminPasswordHash');
        if (!settings) return res.status(404).json({ message: 'Settings not found' });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update store settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        let settings = await StoreSettings.findOne();
        if (!settings) {
            settings = new StoreSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }

        // Handle hero images
        let existingHeroImages = req.body.existingHeroImages || [];
        if (typeof existingHeroImages === 'string') {
            existingHeroImages = [existingHeroImages];
        }
        
        const heroFiles = req.files?.newHeroImages || [];
        const newHeroImages = await Promise.all(
            heroFiles.map(async (file) => {
                const blob = await put(file.originalname, file.buffer, {
                    access: 'public',
                });
                return blob.url;
            })
        );
        settings.heroImages = [...existingHeroImages, ...newHeroImages];

        // Handle gallery images
        let existingGalleryImages = req.body.existingGalleryImages || [];
        if (typeof existingGalleryImages === 'string') {
            existingGalleryImages = [existingGalleryImages];
        }
        
        const galleryFiles = req.files?.newGalleryImages || [];
        const newGalleryImages = await Promise.all(
            galleryFiles.map(async (file) => {
                const blob = await put(file.originalname, file.buffer, {
                    access: 'public',
                });
                return blob.url;
            })
        );
        settings.galleryImages = [...existingGalleryImages, ...newGalleryImages];
        
        // Handle payment QR code
        if (req.files?.paymentQRCode) {
            const file = req.files.paymentQRCode[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
            });
            settings.paymentQRCode = blob.url;
        } else if (req.body.removePaymentQRCode === 'true') {
            settings.paymentQRCode = null;
        }

            const savedSettings = await settings.save();
            res.json(savedSettings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getSettings, updateSettings };
