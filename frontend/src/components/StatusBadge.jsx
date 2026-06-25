export default function StatusBadge({ status }) {
  const styles = {
    sent: 'bg-green-900/30 text-green-400 border border-green-800',
    delivered: 'bg-green-900/30 text-green-400 border border-green-800',
    pending: 'bg-amber-900/30 text-amber-400 border border-amber-800',
    scheduled: 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/30',
    failed: 'bg-red-900/30 text-red-400 border border-red-800',
    draft: 'bg-gray-800 text-gray-300 border border-gray-700',
    read: 'bg-blue-900/30 text-blue-400 border border-blue-800'
  };

  const labels = {
    sent: 'Sent ✓',
    delivered: 'Delivered ✓',
    pending: 'Pending ⏳',
    scheduled: 'Scheduled ⏰',
    failed: 'Failed ❌',
    draft: 'Draft 📝',
    read: 'Read 👀'
  };

  const currentStyle = styles[status] || styles.draft;
  const currentLabel = labels[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStyle}`}>
      {currentLabel}
    </span>
  );
}
