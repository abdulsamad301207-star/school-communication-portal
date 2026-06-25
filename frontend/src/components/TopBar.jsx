import { Bell, Search } from 'lucide-react';

export default function TopBar({ title }) {
  return (
    <header className="h-16 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-between px-8 sticky top-0 z-40">
      <h1 className="text-xl font-bold text-white">{title}</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="h-10 pl-10 pr-4 w-64 rounded-lg bg-[#111111] border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFB800] transition-colors"
          />
        </div>
        
        <button className="relative text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C0001A] rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
