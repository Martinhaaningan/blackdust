var socket_io = require( "socket.io" );

var io = socket_io();
var socketapi = {};

socketapi.io = io;

// Add your socket.io logic here!
io.on( "connection", function(socket) {
    console.log( "A user connected" );
    socket.on("disconnect", function(socket) {
    console.log("user disconnected");

  });

});







// end of socket.io logic

module.exports = socketapi;