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
      if (req.session.user.id !== user.id) {
         users.push({
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
            // 친구 요청이 accept 된 친구의 개수
            cnt: user.friends.filter(friend => {
               return friend.Friendship.status === 'accept';
            }).length,
            // join한 userList 데이터에 목록에 자신(현재 로그인 한 세션)이 있으면서 status가 accept인 경우 true를 반환
            isFriend: user.friends.filter(friend => {
               return friend.id === req.session.user.id && friend.Friendship.status === 'accept';
            }).length
               ? true
               : false,
         });
      }
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

exports.renderDm = async (req, res) => {
   const user = await User.findOne({
      where: { id: req.params.id },
   });

   res.render('dm.ejs', {
      data: {
         me: req.session.user.id,
         target: req.params.id,
         targetName: user.username,
      },
   });
};
