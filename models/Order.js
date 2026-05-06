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
        discountCode: { type: String, trim: true },
        type: {
            type: String,
            enum: ['coffee', 'lunch'],
            default: 'coffee',
            index: true,
        },
        queueNumber: { type: Number },
        lunchDate: { type: String, index: true },
        paymentMethod: {
            type: String,
            enum: ['pay_later', 'pay_now'],
            default: 'pay_later',
        },
        lunchSelection: {
            mains: [{ type: String }],
            vegetable: { type: String },
        },
    },
    { timestamps: true }
);

orderSchema.index({ type: 1, lunchDate: 1, queueNumber: 1 });

// Auto-increment orderNumber (simplified for this task)
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const lastOrder = await this.constructor.findOne({}, {}, { sort: { orderNumber: -1 } });
        this.orderNumber = lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 100;
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
