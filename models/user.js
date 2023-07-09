const Sequelize = require('sequelize');
const Friendship = require('./friendship');

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
   static associate(db) {
      // User : User => N:M
      db.User.belongsToMany(db.User, {
         through: Friendship,
         as: 'friends',
      });
   }
}
module.exports = User;
