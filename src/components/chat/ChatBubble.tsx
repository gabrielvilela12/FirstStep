import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatBubbleProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChatBubble = ({ onClick, isOpen }: ChatBubbleProps) => {
  if (isOpen) return null;

  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110 z-50 animate-in zoom-in-50"
      aria-label="Abrir chat"
    >
      <MessageSquareText className="h-7 w-7 text-primary-foreground" />
    </Button>
  );
};