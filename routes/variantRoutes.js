const express = require('express');
const router = express.Router();
const {
    getVariantTypes,
    createVariantType,
    updateVariantType,
    deleteVariantType,
} = require('../controllers/variantController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getVariantTypes)
    .post(protect, createVariantType);

router.route('/:id')
    .put(protect, updateVariantType)
    .delete(protect, deleteVariantType);

module.exports = router;
