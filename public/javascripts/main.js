'use strict'

const socket = io();

let loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function() {
  let uid = document.getElementById('uid').value;
  console.log("test");
  socket.emit('login', uid.value);
});