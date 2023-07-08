const express = require('express');
const router = express.Router();
const { getRoom } = require('../controllers/room');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');

router.get('/', isLoggedIn, getRoom);

module.exports = router;
