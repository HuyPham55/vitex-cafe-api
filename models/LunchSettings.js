const mongoose = require('mongoose');

const lunchSettingsSchema = new mongoose.Schema(
    {
        cutoffTime: { type: String, default: '10:30' },
        cutoffDate: { type: String, default: '' },
        paymentQRImage: { type: String, default: '' },
        paymentInstructions: {
            type: String,
            default: 'Scan the QR code to transfer the lunch fee, then check the confirmation box below.',
        },
        basePrice: { type: Number, default: 35000 },
        extraMainPrice: { type: Number, default: 5000 },
        baseMainsLimit: { type: Number, default: 3 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('LunchSettings', lunchSettingsSchema);
