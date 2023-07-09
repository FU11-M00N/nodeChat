const express = require('express');
const router = express.Router();
const { addFriend, acceptFriend, denyFriend } = require('../controllers/friends');
const { isLoggedIn } = require('../middlewares/auth');

router.post('/:id/accept', isLoggedIn, acceptFriend);
router.post('/:id/deny', isLoggedIn, denyFriend);
router.post('/:id', isLoggedIn, addFriend);

module.exports = router;
