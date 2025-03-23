import { useEffect, useState } from "react";
import socket from "./socket";
import { ConnectionState } from "./components/ConnectionState";
import { Events } from "./components/Events";
import ConnectionManager from "./components/ConnectionManager";
import { MyForm } from "./components/MyForm";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvent, setFooEvent] = useState<any>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onFooEvent(event: any) {
      setFooEvent(previous => [...previous, event]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    }
  }, []);

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    }
  }, [])
  

  return (
    <>
      <ConnectionState isConnected={isConnected} />
      <Events events={fooEvent} />
      <ConnectionManager />
      <MyForm />
    </>
  )
}
export default App;
