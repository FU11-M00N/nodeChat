const SocketIO = require('socket.io');
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
   const io = SocketIO(server, { path: '/socket.io' });
   app.set('io', io);
   const room = io.of('/room');
   const chat = io.of('/chat');

   const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
   chat.use(wrap(sessionMiddleware));

   io.on('connection', socket => {
      socket.emit('news', ' 하이 서버 응답임');
   });

   io.on('disconnect', socket => {
      console.log('연결 종료');
   });

   room.on('connection', socket => {
      console.log('room 네임스페이스 접속');
      socket.emit('usercnt', {
         cnt: [chat.adapter.rooms.get('1')?.size, chat.adapter.rooms.get('2')?.size],
      });
      socket.on('disconnect', () => {
         console.log('room 네임스페이스 접속 해제');
      });
   });

   chat.on('connection', socket => {
      const req = socket.request;
      let roomNum = '';
      socket.on('join', roomId => {
         roomNum = roomId;

         console.log(roomNum, ' 번 chat 네임스페이스 접속 ');
         socket.join(roomNum);
         chat.to(roomNum).emit('join', {
            user: 'system',
            chat: `${req.session.user.username} 님이 접속하셨습니다.`,
         });
      });

      socket.on('chat', msg => {
         socket.join(roomNum);
         chat.to(roomNum).emit('chat', {
            user: 'user',
            chat: `${req.session.user.username} : ${msg}`,
         });
      });

      socket.on('disconnect', () => {
         console.log('chat 네임스페이스 접속 해제');
         socket.to(roomNum).emit('exit', {
            user: 'system',
            chat: `${req.session.user.username}님이 퇴장하셨습니다.`,
         });
      });
   });
};
