const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/auth', authRoutes);
// /api/login도 지원 (기존 API와의 호환성)
router.post('/login', require('../controllers/authController').login);

// API routes
router.use('/members', require('./memberRoutes'));
router.use('/attendance', require('./attendanceRoutes'));
router.use('/statistics', require('./statisticsRoutes'));
router.use('/instructors', require('./instructorRoutes'));
router.use('/programs', require('./programRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

module.exports = router;

