const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');

const { protect: requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, discountController.getDiscounts);
router.post('/', requireAuth, discountController.createDiscount);
router.put('/:id', requireAuth, discountController.updateDiscount);
router.delete('/:id', requireAuth, discountController.deleteDiscount);

router.post('/validate', discountController.validateDiscount);

module.exports = router;
