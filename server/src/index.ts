import express from "express";
import { timeStamp } from "node:console";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { v4 } from "uuid";
import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from "@google/genai";


console.log(process.env.GOOGLE_API_KEY);
const ai = new GoogleGenAI({ apiKey: "AIzaSyBfMphMKuNEjp9VL-wR0mPu-C_JqH7xdZc" });

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

    //add users to the queue
    socket.on('joinQueue', (user) => {
        waitingUsers.push({
            socket_id: socket.id,
            username: user.username || `Player_${socket.id.substring(0, 5)}`,
            ...user
        });

        //let the users know that they're in a queue
        // socket.emit('queueStatus', { status: 'waiting', position: waitingUsers.length });

        //start the match making after every player
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

        // socket.disconnect();
        gameRooms.delete(room);

        // if (!room.hasAI) {
        //     io.to(room.player2).emit('opponentDecided', { 
        //       decision,
        //       isCorrect
        //     });
        // }
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
    


    //if an user disconnect, move them from the queue
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        const idx = waitingUsers.findIndex(user => user.socket_id === socket.id);
        if(idx !== -1) {
            waitingUsers.splice(idx, 1);
        }

        for(const [room_id, room] of gameRooms.entries()) {
            if(room.player1 === socket.id || room.player2 === socket.id) {
                if(room.player1 === socket.id && !room.hasAI) {
                    io.to(room.player2).emit('opponentDisconnected')
                }else if(room.player2 === socket.id) {
                    io.to(room.player1).emit('opponentDisconnected');
                }

                gameRooms.delete(room_id);
            }
        }
    });
});

async function matchMaking() {

    if(waitingUsers.length === 0) return;

    if(waitingUsers.length === 1) {
        const player1 = waitingUsers[0];
        const useAI = Math.random() < 0.5;

        if(useAI) {
            waitingUsers.shift();
            createGame(player1, null, true);
        }else {
            await new Promise(resolve => setTimeout(resolve, 5000));

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
        const useAI = Math.random() < 0.3;

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

    // while(waitingUsers.length >= 2) {
    //     const player1 = waitingUsers.shift()!;
    //     const player2 = waitingUsers.shift()!;

    //     createGame(player1, player2, false);
    // }

    // if(waitingUsers.length === 1) {
    //     await new Promise(resolve => setTimeout(resolve, 3000));
    //     if(waitingUsers.length === 1) {
    //         const player1 = waitingUsers.shift()!;
    //         createGame(player1, null, true);
    //     }else if(waitingUsers.length >= 2) {
    //         matchMaking();
    //     }
    // }

    // if(waitingUsers.length >= 2) {
    //     const player1 = waitingUsers.shift();
    //     const player2 = waitingUsers.shift();

    //     createGame(player1, player2, false);
    // }else {
    //     const player1 = waitingUsers[0];
    //     await new Promise(resolve => setTimeout(resolve, 8000));

    //     if(waitingUsers.length >= 2) {
    //         waitingUsers.shift();
    //         const player2 = waitingUsers.shift();
    //         createGame(player1, player2, false);
    //     }else {
    //         waitingUsers.shift();
    //         createGame(player1, null, true);
    //     }
    // }

    // waitingUsers.forEach((user, index) => {
    //     io.to(user.socket_id).emit('queueStatus', { status: 'waiting', position: index + 1 });
    // });

    // if(waitingUsers.length > 0) {
    //     matchMaking();
    // }
    
    
    // const isAI = Math.random() > 0.5 || waitingUsers.length === 0;
    // let isAI = false;
    // if(waitingUsers.length === 0) {
    //     isAI = true;
    // }
    // // const isAI = false;
    
    // const game_room_id = `game-${v4()}`;


    // if(isAI) {
    //     //human vs ai
    //     console.log(`Creating human vs AI game in room ${game_room_id}`);

    //     io.sockets.sockets.get(player1.socket_id)?.join(game_room_id);

    //     gameRooms.set(game_room_id, {
    //         hasAI: true,
    //         player1: player1.socket_id,
    //         timeLimit: 60,
    //         startTime: Date.now()
    //     });

    //     io.to(player1.socket_id).emit('gameStart', {
    //         room_id: game_room_id,
    //         timeLimit: 60,
    //         username: player1.username,
    //         opponent: 'ai',
    //     })

    //     setTimeout(() => {
    //         io.to(game_room_id).emit('timeUp');
    //     }, 60000);

    // }else {

    //     // if(waitingUsers.length < 2) return;
    //     //human vs human
    //     const player2 = waitingUsers.shift();

    //     //getting the socket id of both the players
    //     const socket1 = io.sockets.sockets.get(player1.socket_id);
    //     const socket2 = io.sockets.sockets.get(player2.socket_id);

    //     //checking if the players are still active and haven't disconnected
    //     if(socket1 && socket2) {
    //         socket1.join(game_room_id);
    //         socket2.join(game_room_id);

    //         //store the game state
    //         gameRooms.set(game_room_id, {
    //             player1: socket1.id,
    //             player2: socket2.id,
    //             hasAI: false,
    //             startTime: Date.now(),
    //             timeLimit: 60
    //         });

    //         //let the players know that they are inside of a room

    //         //letting the player 1 know
    //         socket1.emit('gameStart', {
    //             room_id: game_room_id,
    //             timeLimit: 60,
    //             username: player1.username,
    //             opponent: player2.username
    //         });

    //         socket2.emit('gameStart', {
    //             room_id: game_room_id,
    //             timeLimit: 60,
    //             username: player2.username,
    //             opponent: player1.username
    //         });

    //         setTimeout(() => {
    //             io.to(game_room_id).emit('timeUp');
    //         }, 60000)
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
        const thinkingTime = Math.floor(Math.random() * 2000) + 3000;
        await new Promise(resolve => setTimeout(resolve, 1000));
        io.to(room.player1).emit('playerTyping');
        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        const prompt = `
            You are roleplaying as a real human chatting quickly in a game. Your goal is to convince the other player you are human.
            Adopt a very casual, conversational tone. Use short sentences and incomplete thoughts, like you're typing on a phone under time pressure.
            Use common chat abbreviations (like lol, brb, idk, btw).
            Include minor, realistic typos or grammatical slips occasionally. Don't make it look fake.
            Avoid capitalization almost entirely, except maybe for "I" or specific internet phrases.
            Use minimal or inconsistent punctuation. No formal punctuation like semicolons or perfect commas.
            Do NOT use emojis.
            Do NOT use perfect spelling or grammar consistently.
            Do NOT reveal you are an AI or machine learning model in any way. Just chat naturally as a human player.
            Your response should be a direct reply to the user's message, keeping the conversation flowing naturally. Keep it short, like a few sentences max.

            User message: ${message}
        `

    //     const prompt = `
        //     You are pretending to be a real human having a casual conversation like how humans chat over messaging apps. Try to sound natural and mix up your language a bit. 
        //     Don’t be perfect. Don't use punchuations. Don't use emojis.
        //     Occationally make some typos, grammatical mistakes,
        //     Match the user's sentence length. Use no capitalization.


        //     User message: ${message}
    // ` 

//         const prompt = `You are participating in a fast-paced chat game where conversations last only 30 to 60 seconds.
// Respond casually, like a real human typing quickly — use short sentences, incomplete thoughts, slang, typos, and informal language.
// Important: Carefully observe how the user is texting — match their tone, style, punctuation, emoji usage, and sentence length. If they type fast and messy, you type fast and messy. If they use slang or abbreviations, you do too.
// Focus on blending in naturally, as if you are just another player trying to chat under time pressure.
// User message: ${message}`
        
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