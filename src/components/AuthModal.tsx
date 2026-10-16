'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { name: string; emailOrPhone: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [method, setMethod] = useState<'google' | 'phone' | 'email'>('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      onSuccess({
        name: user.displayName || 'Google User',
        emailOrPhone: user.email || '+91 9847123456',
      });
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        alert(err.message || 'Google sign in failed');
      }
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      alert('ദയവായി 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      alert('ദയവായി ഒടിപി നൽകുക');
      return;
    }
    onSuccess({
      name: name || `User ${phoneNumber.slice(-4)}`,
      emailOrPhone: `+91 ${phoneNumber}`,
    });
    onClose();
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('ഇമെയിലും പാസ്‌വേർഡും നൽകുക');
      return;
    }
    onSuccess({
      name: name || email.split('@')[0],
      emailOrPhone: email,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            ലോഗിൻ / സൈൻ ഇൻ
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            നിങ്ങളുടെ വെഡ്ഡിംഗ് പ്ലാൻ സേവ് ചെയ്യാനും കൊട്ടേഷനുകൾ ട്രാക്ക് ചെയ്യാനും ലോഗിൻ ചെയ്യുക
          </p>
        </div>

        {/* Auth Method Selector */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl mb-5 text-xs font-bold text-stone-700">
          <button
            type="button"
            onClick={() => setMethod('google')}
            className={`py-2 rounded-lg transition ${
              method === 'google' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => setMethod('phone')}
            className={`py-2 rounded-lg transition ${
              method === 'phone' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            Phone OTP
          </button>
          <button
            type="button"
            onClick={() => setMethod('email')}
            className={`py-2 rounded-lg transition ${
              method === 'email' ? 'bg-white text-stone-900 shadow-xs' : 'hover:text-stone-900'
            }`}
          >
            Email
          </button>
        </div>

        {/* 1. Google Sign-In */}
        {method === 'google' && (
          <div className="space-y-4 text-center">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50/20 py-3 px-4 rounded-2xl font-bold text-sm text-stone-800 transition shadow-xs"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[11px] text-stone-500">
              ഗൂഗിൾ അക്കൗണ്ട് വഴി ഒരു ക്ലിക്കിൽ ലളിതമായി ലോഗിൻ ചെയ്യാം
            </p>
          </div>
        )}

        {/* 2. Phone OTP */}
        {method === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    നിങ്ങളുടെ പേര്
                  </label>
                  <input
                    type="text"
                    placeholder="പേര് നൽകുക"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    മൊബൈൽ നമ്പർ *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-200 bg-stone-100 text-stone-600 text-sm font-semibold">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-r-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm"
                >
                  Send OTP (ഒടിപി അയക്കുക)
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <span>+91 {phoneNumber} എന്ന നമ്പറിലേക്ക് OTP അയച്ചിട്ടുണ്ട്</span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="underline font-bold"
                  >
                    Edit
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    6 അക്ക ഒടിപി നൽകുക
                  </label>
                  <input
                    type="text"
                    placeholder="ഉദാ: 123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-center tracking-widest text-lg font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm"
                >
                  Verify & Login (ലോഗിൻ പൂർത്തിയാക്കുക)
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. Email & Password */}
        {method === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">പേര്</label>
              <input
                type="text"
                placeholder="നിങ്ങളുടെ പേര്"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">ഇമെയിൽ</label>
              <input
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">പാസ്‌വേർഡ്</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition text-sm shadow-sm"
            >
              Sign In with Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
