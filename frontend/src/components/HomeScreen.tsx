import { ArrowRight, AtSign, Mic, Plus, Search } from 'lucide-react';
import { useState } from 'react';

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

        <div className="rounded-xl border border-zinc-800 bg-[#151517] p-3 shadow-xl">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Start a new chat"
            rows={1}
            className="w-full resize-none bg-transparent px-2 py-2 text-[15px] text-zinc-100 placeholder-zinc-500 outline-none"
          />
          <div className="mt-1 flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Attach"
              >
                <Plus size={19} />
              </button>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Mention a bot"
              >
                <AtSign size={18} />
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Voice input"
              >
                <Mic size={18} />
              </button>
              <button
                disabled={!message.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-black transition-opacity disabled:opacity-40"
                aria-label="Send"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
