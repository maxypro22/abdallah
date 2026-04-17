const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, checkRole(['Super Admin', 'Admin']), userController.getUsers);
router.post('/', auth, checkRole(['Super Admin', 'Admin']), userController.createUser);
router.put('/:id', auth, checkRole(['Super Admin', 'Admin']), userController.updateUser);
router.delete('/:id', auth, checkRole(['Super Admin', 'Admin']), userController.deleteUser);

module.exports = router;
