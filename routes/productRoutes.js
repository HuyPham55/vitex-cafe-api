const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');

// Routes
router.route('/')
    .get(getProducts)
    .post(protect, imageUpload.single('image'), addProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, imageUpload.single('image'), updateProduct)
    .delete(protect, deleteProduct);

module.exports = router;
