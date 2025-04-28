interface Player {
    socket_id: string;
    username: string;
}

interface GameRoom {
    id: string;
    player1: string;
    player2?: string;
    hasAI: boolean;
    timeLimit: number;
    startTime: number;
}