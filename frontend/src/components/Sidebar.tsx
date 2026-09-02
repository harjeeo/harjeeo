import {
  Compass,
  Download,
  Grid2x2,
  Menu,
  MessageSquareText,
  PenSquare,
  Search,
  Settings,
  SquarePlus,
  Star,
  TrendingUp,
  Package,
} from 'lucide-react';
import { useState } from 'react';

type NavItem = {
  icon: React.ElementType;
  label: string;
};

const topItems: NavItem[] = [
  { icon: PenSquare, label: 'New chat' },
  { icon: Search, label: 'Search chats' },
  { icon: MessageSquareText, label: 'Chats' },
];

const menuItems: NavItem[] = [
  { icon: Star, label: 'Get more points' },
  { icon: Compass, label: 'Explore' },
  { icon: Grid2x2, label: 'Bots' },
  { icon: TrendingUp, label: 'Leaderboard' },
  { icon: SquarePlus, label: 'Create' },
  { icon: Package, label: 'Creator earnings' },
];

const bottomItems: NavItem[] = [
  { icon: Download, label: 'Get the app' },
  { icon: Settings, label: 'Settings' },
];

function NavRow({ icon: Icon, label, expanded }: NavItem & { expanded: boolean }) {
  return (
    <div className="group relative flex">
      <button
        className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        aria-label={label}
      >
        <Icon size={20} strokeWidth={1.75} className="shrink-0" />
        <span
          className="overflow-hidden whitespace-nowrap text-[15px] font-medium text-zinc-100 transition-[width,opacity] duration-200 ease-in-out"
          style={{ width: expanded ? 176 : 0, opacity: expanded ? 1 : 0 }}
        >
          {label}
        </span>
      </button>

      {!expanded && (
        <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="flex h-full shrink-0 flex-col border-r border-zinc-800/80 bg-[#0d0d10] p-3 transition-[width] duration-200 ease-in-out"
      style={{ width: expanded ? 288 : 64 }}
    >
      <div className="mb-4 flex h-9 items-center gap-2 px-0">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <img src="/poe-mark.svg" alt="Poe" className="h-9 w-9" />
        </button>
        <span
          className="overflow-hidden whitespace-nowrap text-lg font-semibold text-white transition-[width,opacity] duration-200 ease-in-out"
          style={{ width: expanded ? 100 : 0, opacity: expanded ? 1 : 0 }}
        >
          Poe
        </span>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {topItems.map((item) => (
          <NavRow key={item.label} {...item} expanded={expanded} />
        ))}
        <div className="my-3 h-px bg-zinc-800" />
        {menuItems.map((item) => (
          <NavRow key={item.label} {...item} expanded={expanded} />
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        {bottomItems.map((item) => (
          <NavRow key={item.label} {...item} expanded={expanded} />
        ))}
        <div className="mt-2 flex h-10 items-center gap-3 px-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-white">
            T
          </span>
          <span
            className="overflow-hidden whitespace-nowrap text-sm font-medium text-zinc-100 transition-[width,opacity] duration-200 ease-in-out"
            style={{ width: expanded ? 140 : 0, opacity: expanded ? 1 : 0 }}
          >
            Account
          </span>
        </div>
      </div>
    </aside>
  );
}
