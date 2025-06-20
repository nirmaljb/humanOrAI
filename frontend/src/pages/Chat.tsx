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

export default function Chat({ socket, gameState, joinQueue, exitGame }: { socket: any | null, gameState: GameState, joinQueue: () => void, exitGame: () => void }) {
    const [chat, setChat] = useState('');
    const [messages, setMessages] = useState<any>([]);
    const [timeUp, setTimeUp] = useState(false);
    const [isResultAvailable, setIsResultAvailable] = useState(false);
    const [isOpponentDisconnected, setIsOpponentDisconnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpponentTyping, setIsOpponentTyping] = useState(false);
    const typingTimeOutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewportMeta = document.createElement('meta');
        viewportMeta.name = 'viewport';
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, height=device-height, viewport-fit=cover';
        document.head.appendChild(viewportMeta);
        
        return () => {
            document.head.removeChild(viewportMeta);
        };
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        socket?.on('opponentDisconnected', () => {
            if(typingTimeOutRef.current) {
                clearTimeout(typingTimeOutRef.current);
            }

            setIsOpponentDisconnected(true);
        });

        socket?.on('playerTyping', () => {
            setIsOpponentTyping(true);
        });

        socket?.on('playerNotTyping', () => {
            setIsOpponentTyping(false);
        });

        socket?.on('timeUp', () => {
            setTimeUp(true);
        })

        socket?.on('receiveMessage', (data: any) => {
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

        const handleVisualViewportResize = () => {
            if (chatContainerRef.current) {
                messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            }
        };

        // Use VisualViewport API if available
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleVisualViewportResize);
            window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
        }

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
                window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
            }
        };
    }, []);

    return (
        <div 
            ref={chatContainerRef}
            className="flex flex-col h-screen max-w-md md:max-w-96 md:rounded-md mx-auto relative md:border rounded-sm overflow-hidden"
            style={{ 
                position: 'fixed', 
                top: 0, 
                bottom: 0, 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '24rem'
            }}
        >
            <div className="sticky top-0 z-20 w-full p-2 border-b">
                <Timer startTimer={gameState.gameStartData?.startTime || 0} duration={gameState.gameStartData?.duration || 0} exitGame={exitGame}/>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 pb-20">
                <Messages messages={messages} loading={isOpponentTyping} />
                <div ref={messagesEndRef} />
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 max-w-md md:max-w-96 mx-auto" style={{ 
                left: '50%', 
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '24rem'
            }}>
                <form onSubmit={submitHandler} className="w-full">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Input
                                value={chat} 
                                onChange={e => setChat(e.target.value)} 
                                placeholder="Type your message..."
                                className="p-5 pr-12 border-none drop-shadow-2xl bg-accent-foreground text-sm"
                                disabled={timeUp}
                                onKeyDown={handleKeyPress}
                                autoComplete="off"
                            />
                            <Button 
                                type="submit" 
                                size="icon" 
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-9 w-9 cursor-pointer"
                            >
                                <FaArrowUp className="text-[#03ff03]"/>
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
            <DecisionPanel isOpen={timeUp} onDecide={makeDecision} />
            {gameState.gameResult && <GameResult isOpen={isResultAvailable} gameState={gameState} joinQueue={joinQueue}/> }
            <OpponentDisconnectedPanel isOpen={isOpponentDisconnected} gameState={gameState} joinQueue={joinQueue} />
        </div>
    );
}