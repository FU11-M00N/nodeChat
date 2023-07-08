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
   // TODO
   //Room.findAll(~~)
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
