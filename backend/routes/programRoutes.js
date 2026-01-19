const express = require('express');
const router = express.Router();
const programController = require('../controllers/programController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, programController.getAllPrograms);
router.get('/:id', authenticateToken, programController.getProgramById);
router.post('/', authenticateToken, programController.createProgram);
router.put('/:id', authenticateToken, programController.updateProgram);
router.delete('/:id', authenticateToken, programController.deleteProgram);
router.delete('/', authenticateToken, programController.deleteAllPrograms);

module.exports = router;

