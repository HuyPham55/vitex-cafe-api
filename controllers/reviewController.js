const Review = require('../models/Review');
const { put } = require('@vercel/blob');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a review
// @route   POST /api/reviews
// @access  Public
const createReview = async (req, res) => {
    try {
        const { productId, customerName, rating, comment } = req.body;
        
        let photos = [];
        if (req.files && req.files.length > 0) {
            photos = await Promise.all(
                req.files.map(async (file) => {
                    const blob = await put(file.originalname, file.buffer, {
                        access: 'public',
                        addRandomSuffix: false,
                        allowOverwrite: true,
                    });
                    return blob.url;
                })
            );
        }

        const review = new Review({
            product: productId,
            customerName,
            rating,
            comment,
            photos,
        });

        const savedReview = await review.save();
        res.status(201).json(savedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get review summaries for all products (avg rating, count, latest review)
// @route   GET /api/reviews
// @access  Public
const getReviewSummaries = async (req, res) => {
    try {
        const summaries = await Review.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$product',
                    avgRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 },
                    latestReviewComment: { $first: '$comment' },
                    latestReviewCustomer: { $first: '$customerName' },
                    latestReviewRating: { $first: '$rating' },
                }
            }
        ]);

        // Convert to a map keyed by product ID for easy lookup
        const result = {};
        summaries.forEach(s => {
            result[s._id.toString()] = {
                avgRating: Math.round(s.avgRating * 10) / 10,
                reviewCount: s.reviewCount,
                latestReview: {
                    comment: s.latestReviewComment,
                    customerName: s.latestReviewCustomer,
                    rating: s.latestReviewRating,
                },
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getReviews, createReview, getReviewSummaries };
