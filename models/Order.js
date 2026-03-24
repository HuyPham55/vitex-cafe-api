const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: Number,
            unique: true,
        },
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: String,
                quantity: { type: Number, default: 1 },
                price: { type: Number, required: true },
                variantOptions: [
                    {
                        name: String,
                        selectedOption: String,
                        priceModifier: { type: Number, default: 0 },
                    },
                ],
                subtotal: { type: Number, required: true },
            },
        ],
        note: { type: String, trim: true },
        total: { type: Number, required: true },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid'],
            default: 'unpaid',
        },
        status: {
            type: String,
            enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
            default: 'pending',
        },
        paymentDescription: String,
        isPreOrder: { type: Boolean, default: false },
        estimatedDeliveryDate: { type: Date },
        isAnonymous: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Auto-increment orderNumber (simplified for this task)
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
        this.orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 100;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
