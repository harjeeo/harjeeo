import { Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatComposer from './ChatComposer';
import { useChat } from '../context/ChatContext';

type ModelPill = {
  id: string;
  name: string;
  emoji: string;
};

const models: ModelPill[] = [
  { id: 'assistant', name: 'Assistant', emoji: '🤖' },
  { id: 'meal-planner', name: 'SmartMealPlannerAI', emoji: '🍲' },
  { id: 'gpt-sol', name: 'GPT-5.6-Sol', emoji: '✨' },
];

export default function HomeScreen() {
  const [selected, setSelected] = useState('assistant');
  const [message, setMessage] = useState('');
  const { createConversation } = useChat();
  const navigate = useNavigate();

  const handleSend = () => {
    if (!message.trim()) return;
    const bot = models.find((m) => m.id === selected)!;
    const id = createConversation(message.trim(), bot.name, bot.emoji);
    setMessage('');
    navigate(`/chat/${id}`);
  };

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center px-4">
      <div className="mb-10 flex items-center justify-center">
        <img
          src="/jeeo-logo.png"
          alt="Jeeo"
          className="h-16 w-auto max-w-xs object-contain"
        />
      </div>

      <div className="w-full max-w-3xl">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelected(model.id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected === model.id
                  ? 'border-white bg-white text-black'
                  : 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span>{model.emoji}</span>
              {model.name}
            </button>
          ))}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
            aria-label="Search models"
          >
            <Search size={16} />
          </button>
        </div>

        <ChatComposer value={message} onChange={setMessage} onSend={handleSend} />
      </div>
    </div>
  );
}
