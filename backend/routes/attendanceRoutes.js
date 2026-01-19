const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, attendanceController.createAttendance);
router.get('/', authenticateToken, attendanceController.getAttendance);

module.exports = router;

