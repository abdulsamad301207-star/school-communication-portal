import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { BarChart3, TrendingUp, Users, Send, CheckCircle } from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/v1/reports/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Reports" />
        <div className="p-8 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>
      </main>
    </div>
  );

  const typeColors = {
    circular: '#C0001A', fee: '#FFB800', attendance: '#3B82F6', exam: '#8B5CF6', event: '#10B981', custom: '#6B7280'
  };

  const maxType = Math.max(...Object.values(stats.byType), 1);

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Reports & Analytics" />
        <div className="p-8">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-900/20 text-blue-500 flex items-center justify-center"><Send size={24} /></div>
              <div><div className="text-sm text-gray-400">Total Messages</div><div className="text-2xl font-bold text-white">{stats.totalMessages}</div></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-900/20 text-green-500 flex items-center justify-center"><CheckCircle size={24} /></div>
              <div><div className="text-sm text-gray-400">Total Delivered</div><div className="text-2xl font-bold text-white">{stats.totalDelivered}</div></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFB800]/10 text-[#FFB800] flex items-center justify-center"><Users size={24} /></div>
              <div><div className="text-sm text-gray-400">Total Recipients</div><div className="text-2xl font-bold text-white">{stats.totalRecipients}</div></div>
            </div>
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C0001A]/10 text-[#C0001A] flex items-center justify-center"><TrendingUp size={24} /></div>
              <div><div className="text-sm text-gray-400">Delivery Rate</div><div className="text-2xl font-bold text-white">{stats.deliveryRate}%</div></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Messages by Type - Bar Chart */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-[#FFB800]" /> Messages by Type
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-4">
                    <div className="w-24 text-sm text-gray-400 capitalize shrink-0">{type}</div>
                    <div className="flex-1 h-8 bg-[#222] rounded-lg overflow-hidden relative">
                      <div className="h-full rounded-lg transition-all duration-500" style={{
                        width: `${(count / maxType) * 100}%`,
                        backgroundColor: typeColors[type] || '#6B7280'
                      }}></div>
                    </div>
                    <div className="w-10 text-right text-sm font-bold text-white">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages by Status */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-[#C0001A]" /> Messages by Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const statusColors = { sent: 'border-green-700 text-green-400', scheduled: 'border-[#FFB800] text-[#FFB800]', draft: 'border-gray-700 text-gray-400', failed: 'border-red-700 text-red-400' };
                  return (
                    <div key={status} className={`p-4 rounded-xl border bg-[#222] ${statusColors[status] || 'border-gray-700 text-gray-400'}`}>
                      <div className="text-3xl font-bold mb-1">{count}</div>
                      <div className="text-sm capitalize">{status}</div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Rate Visual */}
              <div className="mt-8 pt-6 border-t border-gray-800">
                <div className="text-sm text-gray-400 mb-3">Overall Delivery Rate</div>
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#222" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#C0001A" strokeWidth="3"
                      strokeDasharray={`${stats.deliveryRate} ${100 - stats.deliveryRate}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{stats.deliveryRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
