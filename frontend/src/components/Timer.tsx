import { useEffect, useState } from "react";
import { IoMdExit } from "react-icons/io";


export default function Timer({ startTimer, duration, exitGame }: { startTimer: number, duration: number, exitGame: () => void }) {
    const [timeRemaining, setTimeRemaining] = useState(duration);

    useEffect(() => {
        const endTime = startTimer + (duration * 1000);
        const TimeInterval = setInterval(() => {
            const now = Date.now()
            const time = Math.max(0, Math.floor((endTime - now)/1000));

            setTimeRemaining(time);

            if(time <= 0) {
                clearInterval(TimeInterval);
            }
        }, 1000);

        return () => clearInterval(TimeInterval);
    }, [startTimer, duration]);


    return (
        <div className="flex items-center justify-between p-3 sm:p-5">
            <div>
                <h1 className="text-sm text-[#03ff03] press-start-2p-regular">human or not? <span className="text-white font-normal">{timeRemaining}s</span></h1>
            </div>
            <IoMdExit size={30} className="text-red-500 cursor-pointer" onClick={exitGame}/>
        </div>
    )
}