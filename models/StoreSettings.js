const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
    {
        openTime: { type: String, default: '08:00' },
        closeTime: { type: String, default: '22:00' },
        paymentDescription: { type: String, default: 'Please pay at the counter or scan our QR code.' },
        adminUsername: { type: String, required: true, unique: true },
        adminPasswordHash: { type: String, required: true },
        heroImages: { type: [String], default: [] },
        galleryImages: { type: [String], default: [] },
        currencySymbol: { type: String, default: '₫' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
