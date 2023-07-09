const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const fs = require('fs');
const path = require('path');

const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

const basename = path.basename(__filename);

// 테이블 정의
fs.readdirSync(__dirname) // 현재 폴더의 모든 파일을 조회
   .filter(file => {
      // 숨김 파일, 현재 파일, js 확장자가 아닌 파일 필터링
      return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
   })
   .forEach(file => {
      // 해당 파일의 모델 불러온 후 초기화
      const model = require(path.join(__dirname, file));
      console.log(file, model.name);
      db[model.name] = model;
      model.initiate(sequelize);
   });

// 모델 간 관계 정의
Object.keys(db).forEach(modelName => {
   // associate 호출
   if (db[modelName].associate) {
      db[modelName].associate(db);
   }
});

module.exports = db;
