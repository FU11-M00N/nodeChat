const express = require('express');
const router = express.Router();
const {
   renderLogin,
   renderJoin,
   renderMain,
   renderRooms,
   renderChat,
   renderUser,
   renderFriends,
   renderDm,
} = require('../controllers/index');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares/auth');

router.get('/', renderMain);
router.get('/join', isNotLoggedIn, renderJoin);
router.get('/login', isNotLoggedIn, renderLogin);
router.get('/room', isLoggedIn, renderRooms);
router.get('/room/:id', isLoggedIn, renderChat);
router.get('/users', isLoggedIn, renderUser);
router.get('/friends', isLoggedIn, renderFriends);
router.get('/dm/:id', isLoggedIn, renderDm);

module.exports = router;
