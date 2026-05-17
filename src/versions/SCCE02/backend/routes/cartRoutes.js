
const express = require('express');
const router = express.Router();
const controller = require('../controllers/cartController');

router.get('/:userId', controller.getCart);

module.exports = router;
