const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Serve the files in the current directory
app.use(express.static(__dirname));

const players = {};

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);
  
  // Create a new player with random color
  players[socket.id] = {
    x: 400,
    y: 300,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  };

  // Tell the new player about all existing players
  socket.emit('currentPlayers', players);
  
  // Tell everyone else a new player joined
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });

  // When a player moves, update their position and tell everyone else
  socket.on('playerMovement', (movementData) => {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    socket.broadcast.emit('playerMoved', { id: socket.id, x: movementData.x, y: movementData.y });
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('playerDisconnected', socket.id);
  });
});

// Run the server on port 3000
const PORT = 3000;
http.listen(PORT, () => {
  console.log(`Game Server running! Open http://localhost:${PORT} in your browser.`);
});


