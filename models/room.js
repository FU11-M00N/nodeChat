const Sequelize = require('sequelize');

class Room extends Sequelize.Model {
   static initiate(sequelize) {
      Room.init(
         {
            title: {
               type: Sequelize.STRING(30),
               allowNull: false,
               unique: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Room',
            tableName: 'room',
            paranoid: true,
            charset: 'utf8',
         },
      );
   }
   static associate(db) {
      // Chat : Room => 1:N
      db.Room.hasMany(db.Chat);
   }
}
module.exports = Room;
