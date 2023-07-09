const Sequelize = require('sequelize');

class Chat extends Sequelize.Model {
   static initiate(sequelize) {
      Chat.init(
         {
            chat: {
               type: Sequelize.STRING(30),
               allowNull: false,
               unique: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Chat',
            tableName: 'chat',
            paranoid: true,
            charset: 'utf8',
         },
      );
   }
   static associate(db) {
      // Chat : Room => 1:N
      db.Chat.belongsTo(db.Room);
   }
}
module.exports = Chat;
