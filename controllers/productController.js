const Product = require('../models/Product');
const { put } = require('@vercel/blob');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate('variantTypes');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('variantTypes');
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a product
// @route   POST /api/products
// @access  Private/Admin
const addProduct = async (req, res) => {
    try {
        let productData = { ...req.body };
        
        if (req.file) {
            const blob = await put(req.file.originalname, req.file.buffer, {
                access: 'public',
            });
            productData.imageUrl = blob.url;
        }

        // Parse variantTypes if sent as string (common with FormData)
        if (typeof productData.variantTypes === 'string') {
            try {
                productData.variantTypes = JSON.parse(productData.variantTypes);
            } catch (e) {
                // If not JSON, it might be a comma-separated list
                productData.variantTypes = productData.variantTypes.split(',').filter(id => id.trim());
            }
        }

        const newProduct = new Product(productData);
        const product = await newProduct.save();
        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        let productData = { ...req.body };

        if (req.file) {
            const blob = await put(req.file.originalname, req.file.buffer, {
                access: 'public',
            });
            productData.imageUrl = blob.url;
        }

        // Parse variantTypes if sent as string
        if (typeof productData.variantTypes === 'string') {
            try {
                productData.variantTypes = JSON.parse(productData.variantTypes);
            } catch (e) {
                productData.variantTypes = productData.variantTypes.split(',').filter(id => id.trim());
            }
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
};
