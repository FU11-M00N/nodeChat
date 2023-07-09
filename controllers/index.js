const User = require('../models/user');
const Friendship = require('../models/friendship');

exports.renderMain = (req, res) => {
   if (req.session.user) {
      res.render('index.ejs', { username: req.session.user.username });
   } else {
      res.render('index.ejs');
   }
};
exports.renderLogin = (req, res) => {
   res.render('login.ejs');
};
exports.renderJoin = (req, res) => {
   res.render('join.ejs');
};
exports.renderRooms = (req, res) => {
   const data = [
      { id: 1, userNum: 3 },
      { id: 2, userNum: 4 },
   ];
   res.render('room.ejs', { data });
};

exports.renderChat = (req, res) => {
   const room = {
      id: req.params.id,
      title: '채팅방',
   };
   res.render('chat.ejs', {
      room,
      title: room.title,
      user: req.session.user.username,
      chats: [],
   });
};

// status가 accept인 .lenghth 를 줘야한다

exports.renderUser = async (req, res) => {
   // status 가 'accept'
   const userList = await User.findAll({
      include: [
         {
            model: User,
            as: 'friends',
         },
      ],
   });

   const users = [];

   userList.forEach(user => {
      users.push({
         id: user.id,
         username: user.username,
         createdAt: user.createdAt,
         cnt: user.friends.filter(friend => {
            return friend.Friendship.status == 'accept';
         }).length,
      });
   });

   res.render('user.ejs', { users });
};

exports.renderFriends = async (req, res) => {
   const friendsPending = await User.findAll({
      include: [
         {
            model: User,
            as: 'friends',
            where: { id: req.session.user.id },
            through: { where: { status: 'pending' } },
         },
      ],
   });
   const friends = await User.findAll({
      include: [
         {
            model: User,
            as: 'friends',
            where: { id: req.session.user.id },
            through: { where: { status: 'accept' } },
         },
      ],
   });

   res.render('friends.ejs', {
      friendsPending,
      friends,
   });
};
