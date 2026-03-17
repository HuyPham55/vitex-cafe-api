const mongoose = require('mongoose');

const variantTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        options: [
            {
                label: { type: String, required: true },
                priceModifier: { type: Number, default: 0 },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('VariantType', variantTypeSchema);
