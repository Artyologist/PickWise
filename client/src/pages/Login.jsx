import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../components/content/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister && formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = isRegister
        ? await api.register(formData)
        : await api.login(formData);

      if (res.ok) {
        // Demonstration Audit Log
        console.log('✅ Auth success:', {
          email: formData.email,
          time: new Date().toLocaleTimeString(),
          type: isRegister ? 'registration' : 'login'
        });

        login(res.token, res.user);
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 py-8">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 transition-all duration-500">
        <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">
              {isRegister ? 'Join PickWise' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {isRegister
                ? 'Create an account to start your IP discovery journey.'
                : 'Sign in to access your watchlist and reviews.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-shake">
              <span className="text-lg">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 ml-4 uppercase tracking-widest">Username</label>
                <input
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  type="text"
                  placeholder="UniversalExplorer"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-slate-500 ml-4 uppercase tracking-widest">Email Address</label>
              <input
                className="w-full bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                type="email"
                placeholder="you@ipsearch.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-slate-500 ml-4 uppercase tracking-widest">Password</label>
              <input
                className="w-full bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 dark:text-slate-500 ml-4 uppercase tracking-widest">Confirm Password</label>
                <input
                  className="w-full bg-gray-50 dark:bg-slate-800/50 border-none rounded-2xl p-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Join now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
