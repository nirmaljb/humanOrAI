export interface GameState {
    username: string | null,
    room_id: string | null,
    showDecision: boolean,
    gameActive: boolean,
    gameStartData: {
        duration: number,
        startTime: number,
    } | null,
    gameResult: {
        isCorrect: boolean,
        opponentType: "ai" | "human"
    } | null,
    opponent: string | null
}

export interface Message {
    id: string;
    message: string;
    fromSelf: boolean;
    timestamp: number;
}