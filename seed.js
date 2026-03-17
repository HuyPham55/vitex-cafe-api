process.env.TZ = 'Asia/Ho_Chi_Minh';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Product = require('./models/Product');
const VariantType = require('./models/VariantType');
const StoreSettings = require('./models/StoreSettings');
const AsmrVideo = require('./models/AsmrVideo');

const seedData = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vitexCafe';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await Product.deleteMany({});
        await VariantType.deleteMany({});
        await StoreSettings.deleteMany({});
        await AsmrVideo.deleteMany({});

        // 1. Create Variant Types
        const variants = await VariantType.insertMany([
            {
                name: 'Size',
                options: [
                    { label: 'Small', priceModifier: 0 },
                    { label: 'Medium', priceModifier: 0.5 },
                    { label: 'Large', priceModifier: 1.0 },
                ],
            },
            {
                name: 'Ice Level',
                options: [
                    { label: '100% Ice', priceModifier: 0 },
                    { label: '50% Ice', priceModifier: 0 },
                    { label: 'No Ice', priceModifier: 0 },
                ],
            },
            {
                name: 'Sugar Level',
                options: [
                    { label: '100% Sugar', priceModifier: 0 },
                    { label: '50% Sugar', priceModifier: 0 },
                    { label: 'No Sugar', priceModifier: 0 },
                ],
            },
            {
                name: 'Milk Type',
                options: [
                    { label: 'Whole Milk', priceModifier: 0 },
                    { label: 'Oat Milk', priceModifier: 0.75 },
                    { label: 'Almond Milk', priceModifier: 0.75 },
                ],
            },
        ]);

        // 2. Create Products
        await Product.insertMany([
            {
                name: 'Signature Iced Latte',
                description: 'Smooth espresso with chilled milk and a hint of vanilla.',
                price: 5.5,
                category: 'Cold Drinks',
                imageUrl: 'https://picsum.photos/seed/latte/400/300',
                variantTypes: [variants[0]._id, variants[1]._id, variants[2]._id, variants[3]._id],
            },
            {
                name: 'Double Espresso',
                description: 'Rich, full-bodied double shot of our premium roast.',
                price: 3.5,
                category: 'Espresso',
                imageUrl: 'https://picsum.photos/seed/espresso/400/300',
                variantTypes: [variants[0]._id],
            },
            {
                name: 'Caramel Macchiato',
                description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and topped with caramel drizzle.',
                price: 5.75,
                category: 'Lattes',
                imageUrl: 'https://picsum.photos/seed/caramel/400/300',
                variantTypes: [variants[0]._id, variants[2]._id, variants[3]._id],
            },
        ]);

        // 3. Create Admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await StoreSettings.create({
            openTime: '08:00',
            closeTime: '22:00',
            paymentDescription: 'Please pay via ZaloPay or Cash at counter. Transfer to: 123456789 (Vietcombank).',
            adminUsername: 'admin',
            adminPasswordHash: hashedPassword,
        });

        console.log('Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
