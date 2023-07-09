require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

const { sequelize } = require('./models');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const friendsRouter = require('./routes/friends');

const webSocket = require('./socket');

const app = express();
app.set('port', 3000);

// db 연결
sequelize
   .sync({ force: false })
   .then(() => {
      console.log('DB connect success');
   })
   .catch(err => {
      console.error(err);
   });

app.use(morgan('combined'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));

// 세션 미들웨어 설정
const sessionMiddleware = session({
   secret: process.env.COOKIE_SECRET,
   resave: false,
   saveUninitialized: false,
});

app.use(sessionMiddleware);

// 정적 파일 템플릿 설정
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/friend', friendsRouter);

const server = app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트 대기');
});

webSocket(server, app, sessionMiddleware);
