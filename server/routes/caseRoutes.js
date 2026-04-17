const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const { auth, checkRole } = require('../middleware/auth');

router.post('/', auth, checkRole(['Super Admin', 'Admin', 'Lawyer']), caseController.createCase);
router.get('/', auth, caseController.getCases);
router.get('/:id', auth, caseController.getCase);
router.put('/:id', auth, checkRole(['Super Admin', 'Admin', 'Lawyer']), caseController.updateCase);
router.delete('/:id', auth, checkRole(['Super Admin', 'Admin']), caseController.deleteCase);

// Hearings
router.post('/hearings', auth, checkRole(['Super Admin', 'Admin', 'Lawyer']), caseController.addHearing);
router.get('/hearings/all', auth, caseController.getHearings);
router.put('/hearings/:id', auth, checkRole(['Super Admin', 'Admin', 'Lawyer']), caseController.updateHearing);
router.delete('/hearings/:id', auth, checkRole(['Super Admin', 'Admin', 'Lawyer']), caseController.deleteHearing);

module.exports = router;
