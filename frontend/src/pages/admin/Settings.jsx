import { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { useAuth } from '../../context/AuthContext';
import { Save, School, Bell, Shield, Check } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [school, setSchool] = useState({
    name: 'Sri Gowthami Educational Institutions',
    tagline: 'Nurturing Future Leaders',
    email: 'admin@sgei.edu.in',
    phone: '+91 98765 43210',
    address: 'Main Campus, Rajahmundry, Andhra Pradesh 533101',
    website: 'www.sgei.edu.in'
  });
  const [notifications, setNotifications] = useState({
    emailOnSend: true,
    autoAlerts: true,
    dailyDigest: false,
    parentReadReceipts: true
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Settings" />
        <div className="p-8 max-w-4xl">
          {saved && (
            <div className="mb-6 p-4 rounded-xl bg-green-900/30 border border-green-700 text-green-400 flex items-center gap-3">
              <Check size={20} /> Settings saved successfully!
            </div>
          )}

          {/* School Profile */}
          <div className="card mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#FFB800]/10 text-[#FFB800] flex items-center justify-center"><School size={20} /></div>
              <h2 className="text-lg font-bold text-white">School Profile</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text">School Name</label>
                <input value={school.name} onChange={e => setSchool({...school, name: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">Tagline</label>
                <input value={school.tagline} onChange={e => setSchool({...school, tagline: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">Contact Email</label>
                <input value={school.email} onChange={e => setSchool({...school, email: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">Phone Number</label>
                <input value={school.phone} onChange={e => setSchool({...school, phone: e.target.value})} className="input-field" />
              </div>
              <div className="md:col-span-2">
                <label className="label-text">Address</label>
                <input value={school.address} onChange={e => setSchool({...school, address: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="label-text">Website</label>
                <input value={school.website} onChange={e => setSchool({...school, website: e.target.value})} className="input-field" />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#C0001A]/10 text-[#C0001A] flex items-center justify-center"><Bell size={20} /></div>
              <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { key: 'emailOnSend', label: 'Email confirmation on send', desc: 'Receive an email copy when messages are sent.' },
                { key: 'autoAlerts', label: 'Automatic attendance alerts', desc: 'Automatically alert parents when attendance drops below threshold.' },
                { key: 'dailyDigest', label: 'Daily digest report', desc: 'Receive a daily summary of all communication activity.' },
                { key: 'parentReadReceipts', label: 'Parent read receipts', desc: 'Track when parents open and read messages.' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-[#222] border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" checked={notifications[item.key]}
                      onChange={() => setNotifications(prev => ({...prev, [item.key]: !prev[item.key]}))}
                      className="sr-only" />
                    <div className={`w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-[#C0001A]' : 'bg-gray-700'}`}></div>
                    <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Current User Info */}
          <div className="card mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-900/20 text-blue-500 flex items-center justify-center"><Shield size={20} /></div>
              <h2 className="text-lg font-bold text-white">Account Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-text">Name</label>
                <input value={user?.name || ''} readOnly className="input-field opacity-60" />
              </div>
              <div>
                <label className="label-text">Email</label>
                <input value={user?.email || ''} readOnly className="input-field opacity-60" />
              </div>
              <div>
                <label className="label-text">Role</label>
                <input value={user?.role?.replace('_', ' ') || ''} readOnly className="input-field opacity-60 capitalize" />
              </div>
              <div>
                <label className="label-text">Campus</label>
                <input value={user?.campus || ''} readOnly className="input-field opacity-60" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary h-12 px-8 text-base">
            <Save size={18} /> Save All Settings
          </button>
        </div>
      </main>
    </div>
  );
}
