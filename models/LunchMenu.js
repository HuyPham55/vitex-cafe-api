const mongoose = require('mongoose');

const lunchMenuSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
            unique: true,
        },
        rawText: {
            type: String,
            default: '',
        },
        mainDishes: [
            {
                name: { type: String, required: true, trim: true },
            },
        ],
        vegetables: [
            {
                name: { type: String, required: true, trim: true },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model('LunchMenu', lunchMenuSchema);
