const express = require('express');
const router = express.Router();
const { renderLogin, renderJoin, renderMain } = require('../controllers');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');

router.get('/', renderMain);
router.get('/join', isNotLoggedIn, renderJoin);
router.get('/login', isNotLoggedIn, renderLogin);

module.exports = router;
