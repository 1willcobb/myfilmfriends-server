const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);

// Other routes for update, delete, etc.

module.exports = router;
