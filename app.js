const express = require('express');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const session = require('express-session');

const app = express();

app.set('port', 3000);

sequelize
   .sync({ force: false })
   .then(() => {
      console.log('DB connect success');
   })
   .catch(err => {
      console.error(err);
   });

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'views')));
app.use(
   session({
      secret: process.env.COOKIE_SECRET,
      resave: false,
      saveUninitialized: false,
   }),
);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트 대기');
});
