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
        currencySymbol: { type: String, default: '$' },
        paymentQRCode: { type: String },
        logo: { type: String },
        favicon: { type: String },
        footerDescription: { type: String, default: 'Experience the best coffee in town. We roast our own beans and craft each cup with care.' },
        contactEmail: { type: String, default: 'hello@dailygrind.com' },
        contactPhone: { type: String, default: '(555) 123-4567' },
        contactLocation: { type: String, default: '123 Brew St, Bean City' },
        asmrTitle: { type: String, default: 'ASMR Brews' },
        asmrDescription: { type: String, default: 'Immerse yourself in the rhythmic symphony of coffee craftsmanship. From the gentle hiss of steam to the crunch of freshly ground beans.' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
