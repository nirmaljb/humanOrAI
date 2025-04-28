import { useEffect, useState } from "react";
import socketServer from "./socket";
import { Socket } from "socket.io-client";
import Chat from "./pages/Chat";
import { GameState } from "./utils/interface";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import Queue from "./pages/Queue";

function App() {
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
      console.log(`User ${socketServer.id} is connected`);
      setSocket(socketServer);
      setIsConnected(true);
    });
    
    socketServer.on('disconnect', () => {
      console.log(`User ${socketServer.id} is disconnected`);
      setSocket(null);
      setIsConnected(false);
    });

    return () => {
      socketServer.disconnect();
    }
  }, []);

  useEffect(() => {
    socket?.on('queueStatus', (data) => {
        console.log(`Queue status: ${data}`);
        setInQueue(true);
    });

    socket?.on('gameStart', (data) => {
        console.log(`Game started: ${data}`);
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
    });

    socket?.on('gameResult', (data) => {
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
      socket?.off("opponentDisconnected");
    }
  }, [socket])

  console.log(gameState);

  const joinQueue = () => {

    if(socket?.connected) {
      socket?.disconnect();
      gameState.gameActive = false;
    }

    if(username.trim().length === 0) return;
    socketServer.connect();
        
    socketServer.emit('joinQueue', { username: username })
    setInQueue(true);
  };

  const disconnectQueue = () => {
    setInQueue(false);
    socket?.disconnect()
  }

  if(isConnected && inQueue) {
    return (
      // <div className="container grid place-content-center h-dvh max-w-md text-center m-auto space-y-4 px-5">
      //   <h1 className="text-2xl">{username} is in queue...</h1>
      //   <Button className="text-[#03ff03]" onClick={disconnectQueue}>Cancel</Button>
      // </div>
      <Queue cancelQueue={disconnectQueue}/>
    )
  }

  // if(gameState.gameResult) {
  //   return (
  //     <>
  //       {/* <h1>{gameState.gameResult?.isCorrect ? 'Correct': 'InCorrect'}</h1>
  //       <h1>Opponent was {gameState.opponent}</h1>
  //       <button onClick={joinQueue}>Play another game!</button> */}

  //     </>
  //   )
  // }

  if(gameState.gameActive) {
    return (
        <Chat socket={socket} gameState={gameState} joinQueue={joinQueue}/>
    )
  }



  return (
    <>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <div className="container max-w-md grid place-content-center h-dvh m-auto">
      <div className="text-center w-full">
        <div className="space-y-5 mb-8 px-5">
          <h1 className="text-5xl press-start-2p-regular max-w-64 m-auto">human or not?</h1>
          <p className="mt-7 text-white bg-black">A Social Turing Game.</p>
          <p className="text-sm md:mx-16">Chat with someone for 1 minute, then guess if they're human or AI.</p>
          {/* <p className="text-sm font-semibold">Can you tell the difference?</p> */}
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
