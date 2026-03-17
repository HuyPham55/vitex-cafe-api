const VariantType = require('../models/VariantType');

// @desc    Get all variant types
// @route   GET /api/variants
// @access  Public
const getVariantTypes = async (req, res) => {
    try {
        const variants = await VariantType.find();
        res.json(variants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a variant type
// @route   POST /api/variants
// @access  Private/Admin
const createVariantType = async (req, res) => {
    try {
        const variant = new VariantType(req.body);
        const savedVariant = await variant.save();
        res.status(201).json(savedVariant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a variant type
// @route   PUT /api/variants/:id
// @access  Private/Admin
const updateVariantType = async (req, res) => {
    try {
        const variant = await VariantType.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!variant) return res.status(404).json({ message: 'Variant not found' });
        res.json(variant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a variant type
// @route   DELETE /api/variants/:id
// @access  Private/Admin
const deleteVariantType = async (req, res) => {
    try {
        const variant = await VariantType.findByIdAndDelete(req.params.id);
        if (!variant) return res.status(404).json({ message: 'Variant not found' });
        res.json({ message: 'Variant deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVariantTypes,
    createVariantType,
    updateVariantType,
    deleteVariantType,
};
