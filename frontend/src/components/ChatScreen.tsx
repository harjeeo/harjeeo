import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ChatComposer from './ChatComposer';
import { useChat } from '../context/ChatContext';

export default function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const { conversations, sendMessage } = useChat();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = id ? conversations[id] : undefined;

  useEffect(() => {
    if (!conversation) {
      navigate('/', { replace: true });
    }
  }, [conversation, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  if (!conversation || !id) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(id, message.trim());
    setMessage('');
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-800/80 px-6">
        <span>{conversation.botEmoji}</span>
        <span className="text-sm font-medium text-zinc-100">{conversation.botName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
          {conversation.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[75%] rounded-2xl bg-zinc-800 px-4 py-2.5 text-[15px] text-zinc-100'
                    : 'max-w-[75%] text-[15px] leading-relaxed text-zinc-100'
                }
              >
                {m.content}
                {m.streaming && (
                  <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-zinc-400 align-middle" />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <ChatComposer value={message} onChange={setMessage} onSend={handleSend} />
      </div>
    </div>
  );
}
