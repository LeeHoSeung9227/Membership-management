const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const authenticateToken = require('../middleware/auth');

router.get('/monthly', authenticateToken, statisticsController.getMonthlyStatistics);
router.get('/program', authenticateToken, statisticsController.getProgramStatistics);

module.exports = router;

