const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        discountType: {
            type: String,
            enum: ['percent', 'amount'],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        applicableProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        quantity: {
            type: Number, // null or undefined means unlimited
            min: 0,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date, // null or undefined means no expiration
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Discount', discountSchema);
