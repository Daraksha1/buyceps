'use strict';

var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var user = mongoose.model('user');

exports.register = function(req, res, next) {
    var newUser = new user(req.body);
    newUser.password = bcrypt.hashSync(req.body.password, 10);

    user.create(newUser).then(function(user){
        user.password = undefined;
        res.send(user);
    }).catch(function(err) {
        if(err.code == 11000) {
            err.status = 409;
            err.message = "User with the given Email Id already Exist.";
        }
        next(err);
    });
};

exports.signIn = function(req, res) {
    user.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) throw err;
      if (!user || !user.comparePassword(req.body.password)) {
        return res.status(401).json({ message: 'Authentication failed. Invalid user or password.' });
      }
      const payload = {
        email: user.email
      };

      var token = jwt.sign(payload, 'buycepsdotcomsecret', {
          expiresIn: 1440,
      });
      return res.json({
          success: true,
          message: 'auth token',
          token: token,
          isAdmin: user.isAdmin
      });
    });
  };
  
  exports.loginRequired = function(req, res, next) {
    if (req.user) {
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized user!' });
    }
  };