import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Key, Check, AlertCircle, X, RefreshCw } from 'lucide-react';
import { SacredCrossIcon } from '../common/DecorativeIcons';

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsername: string;
  currentPassword: string;
  onSaveCredentials: (newUsername: string, newPassword: string) => void;
}

export const AdminSecurityModal: React.FC<AdminSecurityModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  currentPassword,
  onSaveCredentials,
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (oldPassword !== currentPassword) {
      setErrorMsg('Current password does not match.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }

    onSaveCredentials(username.trim(), newPassword);
    setSuccessMsg('Admin credentials updated successfully!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1600);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset admin credentials to default (admin / admin123)?')) {
      onSaveCredentials('admin', 'admin123');
      setUsername('admin');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Reset to default credentials (admin / admin123)!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-montserrat">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 mb-2.5 text-amber-800">
            <ShieldCheck className="w-6 h-6 text-amber-700" />
          </div>
          <h3 className="font-cormorant text-2xl font-bold text-stone-900 leading-tight">
            Admin Security &amp; Credentials
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Update your admin login username and password credentials.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="Min 4 chars"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all cursor-pointer shadow-xs"
            >
              Update Credentials
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-400">
            Credentials are securely stored locally for this host browser session.
          </p>
        </div>
      </div>
    </div>
  );
};
