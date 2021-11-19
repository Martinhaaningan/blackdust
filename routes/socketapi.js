var app = require('express');
const server = require('http').Server(app);
const io = require('socket.io')(server);
var socketapi = {}
socketapi = io;
//sætter sessions data for socket.io som er delt fra express-session
//lytter på login event, sæt en login emit på frontend

io.on('connection', function(socket){
    socket.on('loggedIn', function() {
    console.log("User with ID: " + socket.handshake.session.passport.user + " is logged in"); 
    });
});






// end of socket.io logic

module.exports = socketapi;