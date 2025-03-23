import { useState } from "react";
import socket from "../socket";
import { Events } from "./Events";


export default function Chat() {
    const [user, seetUser] = useState([]);

    const initReactiveProperties = (user) => {
        user.connected = true;
        user.messages = []
        user.hasNewMessages = false;
    };

    socket.on('users', (userData) => {

    });

    return (
        <Events events={user} />
    )
}