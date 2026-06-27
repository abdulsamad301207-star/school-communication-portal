import { useState, Fragment } from 'react';
import StatusBadge from './StatusBadge';
import { ChevronRight, ChevronDown, Paperclip } from 'lucide-react';

export default function MessageTable({ messages, showPagination = false }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatDate = (ds) => {
    if (!ds) return '-';
    const d = new Date(ds);
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}, ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const getFormatType = (t) => {
    const map = { circular: 'Circular', fee: 'Fee Reminder', attendance: 'Attendance', exam: 'Exam', event: 'Event', custom: 'Custom' };
    return map[t] || t;
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="card overflow-hidden p-0 border-gray-800 rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0A0A0A] border-b border-gray-800 text-sm font-medium text-gray-400">
              <th className="p-4 pl-6 font-medium">Subject</th>
              <th className="p-4 font-medium">Sent To</th>
              <th className="p-4 font-medium">Date & Time</th>
              <th className="p-4 font-medium">Delivered</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 pr-6 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {messages.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No messages found.</td></tr>
            ) : messages.map((msg) => {
              const deliveryPct = msg.recipients_count ? Math.round((msg.delivered_count / msg.recipients_count) * 100) : 0;
              const isExpanded = expandedId === msg.id;
              return (
                <Fragment key={msg.id}>
                  <tr 
                    className={`hover:bg-[#222222]/50 transition-colors cursor-pointer group ${isExpanded ? 'bg-[#222222]/30' : ''}`} 
                    onClick={() => toggleExpand(msg.id)}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-medium text-gray-200">{msg.subject}</div>
                      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{getFormatType(msg.message_type)}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      <div>{msg.recipients_count} recipients</div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {formatDate(msg.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-300 mb-1">{msg.delivered_count} / {msg.recipients_count}</div>
                      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C0001A]" style={{ width: `${deliveryPct}%` }}></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={msg.status} />
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-gray-400 group-hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${msg.id}-expanded`} className="bg-[#151515]/80">
                      <td colSpan="6" className="p-6 border-b border-gray-800">
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-[#FFB800] text-sm uppercase tracking-wider">Message Content</h4>
                            {msg.attachment_url && (
                              <a 
                                href={msg.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-[#FFB800] hover:underline flex items-center gap-1.5 font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Paperclip size={14} />
                                View Attachment
                              </a>
                            )}
                          </div>
                          <div 
                            className="text-sm text-gray-300 bg-[#0A0A0A] p-4 rounded-xl border border-gray-800 leading-relaxed max-w-4xl prose prose-invert"
                            dangerouslySetInnerHTML={{ __html: msg.body_html || msg.body }}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {showPagination && messages.length > 0 && (
        <div className="p-4 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400">
          <div>Showing {messages.length} results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-700 rounded hover:bg-gray-800">Prev</button>
            <button className="px-3 py-1 border border-gray-700 rounded hover:bg-gray-800">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
