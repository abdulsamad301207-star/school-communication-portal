import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, GraduationCap } from 'lucide-react';

export default function PortalLogin() {
  const [tab, setTab] = useState('parent'); // 'parent' or 'student'
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const creds = tab === 'parent' 
        ? { email: userId, password } 
        : { roll_number: userId, password };
      await login(creds);
      navigate('/portal/inbox');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const fillDemo = () => {
    if (tab === 'parent') {
      setUserId('rajesh.sharma@sgei.edu.in');
      setPassword('Parent@123');
    } else {
      setUserId('STU001');
      setPassword('Student@123');
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1A1A1A] rounded-2xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#C0001A] to-[#FFB800]"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#C0001A]/20 text-[#C0001A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Parent & Student Portal</h2>
          <p className="text-gray-400 text-sm">Enter your registered credentials</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-[#0A0A0A] rounded-lg mb-8">
          <button 
            onClick={() => setTab('parent')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'parent' ? 'bg-[#1A1A1A] text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Parent
          </button>
          <button 
            onClick={() => setTab('student')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'student' ? 'bg-[#1A1A1A] text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            Student
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="label-text">
              {tab === 'parent' ? 'Registered Email Address' : 'Student Roll Number'}
            </label>
            <input 
              type="text" 
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={tab === 'parent' ? 'parent@email.com' : 'e.g., STU001'} 
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="input-field"
            />
          </div>
          
          <button type="submit" className="btn-primary w-full mt-2">
            Secure Login <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <button onClick={fillDemo} className="hover:text-[#FFB800] underline underline-offset-4 decoration-gray-700 hover:decoration-[#FFB800] transition-colors">
            Use Demo Credentials
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-white transition-colors">← Back to Home</Link>
        <span className="text-gray-700">|</span>
        <span>Staff? <Link to="/admin-login" className="text-[#C0001A] hover:text-red-400 font-medium">Admin Login</Link></span>
      </div>
    </div>
  );
}
