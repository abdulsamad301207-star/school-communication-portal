import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Check, X as XIcon, Save, AlertTriangle } from 'lucide-react';

const CLASS_LIST = ['7A','7B','8A','8B','9A','9B','10A','10B','11A','12A'];

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState('10A');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [alertRules, setAlertRules] = useState([]);

  useEffect(() => {
    // Load students for this class from the attendance endpoint
    axios.get('/api/v1/attendance', { params: { class_name: selectedClass, date } })
      .then(r => {
        const data = r.data;
        // Build student list and existing records
        const stuMap = {};
        const recMap = {};
        data.forEach(rec => {
          if (rec.student) {
            stuMap[rec.student.id] = rec.student;
            recMap[rec.student.roll_number] = rec.status;
          }
        });
        setStudents(Object.values(stuMap));
        setRecords(recMap);
      })
      .catch(() => {});
    axios.get('/api/v1/alert-rules').then(r => setAlertRules(r.data)).catch(() => {});
  }, [selectedClass, date]);

  const toggleStatus = (rollNumber) => {
    setRecords(prev => ({
      ...prev,
      [rollNumber]: prev[rollNumber] === 'present' ? 'absent' : 'present'
    }));
  };

  const markAll = (status) => {
    const newRec = {};
    students.forEach(s => { newRec[s.roll_number] = status; });
    setRecords(newRec);
  };

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(records).map(([roll_number, status]) => ({ roll_number, status }));
    try {
      await axios.post('/api/v1/attendance/bulk', {
        class_name: selectedClass, date, period: 'Full Day', records: entries
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const presentCount = Object.values(records).filter(s => s === 'present').length;
  const absentCount = Object.values(records).filter(s => s === 'absent').length;
  const total = Object.keys(records).length;

  return (
    <div className="min-h-screen bg-[#111111] flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar title="Attendance" />
        <div className="p-8">
          {saved && (
            <div className="mb-6 p-4 rounded-xl bg-green-900/30 border border-green-700 text-green-400 flex items-center gap-3">
              <Check size={20} /> Attendance saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left: Attendance Sheet */}
            <div className="lg:col-span-3 space-y-6">
              {/* Controls */}
              <div className="card">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="label-text">Class</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="input-field w-auto min-w-[120px]">
                      {CLASS_LIST.map(c => <option key={c} value={c}>Class {c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-auto" />
                  </div>
                  <div className="flex gap-2 ml-auto items-end">
                    <button onClick={() => markAll('present')} className="btn-secondary h-10 text-xs text-green-400 border-green-800 hover:bg-green-900/20">Mark All Present</button>
                    <button onClick={() => markAll('absent')} className="btn-secondary h-10 text-xs text-red-400 border-red-800 hover:bg-red-900/20">Mark All Absent</button>
                  </div>
                </div>
              </div>

              {/* Student Table */}
              <div className="card p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#0A0A0A] border-b border-gray-800 text-sm text-gray-400">
                      <th className="p-4 pl-6 font-medium">Roll No.</th>
                      <th className="p-4 font-medium">Student Name</th>
                      <th className="p-4 font-medium">Class</th>
                      <th className="p-4 pr-6 text-center font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {students.length === 0 ? (
                      <tr><td colSpan="4" className="p-8 text-center text-gray-500">No students found for this class. Select a different class or check data.</td></tr>
                    ) : students.map(s => {
                      const status = records[s.roll_number] || 'present';
                      return (
                        <tr key={s.id} className="hover:bg-[#222] transition-colors">
                          <td className="p-4 pl-6 text-sm font-mono text-gray-300">{s.roll_number}</td>
                          <td className="p-4 text-sm font-medium text-white">{s.name}</td>
                          <td className="p-4 text-sm text-gray-400">{s.class_name}</td>
                          <td className="p-4 pr-6 text-center">
                            <button onClick={() => toggleStatus(s.roll_number)}
                              className={`w-24 py-1.5 rounded-full text-xs font-bold transition-colors ${
                                status === 'present' 
                                  ? 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50' 
                                  : 'bg-red-900/30 text-red-400 border border-red-800 hover:bg-red-900/50'
                              }`}>
                              {status === 'present' ? '✓ Present' : '✗ Absent'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button onClick={handleSave} disabled={saving || total === 0}
                className="btn-primary h-12 px-8 text-base disabled:opacity-50">
                <Save size={18} /> {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>

            {/* Right: Summary & Alert Rules */}
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-4">Today's Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-400">Total</span><span className="font-bold text-white">{total}</span></div>
                  <div className="flex justify-between"><span className="text-green-400">Present</span><span className="font-bold text-green-400">{presentCount}</span></div>
                  <div className="flex justify-between"><span className="text-red-400">Absent</span><span className="font-bold text-red-400">{absentCount}</span></div>
                  {total > 0 && (
                    <>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-green-500 transition-all" style={{ width: `${(presentCount / total) * 100}%` }}></div>
                      </div>
                      <div className="text-center text-sm text-gray-400">{Math.round((presentCount / total) * 100)}% attendance</div>
                    </>
                  )}
                </div>
              </div>

              {/* Alert Rules */}
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-[#FFB800]" /> Auto-Alert Rules
                </h3>
                <div className="space-y-3">
                  {alertRules.map(rule => (
                    <div key={rule.id} className="p-3 rounded-lg bg-[#222] border border-gray-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-white">{rule.rule_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rule.is_active ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                          {rule.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Triggers below {rule.threshold_percent}% attendance</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
