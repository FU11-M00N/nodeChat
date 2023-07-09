const User = require('../models/user');
const Friendship = require('../models/friendship');
exports.addFriend = async (req, res) => {
   const target = req.params.id;

   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });

   const targetUser = await User.findOne({
      where: { id: target },
   });
   if (targetUser) {
      //친구 관계 추가
      //   await meUser.addFriends(targetUser);
      await meUser.setFriends(targetUser, { through: { status: 'pending' } });
   }
   res.status(201).redirect('/users');
};

exports.acceptFriend = async (req, res) => {
   const target = req.params.id;
   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });
   const targetUser = await User.findOne({
      where: { id: target },
   });
   if (targetUser) {
      await targetUser.setFriends([meUser], {
         through: {
            status: 'accept',
         },
      });

      await meUser.setFriends([targetUser], {
         through: {
            status: 'accept',
         },
      });
   } else {
      return res.status(404).send('유저가 존재하지 않습니다.');
   }

   res.redirect('/friends');
};
exports.denyFriend = async (req, res) => {
   const target = req.params.id;
   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });
   const targetUser = await User.findOne({
      where: { id: target },
   });

   await targetUser.setFriends([meUser], {
      through: {
         status: 'deny',
      },
   });
   res.status(201).redirect('/friends');
};

exports.deleteFriend = async (req, res) => {
   // 친구 삭제 기능 삭제하면 나한테 안보여야함
   const target = req.params.id;

   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });

   const targetUser = await User.findOne({
      where: { id: target },
   });

   if (targetUser) {
      meUser.removeFriends(targetUser);
      targetUser.removeFriends(meUser);
   } else {
      return res.status(404).send('유저가 존재하지 않습니다.');
   }

   res.status(201).redirect('/users');
};
