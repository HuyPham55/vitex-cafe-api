const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        inStock: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        imageUrl: {
            type: String,
        },
        variantTypes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'VariantType',
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
