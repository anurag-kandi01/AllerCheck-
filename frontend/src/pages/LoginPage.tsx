import React, { useState } from 'react';
import { Stethoscope, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onGuestLogin: () => void;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGuestLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onLogin(email || 'user@allercheck.ai');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] hero-grid flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb-1" style={{ top: '-200px', left: '-100px' }} />
      <div className="orb-2" style={{ bottom: '-100px', right: '-100px' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 to-[#0a0a0f]/80" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={onBack} className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Aller<span className="text-cyan-400">Check</span>
              <span className="text-gradient text-sm font-medium ml-1">AI</span>
            </span>
          </button>
          <p className="text-slate-500 text-sm mt-3">Clinical-grade dermatological screening</p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                  tab === t
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 pr-10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/50 focus:bg-white/8 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {tab === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {tab === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0e0e17] px-3 text-xs text-slate-500">or continue as</span>
            </div>
          </div>

          <button
            onClick={onGuestLogin}
            className="w-full flex items-center justify-center gap-2 glass hover:bg-white/8 text-slate-300 hover:text-white py-3 rounded-xl font-medium text-sm transition-all border border-white/10 hover:border-white/20"
          >
            <Shield className="w-4 h-4 text-slate-400" />
            Guest Diagnostic Session
          </button>

          <p className="text-center text-xs text-slate-600 mt-6">
            By continuing, you agree this tool is for educational purposes only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
