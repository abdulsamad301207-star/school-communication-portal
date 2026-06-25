import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import StatsCard from '../../components/StatsCard';
import MessageTable from '../../components/MessageTable';
import { Send, CheckCircle2, Users, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    axios.get('/api/v1/dashboard/stats').then(res => setStats(res.data));
    axios.get('/api/v1/messages?limit=5').then(res => setRecent(res.data.slice(0, 5)));
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Dashboard" />
        
        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Messages Sent Today" 
              value={stats?.sentToday || 0} 
              icon={Send} 
              color="blue" 
              trend={12} 
            />
            <StatsCard 
              title="Delivered Successfully" 
              value={stats?.totalDelivered || 0} 
              icon={CheckCircle2} 
              color="green" 
            />
            <StatsCard 
              title="Recipients Reached" 
              value={stats?.totalRecipients || 0} 
              icon={Users} 
              color="purple" 
            />
            <StatsCard 
              title="Pending / Scheduled" 
              value={stats?.pending || 0} 
              icon={Clock} 
              color="amber" 
            />
          </div>

          {/* Recent Messages */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Communications</h2>
            <div className="flex gap-3">
              <select className="bg-[#1A1A1A] border border-gray-800 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#FFB800] text-gray-300">
                <option value="">All Types</option>
                <option value="circular">Circulars</option>
                <option value="attendance">Attendance</option>
              </select>
            </div>
          </div>
          
          <MessageTable messages={recent} />
        </div>
      </main>
    </div>
  );
}
