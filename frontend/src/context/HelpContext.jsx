import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const HelpContext = createContext(null);

export function HelpProvider({ children }) {
  const { user } = useAuth();
  const [helpRequests, setHelpRequests] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [newIds, setNewIds] = useState(new Set()); // tracks newly arrived IDs

  const isAdmin = user?.role === 'super_admin' || user?.role === 'staff';

  const fetchHelp = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await axios.get('/api/v1/help');
      const incoming = res.data;

      setHelpRequests(prev => {
        // Find IDs that weren't in the previous list
        const prevIds = new Set(prev.map(r => r.id));
        const freshIds = incoming.filter(r => !prevIds.has(r.id)).map(r => r.id);
        if (freshIds.length > 0) {
          setNewIds(ids => new Set([...ids, ...freshIds]));
          // Clear "new" highlight after 8 seconds
          setTimeout(() => {
            setNewIds(ids => {
              const next = new Set(ids);
              freshIds.forEach(id => next.delete(id));
              return next;
            });
          }, 8000);
        }
        return incoming;
      });

      setOpenCount(incoming.filter(r => r.status === 'open').length);
      setLastFetchTime(new Date());
    } catch (err) {
      // silently ignore — don't crash the app if polling fails
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchHelp(); // immediate first load
    const interval = setInterval(fetchHelp, 15000); // poll every 15 seconds
    return () => clearInterval(interval);
  }, [isAdmin, fetchHelp]);

  const markResolved = async (id) => {
    const req = helpRequests.find(r => r.id === id);
    if (!req) return;
    const newStatus = req.status === 'open' ? 'resolved' : 'open';
    await axios.patch(`/api/v1/help/${id}/status`, { status: newStatus });
    setHelpRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    setOpenCount(prev => newStatus === 'resolved' ? Math.max(0, prev - 1) : prev + 1);
  };

  return (
    <HelpContext.Provider value={{ helpRequests, openCount, newIds, lastFetchTime, fetchHelp, markResolved }}>
      {children}
    </HelpContext.Provider>
  );
}

export const useHelp = () => useContext(HelpContext);
