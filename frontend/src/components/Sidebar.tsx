import {
  Compass,
  Download,
  Grid2x2,
  Menu,
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

function RailButton({ icon: Icon, label }: NavItem) {
  return (
    <div className="group relative flex justify-center">
      <button
        className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        aria-label={label}
      >
        <Icon size={20} strokeWidth={1.75} />
      </button>
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {label}
      </span>
    </div>
  );
}

function ExpandedRow({ icon: Icon, label }: NavItem) {
  return (
    <button className="flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-zinc-100 hover:bg-zinc-800">
      <Icon size={19} strokeWidth={1.75} className="shrink-0" />
      {label}
    </button>
  );
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="flex h-full shrink-0 flex-col overflow-hidden border-r border-zinc-800/80 bg-[#0d0d10] transition-[width] duration-200 ease-in-out"
      style={{ width: expanded ? 288 : 64 }}
    >
      {expanded ? (
        <div className="flex h-full w-72 flex-col p-3">
          <div className="mb-2 flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2">
              <img src="/poe-mark.svg" alt="Poe" className="h-8 w-8" />
              <span className="text-lg font-semibold text-white">Poe</span>
            </div>
            <button
              onClick={() => setExpanded(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
              aria-label="Collapse sidebar"
            >
              <Menu size={18} />
            </button>
          </div>

          <nav className="flex flex-1 flex-col">
            {topItems.map((item) => (
              <ExpandedRow key={item.label} {...item} />
            ))}
            <div className="my-2 h-px bg-zinc-800" />
            {menuItems.map((item) => (
              <ExpandedRow key={item.label} {...item} />
            ))}
          </nav>
        </div>
      ) : (
        <div className="flex h-full w-16 flex-col items-center py-4">
          <button
            onClick={() => setExpanded(true)}
            className="mb-6 flex h-9 w-9 items-center justify-center rounded-full"
            aria-label="Expand sidebar"
          >
            <img src="/poe-mark.svg" alt="Poe" className="h-9 w-9" />
          </button>

          <nav className="flex flex-1 flex-col items-center gap-1">
            {topItems.map((item) => (
              <RailButton key={item.label} {...item} />
            ))}
            <div className="my-3 h-px w-8 bg-zinc-800" />
            {menuItems.map((item) => (
              <RailButton key={item.label} {...item} />
            ))}
          </nav>

          <div className="flex flex-col items-center gap-1">
            {bottomItems.map((item) => (
              <RailButton key={item.label} {...item} />
            ))}
            <button
              className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-700 text-sm font-medium text-white"
              aria-label="Account"
            >
              T
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
