const socket = io('/');

let Events = {}

Events.getMap = async function(onDone) {
  socket.emit('connected');
  socket.on('getMap', function(map, user, callback){
    console.log("A map has been served for the user.");
    let res = 'map served succesfully';
    callback(res);
    onDone(map, user);
    });
};

// Events.incomingMsg = async function(onDone) {
// 	socket.on('message', function(msg) {
// 	  console.log(msg);
// 	  onDone(msg);
// 	});

// 	let chatFrame = $('chatFrame');
// 	if (chatFrame === null) {
// 		Interface.openChat();
// 	}
// 	var item = document.createElement('li');
// 	item.style.margin = '5px';
// 	item.style.listStyleType = 'none';
// 	item.textContent = msg;
// 	  let messages = $('messages');
// 	  messages.appendChild(item);
// }

Events.tileRequest = async function(coords) {
	socket.emit('tileClicked', coords);
}

Events.tileResult = async function(onDone) {
	socket.on('rolledTile', function(newTile) {
	  console.log('A tile has been revealed. Rendering...');
	  onDone(newTile);
	});
}

export {Events}

