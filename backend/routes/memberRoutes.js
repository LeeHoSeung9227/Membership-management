const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authenticateToken = require('../middleware/auth');

// Member CRUD routes
router.get('/', authenticateToken, memberController.getAllMembers);
router.get('/:id', authenticateToken, memberController.getMemberById);
router.post('/', authenticateToken, memberController.createMember);
router.put('/:id', authenticateToken, memberController.updateMember);
router.delete('/:id', authenticateToken, memberController.deleteMember);

// Member specific routes
router.get('/:id/basic', authenticateToken, memberController.getMemberBasicInfo);
router.put('/:id/basic', authenticateToken, memberController.updateMemberBasicInfo);
router.put('/:id/visibility', authenticateToken, memberController.updateMemberVisibility);
router.get('/:id/payment-logs', authenticateToken, memberController.getPaymentLogs);

// Enrollment routes
router.get('/enrollment/:id', authenticateToken, memberController.getEnrollmentById);
router.post('/enrollment/:id/programs', authenticateToken, memberController.addProgramToEnrollment);
router.put('/enrollment/:id', authenticateToken, memberController.updateEnrollment);
router.delete('/enrollment/:id', authenticateToken, memberController.deleteEnrollment);

module.exports = router;

