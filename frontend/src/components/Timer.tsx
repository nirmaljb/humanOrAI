import { useEffect, useState } from "react"

export default function Timer({ startTimer, duration }: { startTimer: number, duration: number }) {
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
        <div className="flex justify-evenly p-5">
            <h1 className="text-sm text-[#03ff03] press-start-2p-regular">human or not? <span className="text-white font-normal">{timeRemaining}s</span></h1>
        </div>
    )
}