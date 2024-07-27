const express = require('express');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 3000 ;

let connectedUsers = {}; // Store connected users using a dictionary (object)

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/game.html");
});

// app.get('/game', (req, res) => {
//     res.sendFile(__dirname + "/public/game.html");
// });

io.on("connection", (socket) => {
    if (io.engine.clientsCount <= 4) {
        // Send the usernames of connected users to the newly connected client
        socket.emit("nmessage", Object.values(connectedUsers));
    } else {
        socket.emit("maxClientReached");
    }

    // Listen for the username from the client and store it in the connectedUsers object
    socket.on("setUsername", (username) => {
        connectedUsers[socket.id] = { username, score: 0,lives:3 };
        // Broadcast the updated usernames to all clients
        io.emit("nmessage", Object.values(connectedUsers));
    });

    socket.on("updateScore", (newScore) => {
        if (connectedUsers[socket.id]) {
            connectedUsers[socket.id].score = newScore;
            // Broadcast the updated score to all clients
            io.emit("nmessage", Object.values(connectedUsers));
        }
    });

    socket.on('updateLives', (newLives) => {
        if (connectedUsers[socket.id]) {
            connectedUsers[socket.id].lives = newLives;
            const playersWithLives = Object.values(connectedUsers).filter(player => player.lives > 0);
            if (playersWithLives.length === 0) {
                io.emit('gameOver');
            }
            io.emit('nmessage', Object.values(connectedUsers));
        }
    });

    // Listen for the disconnect event
    socket.on("disconnect", () => {
        const disconnectedUser = connectedUsers[socket.id];
        delete connectedUsers[socket.id];
        // Broadcast the updated usernames to all clients
        io.emit("nmessage", Object.values(connectedUsers));
    });
});

server.listen(PORT, () => {
    console.log("The server is running on port 3000");
});
