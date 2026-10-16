'use client';

import React, { useState } from 'react';
import { AppUserSession, StudioContactConfig } from '@/types';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Package,
  Sparkles,
  Images,
  Settings,
  LogOut,
  User,
  Building2,
  Menu,
  X,
  Phone,
  MessageCircle,
  Globe,
  Camera,
  Layers,
} from 'lucide-react';

export type MainNavTab =
  | 'dashboard'
  | 'new_quote'
  | 'quotes'
  | 'packages'
  | 'services'
  | 'gallery'
  | 'admin';

interface SidebarNavProps {
  currentTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  userSession: AppUserSession | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  studioContact: StudioContactConfig;
  language: 'en' | 'ml';
  onToggleLanguage: () => void;
  quotesCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentTab,
  onSelectTab,
  userSession,
  onOpenAuthModal,
  onLogout,
  studioContact,
  language,
  onToggleLanguage,
  quotesCount = 0,
}) => {
  const isMl = language === 'ml';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as MainNavTab,
      labelEn: 'Dashboard',
      labelMl: 'ഡാഷ്ബോർഡ്',
      icon: LayoutDashboard,
      badge: quotesCount > 0 ? `${quotesCount}` : undefined,
    },
    {
      id: 'new_quote' as MainNavTab,
      labelEn: 'Create New Quote',
      labelMl: 'പുതിയ കൊട്ടേഷൻ',
      icon: PlusCircle,
      highlight: true,
    },
    {
      id: 'quotes' as MainNavTab,
      labelEn: 'Quotes',
      labelMl: 'കൊട്ടേഷനുകൾ',
      icon: FileText,
      badge: quotesCount > 0 ? `${quotesCount}` : undefined,
    },
    {
      id: 'packages' as MainNavTab,
      labelEn: 'Packages',
      labelMl: 'പാക്കേജുകൾ',
      icon: Package,
    },
    {
      id: 'services' as MainNavTab,
      labelEn: 'Other Services',
      labelMl: 'മറ്റ് സർവീസുകൾ',
      icon: Sparkles,
    },
    {
      id: 'gallery' as MainNavTab,
      labelEn: 'Gallery',
      labelMl: 'ഗാലറി & വർക്കുകൾ',
      icon: Images,
    },
  ];

  if (userSession?.role === 'studio') {
    navItems.push({
      id: 'admin' as MainNavTab,
      labelEn: 'Studio Rates & CRM',
      labelMl: 'സ്റ്റുഡിയോ സെറ്റിംഗ്സ്',
      icon: Settings,
      highlight: false,
    });
  }

  const handleTabClick = (tab: MainNavTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* TOP HEADER BAR (Always visible at top of page) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
        <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger + Brand name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-950 text-white flex items-center justify-center font-black shadow-xs group-hover:scale-105 transition-transform">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </div>
              </div>
              <div>
                <span className="font-black text-base sm:text-lg tracking-tight text-stone-900 flex items-center gap-1.5">
                  FRAMELU <span className="text-amber-600">WEDDING PLANNER</span>
                </span>
                <p className="text-[10px] font-semibold text-stone-500 tracking-wider uppercase hidden sm:block">
                  Wedding Photography & Films • {studioContact.destination.split(',')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Right Header: Logged-in User name, Role Pill, Language & Auth Button */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-stone-250 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              title="Toggle English / മലയാളം"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
            </button>

            {/* User Session Profile Pill or Sign-in button */}
            {userSession ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-stone-100 hover:bg-stone-150 border border-stone-250 px-3 py-1.5 rounded-2xl transition">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold ${
                      userSession.role === 'studio'
                        ? 'bg-gradient-to-tr from-indigo-600 to-blue-600'
                        : 'bg-gradient-to-tr from-amber-600 to-rose-600'
                    }`}
                  >
                    {userSession.role === 'studio' ? (
                      <Building2 className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900 leading-tight max-w-[120px] sm:max-w-[180px] truncate block">
                        {userSession.name}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full tracking-wider ${
                          userSession.role === 'studio'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {userSession.role === 'studio' ? 'Studio' : 'Customer'}
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 font-medium block truncate max-w-[130px]">
                      @{userSession.userId || userSession.phone}
                    </span>
                  </div>
                </div>

                {/* Logout / Switch Role */}
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                  title={isMl ? 'ലോഗൗട്ട് ചെയ്യുക' : 'Sign out'}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs shadow-xs hover:shadow-md transition active:scale-95 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{isMl ? 'ലോഗിൻ / സൈൻ ഇൻ' : 'Sign In'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* DESKTOP LEFT VERTICAL SIDEBAR MENU (Matches user screenshot) */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-stone-200 z-30 flex-col justify-between pt-16">
        <div>
          {/* Logo & Studio Title inside left sidebar (Top section) */}
          <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-stone-900">
                Framelu Event Planner
              </h2>
              <span className="text-[10px] text-stone-400 font-semibold block">
                {userSession?.role === 'studio' ? 'Studio Partner Portal' : 'Event Portal'}
              </span>
            </div>
          </div>

          {/* Navigation Items - Clean vertical stack as shown in image */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold border border-amber-200/80'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-stone-500'}`} />
                    <span>{isMl ? item.labelMl : item.labelEn}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/60 text-xs">
          {userSession ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-stone-600 font-medium">
                <span>{isMl ? 'റോൾ:' : 'Role:'}</span>
                <span className="font-bold uppercase text-stone-900">
                  {userSession.role === 'studio' ? 'Studio Partner' : 'Customer'}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-stone-700 font-bold transition text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isMl ? 'ലോഗൗട്ട് ചെയ്യുക' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black transition text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In'}</span>
            </button>
          )}

          <div className="mt-3 pt-3 border-t border-stone-200/80 text-[10px] text-stone-400 flex items-center justify-between">
            <span>Framelu Event Planner</span>
            <a
              href={`https://wa.me/${studioContact.whatsapp || '916238747722'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline font-bold"
            >
              Support
            </a>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 animate-fade-in">
            <div>
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-black">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-stone-900">Framelu Event Planner</h3>
                    <span className="text-[10px] text-stone-500 font-medium">Menu Navigation</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-stone-900 text-white shadow-xs'
                          : item.highlight
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-amber-700' : 'text-stone-500'}`} />
                        <span>{isMl ? item.labelMl : item.labelEn}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-stone-200 text-xs space-y-2">
              {userSession ? (
                <>
                  <div className="text-[11px] text-stone-600">
                    Logged in as <strong className="text-stone-900">{userSession.name}</strong> ({userSession.role})
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-rose-50 hover:text-rose-700 text-stone-700 font-bold text-xs transition"
                  >
                    {isMl ? 'ലോഗൗട്ട് ചെയ്യുക' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition"
                >
                  {isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (Prominent, thumb-friendly app bar for phones) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {/* Tab: Dashboard */}
        <button
          type="button"
          onClick={() => handleTabClick('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === 'dashboard' ? 'text-amber-600 font-extrabold' : 'text-stone-500 font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isMl ? 'ഡാഷ്ബോർഡ്' : 'Dashboard'}</span>
        </button>

        {/* Tab: Quotes */}
        <button
          type="button"
          onClick={() => handleTabClick('quotes')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
            currentTab === 'quotes' ? 'text-amber-600 font-extrabold' : 'text-stone-500 font-medium'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isMl ? 'കൊട്ടേഷൻ' : 'Quotes'}</span>
          {quotesCount > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 bg-amber-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {quotesCount}
            </span>
          )}
        </button>

        {/* Center Action: + New Quote */}
        <button
          type="button"
          onClick={() => handleTabClick('new_quote')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform border-2 border-white">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-amber-700 mt-0.5">
            {isMl ? 'പുതിയത്' : 'New Quote'}
          </span>
        </button>

        {/* Tab: Packages */}
        <button
          type="button"
          onClick={() => handleTabClick('packages')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            currentTab === 'packages' ? 'text-amber-600 font-extrabold' : 'text-stone-500 font-medium'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{isMl ? 'പാക്കേജ്' : 'Packages'}</span>
        </button>

        {/* Tab: User/Profile */}
        <button
          type="button"
          onClick={() => {
            if (userSession) {
              handleTabClick('dashboard');
            } else {
              onOpenAuthModal();
            }
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            userSession ? 'text-emerald-700 font-extrabold' : 'text-stone-500 font-medium'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">
            {userSession ? userSession.name.split(' ')[0] : (isMl ? 'ലോഗിൻ' : 'Login')}
          </span>
        </button>
      </nav>
    </>
  );
};
