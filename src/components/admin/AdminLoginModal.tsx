import React, { useState } from 'react';
import { SacredCrossIcon, HolyDoveIcon, GoldSparkleIcon } from '../common/DecorativeIcons';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, Sparkles, X, Check } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: () => void;
  savedUsername: string;
  savedPasswordHash: string;
  canCancel?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  savedUsername,
  savedPasswordHash,
  canCancel = true,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const expectedUser = (savedUsername || 'admin').toLowerCase();
    const expectedPass = savedPasswordHash || 'admin123';

    if (trimmedUser === expectedUser && password === expectedPass) {
      if (rememberMe) {
        localStorage.setItem('blessed_admin_session', 'true');
      } else {
        sessionStorage.setItem('blessed_admin_session', 'true');
      }
      onLoginSuccess();
    } else {
      setErrorMsg('Invalid admin username or password. Please try again.');
    }
  };

  const handleFillDemo = () => {
    setUsername(savedUsername || 'admin');
    setPassword(savedPasswordHash || 'admin123');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in font-montserrat">
      <div
        className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl p-7 sm:p-8 shadow-2xl border border-stone-200 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(201, 169, 106, 0.25)',
        }}
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-40 pointer-events-none bg-amber-200" />

        {/* Close Button if cancel is allowed */}
        {canCancel && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Close login portal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header with Sacred Cross & Dove */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 shadow-xs mb-3 text-amber-800">
            <SacredCrossIcon color="#C9A96A" className="w-7 h-7" />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-widest uppercase text-amber-800 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMIN SECURE ACCESS</span>
          </div>

          <h2 className="font-cormorant text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
            Invitation Studio Portal
          </h2>

          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
            Authorized administrator &amp; host login to create sites and manage RSVPs.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all text-stone-800 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 transition-all text-stone-800 placeholder:text-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-stone-600 pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span>Keep me logged in</span>
            </label>

            <button
              type="button"
              onClick={handleFillDemo}
              className="text-amber-800 hover:text-amber-900 font-semibold text-[11px] hover:underline cursor-pointer"
            >
              Fill Default Credentials
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl text-xs font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #C9A96A, #A87D43)',
            }}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Login to Admin Studio</span>
          </button>
        </form>

        {/* Demo Credentials Hint Box */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">
            Default Host Credentials
          </span>
          <div className="flex items-center justify-center gap-3 text-xs text-stone-700 font-mono">
            <span>User: <strong className="text-stone-900 font-bold">{savedUsername || 'admin'}</strong></span>
            <span>•</span>
            <span>Pass: <strong className="text-stone-900 font-bold">{savedPasswordHash || 'admin123'}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
