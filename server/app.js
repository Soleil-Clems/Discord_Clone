const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const channelRoutes = require('./routes/channelRoutes');
const openAiRoutes = require('./routes/openAiRoute');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const httpServer = http.createServer(app);
const io = socketIo(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());
app.use('/api/messages', messageRoutes);
app.use('/api/openai', openAiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/channels', channelRoutes);

const users = {};
const rooms = {};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinRoom', ({ room, user }) => {
        if (typeof room !== 'string') {
            room = room.toString();
        }
        if (users[socket.id] && users[socket.id].rooms.includes(room)) {
            return;
        }

        if (users[socket.id]) {
            users[socket.id].rooms.forEach(r => {
                socket.leave(r);
                io.to(r).emit('message', {
                    content: `${users[socket.id].nickname} left the room`,
                    type: 'notification'
                });
                rooms[r] = rooms[r].filter(id => id !== socket.id);
                io.to(r).emit('userList', rooms[r].map(socketId => users[socketId].nickname));
            });
            users[socket.id].rooms = [];
        } else {
            users[socket.id] = { nickname: user, rooms: [] };
        }

        socket.join(room);
        users[socket.id].rooms.push(room);

        if (!rooms[room]) {
            rooms[room] = [];
        }
        rooms[room].push(socket.id);

        console.log(`${user} joined room: ${room}`);
        io.to(room).emit('message', {
            content: `${user} joined the room ${room}`,
            type: 'notification'
        });
        io.to(room).emit('userList', rooms[room].map(socketId => users[socketId].nickname));
    });

    socket.on("create", ({ room }) => {
        if (users[socket.id]) {
            const user = users[socket.id].nickname;
            io.to(room).emit('message', {
                content: `${user} created a room : ${room}`,
                type: 'notification'
            });
            console.log(user)
        }
    });

    socket.on('leaveRoom', ({ room }) => {
        if (users[socket.id] && users[socket.id].rooms.includes(room)) {
            const user = users[socket.id].nickname;
            socket.leave(room);
            users[socket.id].rooms = users[socket.id].rooms.filter(r => r !== room);
            rooms[room] = rooms[room].filter(id => id !== socket.id);
            if (rooms[room].length === 0) {
                delete rooms[room];
            }

            console.log(`${user} left room: ${room}`);
            io.to(room).emit('message', {
                content: `${user} left the room`,
                type: 'notification'
            });
            io.to(room).emit('userList', rooms[room] ? rooms[room].map(socketId => users[socketId].nickname) : []);
        }
    });

    socket.on('message', ({ room, message, user }) => {
        console.log(room)
        io.to(room).emit('message', {
            content: message,
            sender: { username: user },
            type: 'message'
        });
    });

    socket.on('typing', ({ room, message, user }) => {
        console.log(room)
        io.to(room).emit('message', {
            content: message,
            sender: { username: user },
            type: 'typing'
        });
    });

    socket.on('openai', ({ room, message, user }) => {
        console.log(room)
        io.to(room).emit('message', {
            content: message,
            sender: { username: user },
            type: 'img'
        });
    });

    socket.on('deleteRoom', ({ room, user }) => {
        console.log(room)
        io.to(room).emit('message', {
            content: `${user} delete room: ${room}`,
            sender: { username: user },
            type: 'notification'
        });
    });

    socket.on('updateRoom', ({ room, user }) => {
        console.log(room)
        io.to(room).emit('message', {
            content: `${user} update room: ${room}`,
            sender: { username: user },
            type: 'notification'
        });
    });

    socket.on('privateMessage', ({ to, message }) => {
        const recipientSocketId = Object.keys(users).find(id => users[id].nickname === to);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('message', {
                content: message,
                type: 'message'
            });
        }
    });

    const intervalId = setInterval(() => {
        socket.emit('rmmsg', { message: 'This is a periodic event' });
        console.log('Emitting periodic event');
    }, 5 * 60 * 1000);

    socket.on('nick', ({ room, nick, user }) => {
        if (users[socket.id]) {
            const oldNick = users[socket.id].nickname;
            users[socket.id].nickname = nick;
            io.to(room).emit('message', {
                content: `${oldNick} changed nickname to ${nick}`,
                sender: { username: user },
                type: 'notification'
            });


        }
    });

    socket.on('getUsers', (room, callback) => {
        if (rooms[room]) {
            const usersInRoom = rooms[room].map(socketId => users[socketId].nickname);
            callback(usersInRoom);
            console.log(usersInRoom)

        } else {
            callback([]);
        }
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            users[socket.id].rooms.forEach(room => {
                rooms[room] = rooms[room].filter(id => id !== socket.id);
                io.to(room).emit('message', {
                    content: `${users[socket.id].nickname} left the room`,
                    type: 'notification'
                });
                io.to(room).emit('userList', rooms[room].map(socketId => users[socketId].nickname));
            });
            delete users[socket.id];
        }
        console.log('Client disconnected');
    });
});

module.exports = httpServer;
