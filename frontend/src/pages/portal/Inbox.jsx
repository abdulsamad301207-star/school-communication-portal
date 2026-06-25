import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Bell, LogOut, FileText, ChevronRight, X, Calendar, CheckCircle2, AlertTriangle, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'attendance'
  const [activeMessage, setActiveMessage] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchMessages = () => {
    axios.get('/api/v1/portal/inbox').then(res => setMessages(res.data));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      setAttendanceLoading(true);
      axios.get('/api/v1/portal/attendance')
        .then(res => {
          setAttendance(res.data);
          setAttendanceLoading(false);
        })
        .catch(err => {
          console.error(err);
          setAttendanceLoading(false);
        });
    }
  }, [activeTab]);

  const handleViewMessage = (msg) => {
    // Open modal immediately with current local data
    setActiveMessage(msg);
    // Mark as read in backend and update details
    axios.get(`/api/v1/portal/inbox/${msg.id}`)
      .then(res => {
        // Update local messages array
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read_at: res.data.read_at } : m));
        // Update modal data
        setActiveMessage(res.data);
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'text-green-500 border-green-500/20 bg-green-500/10';
    if (percentage >= 75) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
    return 'text-red-500 border-red-500/20 bg-red-500/10';
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white flex flex-col pb-20">
      {/* Top Navbar */}
      <nav className="h-14 bg-[#1A1A1A] border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-bold text-[#FFB800]">SG Portal</div>
        <div className="text-sm font-medium capitalize">{activeTab}</div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-[#C0001A] flex items-center justify-center font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4">
        {activeTab === 'inbox' ? (
          <>
            <h1 className="text-2xl font-bold mb-6">My Messages</h1>
            
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center p-12 text-gray-500 bg-[#1A1A1A] rounded-2xl border border-gray-800">
                  <FileText className="mx-auto mb-3 text-gray-600" size={32} />
                  No messages yet.
                </div>
              ) : messages.map(msg => (
                <div 
                  key={msg.id} 
                  onClick={() => handleViewMessage(msg)}
                  className={`bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 flex gap-4 cursor-pointer hover:border-gray-700 transition-all ${
                    !msg.read_at ? 'border-l-4 border-l-[#C0001A]' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-800/80 flex items-center justify-center shrink-0">
                    <FileText size={20} className="text-[#FFB800]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-[#FFB800] uppercase font-bold tracking-wider">{msg.message_type}</span>
                      <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                    </div>
                    <h3 className={`text-sm mb-1 truncate ${!msg.read_at ? 'font-bold text-white' : 'text-gray-300'}`}>
                      {msg.subject}
                    </h3>
                    <p className="text-xs text-gray-500 truncate" dangerouslySetInnerHTML={{ __html: msg.body_html?.replace(/<[^>]*>/g, '') || '' }} />
                  </div>
                  <div className="flex items-center text-gray-600">
                    <ChevronRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Attendance</h1>
            
            {attendanceLoading ? (
              <div className="text-center py-12 text-gray-400">Loading attendance data...</div>
            ) : attendance ? (
              <div className="space-y-6">
                {/* Overall Stats Card */}
                <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl p-5 flex items-center gap-5">
                  <div className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${getAttendanceColor(attendance.stats.percentage)}`}>
                    <span className="text-xl font-bold">{attendance.stats.percentage}%</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold">Overall</span>
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-2 gap-3 text-center">
                    <div className="bg-gray-800/30 p-2.5 rounded-xl border border-gray-800/50">
                      <div className="text-xs text-gray-400">Present</div>
                      <div className="text-lg font-bold text-green-400">{attendance.stats.present} / {attendance.stats.total}</div>
                    </div>
                    <div className="bg-gray-800/30 p-2.5 rounded-xl border border-gray-800/50">
                      <div className="text-xs text-gray-400">Absent</div>
                      <div className="text-lg font-bold text-red-400">{attendance.stats.absent}</div>
                    </div>
                  </div>
                </div>

                {/* Progress Alert */}
                {attendance.stats.percentage < 75 && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex gap-3 items-start text-xs">
                    <AlertTriangle size={18} className="shrink-0 text-red-500" />
                    <div>
                      <span className="font-bold">Low Attendance Warning:</span> Your attendance is currently below the school's required 75% threshold. Please maintain regular attendance.
                    </div>
                  </div>
                )}

                {/* Log List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Attendance History</h3>
                  <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800">
                    {attendance.records.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">No attendance logs found.</div>
                    ) : (
                      attendance.records.map(record => (
                        <div key={record.id} className="p-4 flex justify-between items-center hover:bg-gray-800/20 transition-colors">
                          <div className="flex items-center gap-3">
                            <Calendar size={18} className="text-gray-500" />
                            <div>
                              <div className="text-sm font-medium">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                              {record.remarks && <div className="text-xs text-gray-400 mt-0.5">{record.remarks}</div>}
                            </div>
                          </div>
                          <div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              record.status === 'present' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">No student profile linked.</div>
            )}
          </>
        )}
      </main>

      {/* Message Details Modal */}
      {activeMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] text-[#FFB800] uppercase font-bold tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {activeMessage.message_type}
                </span>
                <h2 className="text-base font-bold text-white mt-2">{activeMessage.subject}</h2>
              </div>
              <button 
                onClick={() => setActiveMessage(null)}
                className="text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-800 p-1.5 rounded-lg transition-all"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-sm text-gray-300">
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Sender: School Administration</span>
                <span>{new Date(activeMessage.created_at).toLocaleString()}</span>
              </div>
              <div 
                className="prose prose-invert max-w-none text-gray-300 leading-relaxed border-t border-gray-800 pt-4"
                dangerouslySetInnerHTML={{ __html: activeMessage.body_html || activeMessage.body }}
              />

              {activeMessage.attachment_url && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <a 
                    href={activeMessage.attachment_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-lg text-[#FFB800] transition-colors"
                  >
                    <Paperclip size={14} />
                    View Attachment
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-end bg-gray-900/20">
              <button 
                onClick={() => setActiveMessage(null)}
                className="px-4 py-2 bg-[#C0001A] hover:bg-[#A00016] text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Tab Bar */}
      <div className="h-16 bg-[#1A1A1A] border-t border-gray-800 fixed bottom-0 left-0 w-full flex justify-around items-center px-2 z-50">
        <button 
          onClick={() => setActiveTab('inbox')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'inbox' ? 'text-[#FFB800]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <FileText size={20} />
          <span className="text-[10px] font-medium">Inbox</span>
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'attendance' ? 'text-[#FFB800]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Calendar size={20} />
          <span className="text-[10px] font-medium">Attendance</span>
        </button>
        <button 
          onClick={handleLogout} 
          className="flex flex-col items-center gap-1 text-red-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
