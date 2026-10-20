const express = require('express');
const router = express.Router();
const calculationController = require('../controllers/calculationController');

// Calculation endpoints
router.get('/', calculationController.getCalculations);
router.post('/', calculationController.createCalculation);
router.delete('/', calculationController.clearAll);
router.get('/stats', calculationController.getStats);
router.patch('/:id/favorite', calculationController.toggleFavorite);
router.delete('/:id', calculationController.deleteCalculation);

module.exports = router;
