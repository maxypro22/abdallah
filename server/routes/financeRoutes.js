const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { auth, checkRole } = require('../middleware/auth');

// Apply auth and role check to all finance routes
router.use(auth, checkRole(['Super Admin', 'Accountant']));

router.get('/invoices', financeController.getInvoices);
router.post('/invoices', financeController.createInvoice);
router.put('/invoices/:id', financeController.updateInvoice);
router.delete('/invoices/:id', financeController.deleteInvoice);

module.exports = router;
