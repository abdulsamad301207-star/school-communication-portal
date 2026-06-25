import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import MessageTable from '../../components/MessageTable';
import { Search, Filter } from 'lucide-react';

export default function History() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState({ type: '', status: '', search: '' });

  useEffect(() => { load(); }, []);

  const load = () => {
    const params = {};
    if (filter.type) params.type = filter.type;
    if (filter.status) params.status = filter.status;
    if (filter.search) params.search = filter.search;
    axios.get('/api/v1/messages', { params }).then(r => setMessages(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Message History" />
        <div className="p-8">
          {/* Filters Bar */}
          <div className="card mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})}
                  placeholder="Search messages..." className="input-field pl-10" />
              </div>
              <select value={filter.type} onChange={e => setFilter({...filter, type: e.target.value})}
                className="input-field w-auto min-w-[150px]">
                <option value="">All Types</option>
                <option value="circular">Circular</option>
                <option value="fee">Fee Reminder</option>
                <option value="attendance">Attendance</option>
                <option value="exam">Exam</option>
                <option value="event">Event</option>
              </select>
              <select value={filter.status} onChange={e => setFilter({...filter, status: e.target.value})}
                className="input-field w-auto min-w-[150px]">
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="draft">Draft</option>
              </select>
              <button onClick={() => setFilter({ type: '', status: '', search: '' })}
                className="btn-secondary h-10 px-4 text-sm">Clear</button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-400">{messages.length} message{messages.length !== 1 ? 's' : ''} found</p>
          </div>

          <MessageTable messages={messages} showPagination={true} />
        </div>
      </main>
    </div>
  );
}
