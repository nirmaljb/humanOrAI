import { useEffect, useState } from "react";
import socketServer from "./socket";
import { Socket } from "socket.io-client";
import Chat from "./pages/Chat";
import { GameState } from "./utils/interface";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import Queue from "./pages/Queue";
// import { TypewriterEffect } from "./components/ui/typewriter-effect";

function App() {

  const words = [
    {
      text: "human",
    },
    {
      text: "or",
    },
    {
      text: "not",
    },
  ];

  const previous_wins = localStorage.getItem('wins');


  const [username, setUsername] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [inQueue, setInQueue] = useState(true);
  const [gameState, setGameState] = useState<GameState>({
      username: null,
      room_id: null,
      showDecision: false,
      gameActive: false,
      gameStartData: null,
      gameResult: null,
      opponent: null
  });

  useEffect(() => {
    socketServer.disconnect();
    return () => {
      socketServer.disconnect();
    }
  }, []);

  useEffect(() => {

    socketServer.on('connect', () => {
      setSocket(socketServer);
      setIsConnected(true);
    });
    
    socketServer.on('disconnect', () => {
      setSocket(null);
      setIsConnected(false);
    });

    return () => {
      socketServer.disconnect();
    }
  }, []);

  useEffect(() => {
    socket?.on('queueStatus', (data) => {
        setInQueue(true);
        console.log(data);
        // setGameState(null);
    });

    socket?.on('gameStart', (data) => {
        console.log("game started")
        setInQueue(false);
        setGameState({
            username: data.username,
            room_id: data.room_id,
            gameActive: true,
            opponent: data.opponent,
            // @ts-ignore
            gameStartData: {
              startTime: Date.now(),
              duration: data.timeLimit
            },
            showDecision: false,
            gameResult: null
        });
        console.log(gameState);
    });

    socket?.on('gameResult', (data) => {
      if(data.isCorrect && previous_wins) {
        localStorage.setItem('wins', (parseInt(previous_wins) + 1).toString());
      }
      setGameState((prev) => ({
        ...prev,
        // gameActive: false,
        gameResult: {...data}
      }))
    })

    socket?.on('timeUp', () => {
      setGameState((prev) => ({
        ...prev,
        showDecision: true,
      }))
    });

    return () => {
      socket?.off("queueStatus");
      socket?.off("gameStart");
      socket?.off("gameResult");
      socket?.off("opponentDisconnected");
      socket?.off('timeUp');
    }
  }, [socket])


  const joinQueue = () => {
    if(username.trim().length === 0) return;
    
    setGameState({
        username: null,
        room_id: null,
        showDecision: false,
        gameActive: false,
        gameStartData: null,
        gameResult: null,
        opponent: null
    });
    
    console.log(gameState);
    socketServer.connect();

    socketServer.emit('joinQueue', { username: username });
    setInQueue(true);
  };

  const disconnectQueue = () => {
    setInQueue(false);
    socket?.disconnect();
  }

  const exitGame = () => {
    socket?.disconnect();
    setGameState({
        username: null,
        room_id: null,
        showDecision: false,
        gameActive: false,
        gameStartData: null,
        gameResult: null,
        opponent: null
    });
  }

  if(isConnected && inQueue) {
    return (
      <Queue cancelQueue={disconnectQueue} />
    )
  }

  if(gameState.gameActive) {
    return (
        <Chat socket={socket} gameState={gameState} joinQueue={joinQueue} exitGame={exitGame}/>
    )
  }



  return (
    <>
    <div className="container max-w-md grid place-content-center h-dvh m-auto">
      <div className="text-center w-full">
        <div className="space-y-5 mb-8 px-5 max-w-64 md:max-w-md">
          <h1 className="text-5xl press-start-2p-regular max-w-80 mx-auto">human or not?</h1>
          {/* <TypewriterEffect className="text-[#03ff03] text-5xl press-start-2p-regular max-w-64 m-auto" words={words} /> */}
          <p className="mt-7 text-white bg-black">A Social Turing Game.</p>
          <p className="text-sm md:mx-16">Chat with someone for 1 minute, then guess if they're human or AI.</p>
        </div>
        <div className="flex-row max-w-64 m-auto mt-5 space-y-4">
          <Input className="py-5 text-sm" type="text" placeholder="Username..." onChange={e => setUsername(e.target.value)} value={username} />
          <Button size={"lg"} className="w-full text-[#03ff03] hover:cursor-pointer"onClick={joinQueue}>Play!</Button>
        </div>
      </div>
  </div>
    </>
  )
}
export default App;
