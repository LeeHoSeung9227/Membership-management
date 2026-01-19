const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructorController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, instructorController.getAllInstructors);
router.get('/:id', authenticateToken, instructorController.getInstructorById);
router.post('/', authenticateToken, instructorController.createInstructor);
router.put('/:id', authenticateToken, instructorController.updateInstructor);
router.delete('/:id', authenticateToken, instructorController.deleteInstructor);

module.exports = router;

