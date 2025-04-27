import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";  
import { AlertDialogAction, AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { Button } from "./ui/button";
import { GameState } from "@/utils/interface";
import { IoIosCheckmark } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";


export default function GameResult({ isOpen, gameState, joinQueue }: { isOpen: boolean, gameState: GameState, joinQueue: () => void }) {

    return (
        <AlertDialog open={isOpen}>
        <AlertDialogContent className="flex flex-col items-center text-center bg-white text-black md:max-w-80">
            <AlertDialogHeader>
                <AlertDialogTitle className="flex space-x-1 text-md items-center">
                    <span>{gameState.gameResult?.isCorrect ? "Correct" : "Incorrect"}</span>
                    {/* <img src={gameState.gameResult?.isCorrect ? "https://app.humanornot.ai/assets/svg/spot_on.svg" : "https://app.humanornot.ai/assets/svg/wrong.svg"}/> */}
                    {gameState.gameResult?.isCorrect ? <IoIosCheckmark className="text-3xl" /> : <RxCross2 className="text-xl" /> }
                </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
                    {gameState.gameResult?.opponentType === "human" && <AlertDialogTitle className="font-thin text-3xl flex items-center flex-col justify-center space-y-10">
                        <div>
                        <p>You just talked to</p>
                            <div className="flex justify-center ml-0 items-center space-x-2 md:mt-0 md:ml-2 md:space-x-3">
                                <img src="https://app.humanornot.ai/assets/svg/human_avatar_green.svg"/>
                                <span className="bg-white text-black p-1 font-normal">{gameState.opponent}</span>
                            </div>
                        </div>
                    </AlertDialogTitle>
                    }
                    {gameState.gameResult?.opponentType === "ai" && <AlertDialogTitle className="font-thin text-3xl flex items-center flex-col space-y-10">
                        <div>
                            <p>You just talked to</p>
                                <div className="flex space-x-2 justify-center items-center">
                                    <img src="https://app.humanornot.ai/assets/svg/bot_avatar_green.svg"/>
                                    <span className="bg-white text-black p-1">Bot</span>
                                </div>
                        </div>
                    </AlertDialogTitle>
                    }
                </AlertDialogDescription>
            <AlertDialogAction className="" asChild>
                <Button className="text-[#03ff03] cursor-pointer" onClick={joinQueue}>Play Another Game</Button>
            </AlertDialogAction>
            <AlertDialogDescription className="sr-only">
                here is the description
            </AlertDialogDescription>
        </AlertDialogContent>
        </AlertDialog>
    )
}