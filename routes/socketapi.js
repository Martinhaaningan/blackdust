var socket_io = require( "socket.io" );
var io = socket_io();
var socketapi = {};
socketapi.io = io;

//sætter sessions data for socket.io som er delt fra express-session
//lytter på login event, sæt en login emit på frontend

io.on("connection", function(socket) {
    console.log( "A user connected" );
    // Accept a login event with user's data

    socket.on("login", function(userdata) {
        console.log(socket); 
        //socket.handshake.session.userdata = userdata;
        //socket.handshake.session.save();
          
    });
    socket.on("logout", function(userdata) {
        if (socket.handshake.session.userdata) {
            delete socket.handshake.session.userdata;
            socket.handshake.session.save();
        }
    });        
});





// end of socket.io logic

module.exports = socketapi;