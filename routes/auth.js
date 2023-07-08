const express = require('express');
const router = express.Router();
const { login, join } = require('../controllers/auth');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');

router.post('/join', isNotLoggedIn, join);
router.post('/login', isNotLoggedIn, login);

module.exports = router;
