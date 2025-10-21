import { useState } from "react";
import { ChatBubble } from "./ChatBubble";
import { ChatWindow } from "./ChatWindow";
import { useMockChat } from "@/hooks/useMockChat";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, sendMessage } = useMockChat();

  return (
    <>
      <ChatBubble onClick={() => setIsOpen(true)} isOpen={isOpen} />
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
        isTyping={isTyping}
      />
    </>
  );
};