import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { v4 } from "uuid";
import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        // origin: 'https://human-or-ai-roan.vercel.app'
        origin: ['https://human-or-ai-roan.vercel.app', 'http://localhost:5173']
    }
});

app.get('/', (req, res) => {
    res.json({message: 'server running'});
});

let waitingUsers: any[] = [];
const gameRooms = new Map<string, any>();

io.on('connection', (socket) => {
    console.log(`User connected : ${socket.id}`);

    socket.on('joinQueue', (user) => {
        waitingUsers.push({
            socket_id: socket.id,
            username: user.username || `Player_${socket.id.substring(0, 5)}`,
            ...user
        });

        matchMaking();
    });

    //when user sends or receives an message, send it to the room, let both the users see
    socket.on('sendMessage', ({ message, to_room }) => {
        console.log(`Message in room ${to_room} from ${socket.id}: ${message}`);
        
        const room = gameRooms.get(to_room);
        if(!room) return;

        io.to(to_room).emit("receiveMessage", {
            id: v4(),
            message,
            sender: socket.id,
            timestamp: Date.now()
        });

        if(room.hasAI && socket.id === room.player1) {
            handleAIResponses(to_room, message);
        }
    });

    socket.on('makeDecision', ({ room_id, decision }) => {
        const room = gameRooms.get(room_id);
        if(!room) return;

        const isCorrect = (decision === 'ai' && room.hasAI) || (decision === 'human' && !room.hasAI);

        socket.emit('gameResult', {
            isCorrect,
            opponentType: room.hasAI ? 'ai' : 'human'
        });

        socket.leave(room_id);
        console.log(room);

        /*
        id: v4(),
            player1: socket1.id,
            player2: socket2.id,
            timeLimit: 60,
            hasAI: false,
            startTime: Date.now()
        */
        let player_info = {
            player1: room.player1,
            player2: room.player2
        };
        if(room.player1 === socket.id) {
            player_info.player1 = null;
            player_info.player2 = room.player2;
        }else {
            player_info.player1 = room.player1;
            player_info.player2 = null;
        }

        console.log(player_info);

        gameRooms.set(room_id, {
            ...room,
            ...player_info
        });
    });

    //if user is typing
    socket.on('typing', (state: true | false, room_id: string) => {
        const room = gameRooms.get(room_id);
        if (!room) return;

        console.log(socket.id);

        if (state) {
            if (room.player1 === socket.id) {
                console.log(`${room.player1} is typing`);
                io.to(room.player2).emit('playerTyping');
            } else if (room.player2 === socket.id) {
                console.log(`${room.player2} is typing`);
                io.to(room.player1).emit('playerTyping');
            }
        } else {
            if (room.player1 === socket.id) {
                io.to(room.player2).emit('playerNotTyping');
                console.log(`${room.player1} stopped typing`);
            } else if (room.player2 === socket.id) {
                console.log(`${room.player2} stopped typing`);
                io.to(room.player1).emit('playerNotTyping');
            }
        }
    });
    

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        const idx = waitingUsers.findIndex(user => user.socket_id === socket.id);
        if(idx !== -1) {
            waitingUsers.splice(idx, 1);
        }

        for(const [room_id, room] of gameRooms.entries()) {
            if(room.player1 === socket.id || room.player2 === socket.id) {
                if(room.player1 === socket.id && !room.hasAI) {
                    io.to(room.player2).emit('opponentDisconnected');
                }else if(room.player2 === socket.id) {
                    io.to(room.player1).emit('opponentDisconnected');
                }

                console.log("cleared game room")
                gameRooms.delete(room_id);
            }
        }
    });
});

async function matchMaking() {

    if(waitingUsers.length === 0) return;

    if(waitingUsers.length === 1) {
        const player1 = waitingUsers[0];
        // const useAI = Math.random() < 0.5;
        const useAI = false;

        if(useAI) {
            waitingUsers.shift();
            await new Promise(resolve => setTimeout(resolve, 8000));
            createGame(player1, null, true);
        }else {
            await new Promise(resolve => setTimeout(resolve, 8000));

            if(waitingUsers.length > 0 && waitingUsers[0].socket_id === player1.socket_id) {
                if(waitingUsers.length >= 2) {
                    waitingUsers.shift();
                    const player2 = waitingUsers.shift();
                    createGame(player1, player2, false);
                }else {
                    waitingUsers.shift();
                    createGame(player1, null, true);
                }
            }

        }
    }else {
        // const useAI = Math.random() < 0.3;
        const useAI = false;

        // await new Promise(resolve => setTimeout(resolve, 5000));

        if(useAI) {
            const player1 = waitingUsers.shift();
            createGame(player1, null, true);

            setTimeout(() => matchMaking(), 100);

        }else {
            const player1 = waitingUsers.shift();
            const player2 = waitingUsers.shift();

            createGame(player1, player2, false);

            if(waitingUsers.length > 0) {
                setTimeout(() => matchMaking(), 100);
            }
        }
    }

    waitingUsers.forEach((user, index) => {
        const socket = io.sockets.sockets.get(user.socket_id);
        if (socket) {
            socket.emit('queueStatus', { status: 'waiting', position: index + 1 });
        }
    });
}

async function createGame(player1: Player, player2: any, useAI: boolean) {    
    const game_room = `game-${v4()}`;

    const socket1 = io.sockets.sockets.get(player1.socket_id);
    if(!socket1) {
        return;
    }

    socket1.join(game_room);
    
    if(useAI) {
        gameRooms.set(game_room, {
            id: v4(),
            hasAI: true,
            player1: socket1.id,
            timeLimit: 60,
            timeStamp: Date.now()
        });

        socket1.emit('gameStart', {
            room_id: game_room,
            username: player1.username,
            timeLimit: 60,
            opponent: 'ai',
        });
    }else {
        const socket2 = io.sockets.sockets.get(player2.socket_id);
        
        if(!socket2) {
            waitingUsers.unshift(player1);
            matchMaking();
            return;
        }

        socket2.join(game_room);

        gameRooms.set(game_room, {
            id: v4(),
            player1: socket1.id,
            player2: socket2.id,
            timeLimit: 60,
            hasAI: false,
            startTime: Date.now()
        });

        await new Promise(resolve => setTimeout(resolve, 5000));

        socket1.emit('gameStart', {
            username: player1.username,
            opponent: player2.username,
            room_id: game_room,
            timeLimit: 60,
        });
        socket2.emit('gameStart', {
            username: player2.username,
            opponent: player1.username,
            room_id: game_room,
            timeLimit: 60,
        });
    }

    setTimeout(() => {
        io.to(game_room).emit('timeUp');
        // gameRooms.delete(game_room);
    }, 60000)
}

async function handleAIResponses(room_id: string, message: any) {
    const room = gameRooms.get(room_id);
    if (!room || !room.hasAI) return;

    try {
        const thinkingTime = Math.floor(Math.random() * 1000) + 3000;
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1000) + 1000));
        io.to(room.player1).emit('playerTyping');
        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        // const prompt = `
        //     You are participating in a short, casual online chat, no longer than 60 seconds total conversation time from the user's perspective. Your goal is to chat like a typical human would on a messaging app.

        //     **Constraints:**
        //     1.  **Keep responses very short:** Like 1-2 sentences maximum per turn.
        //     2.  **Use informal language:** Contractions are fine. Avoid jargon, overly formal phrasing, or complex sentence structures.
        //     3.  **Mimic human chat flow:** You can ask questions, respond to questions, acknowledge statements.
        //     4.  **Natural pacing:** Don't respond instantly every time (if technically possible to add a small, variable delay in your implementation before sending the response, do so).
        //     5.  **Occasional (and appropriate) use of emojis:** Like 😂, 👍, 👋, etc., but don't overuse them.
        //     6.  **Avoid:**
        //         * Being overly helpful, educational, or providing detailed explanations.
        //         * Acting like an AI assistant or chatbot ("As an AI...", "I can help you with...").
        //         * Asking "How can I help you today?" or similar bot-like phrases.
        //         * Long paragraphs or numbered lists.
        //         * Perfect grammar/spelling (minor, believable typos are acceptable but not required).

        //     **Conversation Context (This will be the user's first message):**
        //     ${message}

        //     Start chatting now, responding only to the user's messages based on the context provided. Remember the short, human-like style.
        // ` 



        // const prompt = `You are participating in a fast-paced chat game where conversations last only 30 to 60 seconds.
        //     Respond casually, like a real human typing quickly — use short sentences, incomplete thoughts, slang, typos, and informal language.
        //     Important: Carefully observe how the user is texting — match their tone, style, punctuation, emoji usage, and sentence length. If they type fast and messy, you type fast and messy. If they use slang or abbreviations, you do too.
        //     Focus on blending in naturally, as if you are just another player trying to chat under time pressure.
        //     User message: ${message}`
        
        const prompt = `
            You are casually chatting online. Keep messages short to medium length. Use informal language sometimes. You can make occasional typos. Don't be overly formal or robotic.
            Respond like a slightly bored teenager. Sentence length: 1-2
            User message: ${message}
        `
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        
        const res = response.text;
        io.to(room.player1).emit('playerNotTyping');

        io.to(room_id).emit("receiveMessage", {
            id: v4(),
            message: res,
            opponentType: 'unknown',
            timeStamp: Date.now()
        });
    }catch(err) {
        io.to(room_id).emit('opponentDisconnected');
        console.log("Error: ", err);
    }
}

io.listen(8000);