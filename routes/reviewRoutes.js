const express = require('express');
const router = express.Router();
const { getReviews, createReview } = require('../controllers/reviewController');
const { imageUpload } = require('../middleware/uploadMiddleware');

router.get('/:productId', getReviews);
router.post('/', imageUpload.array('photos', 5), createReview);

module.exports = router;
