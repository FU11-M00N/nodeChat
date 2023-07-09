const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/user');

exports.login = async (req, res) => {
   try {
      const { username, password } = req.body;

      const user = await User.findOne({
         where: { username },
      });

      if (!user) {
         return res.status(404).send('사용자를 찾을 수 없습니다.');
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
         return res.status(401).send('잘못된 패스워드입니다.');
      }
      req.session.user = {
         id: user.id,
         username: user.username,
      };

      res.status(200).redirect('/');
   } catch (error) {
      console.error(error);
   }
};

exports.join = async (req, res) => {
   try {
      const { username, password } = req.body;

      const hash = await bcrypt.hash(password, 12);

      await User.create({
         username,
         password: hash,
      });
      res.status(201).redirect('/');
   } catch (error) {
      console.error(error);
   }
};
