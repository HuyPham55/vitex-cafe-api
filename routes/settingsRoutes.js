const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getSettings)
    .put(protect, imageUpload.fields([
        { name: 'newHeroImages', maxCount: 5 },
        { name: 'newGalleryImages', maxCount: 10 },
        { name: 'paymentQRCode', maxCount: 1 },
        { name: 'logo', maxCount: 1 },
        { name: 'favicon', maxCount: 1 },
        { name: 'seoImage', maxCount: 1 },
        { name: 'aboutHeroImage', maxCount: 1 },
        { name: 'aboutFounder1Photo', maxCount: 1 },
        { name: 'aboutFounder2Photo', maxCount: 1 },
        { name: 'aboutQualityImage', maxCount: 1 },
    ]), updateSettings);

module.exports = router;
