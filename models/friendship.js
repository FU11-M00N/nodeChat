const Sequelize = require('sequelize');

class Friendship extends Sequelize.Model {
   static initiate(sequelize) {
      Friendship.init(
         {
            status: {
               type: Sequelize.STRING(30),
               defaultValue: 'pending',
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Friendship',
            tableName: 'friendship',
            paranoid: true,
            charset: 'utf8',
         },
      );
   }
}
module.exports = Friendship;
