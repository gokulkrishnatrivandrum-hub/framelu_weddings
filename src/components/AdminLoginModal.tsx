'use client';

import React, { useState } from 'react';
import { X, Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language?: 'en' | 'ml';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Default admin credentials: admin / admin123
    const validUsername = 'admin';
    const validPassword = 'admin123';

    if (username.trim() === validUsername && password === validPassword) {
      onSuccess();
      onClose();
    } else {
      setError(
        isMl
          ? 'തെറ്റായ യൂസർ ഐഡി അല്ലെങ്കിൽ പാസ്‌വേർഡ്. (ഡീഫോൾട്ട്: admin / admin123)'
          : 'Invalid User ID or Password. (Default: admin / admin123)'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="bg-stone-900 text-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-stone-800 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            {isMl ? 'അഡ്മിൻ പോർട്ടൽ ലോഗിൻ' : 'Admin Portal Login'}
          </h3>
          <p className="text-stone-400 text-xs mt-1">
            {isMl
              ? 'സ്റ്റുഡിയോ അഡ്മിൻ പാനലിലേക്ക് പ്രവേശിക്കാൻ യൂസർ ഐഡിയും പാസ്‌വേർഡും നൽകുക'
              : 'Enter User ID and Password to access the protected Studio Admin Panel'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              {isMl ? 'യൂസർ ഐഡി (User ID)' : 'User ID'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-700 text-xs sm:text-sm text-white bg-stone-800/80 focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1">
              {isMl ? 'പാസ്‌വേർഡ് (Password)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-700 text-xs sm:text-sm text-white bg-stone-800/80 focus:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <span>{isMl ? 'അഡ്മിൻ പാനൽ ഓപ്പൺ ചെയ്യുക' : 'Open Admin Panel'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-stone-500 text-center mt-2">
              Default login: <span className="text-amber-400 font-mono">admin</span> / <span className="text-amber-400 font-mono">admin123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
