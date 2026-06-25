import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  // Map standard colors to our theme
  let bgClass = "bg-gray-800/50";
  let iconClass = "text-gray-400";
  
  if (color === 'blue') { bgClass = "bg-blue-900/20"; iconClass = "text-blue-500"; }
  if (color === 'green') { bgClass = "bg-green-900/20"; iconClass = "text-green-500"; }
  if (color === 'purple') { bgClass = "bg-[#FFB800]/10"; iconClass = "text-[#FFB800]"; }
  if (color === 'amber') { bgClass = "bg-[#C0001A]/10"; iconClass = "text-[#C0001A]"; }

  return (
    <div className="card flex items-center p-5 gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bgClass} ${iconClass}`}>
        <Icon size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-400 mb-1 truncate">{title}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
      </div>
      {trend && (
        <div className={`text-xs font-medium flex items-center gap-1 self-end mb-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
