var express = require('express');
var router = express.Router();
const game = require('../controllers/game');

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('index', { title: 'Express',
  user: user });
});

router.get('/game', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('game', 
  {user: user });
});

module.exports = function (io) {
    //Socket.IO here
    io.on('connection', function(socket){

      let userID = socket.handshake.session.passport.user;
      socket.on('loggedIn', async function() {
      console.log("User with ID: " + userID + " is logged in"); 

      let email = await game.getEmail(userID);
      socket.emit('hello', email);
      });
  
    });

    return router;
};

