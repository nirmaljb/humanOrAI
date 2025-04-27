import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";  
import { AlertDialogAction, AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { Button } from "./ui/button";
import { GameState } from "@/utils/interface";


export default function OpponentDisconnectedPanel({ isOpen, gameState, joinQueue }: { isOpen: boolean, gameState: GameState, joinQueue: () => void }) {

    return (
        <AlertDialog open={isOpen}>
        <AlertDialogContent className="flex flex-col items-center text-center bg-white text-black md:max-w-80">
            <AlertDialogHeader>
                <AlertDialogTitle className="flex flex-col space-x-2 text-sm md:text-2xl text-center">
                    {/* <h1 className="text-xl">Unfortunately!</h1> */}
                    <h1 className="text-2xl">Your opponent got disconnected</h1>
                </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
                    <h1>Your were talking to <span>{gameState.opponent}</span></h1>
            </AlertDialogDescription>
            <AlertDialogAction className="" asChild>
                <Button className="text-[#03ff03] cursor-pointer" onClick={joinQueue}>Play Another Game</Button>
            </AlertDialogAction>
        </AlertDialogContent>
        </AlertDialog>
    )
}