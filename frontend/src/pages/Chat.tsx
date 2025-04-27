import { useEffect, useRef, useState } from "react";
import { Messages } from "@/components/Messages";
import DecisionPanel from "@/components/DecisionPanel";
import Timer from "@/components/Timer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GameResult from "@/components/GameResult";
import { GameState } from "@/utils/interface";
import { FaArrowUp } from "react-icons/fa";
import OpponentDisconnectedPanel from "@/components/OpponentDisconnectPanel";

export default function Chat({ socket, gameState, joinQueue }: { socket: any | null, gameState: GameState, joinQueue: () => void }) {
    const [chat, setChat] = useState('');
    const [messages, setMessages] = useState<any>([]);
    const [timeUp, setTimeUp] = useState(false);
    const [isResultAvailable, setIsResultAvailable] = useState(false);
    const [isOpponentDisconnected, setIsOpponentDisconnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpponentTyping, setIsOpponentTyping] = useState(false);
    const typingTimeOutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpponentTyping]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        socket?.on('opponentDisconnected', () => {
            console.log("opponent has Disconnected");
            if(typingTimeOutRef.current) {
                clearTimeout(typingTimeOutRef.current);
            }
            setIsOpponentDisconnected(true);
        });

        socket?.on('playerTyping', () => {
            console.log('opponent is typing');
            setIsOpponentTyping(true);
        });

        socket?.on('playerNotTyping', () => {
            console.log('opponent is not typing');
            setIsOpponentTyping(false);
        });

        socket?.on('timeUp', () => {
            setTimeUp(true);
        })

        socket?.on('receiveMessage', (data: any) => {
            console.log(data);
            setIsOpponentTyping(false);
            setMessages((prev: any) => [...prev, {
                    id: data.id,
                    message: data.message,
                    fromSelf: data.sender === socket.id,
                    timestamp: data.timestamp
                }
            ])
        });
        
        return () => {
            socket?.off('receiveMessage');
            socket?.off('timeUp');
            socket?.off('playerTyping');
            socket?.off('playerNotTyping');
            socket?.off('opponentDisconnected');
        }
    }, [socket, timeUp]);
    
    const submitHandler = (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
    
        if(chat.trim().length === 0) return;
        
        socket?.emit('sendMessage', { message: chat, to_room: gameState.room_id });
        setChat('');
        
        if(typingTimeOutRef.current) {
            clearTimeout(typingTimeOutRef.current);
        }
        socket?.emit('typing', false, gameState.room_id);
        setIsTyping(false);
    };

    const makeDecision = (decision: string) => {
        socket?.emit('makeDecision', { room_id: gameState.room_id, decision: decision });
        setIsResultAvailable(true);
        setTimeUp(false);
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            submitHandler(e);
            return;
        }

        if(typingTimeOutRef.current) {
            clearTimeout(typingTimeOutRef.current);
        }

        if(!isTyping) {
            setIsTyping(true);
            socket?.emit('typing', true, gameState.room_id);
        }
        
        typingTimeOutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket?.emit('typing', false, gameState.room_id);
        }, 2000);
    };

    useEffect(() => {
        if(typingTimeOutRef.current) {
            clearTimeout(typingTimeOutRef.current);
        }
    }, []);

    return (
        <div className="flex flex-col h-full min-h-screen w-full max-w-md mx-auto relative bg-background md:h-screen md:min-h-0 md:border md:rounded-lg md:shadow-lg overflow-hidden">
            {/* Header with Timer */}
            <div className="sticky top-0 z-10 w-full p-3 bg-background border-b shadow-sm">
                <Timer startTimer={gameState.gameStartData?.startTime || 0} duration={gameState.gameStartData?.duration || 0}/>
            </div>
            
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <Messages messages={messages} loading={isOpponentTyping} />
                <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input Area */}
            <form onSubmit={submitHandler} className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t max-w-md mx-auto">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={chat} 
                            onChange={e => setChat(e.target.value)} 
                            placeholder="Type your message..."
                            className="p-4 pr-12 rounded-full border-accent bg-accent-foreground text-sm"
                            disabled={timeUp}
                            onKeyDown={handleKeyPress}
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={chat.trim().length === 0}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center bg-primary hover:bg-primary/90"
                        >
                            <FaArrowUp className="text-primary-foreground" />
                        </Button>
                    </div>
                </div>
            </form>

            {/* Modals and Overlays */}
            <DecisionPanel isOpen={timeUp} onDecide={makeDecision} />
            {gameState.gameResult && <GameResult isOpen={isResultAvailable} gameState={gameState} joinQueue={joinQueue}/> }
            <OpponentDisconnectedPanel isOpen={isOpponentDisconnected} gameState={gameState} joinQueue={joinQueue} />
        </div>
    );
}