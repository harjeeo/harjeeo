import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
};

export type Conversation = {
  id: string;
  title: string;
  botName: string;
  botEmoji: string;
  messages: Message[];
};

type ChatContextValue = {
  conversations: Record<string, Conversation>;
  createConversation: (firstMessage: string, botName: string, botEmoji: string) => string;
  sendMessage: (conversationId: string, content: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const MOCK_REPLY =
  "This is a demo response — the OpenRouter backend isn't wired up yet, so I'm just echoing back a placeholder reply while we build out the rest of the UI.";

function streamReply(
  conversationId: string,
  messageId: string,
  setConversations: React.Dispatch<React.SetStateAction<Record<string, Conversation>>>,
) {
  const words = MOCK_REPLY.split(' ');
  let index = 0;

  const interval = setInterval(() => {
    index += 1;
    const partial = words.slice(0, index).join(' ');
    const done = index >= words.length;

    setConversations((prev) => {
      const convo = prev[conversationId];
      if (!convo) return prev;
      return {
        ...prev,
        [conversationId]: {
          ...convo,
          messages: convo.messages.map((m) =>
            m.id === messageId ? { ...m, content: partial, streaming: !done } : m,
          ),
        },
      };
    });

    if (done) clearInterval(interval);
  }, 45);
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});

  const createConversation = useCallback(
    (firstMessage: string, botName: string, botEmoji: string) => {
      const id = crypto.randomUUID();
      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: firstMessage };
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        streaming: true,
      };

      setConversations((prev) => ({
        ...prev,
        [id]: {
          id,
          title: firstMessage.slice(0, 40),
          botName,
          botEmoji,
          messages: [userMessage, assistantMessage],
        },
      }));

      streamReply(id, assistantMessage.id, setConversations);
      return id;
    },
    [],
  );

  const sendMessage = useCallback((conversationId: string, content: string) => {
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content };
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      streaming: true,
    };

    setConversations((prev) => {
      const convo = prev[conversationId];
      if (!convo) return prev;
      return {
        ...prev,
        [conversationId]: {
          ...convo,
          messages: [...convo.messages, userMessage, assistantMessage],
        },
      };
    });

    streamReply(conversationId, assistantMessage.id, setConversations);
  }, []);

  return (
    <ChatContext.Provider value={{ conversations, createConversation, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
