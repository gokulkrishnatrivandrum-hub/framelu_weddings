'use client';

import React from 'react';
import { PromoOffer, HighlightBoard, StudioContactConfig } from '@/types';
import {
  Gift,
  Sparkles,
  Tag,
  Calendar,
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Flame,
  Crown,
} from 'lucide-react';

interface OffersAndHighlightBoardsProps {
  offers: PromoOffer[];
  highlightBoards: HighlightBoard[];
  studioContact: StudioContactConfig;
  onSelectBoard: (board: HighlightBoard) => void;
  language?: 'en' | 'ml';
}

export const OffersAndHighlightBoards: React.FC<OffersAndHighlightBoardsProps> = ({
  offers,
  highlightBoards,
  studioContact,
  onSelectBoard,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const activeOffers = offers.filter((o) => o.active);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* 1. Promotional Offers & Posters Section */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            {isMl ? 'സീസൺ ഓഫറുകൾ • Limited Deals' : 'Seasonal Promotions'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {isMl ? 'പ്രത്യേക വെഡ്ഡിംഗ് ഓഫറുകളും പ്രൊമോ പോസ്റ്ററുകളും' : 'Special Offers & Promo Deals'}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            {isMl
              ? 'പരിമിതകാല സീസൺ ഡിസ്കൗണ്ടുകളും, സൗജന്യ ഡ്രോൺ ഷൂട്ടുകളും, ലക്ഷ്വറി ആൽബം അപ്‌ഗ്രേഡുകളും പ്രയോജനപ്പെടുത്തൂ'
              : 'Take advantage of limited seasonal deals, complimentary drone shoots and luxury album upgrades'}
          </p>
        </div>

        {activeOffers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-stone-200 text-stone-400">
            <Gift className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">
              {isMl ? 'പുതിയ ഓഫറുകൾ ഉടൻ ലഭ്യമാകും' : 'New offers coming soon'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-stone-100">
                    <img
                      src={offer.posterUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-rose-600 to-amber-600 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      {offer.badge}
                    </span>
                    <span className="absolute bottom-3 left-4 text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>Valid till: {offer.validTill}</span>
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition">
                      {isMl ? offer.titleMl || offer.title : offer.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {offer.description}
                    </p>
                    {offer.discountNote && (
                      <div className="mt-3 inline-block bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-1 text-[11px] font-bold text-amber-800">
                        🎁 {offer.discountNote}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <a
                    href={`https://wa.me/${studioContact.whatsapp}?text=${encodeURIComponent(
                      `Hello Framelu Weddings, I would like to enquire about the offer: ${offer.title} (Valid till ${offer.validTill}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition text-xs sm:text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{isMl ? 'ഈ ഓഫർ WhatsApp-ൽ ക്ലെയിം ചെയ്യുക' : 'Claim Offer on WhatsApp'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Featured Highlight Package Boards Section */}
      <div>
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            {isMl ? 'ഫീച്ചേർഡ് പാക്കേജ് ബോർഡുകൾ' : 'Featured Highlight Boards'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            {isMl ? 'ജനപ്രിയ വെഡ്ഡിംഗ് പാക്കേജ് ബോർഡുകൾ' : 'Popular Wedding Package Boards'}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-2">
            {isMl
              ? 'കേരളത്തിലെ വിവാഹങ്ങൾക്ക് ഏറ്റവും അനുയോജ്യമായ പ്രീ-ഡിസൈൻഡ് ഹൈലൈറ്റ് പാക്കേജുകൾ തിരഞ്ഞെടുക്കുക'
              : 'Choose from carefully designed complete highlight packages with instant customization'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlightBoards.map((board) => (
            <div
              key={board.id}
              className={`rounded-3xl border p-6 sm:p-7 shadow-sm transition-all duration-300 flex flex-col justify-between relative ${
                board.popular
                  ? 'bg-gradient-to-b from-amber-50/70 via-white to-white border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                  : 'bg-white border-stone-200 hover:shadow-md'
              }`}
            >
              {board.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                  Most Popular Choice
                </div>
              )}

              <div>
                <span className="inline-block bg-stone-100 text-stone-700 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
                  {board.tag}
                </span>

                <h3 className="text-xl font-black text-stone-900">
                  {isMl ? board.titleMl || board.title : board.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {board.description}
                </p>

                <div className="my-5 pb-5 border-b border-stone-100">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Complete Package
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black text-stone-900">
                      ₹{board.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">/ all inclusive</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700 mb-6">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-stone-400 mb-2">
                    Package Inclusions:
                  </p>
                  {board.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => onSelectBoard(board)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition text-xs sm:text-sm"
                >
                  <span>{isMl ? 'ഈ പാക്കേജ് കസ്റ്റമൈസ് ചെയ്യുക' : 'Customize This Package'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={`https://wa.me/${studioContact.whatsapp}?text=${encodeURIComponent(
                    `Hello Framelu Weddings, I am interested in the ${board.title} (₹${board.price.toLocaleString('en-IN')}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 px-3 rounded-xl border border-emerald-200 transition text-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{isMl ? 'WhatsApp എൻക്വയറി' : 'WhatsApp Enquiry'}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
