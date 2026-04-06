const Discount = require('../models/Discount');

// @desc    Get all discounts
// @route   GET /api/discounts
// @access  Admin
exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().populate('applicableProducts', 'name _id').sort({ createdAt: -1 });
        res.status(200).json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ message: 'Failed to fetch discounts' });
    }
};

// @desc    Create a new discount
// @route   POST /api/discounts
// @access  Admin
exports.createDiscount = async (req, res) => {
    try {
        const { code, discountType, value, applicableProducts, quantity, expiresAt } = req.body;
        
        let existingDiscount = await Discount.findOne({ code: code.trim().toUpperCase() });
        if (existingDiscount) {
            return res.status(400).json({ message: 'Discount code already exists' });
        }

        const discount = new Discount({
            code: code.trim().toUpperCase(),
            discountType,
            value,
            applicableProducts: applicableProducts || [],
            quantity: quantity ? Number(quantity) : null,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        const savedDiscount = await discount.save();
        const populatedDiscount = await savedDiscount.populate('applicableProducts', 'name _id');
        res.status(201).json(populatedDiscount);
    } catch (error) {
        console.error('Error creating discount:', error);
        res.status(500).json({ message: 'Failed to create discount' });
    }
};

// @desc    Update a discount by ID
// @route   PUT /api/discounts/:id
// @access  Admin
exports.updateDiscount = async (req, res) => {
    try {
        const { code, discountType, value, applicableProducts, quantity, expiresAt, isActive } = req.body;

        const discount = await Discount.findById(req.params.id);
        if (!discount) return res.status(404).json({ message: 'Discount not found' });

        if (code) {
           const existing = await Discount.findOne({ code: code.trim().toUpperCase(), _id: { $ne: discount._id } });
           if (existing) return res.status(400).json({ message: 'Discount code already in use' });
           discount.code = code.trim().toUpperCase();
        }

        if (discountType) discount.discountType = discountType;
        if (value !== undefined) discount.value = value;
        if (applicableProducts) discount.applicableProducts = applicableProducts;
        discount.quantity = quantity !== undefined && quantity !== '' ? Number(quantity) : null;
        discount.expiresAt = expiresAt ? new Date(expiresAt) : null;
        if (isActive !== undefined) discount.isActive = isActive;

        const updatedDiscount = await discount.save();
        const populatedDiscount = await updatedDiscount.populate('applicableProducts', 'name _id');
        res.status(200).json(populatedDiscount);
    } catch (error) {
        console.error('Error updating discount:', error);
        res.status(500).json({ message: 'Failed to update discount' });
    }
};

// @desc    Delete a discount by ID
// @route   DELETE /api/discounts/:id
// @access  Admin
exports.deleteDiscount = async (req, res) => {
    try {
        const discount = await Discount.findById(req.params.id);
        if (!discount) return res.status(404).json({ message: 'Discount not found' });

        await discount.deleteOne();
        res.status(200).json({ message: 'Discount removed' });
    } catch (error) {
        console.error('Error deleting discount:', error);
        res.status(500).json({ message: 'Failed to delete discount' });
    }
};

// @desc    Validate a discount code against a product
// @route   POST /api/discounts/validate
// @access  Public
exports.validateDiscount = async (req, res) => {
    try {
        const { code, productId } = req.body;
        if (!code) return res.status(400).json({ message: 'Discount code is required' });

        const discount = await Discount.findOne({ code: code.trim().toUpperCase() });

        if (!discount) return res.status(404).json({ message: 'Invalid discount code' });
        if (!discount.isActive) return res.status(400).json({ message: 'Discount code is inactive' });
        
        if (discount.expiresAt && new Date() > discount.expiresAt) {
            return res.status(400).json({ message: 'Discount code has expired' });
        }

        if (discount.quantity !== null && discount.quantity !== undefined && discount.usedCount >= discount.quantity) {
            return res.status(400).json({ message: 'Discount code limit reached' });
        }

        if (productId) {
            const applicableIds = discount.applicableProducts.map(id => id.toString());
            // If applicableProducts array is empty, it applies to all products
            if (applicableIds.length > 0 && !applicableIds.includes(productId)) {
                return res.status(400).json({ message: 'Discount code is not applicable to this item' });
            }
        }

        res.status(200).json({
            isValid: true,
            discountType: discount.discountType,
            value: discount.value,
            code: discount.code
        });
    } catch (error) {
        console.error('Error validating discount:', error);
        res.status(500).json({ message: 'Failed to validate discount' });
    }
};
