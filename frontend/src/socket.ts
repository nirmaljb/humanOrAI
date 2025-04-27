import { io } from 'socket.io-client';

const URL = 'https://humanorai-production.up.railway.app/';

const socket = io(URL, {
    autoConnect: false,
    // closeOnBeforeunload: true
});

socket.onAny((event, ...args) => {
    console.log(event, args);
});

export default socket