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
      // 채팅창에 들어 왔을 때
      socket.on('join', data => {
         const roomId = data.roomId;
         roomNum = roomId;
         // 참여 인원 초기화
         if (!socket.adapter.rooms.get('room' + roomNum)) {
            socket.adapter.rooms.set('room' + roomNum, []);
         }
         socket.adapter.rooms.get('room' + roomNum).push(req.session.user.username);

         socket.join(roomNum);
         chat.to(roomNum).emit('join', {
            user: 'system',
            chat: `${req.session.user.username} 님이 접속하셨습니다.`,
            cnt: socket.adapter.rooms.get(roomNum)?.size,
            connectedUsers: socket.adapter.rooms.get('room' + roomNum),
         });
      });
      // 채팅 보냈을때
      socket.on('chat', msg => {
         socket.join(roomNum);
         chat.to(roomNum).emit('chat', {
            user: 'user',
            chat: `${req.session.user.username} : ${msg}`,
         });
      });
      socket.on('setNickName', data => {
         connectedUsers.push(data);
         socket.join(roomNum);
         chat.to(roomNum).emit('setNickName', {
            connectedUsers,
         });
      });
      // 채팅 창을 나갔을 때
      socket.on('disconnect', () => {
         // 해당 유저의 닉네임의 위치를 찾음
         const username = req.session.user.username;
         const findIndex = socket.adapter.rooms.get('room' + roomNum)?.indexOf(username);
         if (findIndex > -1) {
            socket.adapter.rooms.get('room' + roomNum).splice(findIndex, 1);
         }

         socket.to(roomNum).emit('exit', {
            user: 'system',
            chat: `${username}님이 퇴장하셨습니다.`,
            connectedUsers: socket.adapter.rooms.get('room' + roomNum),
         });
      });
   });
};
