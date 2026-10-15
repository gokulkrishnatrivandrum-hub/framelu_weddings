'use client';

import React, { useState } from 'react';
import { CalculationResult, BreakdownItem } from '@/utils/calculator';
import {
  FileText,
  ChevronUp,
  ChevronDown,
  Trash2,
  Sparkles,
  PhoneCall,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface LiveStickyPricingProps {
  calculation: CalculationResult;
  onRemoveItem: (item: BreakdownItem) => void;
  onOpenLeadModal: () => void;
  language?: 'en' | 'ml';
  whatsappNumber?: string;
}

export const LiveStickyPricing: React.FC<LiveStickyPricingProps> = ({
  calculation,
  onRemoveItem,
  onOpenLeadModal,
  language = 'ml',
  whatsappNumber = '919876543210',
}) => {
  const isMl = language === 'ml';
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* Desktop Sticky Sidebar (Visible on LG screens) */}
      <div className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-24 bg-white rounded-3xl border border-stone-200 shadow-xl p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block">
                Live Dynamic Estimation
              </span>
              <h3 className="text-lg font-extrabold text-stone-900 mt-1">
                {isMl ? 'പാക്കേജ് തുക (Summary)' : 'Package Estimate'}
              </h3>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Grand Total Display */}
          <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-amber-600 via-rosewood-700 to-amber-800 text-white shadow-md">
            <span className="text-xs uppercase tracking-wider opacity-85 block">
              {isMl ? 'ആകെ കണക്കാക്കിയ തുക' : 'Total Estimated Cost'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl xl:text-4xl font-black tracking-tight">
                ₹{calculation.totalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs opacity-75 font-medium">/ {isMl ? 'നെറ്റ് എസ്റ്റിമേറ്റ്' : 'Net Total'}</span>
            </div>
            <p className="text-[11px] opacity-80 mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{isMl ? 'തിരഞ്ഞെടുക്കുന്നതിനനുസരിച്ച് തത്സമയം മാറുന്നു' : 'Updates live with your custom choices'}</span>
            </p>
          </div>

          {/* Category Subtotals */}
          <div className="space-y-2 text-xs font-semibold text-stone-600 pb-4 border-b border-stone-100">
            {calculation.groomCrewTotal > 0 && (
              <div className="flex justify-between items-center">
                <span>{isMl ? 'വരന്റെ ക്രൂ ചാർജ് (Groom Crew):' : 'Groom Side Crew Total:'}</span>
                <span className="font-bold text-stone-900">
                  ₹{calculation.groomCrewTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {calculation.brideCrewTotal > 0 && (
              <div className="flex justify-between items-center">
                <span>{isMl ? 'വധുവിന്റെ ക്രൂ ചാർജ് (Bride Crew):' : 'Bride Side Crew Total:'}</span>
                <span className="font-bold text-stone-900">
                  ₹{calculation.brideCrewTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {calculation.deliverablesTotal > 0 && (
              <div className="flex justify-between items-center">
                <span>{isMl ? 'ആൽബം & ഔട്ട്പുട്ട് ഡെലിവറബിൾസ്:' : 'Albums & Video Deliverables:'}</span>
                <span className="font-bold text-stone-900">
                  ₹{calculation.deliverablesTotal.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Itemized Breakdown List */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <span>{isMl ? `തിരഞ്ഞെടുത്ത ഇനങ്ങൾ (${calculation.items.length})` : `Selected Items (${calculation.items.length})`}</span>
              <span className="text-[10px] text-stone-400">{isMl ? 'ഒഴിവാക്കാൻ ടാപ്പ് ചെയ്യുക' : 'Click icon to remove'}</span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {calculation.items.length === 0 ? (
                <p className="text-xs text-stone-400 italic text-center py-4">
                  {isMl ? 'ഇനങ്ങളൊന്നും തിരഞ്ഞെടുത്തിട്ടില്ല' : 'No items selected yet'}
                </p>
              ) : (
                calculation.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs group hover:bg-rose-50/50 hover:border-rose-200 transition"
                  >
                    <div className="flex-1 mr-2 min-w-0">
                      <p className="font-bold text-stone-800 truncate" title={isMl ? item.titleMl : item.title}>
                        {isMl ? item.titleMl : item.title}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        {item.qty} Qty x ₹{item.unitPrice.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-stone-900">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        className="text-stone-400 hover:text-rose-600 transition p-1"
                        title={isMl ? 'ഒഴിവാക്കുക' : 'Remove'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-5 space-y-2.5">
            <button
              type="button"
              onClick={onOpenLeadModal}
              disabled={calculation.totalPrice === 0}
              className="w-full bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>{isMl ? 'PDF കൊട്ടേഷൻ എടുക്കുക' : 'Get PDF Quotation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Hello%20Framelu%20Weddings,%20I%20have%20customized%20a%20wedding%20photography%20package.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isMl ? 'സ്റ്റുഡിയോയുമായി സംസാരിക്കുക' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar (Visible on Small / Medium Screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 shadow-2xl p-3">
        {/* Expanded Drawer on Mobile */}
        {isExpanded && (
          <div className="max-h-72 overflow-y-auto mb-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <div className="flex justify-between items-center font-bold text-stone-800 mb-2">
              <span>{isMl ? `തിരഞ്ഞെടുത്ത ഇനങ്ങൾ (${calculation.items.length})` : `Selected Items (${calculation.items.length})`}</span>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="text-stone-500 hover:text-stone-900"
              >
                {isMl ? 'അടക്കുക' : 'Close'}
              </button>
            </div>
            <div className="space-y-1.5">
              {calculation.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-stone-200 text-xs"
                >
                  <div className="flex-1 mr-2">
                    <p className="font-semibold text-stone-800 truncate">{isMl ? item.titleMl : item.title}</p>
                    <p className="text-[10px] text-stone-500">
                      {item.qty} Qty x ₹{item.unitPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item)}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer flex-1"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
              <span>{isMl ? 'എസ്റ്റിമേറ്റ് തുക' : 'Total Estimate'}</span>
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-xl font-extrabold text-stone-900 leading-tight">
              ₹{calculation.totalPrice.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLeadModal}
            disabled={calculation.totalPrice === 0}
            className="bg-gradient-to-r from-amber-600 to-rosewood-600 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>{isMl ? 'PDF കൊട്ടേഷൻ' : 'PDF Quote'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
