import { EyeOff, Sun } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d0d10] text-white">
      <Sidebar />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Temporary chat"
          >
            <EyeOff size={18} />
          </button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Toggle theme"
          >
            <Sun size={18} />
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
