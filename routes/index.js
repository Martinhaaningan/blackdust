var express = require('express');
var router = express.Router();
const game = require('../controllers/game');
const { forwardAuthenticated, ensureAuthenticated} = require('../services/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  console.log(req.user);
  res.render('index', { title: 'Express',
  user: user });
});

router.get('/game', ensureAuthenticated, function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('game', 
  {user: user });
});

module.exports = function (io) {
    //Socket.IO here
  io.on('connection', function(socket){

    socket.on('handshake', async function() {
      let userID = socket.handshake.session.passport.user;
      console.log("User with ID: " + userID + " has entered the game"); 
      
      let map = await game.getMap(userID);
      socket.emit('hello', map);
    });
  
    socket.on('tileClicked', async function(coords){
      console.log('The user clicked on tile: ' + coords);

      let userID = socket.handshake.session.passport.user;
      let newMap = await game.rollNewTile(userID, coords);
      socket.emit('rolledTile', newMap);
    });
});





    return router;
};

