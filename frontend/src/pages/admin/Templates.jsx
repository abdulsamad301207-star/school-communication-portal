import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Plus, Pencil, Trash2, X, Save, FileText } from 'lucide-react';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null); // null or template obj
  const [form, setForm] = useState({ name: '', message_type: 'circular', subject: '', body_html: '' });

  useEffect(() => { load(); }, []);

  const load = () => axios.get('/api/v1/templates').then(r => setTemplates(r.data)).catch(() => {});

  const startNew = () => {
    setForm({ name: '', message_type: 'circular', subject: '', body_html: '' });
    setEditing('new');
  };

  const startEdit = (t) => {
    setForm({ name: t.name, message_type: t.message_type, subject: t.subject, body_html: t.body_html });
    setEditing(t);
  };

  const handleSave = async () => {
    if (editing === 'new') {
      await axios.post('/api/v1/templates', form);
    } else {
      await axios.put(`/api/v1/templates/${editing.id}`, form);
    }
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/v1/templates/${id}`);
    load();
  };

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Message Templates" />
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-400">Create reusable templates for frequent messages.</p>
            <button onClick={startNew} className="btn-primary"><Plus size={18} /> New Template</button>
          </div>

          {/* Edit / Create Modal */}
          {editing && (
            <div className="card mb-8 border-[#FFB800]/30">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">{editing === 'new' ? 'Create Template' : 'Edit Template'}</h3>
                <button onClick={() => setEditing(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label-text">Template Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g., Fee Reminder" />
                </div>
                <div>
                  <label className="label-text">Message Type</label>
                  <select value={form.message_type} onChange={e => setForm({...form, message_type: e.target.value})}
                    className="input-field">
                    {['circular','fee','attendance','exam','event','custom'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="label-text">Subject Line</label>
                <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field"
                  placeholder="e.g., Fee Reminder — {{month}} {{year}}" />
              </div>
              <div className="mb-6">
                <label className="label-text">Body Content</label>
                <textarea value={form.body_html} onChange={e => setForm({...form, body_html: e.target.value})}
                  rows={6} className="input-field resize-none !h-auto" placeholder="Use {{variable}} for dynamic content..." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary"><Save size={16} /> Save Template</button>
                <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="card hover:border-gray-700 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#C0001A]/10 text-[#C0001A] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(t)} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-1">{t.name}</h3>
                <p className="text-xs text-[#FFB800] uppercase font-medium tracking-wider mb-2">{t.message_type}</p>
                <p className="text-sm text-gray-400 truncate">{t.subject}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
