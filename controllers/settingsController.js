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
                    addRandomSuffix: false,
                    allowOverwrite: true,
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
                    addRandomSuffix: false,
                    allowOverwrite: true,
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
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.paymentQRCode = blob.url;
        } else if (req.body.removePaymentQRCode === 'true') {
            settings.paymentQRCode = null;
        }

        // Handle logo
        if (req.files?.logo) {
            const file = req.files.logo[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.logo = blob.url;
        } else if (req.body.removeLogo === 'true') {
            settings.logo = null;
        }

        // Handle favicon
        if (req.files?.favicon) {
            const file = req.files.favicon[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.favicon = blob.url;
        } else if (req.body.removeFavicon === 'true') {
            settings.favicon = null;
        }

        // Handle seo image
        if (req.files?.seoImage) {
            const file = req.files.seoImage[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.seoImage = blob.url;
        } else if (req.body.removeSeoImage === 'true') {
            settings.seoImage = null;
        }

        // Handle about hero image
        if (req.files?.aboutHeroImage) {
            const file = req.files.aboutHeroImage[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.aboutHeroImage = blob.url;
        } else if (req.body.removeAboutHeroImage === 'true') {
            settings.aboutHeroImage = null;
        }

        // Handle about founder 1 photo
        if (req.files?.aboutFounder1Photo) {
            const file = req.files.aboutFounder1Photo[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.aboutFounder1Photo = blob.url;
        } else if (req.body.removeAboutFounder1Photo === 'true') {
            settings.aboutFounder1Photo = null;
        }

        // Handle about founder 2 photo
        if (req.files?.aboutFounder2Photo) {
            const file = req.files.aboutFounder2Photo[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.aboutFounder2Photo = blob.url;
        } else if (req.body.removeAboutFounder2Photo === 'true') {
            settings.aboutFounder2Photo = null;
        }

        // Handle about quality image
        if (req.files?.aboutQualityImage) {
            const file = req.files.aboutQualityImage[0];
            const blob = await put(file.originalname, file.buffer, {
                access: 'public',
                addRandomSuffix: false,
                allowOverwrite: true,
            });
            settings.aboutQualityImage = blob.url;
        } else if (req.body.removeAboutQualityImage === 'true') {
            settings.aboutQualityImage = null;
        }

            const savedSettings = await settings.save();
            res.json(savedSettings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getSettings, updateSettings };
