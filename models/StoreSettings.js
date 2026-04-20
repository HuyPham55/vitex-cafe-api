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
        seoImage: { type: String },
        footerDescription: { type: String, default: 'Experience the best coffee in town. We roast our own beans and craft each cup with care.' },
        contactEmail: { type: String, default: 'hello@dailygrind.com' },
        contactPhone: { type: String, default: '(555) 123-4567' },
        contactLocation: { type: String, default: '123 Brew St, Bean City' },
        asmrTitle: { type: String, default: 'ASMR Brews' },
        asmrDescription: { type: String, default: 'Immerse yourself in the rhythmic symphony of coffee craftsmanship. From the gentle hiss of steam to the crunch of freshly ground beans.' },
        // About Us page content
        aboutHeroTitle: { type: String, default: 'The soul of the daily grind.' },
        aboutHeroSubtitle: { type: String, default: 'Crafting moments of clarity through uncompromising artisanal roasting since 2012.' },
        aboutHeroImage: { type: String },
        aboutOriginTitle: { type: String, default: 'Our Origin Story' },
        aboutOriginParagraph1: { type: String, default: "We didn't start in a boardroom. It began in a tiny, drafty garage with a second-hand roaster and an obsession for the perfect extraction." },
        aboutOriginParagraph2: { type: String, default: "We realized that specialty coffee had become too clinical. We wanted to bring back the warmth, the tactile joy of the ritual, while elevating the bean to its highest potential. It's not just science; it's an artisanal craft driven by instinct and deep respect for the farmers." },
        aboutFounder1Name: { type: String, default: 'Alex' },
        aboutFounder1Role: { type: String, default: 'Master Roaster' },
        aboutFounder1Bio: { type: String, default: 'With over a decade of sensory analysis and green buying experience, Alex approaches roasting like a composer—finding the perfect harmony of origin characteristics and caramelization.' },
        aboutFounder1Photo: { type: String },
        aboutFounder2Name: { type: String, default: 'Jordan' },
        aboutFounder2Role: { type: String, default: 'Director of Sourcing' },
        aboutFounder2Bio: { type: String, default: "Jordan spends half the year at origin, building relationships with small-lot farmers. Their uncompromising standards ensure every bean meets the roast profile before it leaves the port." },
        aboutFounder2Photo: { type: String },
        aboutQualityTitle: { type: String, default: 'Uncompromising Quality' },
        aboutQualityContent: { type: String, default: "We source exclusively from single-estate farms prioritizing sustainable agriculture. Our roasting process is meticulously calibrated in small batches. We don't rely on automation; we rely on sight, smell, and the sound of the first crack." },
        aboutQualityImage: { type: String },
        aboutMissionStatement: { type: String, default: 'To transform your daily ritual from a mundane habit into a moment of mindful appreciation, one perfectly extracted cup at a time.' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
