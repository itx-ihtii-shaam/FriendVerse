const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('Player joined FriendVerse:', socket.id);

    players[socket.id] = { x: 0, y: 0, z: 0 };
    io.emit('currentPlayers', players);

    socket.on('playerMove', (data) => {
        if (players[socket.id]) {
            players[socket.id] = data;
            socket.broadcast.emit('playerMoved', { id: socket.id, position: data });
        }
    });

    socket.on('playerAction', (data) => {
        socket.broadcast.emit('playerActionBroadcast', { id: socket.id, action: data.action });
    });

    socket.on('disconnect', () => {
        console.log('Player left:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`FriendVerse server active on port ${PORT}`);
});
