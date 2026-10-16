'use client';

import React from 'react';
import { SideSelection } from '@/types';
import { CheckCircle2, Sparkles, HeartHandshake } from 'lucide-react';

interface SideSelectorProps {
  selectedSide: SideSelection;
  onSelectSide: (side: SideSelection) => void;
  language?: 'en' | 'ml';
}

export const SideSelector: React.FC<SideSelectorProps> = ({
  selectedSide,
  onSelectSide,
  language = 'en',
}) => {
  const isMl = language === 'ml';

  return (
    <div className="bg-gradient-to-b from-white via-white to-amber-50/20 rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm mb-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 to-rose-100 text-amber-900 border border-amber-200/80 mb-2.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          {isMl ? 'ഘട്ടം 1' : 'Step 1 • Side Selection'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          {isMl ? 'ആരുടെ ഫോട്ടോഗ്രാഫി വർക്ക് ആണ് ആവശ്യം?' : 'Whose Photography Coverage is Required?'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
          {isMl
            ? 'വരന്റെ ഭാഗം മാത്രമാണോ, വധുവിന്റെ ഭാഗം മാത്രമാണോ, അതോ രണ്ടുപേരുടെയും കവറേജ് ഒരുമിച്ചാണോ എന്ന് തിരഞ്ഞെടുക്കുക'
            : 'Select whether you require Groom side only, Bride side only, or both sides combined with dual crews'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {/* 1. Groom Side Only (Gentleman Symbol 🤵) */}
        <div
          onClick={() => onSelectSide('groom')}
          className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden ${
            selectedSide === 'groom'
              ? 'border-amber-500 bg-gradient-to-br from-amber-500/15 via-amber-100/60 to-amber-500/20 shadow-xl ring-4 ring-amber-400/30 scale-102'
              : 'border-stone-200 bg-white hover:border-amber-300 hover:shadow-md hover:bg-stone-50/80'
          }`}
        >
          {selectedSide === 'groom' && (
            <div className="absolute top-4 right-4 text-amber-600">
              <CheckCircle2 className="w-6 h-6 fill-amber-600 text-white drop-shadow-xs" />
            </div>
          )}

          <div>
            {/* Groom Gentleman Icon & Symbol (Requirement 4) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center text-2xl shadow-md">
                🤵
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200">
                Groom Side
              </span>
            </div>

            <h3 className="text-xl font-black text-stone-900">
              {isMl ? 'വരന്റെ ഭാഗം മാത്രം' : 'Groom Side Only'}
            </h3>
            <p className="text-xs font-bold text-amber-800 mt-0.5">Groom Family & Events</p>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              {isMl
                ? 'വരന്റെ വീട്ടിലെ ചടങ്ങുകൾ, വരന്റെ റിസപ്ഷൻ, വിവാഹ ദിവസത്തെ വരന്റെ കവറേജ്, വരന്റെ ആൽബം.'
                : 'Coverage of groom home ceremonies, pre-wedding rituals, reception & exclusive groom album.'}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-amber-200/50 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700">{isMl ? 'ഇവന്റുകൾ:' : 'Events:'}</span>
            <span className="text-amber-800 font-black">{isMl ? 'കസ്റ്റം ചോയ്‌സ്' : 'Custom Select'}</span>
          </div>
        </div>

        {/* 2. Bride Side Only (Lady Symbol 👰) */}
        <div
          onClick={() => onSelectSide('bride')}
          className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden ${
            selectedSide === 'bride'
              ? 'border-rosewood-600 bg-gradient-to-br from-rose-500/15 via-rose-100/60 to-rose-500/20 shadow-xl ring-4 ring-rose-400/30 scale-102'
              : 'border-stone-200 bg-white hover:border-rose-300 hover:shadow-md hover:bg-stone-50/80'
          }`}
        >
          {selectedSide === 'bride' && (
            <div className="absolute top-4 right-4 text-rosewood-600">
              <CheckCircle2 className="w-6 h-6 fill-rosewood-600 text-white drop-shadow-xs" />
            </div>
          )}

          <div>
            {/* Bride Lady Icon & Symbol (Requirement 4) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 via-rosewood-600 to-rosewood-700 text-white flex items-center justify-center text-2xl shadow-md">
                👰
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100/90 text-rose-900 border border-rose-200">
                Bride Side
              </span>
            </div>

            <h3 className="text-xl font-black text-stone-900">
              {isMl ? 'വധുവിന്റെ ഭാഗം മാത്രം' : 'Bride Side Only'}
            </h3>
            <p className="text-xs font-bold text-rosewood-700 mt-0.5">Bride Family & Events</p>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              {isMl
                ? 'വധുവിന്റെ വീട്ടിലെ ചടങ്ങുകൾ (മൈലാഞ്ചി, ഹൽദി), വിവാഹ ദിവസത്തെ വധുവിന്റെ മേക്കപ്പ് & കവറേജ്, വധുവിന്റെ ആൽബം.'
                : 'Coverage of Mehendi, Haldi, bridal makeover session, wedding rituals & bridal keepsake album.'}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-rose-200/50 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700">{isMl ? 'ഇവന്റുകൾ:' : 'Events:'}</span>
            <span className="text-rosewood-800 font-black">{isMl ? 'കസ്റ്റം ചോയ്‌സ്' : 'Custom Select'}</span>
          </div>
        </div>

        {/* 3. Both Sides Combined (Gentleman & Lady Symbol 🤵👰) */}
        <div
          onClick={() => onSelectSide('both')}
          className={`relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden ${
            selectedSide === 'both'
              ? 'border-emerald-600 bg-gradient-to-br from-emerald-500/15 via-teal-100/60 to-emerald-500/20 shadow-xl ring-4 ring-emerald-400/30 scale-102'
              : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-md hover:bg-stone-50/80'
          }`}
        >
          {selectedSide === 'both' && (
            <div className="absolute top-4 right-4 text-emerald-600">
              <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white drop-shadow-xs" />
            </div>
          )}

          <div>
            <div className="inline-block bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2.5 shadow-2xs">
              {isMl ? 'ഏറ്റവും ജനപ്രിയം' : 'Most Popular • Combo Deal'}
            </div>

            {/* Combined Groom & Bride Symbols (Requirement 4) */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center text-xl shadow-md tracking-tighter">
                🤵👰
              </div>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-200">
                Both Sides
              </span>
            </div>

            <h3 className="text-xl font-black text-stone-900">
              {isMl ? 'രണ്ടുപേരുടെയും വർക്ക് ഒരുമിച്ച്' : 'Both Sides Combined'}
            </h3>
            <p className="text-xs font-bold text-emerald-700 mt-0.5">Complete Wedding Package</p>
            <p className="text-xs text-stone-600 mt-2.5 leading-relaxed">
              {isMl
                ? 'വരന്റെയും വധുവിന്റെയും ചടങ്ങുകൾ പൂർണ്ണമായി കവർ ചെയ്യുന്നു. പ്രത്യേകം പ്രത്യേകം ക്രൂവും കോംബോ ഓഫർ സേവിംഗ്സും.'
                : 'Complete unified coverage with dedicated dual crews for groom & bride with special combo package savings.'}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-emerald-200/50 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-700">{isMl ? 'സേവിംഗ്സ്:' : 'Benefit:'}</span>
            <span className="text-emerald-700 font-black">{isMl ? 'കോംബോ ഓഫർ' : 'Combo Special'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
