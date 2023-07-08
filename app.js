const express = require('express');
const morgan = require('morgan');

const { sequelize } = require('./models');

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

app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트 대기');
});
