const SocketIO = require('socket.io');

module.exports = (server, app, sessionMiddleware) => {
   const io = SocketIO(server, { path: '/socket.io' });
   app.set('io', io);

   // 네임스페이스 분리
   const room = io.of('/room');
   const chat = io.of('/chat');
   const dm = io.of('/dm');

   // 세션 미들웨어 설정
   const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
   chat.use(wrap(sessionMiddleware));

   // room 진입 시 메세지 전달
   room.on('connection', socket => {
      console.log('room 네임스페이스 접속');
      // 1번 방에 들어간 유저 수, 2번 방에 들어간 유저 수 메세지 전달
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
         roomNum = data.roomId;

         if (!socket.adapter.rooms.get('room' + roomNum)) {
            // 방이 새로 생성 되었을 때 참여 인원 초기화
            socket.adapter.rooms.set('room' + roomNum, []);
         }
         // 접속한 방에 유저 이름 정보 추가
         socket.adapter.rooms.get('room' + roomNum).push(req.session.user.username);

         // 방 진입
         socket.join(roomNum);
         // 같은 방 사람들에게 접속 메세지 전달
         chat.to(roomNum).emit('join', {
            user: 'system',
            chat: `${req.session.user.username} 님이 접속하셨습니다.`,
            cnt: socket.adapter.rooms.get(roomNum)?.size,
            connectedUsers: socket.adapter.rooms.get('room' + roomNum),
         });
      });
      // 채팅 보냈을 때
      socket.on('chat', msg => {
         socket.join(roomNum);
         chat.to(roomNum).emit('chat', {
            user: 'user',
            chat: `${req.session.user.username} : ${msg}`,
         });
      });

      // 채팅방 나갔을 때
      socket.on('disconnect', () => {
         // 채팅 방 참여인원에서 제거
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
      socket.emit('dmChat', '클라이언트 메시지 전달~');

      socket.on('join', data => {
         let roomId = '';
         // 고유 방 id 생성
         const tmpRoom1 = `m${data.me}t${data.target}`;
         const tmpRoom2 = `m${data.target}t${data.me}`;

         if (socket.adapter.rooms.get(tmpRoom1)?.size) {
            // 고유방 1번에 이미 한 명이 방에 들어와있다면 참가
            socket.join(tmpRoom1);
            roomId = tmpRoom1;
         } else if (socket.adapter.rooms.get(tmpRoom2)?.size) {
            // 고유방 2번에 이미 한 명이 방에 들어와있다면 참가
            socket.join(tmpRoom2);
            roomId = tmpRoom2;
         } else {
            // 방에 아무도 없을 시 고유방 1번 생성
            socket.join(tmpRoom1);
            roomId = tmpRoom1;
         }
         // 클라이언트 측에 방 id 전달
         dm.to(roomId).emit('join', roomId);
      });

      socket.on('chat message', data => {
         dm.to(data.roomId).emit('chat message', data.msg);
      });
   });
};
