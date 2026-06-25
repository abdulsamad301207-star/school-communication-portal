import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('sgei_auth');
    if (session) {
      const data = JSON.parse(session);
      setUser(data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await axios.post('/api/v1/auth/login', credentials);
    sessionStorage.setItem('sgei_auth', JSON.stringify(res.data));
    setUser(res.data.user);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    return res.data.user;
  };

  const logout = () => {
    sessionStorage.removeItem('sgei_auth');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#111111] text-white">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
