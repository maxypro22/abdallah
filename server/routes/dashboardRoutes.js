const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/stats', auth, checkRole(['Super Admin', 'Admin']), dashboardController.getStats);

module.exports = router;
