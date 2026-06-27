import { useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { HelpCircle, CheckCircle2, Clock, RefreshCw, Zap } from 'lucide-react';
import { useHelp } from '../../context/HelpContext';

export default function HelpRequests() {
  const { helpRequests, openCount, newIds, lastFetchTime, fetchHelp, markResolved } = useHelp();

  // Refresh when page is focused (e.g. admin switches back to this tab)
  useEffect(() => {
    const onFocus = () => fetchHelp();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [fetchHelp]);

  const loading = helpRequests === null;

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Help Requests" />

        <div className="p-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C0001A]/20 text-[#C0001A] flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Student Support</h2>
                <p className="text-sm text-gray-400">Manage and resolve incoming help requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Live indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Live · refreshes every 15s
              </div>
              {lastFetchTime && (
                <span className="text-xs text-gray-500">
                  Last updated: {lastFetchTime.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchHelp}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                title="Refresh now"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white">{helpRequests.length}</div>
              <div className="text-xs text-gray-400 mt-1">Total</div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-400">{openCount}</div>
              <div className="text-xs text-gray-400 mt-1">Open</div>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {helpRequests.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-xs text-gray-400 mt-1">Resolved</div>
            </div>
          </div>

          {/* Requests list */}
          <div className="bg-[#1A1A1A] border border-gray-800 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading requests...</div>
            ) : helpRequests.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <HelpCircle size={40} className="mx-auto mb-3 opacity-20" />
                No help requests yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {helpRequests.map(req => {
                  const isNew = newIds?.has(req.id);
                  return (
                    <div
                      key={req.id}
                      className={`p-5 flex gap-5 transition-all duration-500 ${
                        isNew
                          ? 'bg-amber-500/5 border-l-4 border-l-amber-400'
                          : 'hover:bg-[#222]'
                      }`}
                    >
                      <div className="shrink-0 pt-1">
                        {req.status === 'open' ? (
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                            <Clock size={16} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white leading-tight">{req.subject}</h3>
                              {isNew && (
                                <span className="flex items-center gap-1 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide animate-bounce">
                                  <Zap size={10} /> New
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1 flex gap-2 items-center flex-wrap">
                              <span className="font-medium text-gray-300">{req.user_name}</span>
                              <span>•</span>
                              <span className="capitalize">{req.user_role?.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{new Date(req.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => markResolved(req.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                              req.status === 'open'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                                : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                            }`}
                          >
                            {req.status === 'open' ? 'Mark Resolved' : 'Reopen'}
                          </button>
                        </div>
                        <div className="bg-[#111] border border-gray-800 rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap">
                          {req.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
