var express = require('express');
var router = express.Router();
const game = require('../controllers/game');
const { forwardAuthenticated, ensureAuthenticated} = require('../services/auth');

/* GET home page. */ 
router.get('/', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('index', { title: 'Express',
  user: user });
});

router.get('/news', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('news', { title: 'Express',
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
    let userID = socket.handshake.session.passport.user;
    console.log("User with ID: " + userID + " has entered the game"); 
    
    socket.on('connected', async function(){
      let map = await game.getMap(userID);
      let user = await game.getUser(userID);  
      if (map === null) {
        await game.createMap(userID);
        map = await game.getMap(userID);
      }
      await game.addToRegion(userID);
      socket.emit('getMap', map, user.name, function(res) {
        console.log('client responded with: ' + res);
      });

    });

    
    socket.on('tileClicked', async function(coords){
      console.log('The user clicked on tile: ' + coords);

      let userID = socket.handshake.session.passport.user;
      let newTile = await game.rollNewTile(userID, coords);

      socket.emit('rolledTile', newTile);
    });

    socket.on('message', function(msg) {
      io.emit('message', msg);
    });
});





    return router;
};

