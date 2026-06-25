import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Lock, Home } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  const fillDemo = (e, p) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex bg-[#111111]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center p-12 bg-gradient-to-br from-[#111111] to-[#1A1A1A] border-r border-gray-800">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#C0001A] flex items-center justify-center mb-8 shadow-2xl shadow-red-900/20">
            <Lock className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Staff Portal</h1>
          <p className="text-gray-400 text-lg mb-12">Manage all school communication securely from one centralized dashboard.</p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 text-gray-300"><span className="text-[#FFB800]">✓</span> Compose rich circulars</div>
            <div className="flex items-center gap-3 text-gray-300"><span className="text-[#FFB800]">✓</span> Automated attendance alerts</div>
            <div className="flex items-center gap-3 text-gray-300"><span className="text-[#FFB800]">✓</span> Track live delivery status</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-24 relative bg-[#0A0A0A]">
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400">Sign in to your staff account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-500/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label-text">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@sgei.edu.in" 
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
            
            <button type="submit" className="btn-primary w-full mt-8">
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="text-sm text-gray-400 mb-3">Demo Credentials:</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => fillDemo('admin@sgei.edu.in', 'Admin@123')} className="px-3 py-1.5 text-xs font-medium rounded bg-[#1A1A1A] border border-gray-700 hover:border-[#FFB800] transition-colors text-white">Admin</button>
              <button type="button" onClick={() => fillDemo('teacher@sgei.edu.in', 'Teacher@123')} className="px-3 py-1.5 text-xs font-medium rounded bg-[#1A1A1A] border border-gray-700 hover:border-[#FFB800] transition-colors text-white">Teacher</button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link to="/" className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors">
              <Home size={14} /> Back to Home
            </Link>
            <Link to="/login" className="text-[#FFB800] hover:text-amber-400 font-medium transition-colors">
              Parent / Student Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
