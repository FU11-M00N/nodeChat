const Sequelize = require('sequelize');

class User extends Sequelize.Model {
   static initiate(sequelize) {
      User.init(
         {
            username: {
               type: Sequelize.STRING(30),
               allowNull: false,
               unique: true,
            },
            password: {
               type: Sequelize.STRING(100),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'user',
            paranoid: true,
            charset: 'utf8',
         },
      );
   }
   //    static associate(db) {
   //       // Chat : Room => 1:N
   //       db.User.hasMany(db.Chat);
   //    }
}
module.exports = User;
