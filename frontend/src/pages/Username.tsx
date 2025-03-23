import { useState } from "react"
import { redirect, useNavigate } from "react-router";
import socket from "../socket";

export default function Username() {
    const [username, setUsername] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    function submitHandler(event) {
        event.preventDefault();

        
        setUsername(username);
        setIsSubmitted(true);

        socket.auth = { username };
        socket.connect();

        navigate('/app');
    }
    
    return (
        <div>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
            <button onClick={submitHandler} disabled={isSubmitted}>Set!</button>
        </div>
    )
}