import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog";  
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";


export default function DecisionPanel({ isOpen, onDecide }: { isOpen: boolean, onDecide: (type: string) => void }) {
    
    const decidedAI = () => {
        onDecide('ai')
    };

    const decidedHuman = () => {
        onDecide('human')
    }

    return (
        <AlertDialog open={isOpen}>
        <AlertDialogContent className="bg-white text-black md:max-w-80">
            <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">Whom did you talk to?</AlertDialogTitle>
            </AlertDialogHeader>
                <div className="flex flex-col justify-center items-center space-y-5">
                    {/* <div className="flex items-center space-y-5 p-5"> */}
                        <AlertDialogAction onClick={decidedAI} className="border w-full py-6 rounded-none press-start-2p-regular cursor-pointer">
                            <img src="https://app.humanornot.ai/assets/svg/bot_avatar_green.svg"/>
                            <p>Bot</p>
                        </AlertDialogAction>
                        <AlertDialogAction onClick={decidedHuman} className="border w-full py-6 rounded-none press-start-2p-regular cursor-pointer">
                            <img src="https://app.humanornot.ai/assets/svg/human_avatar_green.svg"/>
                            <p>Human</p>
                        </AlertDialogAction>
                    {/* </div> */}
                </div>
            <AlertDialogDescription className="sr-only">
                here is the description
            </AlertDialogDescription>
        </AlertDialogContent>
        </AlertDialog>
    )
}