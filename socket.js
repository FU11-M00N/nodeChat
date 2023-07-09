const SocketIO = require('socket.io');
const cookieParser = require('cookie-parser');

module.exports = (server, app, sessionMiddleware) => {
   const io = SocketIO(server, { path: '/socket.io' });
   app.set('io', io);
   const room = io.of('/room');
   const chat = io.of('/chat');
   const dm = io.of('/dm');

   const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
   chat.use(wrap(sessionMiddleware));

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
      // socket.on('setNickName', data => {
      //    connectedUsers.push(data);
      //    socket.join(roomNum);
      //    chat.to(roomNum).emit('setNickName', {
      //       connectedUsers,
      //    });
      // });
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

   dm.on('connection', socket => {
      let dmRoom1 = '';
      let dmRoom2 = '';
      socket.emit('dmChat', '클라이언트 메시지 전달~');

      socket.on('join', data => {
         const tmpRoom1 = `m${data.me}t${data.target}`;
         const tmpRoom2 = `m${data.target}t${data.me}`;
         let roomId = '';

         if (socket.adapter.rooms.get(tmpRoom1)?.size) {
            // 이미 한 명이 방에 들어와있다면
            socket.join(tmpRoom1);
            roomId = tmpRoom1;
         } else if (socket.adapter.rooms.get(tmpRoom2)?.size) {
            socket.join(tmpRoom2);
            roomId = tmpRoom2;
         } else {
            socket.join(tmpRoom1);
            roomId = tmpRoom1;
         }

         dm.to(roomId).emit('join', roomId);
      });

      socket.on('chat message', data => {
         console.log('메시지 들어옴');
         dm.to(data.roomId).emit('chat message', data.msg);
         // dm.to(dmRoom2).emit("chat message", msg);
      });
   });
};
