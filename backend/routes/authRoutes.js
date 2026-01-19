const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/verify-password', authenticateToken, authController.verifyPassword);
router.put('/change-password', authenticateToken, authController.changePassword);
router.put('/change-username', authenticateToken, authController.changeUsername);

module.exports = router;

