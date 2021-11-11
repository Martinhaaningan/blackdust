'use strict'

const socket = io('/');

let loginForm = document.getElementById('loginForm');

loginForm.addEventListener('click', function() {
  socket.emit('login', {name: Martin});
});