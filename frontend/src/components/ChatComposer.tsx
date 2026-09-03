import { ArrowRight, AtSign, Mic, Plus } from 'lucide-react';
import type { KeyboardEvent } from 'react';

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
};

export default function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = 'Start a new chat',
}: ChatComposerProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) onSend();
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#151517] p-3 shadow-xl">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
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
            onClick={onSend}
            disabled={!value.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-black transition-opacity disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
