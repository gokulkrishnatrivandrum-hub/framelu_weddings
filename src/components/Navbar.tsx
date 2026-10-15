'use client';

import React from 'react';
import { Camera, Sparkles, Phone, MessageCircle, Heart, LogIn, Lock, Globe, Gift } from 'lucide-react';
import { StudioContactConfig, CustomerUser } from '@/types';

interface NavbarProps {
  activeTab: 'studio' | 'offers' | 'services';
  setActiveTab: (tab: 'studio' | 'offers' | 'services') => void;
  openCustomerAuthModal: () => void;
  customerUser: CustomerUser | null;
  onCustomerLogout: () => void;
  studioContact: StudioContactConfig;
  language: 'en' | 'ml';
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCustomerAuthModal,
  customerUser,
  onCustomerLogout,
  studioContact,
  language,
  onToggleLanguage,
}) => {
  const isMl = language === 'ml';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Bar for Dynamic Studio Destination, Offers & Contact */}
      <div className="bg-gradient-to-r from-amber-700 via-rosewood-700 to-amber-800 text-amber-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-stone-900 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
              Studio
            </span>
            <span className="font-medium truncate max-w-xs sm:max-w-md">
              {studioContact.destination} • {isMl ? 'ഫ്രെയിം ലൂ വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി & സിനിമാറ്റോഗ്രാഫി' : 'Framelu Wedding Photography & Films'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a
              href={`https://wa.me/${studioContact.whatsapp}?text=${encodeURIComponent('Hello Framelu Wedding Company, I am interested in Wedding Photography & Studio Booking')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${studioContact.phone}`}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>{studioContact.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('studio')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-rosewood-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-stone-900">
                FRAMELU <span className="text-amber-600 font-black">WEDDINGS</span>
              </span>
              <Heart className="w-3.5 h-3.5 text-rosewood-500 fill-rosewood-500" />
            </div>
            <p className="text-[11px] font-semibold text-stone-500 tracking-wide">
              Framelu Wedding Company • {studioContact.destination.split(',')[0]}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Admin is separated away from here as requested!) */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'studio'
                ? 'bg-white text-amber-700 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isMl ? 'കസ്റ്റം പാക്കേജ്' : 'Custom Package'}</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'offers'
                ? 'bg-white text-rose-700 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gift className="w-4 h-4 text-rose-600" />
            <span>{isMl ? 'ഓഫറുകൾ & ബോർഡുകൾ' : 'Offers & Boards'}</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'services'
                ? 'bg-white text-rosewood-600 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{isMl ? 'മറ്റ് സർവീസുകൾ' : 'Other Services'}</span>
          </button>
        </nav>

        {/* Right Section: Language Switcher & Customer Sign In */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher Toggle (User specifically requested Malayalam <-> English switch) */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs transition shadow-2xs"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span className={language === 'ml' ? 'text-amber-800 font-black' : 'text-stone-400'}>മല</span>
            <span className="text-stone-300">/</span>
            <span className={language === 'en' ? 'text-amber-800 font-black' : 'text-stone-400'}>EN</span>
          </button>

          {/* Customer User Account / Sign In */}
          {customerUser ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-2xl">
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                {customerUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-stone-900 leading-tight">{customerUser.name}</p>
                <p className="text-[10px] text-stone-500">{customerUser.place || customerUser.phone}</p>
              </div>
              <button
                onClick={onCustomerLogout}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold ml-1 pl-2 border-l border-amber-200"
              >
                {isMl ? 'ലോഗൗട്ട്' : 'Logout'}
              </button>
            </div>
          ) : (
            <button
              onClick={openCustomerAuthModal}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 rounded-xl shadow-xs transition hover:shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>{isMl ? 'കസ്റ്റമർ സൈൻ-ഇൻ' : 'Customer Sign In'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-stone-200 bg-stone-50 text-xs font-bold">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'studio'
              ? 'border-amber-600 text-amber-700 bg-white'
              : 'border-transparent text-stone-600'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isMl ? 'സ്റ്റുഡിയോ' : 'Studio'}</span>
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'offers'
              ? 'border-rose-600 text-rose-700 bg-white'
              : 'border-transparent text-stone-600'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-rose-600" />
          <span>{isMl ? 'ഓഫറുകൾ' : 'Offers'}</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'services'
              ? 'border-rosewood-600 text-rosewood-600 bg-white'
              : 'border-transparent text-stone-600'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{isMl ? 'സർവീസുകൾ' : 'Services'}</span>
        </button>
      </div>
    </header>
  );
};
