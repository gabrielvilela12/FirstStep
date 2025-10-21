import { useState, useCallback } from "react";
import type { Message } from "@/components/chat/ChatWindow";

// Mock responses - substitua isso por chamadas de API reais no futuro
const MOCK_RESPONSES = [
  "Bem-vindo(a)! Vou te ajudar a navegar pela sua jornada de onboarding.",
  "Você já conferiu a etapa atual no seu dashboard? Lá você vê as tarefas pendentes.",
  "Lembre-se: para avançar para a próxima etapa, todas as tarefas obrigatórias precisam estar concluídas.",
  "Se precisar, posso mostrar os cursos da sua etapa atual.",
  "Quer que eu abra a lista de acessos pendentes para você verificar?",
  "Dica: você também pode revisar cursos concluídos no histórico de vídeos.",
  "Na central de documentos você encontra os materiais obrigatórios sempre que precisar.",
  "Seu Buddy também acompanha seu progresso — você pode falar com ele quando quiser.",
  "Está com dificuldades de acesso? Posso te ajudar a abrir um chamado para o time de TI.",
  "Continue assim! Cada tarefa concluída leva você mais perto de finalizar sua jornada de 90 dias.",
];

export const useMockChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Eu sou seu assistente virtual de onboarding. Pronto para começar sua jornada na Vivo?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback((content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate AI typing
    setIsTyping(true);

    // Simulate API delay and response
    setTimeout(() => {
      const randomResponse =
        MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
  };
};
