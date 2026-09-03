import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { sendMessageStream } from '../lib/api';
import { useAuth } from './AuthContext';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
};

export type Conversation = {
  id: string;
  /** The backend's conversation UUID, set once the first message's stream starts. */
  remoteId?: string;
  title: string;
  botName: string;
  botEmoji: string;
  modelId: string;
  messages: Message[];
};

type ChatContextValue = {
  conversations: Record<string, Conversation>;
  createConversation: (
    firstMessage: string,
    botName: string,
    botEmoji: string,
    modelId: string,
  ) => string;
  sendMessage: (conversationId: string, content: string) => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const { token } = useAuth();

  const appendMessages = useCallback((convoId: string, messages: Message[]) => {
    setConversations((prev) => {
      const convo = prev[convoId];
      if (!convo) return prev;
      return { ...prev, [convoId]: { ...convo, messages: [...convo.messages, ...messages] } };
    });
  }, []);

  const updateAssistantMessage = useCallback(
    (convoId: string, messageId: string, updater: (content: string) => string) => {
      setConversations((prev) => {
        const convo = prev[convoId];
        if (!convo) return prev;
        return {
          ...prev,
          [convoId]: {
            ...convo,
            messages: convo.messages.map((m) =>
              m.id === messageId ? { ...m, content: updater(m.content) } : m,
            ),
          },
        };
      });
    },
    [],
  );

  const finishStreaming = useCallback((convoId: string, messageId: string) => {
    setConversations((prev) => {
      const convo = prev[convoId];
      if (!convo) return prev;
      return {
        ...prev,
        [convoId]: {
          ...convo,
          messages: convo.messages.map((m) => (m.id === messageId ? { ...m, streaming: false } : m)),
        },
      };
    });
  }, []);

  const setRemoteId = useCallback((localId: string, remoteId: string) => {
    setConversations((prev) => {
      const convo = prev[localId];
      if (!convo || convo.remoteId) return prev;
      return { ...prev, [localId]: { ...convo, remoteId } };
    });
  }, []);

  const runStream = useCallback(
    (localId: string, remoteConversationId: string | undefined, modelId: string, content: string) => {
      if (!token) return;
      const assistantId = crypto.randomUUID();
      appendMessages(localId, [{ id: assistantId, role: 'assistant', content: '', streaming: true }]);

      sendMessageStream(
        token,
        { conversationId: remoteConversationId, modelId, message: content },
        {
          onConversationId: (remoteId) => setRemoteId(localId, remoteId),
          onDelta: (text) => {
            updateAssistantMessage(localId, assistantId, (prev) => prev + text);
          },
          onDone: () => finishStreaming(localId, assistantId),
          onError: (message) => {
            updateAssistantMessage(localId, assistantId, () => `⚠️ ${message}`);
            finishStreaming(localId, assistantId);
          },
        },
      );
    },
    [token, appendMessages, updateAssistantMessage, finishStreaming, setRemoteId],
  );

  const createConversation = useCallback(
    (firstMessage: string, botName: string, botEmoji: string, modelId: string) => {
      const id = crypto.randomUUID();
      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: firstMessage };

      setConversations((prev) => ({
        ...prev,
        [id]: {
          id,
          title: firstMessage.slice(0, 40),
          botName,
          botEmoji,
          modelId,
          messages: [userMessage],
        },
      }));

      runStream(id, undefined, modelId, firstMessage);
      return id;
    },
    [runStream],
  );

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const convo = conversations[conversationId];
      if (!convo) return;
      const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content };
      appendMessages(conversationId, [userMessage]);
      runStream(conversationId, convo.remoteId, convo.modelId, content);
    },
    [conversations, appendMessages, runStream],
  );

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
