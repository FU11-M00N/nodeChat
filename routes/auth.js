const express = require('express');
const router = express.Router();
const { login, join, logout } = require('../controllers/auth');
const { isNotLoggedIn, isLoggedIn } = require('../middlewares/auth');

router.post('/join', isNotLoggedIn, join);
router.post('/login', isNotLoggedIn, login);
router.get('/logout', isLoggedIn, logout);

module.exports = router;
