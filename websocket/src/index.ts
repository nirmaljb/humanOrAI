import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";


const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173'
    }
});


app.get('/', (req, res) => {
    res.json({message: 'server running'});
});

// //middleware to check if the username has already been taken or not
// io.use((socket, next) => {
//     const username = socket.handshake.auth.username;
//     if(!username) {
//         return next(new Error('invalid username'));
//     }
//     (socket as any).username = username;
//     next();
// })

const waitingUsers: any[] = [];
io.on('connection', (socket) => {

    const isAI = Math.random() < 0.5
    const room = isAI ? `ai-room` : `human-room-${socket.id}`;
    socket.join(room)

    console.log(room);

    (socket as any).user = {
        id: socket.id,
        joinedAt: Date.now(),
        room: room
    };

    socket.on('message', () => {
        if(isAI) {
            const response = { message: 'asdfasdfasdfasdf' };
            const message = response.message;
    
            io.to(room).emit('foo', message);
        }
    });

    // }else {
    //     waitingUsers.push(socket);
    //     console.log(`User ${socket.id} added to waiting queue. Queue size: ${waitingUsers.length}`);
    // }
    
    console.log('a user has connected');

    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`);

        const user_idx = waitingUsers.findIndex(user => user.id == socket.id);
        if(user_idx != -1) {
            waitingUsers.splice(user_idx, 1);
        }

        socket.broadcast.emit("user has disconnected");



    });
});

io.listen(8000);