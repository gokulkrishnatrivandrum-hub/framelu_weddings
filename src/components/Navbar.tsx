'use client';

import React from 'react';
import {
  Camera,
  Sparkles,
  Phone,
  MessageCircle,
  Heart,
  LogIn,
  Lock,
  Globe,
  Gift,
  Images,
  Instagram,
  Youtube,
  Facebook,
  Building2,
} from 'lucide-react';
import { StudioContactConfig, CustomerUser, StudioUser } from '@/types';

interface NavbarProps {
  activeTab: 'studio' | 'offers' | 'services' | 'gallery';
  setActiveTab: (tab: 'studio' | 'offers' | 'services' | 'gallery') => void;
  openCustomerAuthModal: () => void;
  customerUser: CustomerUser | null;
  onCustomerLogout: () => void;
  studioUser?: StudioUser | null;
  openStudioAuthModal?: () => void;
  onStudioLogout?: () => void;
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
  studioUser,
  openStudioAuthModal,
  onStudioLogout,
  studioContact,
  language,
  onToggleLanguage,
}) => {
  const isMl = language === 'ml';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Bar for Dynamic Studio Destination, Offers & Social Links (User Requirement) */}
      <div className="bg-gradient-to-r from-amber-700 via-rosewood-700 to-amber-800 text-amber-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {studioUser ? (
              <span className="bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                {isMl ? 'സ്റ്റുഡിയോ പോർട്ടൽ സജീവം' : 'Studio Portal Active'}
              </span>
            ) : customerUser ? (
              <span className="bg-emerald-400 text-stone-950 font-black px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-stone-950 animate-pulse"></span>
                {isMl ? 'കസ്റ്റമർ ലോഗിൻ സജീവം' : 'Customer Active'}
              </span>
            ) : (
              <span className="bg-amber-400 text-stone-900 font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                Studio
              </span>
            )}
            <span className="font-medium truncate max-w-xs sm:max-w-md">
              {studioUser
                ? `🏢 ${studioUser.studioName} (${studioUser.place}) • Partner Mode`
                : customerUser
                ? `👤 ${customerUser.name} • ${customerUser.place || customerUser.phone}`
                : `${studioContact.destination} • ${isMl ? 'ഫ്രെയിം ലൂ വെഡ്ഡിംഗ് കമ്പനി' : 'Framelu Wedding Photography & Films'}`}
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-xs font-medium">
            {/* Social Media Links (Instagram, YouTube, Facebook) */}
            {studioContact.instagram && (
              <a
                href={studioContact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition opacity-90 hover:opacity-100"
                title="Follow on Instagram"
              >
                <Instagram className="w-3.5 h-3.5 text-pink-300" />
                <span className="hidden sm:inline">Instagram</span>
              </a>
            )}

            {studioContact.youtube && (
              <a
                href={studioContact.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition opacity-90 hover:opacity-100"
                title="Watch on YouTube"
              >
                <Youtube className="w-3.5 h-3.5 text-red-300" />
                <span className="hidden sm:inline">YouTube</span>
              </a>
            )}

            {studioContact.facebook && (
              <a
                href={studioContact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition opacity-90 hover:opacity-100"
                title="Follow on Facebook"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden sm:inline">Facebook</span>
              </a>
            )}

            <a
              href={`https://wa.me/${studioContact.whatsapp || '916238747722'}?text=${encodeURIComponent('Hello Framelu Wedding Company, I am interested in Wedding Photography & Studio Booking')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${studioContact.phone || '+91 6238747722'}`}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{studioContact.phone || '+91 6238747722'}</span>
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
            <span>{isMl ? 'ഫോട്ടോഷൂട്ട് & പാക്കേജ്' : 'Photoshoots & Custom'}</span>
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

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'gallery'
                ? 'bg-white text-amber-800 shadow-sm border border-stone-200/60'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Images className="w-4 h-4 text-amber-600" />
            <span>{isMl ? 'ഗാലറി & വർക്കുകൾ' : 'Gallery & Works'}</span>
          </button>
        </nav>

        {/* Right Section: Studio Partner, Language Switcher & Customer Sign In */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Active Studio Partner Login Highlight */}
          {studioUser ? (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-stone-950 p-1 pl-2.5 pr-2 rounded-2xl shadow-md border-2 border-amber-300 ring-2 ring-amber-400/40">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-stone-950 text-amber-300 flex items-center justify-center shrink-0 shadow-inner">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left leading-tight min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-stone-950 text-amber-300 px-1 py-0.5 rounded">
                      {isMl ? 'സ്റ്റുഡിയോ ലോഗിൻ' : 'Studio Portal'}
                    </span>
                  </div>
                  <p className="text-xs font-black text-stone-950 truncate max-w-[100px] sm:max-w-[150px]">
                    {studioUser.studioName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onStudioLogout}
                className="text-[10px] font-black bg-stone-950 text-white hover:bg-stone-800 px-2 py-1 rounded-xl transition cursor-pointer shrink-0"
                title="Logout from Studio Portal"
              >
                {isMl ? 'ലോഗ് ഔട്ട്' : 'Logout'}
              </button>
            </div>
          ) : customerUser ? (
            /* Active Customer Login Highlight */
            <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-2 border-emerald-500 text-emerald-950 p-1 pl-2.5 pr-2 rounded-2xl shadow-md ring-2 ring-emerald-400/30">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                  {customerUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left leading-tight min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1 py-0.5 rounded">
                      {isMl ? 'കസ്റ്റമർ ലോഗിൻ' : 'Customer Active'}
                    </span>
                  </div>
                  <p className="text-xs font-black text-stone-900 truncate max-w-[100px] sm:max-w-[140px]">
                    {customerUser.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCustomerLogout}
                className="text-[10px] font-black bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-1 rounded-xl transition cursor-pointer shrink-0"
                title="Customer Logout"
              >
                {isMl ? 'ലോഗ് ഔട്ട്' : 'Logout'}
              </button>
            </div>
          ) : (
            /* Neither Logged In: Show both options clearly */
            <div className="flex items-center gap-1.5 sm:gap-2">
              {openStudioAuthModal && (
                <button
                  type="button"
                  onClick={openStudioAuthModal}
                  className="flex items-center gap-1.5 bg-stone-100 hover:bg-amber-100 hover:border-amber-300 text-stone-800 text-xs font-bold px-3 py-2 rounded-xl transition border border-stone-200 cursor-pointer"
                  title="Studio Partner Portal"
                >
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">{isMl ? 'സ്റ്റുഡിയോ പോർട്ടൽ' : 'Studio Portal'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={openCustomerAuthModal}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xl shadow-xs transition hover:shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isMl ? 'കസ്റ്റമർ ലോഗിൻ' : 'Customer Sign In'}</span>
              </button>
            </div>
          )}

          {/* Quick Switch to Studio Portal when Customer is logged in */}
          {customerUser && openStudioAuthModal && (
            <button
              type="button"
              onClick={openStudioAuthModal}
              className="hidden lg:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
              title={isMl ? 'സ്റ്റുഡിയോ പോർട്ടലിലേക്ക് മാറുക' : 'Switch to Studio Portal'}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-700" />
              <span>{isMl ? 'സ്റ്റുഡിയോ പോർട്ടൽ' : 'Studio Portal'}</span>
            </button>
          )}

          {/* Quick Switch to Customer Sign In when Studio is logged in */}
          {studioUser && (
            <button
              type="button"
              onClick={openCustomerAuthModal}
              className="hidden lg:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
              title={isMl ? 'കസ്റ്റമർ ലോഗിനിലേക്ക് മാറുക' : 'Switch to Customer Login'}
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isMl ? 'കസ്റ്റമർ ലോഗിൻ' : 'Customer Login'}</span>
            </button>
          )}

          {/* Language Switcher Toggle */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold text-xs transition shadow-2xs"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span className={language === 'ml' ? 'text-amber-800 font-black' : 'text-stone-400'}>മല</span>
            <span className="text-stone-300">/</span>
            <span className={language === 'en' ? 'text-amber-800 font-black' : 'text-stone-400'}>EN</span>
          </button>
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
          <span>{isMl ? 'ഫോട്ടോഷൂട്ട്' : 'Photoshoots'}</span>
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

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === 'gallery'
              ? 'border-amber-600 text-amber-800 bg-white'
              : 'border-transparent text-stone-600'
          }`}
        >
          <Images className="w-3.5 h-3.5 text-amber-600" />
          <span>{isMl ? 'ഗാലറി' : 'Gallery'}</span>
        </button>
      </div>
    </header>
  );
};
