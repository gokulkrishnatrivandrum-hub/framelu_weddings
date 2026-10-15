'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PriceRates,
  CustomerLead,
  StudioContactConfig,
  PromoOffer,
  HighlightBoard,
  CustomPrintItem,
} from '@/types';
import {
  DEFAULT_RATES,
  DEFAULT_STUDIO_CONTACT,
  DEFAULT_OFFERS,
  DEFAULT_HIGHLIGHT_BOARDS,
  DEFAULT_CUSTOM_PRINTS,
} from '@/constants/defaults';
import { AdminDashboard } from '@/components/AdminDashboard';
import {
  Camera,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Heart,
  LogOut,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Data State
  const [rates, setRates] = useState<PriceRates>(DEFAULT_RATES);
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [studioContact, setStudioContact] = useState<StudioContactConfig>(DEFAULT_STUDIO_CONTACT);
  const [offers, setOffers] = useState<PromoOffer[]>(DEFAULT_OFFERS);
  const [highlightBoards, setHighlightBoards] = useState<HighlightBoard[]>(DEFAULT_HIGHLIGHT_BOARDS);
  const [customPrintItems, setCustomPrintItems] = useState<CustomPrintItem[]>(DEFAULT_CUSTOM_PRINTS);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check session
      const authSession = sessionStorage.getItem('framlu_admin_session');
      if (authSession === 'true') {
        setIsAuthenticated(true);
      }

      // Load custom prints
      const savedCustomPrints = localStorage.getItem('framlu_wedding_custom_prints');
      if (savedCustomPrints) {
        try {
          setCustomPrintItems(JSON.parse(savedCustomPrints));
        } catch (e) {
          console.error(e);
        }
      }

      // Load rates
      const savedRates = localStorage.getItem('framlu_wedding_rates') || localStorage.getItem('lumina_wedding_rates');
      if (savedRates) {
        try {
          setRates(JSON.parse(savedRates));
        } catch (e) {
          console.error(e);
        }
      }

      // Load contact
      const savedContact = localStorage.getItem('framlu_wedding_contact') || localStorage.getItem('lumina_wedding_contact');
      if (savedContact) {
        try {
          setStudioContact(JSON.parse(savedContact));
        } catch (e) {
          console.error(e);
        }
      }

      // Load offers
      const savedOffers = localStorage.getItem('framlu_wedding_offers') || localStorage.getItem('lumina_wedding_offers');
      if (savedOffers) {
        try {
          setOffers(JSON.parse(savedOffers));
        } catch (e) {
          console.error(e);
        }
      }

      // Load boards
      const savedBoards = localStorage.getItem('framlu_wedding_boards') || localStorage.getItem('lumina_wedding_boards');
      if (savedBoards) {
        try {
          setHighlightBoards(JSON.parse(savedBoards));
        } catch (e) {
          console.error(e);
        }
      }

      // Load leads
      const savedLeads = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      if (savedLeads) {
        try {
          setLeads(JSON.parse(savedLeads));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Secure Admin credentials: admin / admin (or framelu@admin / admin123)
    const validUsernames = ['admin', 'framelu', 'frameluadmin', 'framlu', 'framluadmin'];
    const validPasswords = ['admin', 'framelu@admin', 'admin123', 'framelu2026', 'framlu@admin', 'framlu2026'];

    if (
      validUsernames.includes(username.trim().toLowerCase()) &&
      validPasswords.includes(password.trim())
    ) {
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('framlu_admin_session', 'true');
      }
    } else {
      setLoginError('Invalid Username or Password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('framlu_admin_session');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-between p-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white flex items-center justify-center font-black shadow-lg">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white block leading-tight">
                FRAMELU <span className="text-amber-500">WEDDINGS</span>
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                Private Company Portal
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"
          >
            <span>Public Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Login Card */}
        <main className="max-w-md w-full mx-auto my-auto relative z-10 py-8">
          <div className="bg-stone-850/90 backdrop-blur-xl border border-stone-750 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Company Admin Login
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Framelu Wedding Company • Authorized Access Only
              </p>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-semibold text-center animate-fade-in">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                  Admin User ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Admin Username (admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1.5 uppercase tracking-wider">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter Admin Password (admin)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm shadow-lg shadow-amber-600/30 transition hover:shadow-xl active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Enter Admin Portal</span>
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-800 text-center">
              <p className="text-[11px] text-stone-400">
                Default Credentials: User ID: <code className="bg-stone-900 text-amber-400 px-1.5 py-0.5 rounded font-mono">admin</code> | Password: <code className="bg-stone-900 text-amber-400 px-1.5 py-0.5 rounded font-mono">admin</code>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto w-full text-center py-3 text-xs text-stone-400 relative z-10">
          Framelu Wedding Company • Private Admin Dashboard • All rights reserved
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Admin Top Sticky Bar */}
      <div className="bg-stone-900 text-white px-4 py-3 border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base text-white tracking-tight block leading-tight">
                FRAMELU <span className="text-amber-400">WEDDING COMPANY</span>
              </span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                Private Admin Management Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-stone-200 transition"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Dashboard */}
      <AdminDashboard
        rates={rates}
        setRates={setRates}
        leads={leads}
        setLeads={setLeads}
        studioContact={studioContact}
        setStudioContact={setStudioContact}
        offers={offers}
        setOffers={setOffers}
        highlightBoards={highlightBoards}
        setHighlightBoards={setHighlightBoards}
        customPrintItems={customPrintItems}
        setCustomPrintItems={setCustomPrintItems}
        onCloseAdmin={handleLogout}
        language="en"
      />
    </div>
  );
}
