/* JS Document */
/* Handles client-server connection */
// Create SocketIO instance, connect

namespace = '/link'; // change to an empty string to use the global namespace
var sep = ":::"; // separator

// the socket.io documentation recommends sending an explicit package upon connection
// this is specially important when using the global namespace

//var socket = io.connect('https://' + document.domain + ':' + location.port + namespace);
// Changing from the above line in the original example to the following allows the
// system to work locally with http, and on Heroku with both https and http:
var socket = io.connect(namespace);

// Add a connect listener
socket.on('connect',function() {
  console.log('Client has connected to the server!');
  if (disconnected && requestNotReceived) {
    run();
    console.log("resending");
  }
});
// Add a connect listener
socket.on('message',function(data) {
  console.log('Received a message from the server!',data);
  alert('Received a message from the server!',data);
});
// Add a connect listener
socket.on('simOutput',function(data) {
  document.getElementById("run").innerHTML = "Simulate!";
  console.log('Received simulation output from the server!');
  files = decodeFileMsg(data);
  displaySimOutput(files);
  //downloadOutput();
});

// Add a connect listener
socket.on('error',function(data) {
  console.log('Received error from the server!');
  document.getElementById("run").innerHTML = "Simulate!";
  alert("There was an error trying to run the simulation. Check you have all your variables and constants listed in the spaces provided!");
});

// Add a disconnect listener
socket.on('disconnect',function() {
  console.log('The client has disconnected!');
  disconnected = true;
});

// Sends a message to the server via sockets
function sendMessageToServer(message,type) {
  socket.emit(type, {data: message});
  console.log(message + " :: sent");
};
