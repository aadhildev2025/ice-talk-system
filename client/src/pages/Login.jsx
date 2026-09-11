import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, UtensilsCrossed } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, getRoleHomePath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      const redirectPath = getRoleHomePath(result.user.role);
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Invalid username or password.');
    }
  };

  // Quick fill helper for demo/testing convenience
  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="flex-1 min-h-full flex flex-col justify-center items-center p-4 relative overflow-hidden bg-[#0A0A0D]">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#00C2FF]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Card */}
        <div className="bg-[#141419]/90 border border-[#262633] backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/80">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Ice Talk Logo" className="w-24 h-24 object-contain drop-shadow-xl" />
            </div>
            <h1 className="text-2xl font-black tracking-tight font-display text-white">
              ICE TALK
            </h1>
            <p className="text-xs font-bold tracking-widest text-[#FF6B00] uppercase mt-0.5">
              FAMILY RESTAURANT
            </p>
            <div className="mt-3 inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="text-xs text-neutral-300 font-medium">POS & Order Management</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin, ahmed, kitchen"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 transition-all outline-none"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Please contact the Restaurant developer to reset your password.')}
                  className="text-[11px] text-[#FF6B00] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#1C1C24] border border-[#2D2D3B] focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 transition-all outline-none"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8526] hover:from-[#E55A00] hover:to-[#FF6B00] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm tracking-wide uppercase disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Picker */}
          <div className="mt-8 pt-6 border-t border-[#232330]">
            <p className="text-[11px] text-center text-neutral-400 font-medium mb-3 uppercase tracking-wider">
              Quick Demo Staff Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'admin123')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C24] hover:bg-[#262633] border border-[#2D2D3D] hover:border-orange-500/40 text-neutral-300 hover:text-white transition-all group"
              >
                <ShieldCheck className="w-5 h-5 text-orange-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[10px] text-neutral-500">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('ahmed', 'waiter123')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#1C1C24] hover:bg-[#262633] border border-[#2D2D3D] hover:border-blue-500/40 text-neutral-300 hover:text-white transition-all group"
              >
                <UtensilsCrossed className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Waiter</span>
                <span className="text-[10px] text-neutral-500">Ahmed</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-500 mt-6">
          © 2026 ICE TALK FAMILY RESTAURANT • Secure Staff Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
