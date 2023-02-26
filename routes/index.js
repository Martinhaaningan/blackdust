var express = require('express');
var router = express.Router();
const maps = require('../controllers/maps');
const init = require('../controllers/init');
const users = require('../controllers/users');
const units = require('../controllers/units');

const { forwardAuthenticated, ensureAuthenticated} = require('../services/auth');

/* GET home page. */ 
router.get('/', function(req, res, next) {
  let user = req.user ? req.user.email: null;
  res.render('index', { title: 'Express',
  user: user});
});

router.get('/news', function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('news', { title: 'Express',
  user: user});
});

router.get('/game', ensureAuthenticated, function(req, res, next) {
  let user = req.user ? req.user.email: null; 
  res.render('game', 
  {user: user});
});

module.exports = function (io) {
    //Socket.IO here
  io.on('connection', function(socket){
    let userID = socket.handshake.session.passport.user;
    console.log("User with ID: " + userID + " has entered the game"); 
    
    socket.on('connected', async function(){
      let board = await maps.getMap(userID);
      let user = await users.getUser(userID);  
      
      //if no board is found we need to run a startup routine
      if (board === null) {
        await init.createMap(userID);
        board = await maps.getMap(userID);
      }
      await maps.addToRegion(userID);
      socket.emit('getMap', board, user.name, function(res) {
        console.log('client responded with: ' + res);
      });

    });

    
    socket.on('tileClicked', async function(coords){
      console.log('The user clicked on tile: ' + coords);

      let userID = socket.handshake.session.passport.user;
      let newTile = await maps.rollNewTile(userID, coords);

      socket.emit('rolledTile', newTile);
    });

    socket.on('message', function(msg) {
      io.emit('message', msg);
    });
  });





    return router;
};

