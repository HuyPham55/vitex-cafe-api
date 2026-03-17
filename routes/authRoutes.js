const express = require('express');
const router = express.Router();
const { login, initAdmin } = require('../controllers/authController');

router.post('/login', login);
router.post('/init', initAdmin);

module.exports = router;
