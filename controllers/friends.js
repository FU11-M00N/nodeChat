const User = require('../models/user');
const Friendship = require('../models/friendship');

/**
 * 친구추가 api
 * @param {*} req
 * @param {*} res
 */
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
      await meUser.addFriends(targetUser);
   }
   res.status(201).redirect('/users');
};

/**
 * 친구 수락 api
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.acceptFriend = async (req, res) => {
   const target = req.params.id;
   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });
   const targetUser = await User.findOne({
      where: { id: target },
   });

   if (targetUser) {
      // 이전 친구 요청 status 컬럼 데이터 accept로 변경
      await targetUser.setFriends([meUser], {
         through: {
            status: 'accept',
         },
      });

      // 현재 유저 친구 관계 추가
      await meUser.addFriends([targetUser], {
         through: {
            status: 'accept',
         },
      });
   } else {
      return res.status(404).send('유저가 존재하지 않습니다.');
   }

   res.redirect('/friends');
};

/**
 * 친구 요청 거부 api
 * @param {*} req
 * @param {*} res
 */
exports.denyFriend = async (req, res) => {
   const target = req.params.id;
   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });
   const targetUser = await User.findOne({
      where: { id: target },
   });

   // 이전 친구 요청 status 컬럼 데이터 deny로 변경
   await targetUser.setFriends([meUser], {
      through: {
         status: 'deny',
      },
   });
   res.status(201).redirect('/friends');
};

/**
 * 친구 삭제 api
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteFriend = async (req, res) => {
   const target = req.params.id;

   const meUser = await User.findOne({
      where: { id: req.session.user.id },
   });

   const targetUser = await User.findOne({
      where: { id: target },
   });

   if (targetUser) {
      // 친구 관계 삭제
      meUser.removeFriends(targetUser);
      targetUser.removeFriends(meUser);
   } else {
      return res.status(404).send('유저가 존재하지 않습니다.');
   }

   res.status(201).redirect('/users');
};
