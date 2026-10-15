'use client';

import React from 'react';
import { SideSelection } from '@/types';
import { UserCheck, Users, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface SideSelectorProps {
  selectedSide: SideSelection;
  onSelectSide: (side: SideSelection) => void;
  language?: 'en' | 'ml';
}

export const SideSelector: React.FC<SideSelectorProps> = ({
  selectedSide,
  onSelectSide,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm mb-8">
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-2">
          {isMl ? 'ഘട്ടം 1 • Step 1' : 'Step 1'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {isMl ? 'ആരുടെ ഫോട്ടോഗ്രാഫി വർക്ക് ആണ് ആവശ്യം?' : 'Whose Photography Coverage is Required?'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-1">
          {isMl
            ? 'വരന്റെ ഭാഗം മാത്രമാണോ, വധുവിന്റെ ഭാഗം മാത്രമാണോ, അതോ രണ്ടുപേരുടെയും കവറേജ് ഒരുമിച്ചാണോ എന്ന് തിരഞ്ഞെടുക്കുക'
            : 'Select whether you require Groom side only, Bride side only, or both sides combined'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {/* Groom Side Only */}
        <div
          onClick={() => onSelectSide('groom')}
          className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 text-left flex flex-col justify-between ${
            selectedSide === 'groom'
              ? 'border-amber-600 bg-amber-50/50 shadow-md ring-2 ring-amber-600/20'
              : 'border-stone-200 bg-stone-50/50 hover:border-amber-300 hover:bg-stone-50'
          }`}
        >
          {selectedSide === 'groom' && (
            <div className="absolute top-3 right-3 text-amber-600">
              <CheckCircle2 className="w-5 h-5 fill-amber-600 text-white" />
            </div>
          )}

          <div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center mb-3 shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isMl ? 'വരന്റെ ഭാഗം മാത്രം' : 'Groom Side Only'}
            </h3>
            <p className="text-xs font-semibold text-amber-700">Groom Family & Events</p>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {isMl
                ? 'വരന്റെ വീട്ടിലെ ചടങ്ങുകൾ, വരന്റെ റിസപ്ഷൻ, വിവാഹ ദിവസത്തെ വരന്റെ കവറേജ്, വരന്റെ ആൽബം.'
                : 'Coverage of groom home ceremonies, pre-wedding rituals, reception & exclusive groom album.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">{isMl ? 'ഇവന്റുകൾ:' : 'Events:'}</span>
            <span className="text-amber-800 font-bold">{isMl ? 'കസ്റ്റം ചോയ്‌സ്' : 'Custom Select'}</span>
          </div>
        </div>

        {/* Bride Side Only */}
        <div
          onClick={() => onSelectSide('bride')}
          className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 text-left flex flex-col justify-between ${
            selectedSide === 'bride'
              ? 'border-rosewood-600 bg-rosewood-50/50 shadow-md ring-2 ring-rosewood-600/20'
              : 'border-stone-200 bg-stone-50/50 hover:border-rosewood-300 hover:bg-stone-50'
          }`}
        >
          {selectedSide === 'bride' && (
            <div className="absolute top-3 right-3 text-rosewood-600">
              <CheckCircle2 className="w-5 h-5 fill-rosewood-600 text-white" />
            </div>
          )}

          <div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rosewood-500 to-rosewood-700 text-white flex items-center justify-center mb-3 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isMl ? 'വധുവിന്റെ ഭാഗം മാത്രം' : 'Bride Side Only'}
            </h3>
            <p className="text-xs font-semibold text-rosewood-600">Bride Family & Events</p>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {isMl
                ? 'വധുവിന്റെ വീട്ടിലെ ചടങ്ങുകൾ (മൈലാഞ്ചി, ഹൽദി), വിവാഹ ദിവസത്തെ വധുവിന്റെ മേക്കപ്പ് & കവറേജ്, വധുവിന്റെ ആൽബം.'
                : 'Coverage of Mehendi, Haldi, bridal makeover session, wedding rituals & bridal keepsake album.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">{isMl ? 'ഇവന്റുകൾ:' : 'Events:'}</span>
            <span className="text-rosewood-800 font-bold">{isMl ? 'കസ്റ്റം ചോയ്‌സ്' : 'Custom Select'}</span>
          </div>
        </div>

        {/* Both Sides Combined */}
        <div
          onClick={() => onSelectSide('both')}
          className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-200 text-left flex flex-col justify-between ${
            selectedSide === 'both'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-600/20'
              : 'border-stone-200 bg-stone-50/50 hover:border-emerald-300 hover:bg-stone-50'
          }`}
        >
          {selectedSide === 'both' && (
            <div className="absolute top-3 right-3 text-emerald-600">
              <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
            </div>
          )}

          <div>
            <div className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2">
              {isMl ? 'ഏറ്റവും പോപ്പുലർ • Combo Deal' : 'Most Popular • Combo Deal'}
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center mb-3 shadow-sm">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              {isMl ? 'രണ്ടുപേരുടെയും വർക്ക് ഒരുമിച്ച്' : 'Both Sides Combined'}
            </h3>
            <p className="text-xs font-semibold text-emerald-700">Complete Wedding Package</p>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {isMl
                ? 'വരന്റെയും വധുവിന്റെയും ചടങ്ങുകൾ പൂർണ്ണമായി കവർ ചെയ്യുന്നു. പ്രത്യേകം പ്രത്യേകമായ ക്രൂവും കോംബോ ഡിസ്കൗണ്ടും.'
                : 'Complete unified coverage with dedicated dual crews for groom & bride with special combo package savings.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">{isMl ? 'സേവിംഗ്സ്:' : 'Benefit:'}</span>
            <span className="text-emerald-700 font-bold">{isMl ? 'കോംബോ പാക്കേജ്' : 'Combo Special'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
