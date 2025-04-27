import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Message } from "@/utils/interface";

export const Messages = ({ messages, loading }: { messages: Message[], loading?: boolean }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const bubbleVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  const dotAnimationVariants = {
    initial: { y: 0 },
    animate: (i: number) => ({
      y: [0, -5, 0],
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        repeat: Infinity,
        repeatType: "loop"
      }
    })
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {messages.map((message, index) => (
        <motion.div
          key={message.id || index}
          initial="hidden"
          animate="visible"
          variants={bubbleVariants}
          className={`flex ${message.fromSelf ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] p-3 rounded-2xl ${
              message.fromSelf
                ? "bg-[#399939f7] text-primary-foreground rounded-br-none"
                : "bg-accent-foreground text-white rounded-bl-none"
            }`}
          >
            <p className="text-sm">{message.message}</p>
          </div>
        </motion.div>
      ))}

      {/* WhatsApp-like Typing Indicator */}
      {loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={bubbleVariants}
          className="flex justify-start"
        >
          <div className="max-w-[80px] p-3 rounded-2xl bg-accent-foreground text-white rounded-bl-none flex items-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                custom={i}
                initial="initial"
                animate="animate"
                // @ts-ignore
                variants={dotAnimationVariants}
                className="h-2 w-2 bg-white rounded-full mx-1"
              />
            ))}
          </div>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};