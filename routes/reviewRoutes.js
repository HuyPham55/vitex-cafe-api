const express = require('express');
const router = express.Router();
const { getReviews, createReview, getReviewSummaries, getLatestReviews } = require('../controllers/reviewController');
const { imageUpload } = require('../middleware/uploadMiddleware');

router.get('/', getReviewSummaries);
router.get('/latest', getLatestReviews);
router.get('/:productId', getReviews);
router.post('/', imageUpload.array('photos', 5), createReview);

module.exports = router;

