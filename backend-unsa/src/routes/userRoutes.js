const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.patch('/:uuid', userController.updateUser);
router.delete('/:uuid', userController.deleteUser);

module.exports = router;