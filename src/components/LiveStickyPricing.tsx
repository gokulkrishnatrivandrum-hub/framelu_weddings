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
  RotateCcw,
  PlusCircle,
  Camera,
  UtensilsCrossed,
  Palette,
  Sparkle,
  Mail,
  Plane,
  Car,
  CheckCircle2,
  Layers,
  Edit3,
  Tag,
  Gift,
} from 'lucide-react';
import { CouponCode } from '@/types';

interface LiveStickyPricingProps {
  calculation: CalculationResult;
  onRemoveItem: (item: BreakdownItem) => void;
  onOpenLeadModal: () => void;
  onReset?: () => void;
  onNavigateToOtherServices?: () => void;
  onNavigateToPhotography?: () => void;
  language?: 'en' | 'ml';
  whatsappNumber?: string;
  coupons?: CouponCode[];
  appliedCoupon?: CouponCode | null;
  onApplyCoupon?: (code: string) => { success: boolean; message: string };
  onRemoveCoupon?: () => void;
}

export const LiveStickyPricing: React.FC<LiveStickyPricingProps> = ({
  calculation,
  onRemoveItem,
  onOpenLeadModal,
  onReset,
  onNavigateToOtherServices,
  onNavigateToPhotography,
  language = 'ml',
  whatsappNumber = '916238747722',
  coupons = [],
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const isMl = language === 'ml';
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Discount computation
  const baseSubtotal = calculation.totalPrice || 0;
  const couponDiscountPercentage = appliedCoupon?.discountPercentage || 0;
  const couponDiscountAmount = couponDiscountPercentage > 0
    ? Math.round((baseSubtotal * couponDiscountPercentage) / 100)
    : 0;
  const finalPriceAfterDiscount = Math.max(0, baseSubtotal - couponDiscountAmount);

  const handleApplyCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (onApplyCoupon) {
      const res = onApplyCoupon(couponInput.trim().toUpperCase());
      setCouponMsg({ text: res.message, isError: !res.success });
      if (res.success) setCouponInput('');
    }
  };

  // Group items into: Photography & Deliverables VS Other Services
  const photoItems = calculation.items.filter(
    (it) => it.category !== 'other_service' && it.category !== 'discount'
  );
  const otherServiceItems = calculation.items.filter((it) => it.category === 'other_service');
  const discountItems = calculation.items.filter((it) => it.category === 'discount');

  const scrollToOtherServices = () => {
    if (onNavigateToOtherServices) {
      onNavigateToOtherServices();
    } else {
      const el = document.getElementById('other-services-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPhotography = () => {
    if (onNavigateToPhotography) {
      onNavigateToPhotography();
    } else {
      const el = document.getElementById('wedding-customizer-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* DESKTOP STICKY SIDEBAR (Taller, spacious, luxury aesthetic - Requirement 3 & 4) */}
      <div className="hidden lg:block w-84 xl:w-96 shrink-0">
        <div className="sticky top-24 bg-gradient-to-b from-white via-white to-amber-50/20 rounded-3xl border-2 border-amber-200/90 shadow-2xl p-6 flex flex-col justify-between min-h-[640px]">
          <div>
            {/* Header: Title + Reset Button right inside the card (Requirement 4) */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200/80">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full inline-block">
                  Live Estimate • തത്സമയ തുക
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {isMl ? 'പാക്കേജ് എസ്റ്റിമേറ്റ്' : 'Package Estimate'}
                </h3>
              </div>

              {/* Reset Button (Requirement 4) */}
              {calculation.totalPrice > 0 && onReset && (
                <button
                  type="button"
                  onClick={onReset}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-black transition shadow-2xs active:scale-95"
                  title={isMl ? 'എസ്റ്റിമേറ്റ് ₹0 ആക്കുക' : 'Reset quote to ₹0'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isMl ? 'റീസെറ്റ്' : 'Reset'}</span>
                </button>
              )}
            </div>

            {/* Grand Total Luxury Display Banner */}
            <div className="my-5 p-5 rounded-3xl bg-gradient-to-br from-amber-600 via-rosewood-700 to-amber-800 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <span className="text-xs uppercase font-extrabold tracking-wider opacity-85 block">
                {isMl ? 'ആകെ കണക്കാക്കിയ തുക (Grand Total)' : 'Total Estimated Cost'}
              </span>

              {appliedCoupon ? (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base line-through opacity-70">
                      ₹{baseSubtotal.toLocaleString('en-IN')}
                    </span>
                    <span className="bg-emerald-400 text-stone-900 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {appliedCoupon.code} ({couponDiscountPercentage}% OFF)
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl xl:text-4xl font-black tracking-tight drop-shadow-xs text-white">
                      ₹{finalPriceAfterDiscount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs opacity-80 font-medium">/ {isMl ? 'ഡിസ്കൗണ്ടിന് ശേഷം' : 'After Discount'}</span>
                  </div>
                  <p className="text-[11px] text-amber-200 font-bold">
                    {isMl
                      ? `✨ ₹${couponDiscountAmount.toLocaleString('en-IN')} ഡിസ്കൗണ്ട് കുറച്ചു`
                      : `✨ Saved ₹${couponDiscountAmount.toLocaleString('en-IN')} with coupon!`}
                  </p>
                </div>
              ) : (
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-3xl xl:text-4xl font-black tracking-tight drop-shadow-xs">
                    ₹{baseSubtotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs opacity-80 font-medium">/ {isMl ? 'നെറ്റ് തുക' : 'All Inclusive'}</span>
                </div>
              )}

              <p className="text-[11px] opacity-85 mt-2 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>{isMl ? 'തിരഞ്ഞെടുപ്പുകൾക്കനുസരിച്ച് തത്സമയം മാറുന്നു' : 'Updates live with your custom choices'}</span>
              </p>
            </div>

            {/* Coupon Code Section (Requirement 3) */}
            <div className="mb-4 p-3.5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs">
              {appliedCoupon ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-stone-900">{appliedCoupon.code}</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          {appliedCoupon.discountPercentage}% OFF
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-700 font-semibold truncate">
                        {isMl ? `ലാഭം: ₹${couponDiscountAmount.toLocaleString('en-IN')}` : `Discount: -₹${couponDiscountAmount.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>
                  {onRemoveCoupon && (
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2 py-1 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      {isMl ? 'ഒഴിവാക്കുക' : 'Remove'}
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-stone-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isMl ? 'കൂപ്പൺ കോഡ് ഉണ്ടോ?' : 'Have a Coupon Code?'}</span>
                    </label>
                    {coupons && coupons.length > 0 && (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                        {coupons.filter((c) => c.active && c.isPublic).length} {isMl ? 'ലഭ്യം' : 'available'}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponMsg(null);
                      }}
                      placeholder={isMl ? 'കൂപ്പൺ കോഡ് നൽകുക' : 'Enter Coupon Code'}
                      className="flex-1 px-3 py-1.5 text-xs font-mono uppercase font-bold rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={!couponInput.trim() || baseSubtotal === 0}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs transition shadow-2xs cursor-pointer"
                    >
                      {isMl ? 'അപ്ലൈ' : 'Apply'}
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-[10px] font-bold mt-1 ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {couponMsg.text}
                    </p>
                  )}
                  {(() => {
                    const publicCoupons = coupons ? coupons.filter((c) => c.active && c.isPublic) : [];
                    if (publicCoupons.length === 0) return null;
                    return (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-stone-600 shrink-0">Try:</span>
                        {publicCoupons.map((cp) => (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => {
                              setCouponInput(cp.code);
                              if (onApplyCoupon) {
                                const res = onApplyCoupon(cp.code);
                                setCouponMsg({ text: res.message, isError: !res.success });
                              }
                            }}
                            className="text-xs font-bold bg-[#fff9ea] hover:bg-[#fff2cf] text-[#6d3810] border border-[#f5cb6c] px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 group"
                            title={isMl ? (cp.descriptionMl || cp.description) : cp.description}
                          >
                            <span className="font-mono font-bold tracking-wide">{cp.code}</span>
                            <span className="text-emerald-800 font-extrabold text-[11px]">({cp.discountPercentage}% OFF)</span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </form>
              )}
            </div>

            {/* "More Add-on Services" Button inside Estimated Package Card (Requirement 4) */}
            <div className="mb-5">
              <button
                type="button"
                onClick={scrollToOtherServices}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs transition duration-200 shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
                  <span>{isMl ? 'കൂടുതൽ സർവീസുകൾ ചേർക്കുക (Add-ons)' : 'More Add-on Services'}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-700 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* STRUCTURED SELECTED ITEMS BREAKDOWN (Requirement 4) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-black text-stone-800">
                <span>{isMl ? 'തിരഞ്ഞെടുത്ത ഇനങ്ങൾ (Selected Items)' : 'Selected Package Sections'}</span>
                <span className="text-[10px] text-stone-400 font-semibold">
                  {calculation.items.length} {isMl ? 'ഇനങ്ങൾ' : 'Items'}
                </span>
              </div>

              {/* CARD 1: MAIN WEDDING PHOTOGRAPHY & VIDEOGRAPHY CARD */}
              <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-white overflow-hidden shadow-sm transition hover:shadow-md">
                <div
                  onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}
                  className="p-3.5 flex items-center justify-between cursor-pointer border-b border-amber-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-stone-900 truncate">
                        {isMl ? 'വെഡ്ഡിംഗ് ഫുൾ ഫോട്ടോഗ്രാഫി' : 'Wedding Photography & Video'}
                      </h4>
                      <p className="text-[10px] text-amber-800 font-bold">
                        {calculation.activePackageTitle
                          ? `${calculation.activePackageTitle}`
                          : isMl
                          ? 'കസ്റ്റം ഫോട്ടോഗ്രാഫി വർക്ക്'
                          : 'Custom Photography Suite'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-stone-900">
                      ₹{calculation.photographyTotal.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        scrollToPhotography();
                      }}
                      className="text-amber-800 hover:text-amber-950 p-1 hover:bg-amber-100 rounded-lg transition"
                      title={isMl ? 'ഫോട്ടോഗ്രാഫി തിരുത്തുക' : 'Edit Photography'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {isPhotoExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details inside Main Photography Card */}
                {isPhotoExpanded && (
                  <div className="p-3 bg-stone-50/70 text-xs space-y-1.5 divide-y divide-stone-100 max-h-48 overflow-y-auto">
                    {photoItems.length === 0 ? (
                      <p className="text-[11px] text-stone-400 italic text-center py-2">
                        {isMl ? 'ചടങ്ങുകളൊന്നും ചേർത്തിട്ടില്ല' : 'No ceremonies added yet'}
                      </p>
                    ) : (
                      photoItems.map((item) => (
                        <div key={item.id} className="pt-1.5 flex items-start justify-between text-[11px]">
                          <div className="flex-1 mr-2 min-w-0">
                            <p className="font-semibold text-stone-800 truncate" title={isMl ? item.titleMl : item.title}>
                              {isMl ? item.titleMl : item.title}
                            </p>
                            <p className="text-[9px] text-stone-500">
                              {item.qty} Qty x ₹{item.unitPrice.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="font-bold text-stone-900">
                              ₹{item.totalPrice.toLocaleString('en-IN')}
                            </span>
                            {item.deletable && (
                              <button
                                type="button"
                                onClick={() => onRemoveItem(item)}
                                className="text-stone-400 hover:text-rose-600 p-0.5"
                                title="Remove"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Show Package Discount Savings if applicable */}
                    {discountItems.map((d) => (
                      <div key={d.id} className="pt-1.5 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                        <span>{isMl ? d.titleMl : d.title}</span>
                        <span>-₹{Math.abs(d.totalPrice).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 2...N: OTHER SELECTED SERVICES BREAKDOWN */}
              {otherServiceItems.map((item) => {
                const pkgId = item.id.replace('other_service_', '');
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl border border-stone-200 bg-white hover:border-amber-400 flex items-center justify-between transition shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 mr-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-xs text-stone-900 truncate" title={isMl ? item.titleMl : item.title}>
                          {isMl ? item.titleMl : item.title}
                        </p>
                        <p className="text-[10px] text-amber-800 font-semibold">
                          {item.qty > 1 ? `${item.qty} Units x ₹${item.unitPrice.toLocaleString('en-IN')}` : isMl ? 'പാക്കേജ് ആഡ്-ഓൺ' : 'Service Add-on'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-stone-900">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item)}
                        className="text-stone-400 hover:text-rose-600 transition p-1 hover:bg-rose-50 rounded-lg"
                        title={isMl ? 'ഒഴിവാക്കുക' : 'Remove service'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs at Bottom */}
          <div className="mt-6 pt-4 border-t border-stone-200/80 space-y-2.5">
            <button
              type="button"
              onClick={onOpenLeadModal}
              disabled={calculation.totalPrice === 0}
              className="w-full bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isMl ? 'PDF കൊട്ടേഷൻ എടുക്കുക' : 'Get PDF Quotation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                `Hello Framelu Weddings, I have customized a wedding package of ₹${calculation.totalPrice.toLocaleString('en-IN')}. Please share details.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black py-2.5 px-3 rounded-2xl transition flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{isMl ? 'സ്റ്റുഡിയോയുമായി സംസാരിക്കുക' : 'Chat on WhatsApp'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM DRAWER (Requirement 3 & 4) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-stone-200 shadow-2xl p-3">
        {/* Expanded Drawer on Mobile */}
        {isMobileExpanded && (
          <div className="max-h-80 overflow-y-auto mb-3 p-4 bg-stone-50 rounded-3xl border border-stone-200 text-xs space-y-3">
            <div className="flex justify-between items-center font-black text-stone-900 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span>{isMl ? 'തിരഞ്ഞെടുത്ത ഇനങ്ങൾ' : 'Selected Items'} ({calculation.items.length})</span>
                {onReset && calculation.totalPrice > 0 && (
                  <button
                    type="button"
                    onClick={onReset}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isMl ? 'റീസെറ്റ്' : 'Reset'}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileExpanded(false)}
                className="text-stone-500 hover:text-stone-900 font-bold"
              >
                {isMl ? 'അടക്കുക' : 'Close'}
              </button>
            </div>

            {/* Quick Add More Services link in mobile */}
            <button
              type="button"
              onClick={() => {
                setIsMobileExpanded(false);
                scrollToOtherServices();
              }}
              className="w-full py-2 px-3 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-950 font-bold text-xs flex items-center justify-between"
            >
              <span>+ {isMl ? 'മറ്റ് സർവീസുകൾ ചേർക്കുക' : 'Add More Services'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Main Photography Section */}
            <div className="p-3 bg-white rounded-2xl border border-amber-300">
              <div className="flex justify-between items-center font-black text-stone-900 mb-1">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി' : 'Wedding Photography'}</span>
                </span>
                <span>₹{calculation.photographyTotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-amber-800 font-semibold">
                {calculation.activePackageTitle || (isMl ? 'കസ്റ്റം പ്ലാൻ' : 'Custom Plan')}
              </p>
            </div>

            {/* Other Services */}
            {otherServiceItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-stone-200 text-xs"
              >
                <div className="flex-1 mr-2 min-w-0">
                  <p className="font-bold text-stone-800 truncate">{isMl ? item.titleMl : item.title}</p>
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
                    className="text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Bottom Bar Row */}
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="cursor-pointer flex-1"
          >
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
              <span>{isMl ? 'എസ്റ്റിമേറ്റ് തുക' : 'Total Estimate'}</span>
              {isMobileExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-xl font-black text-stone-900 leading-tight flex items-baseline gap-1.5">
              <span>₹{finalPriceAfterDiscount.toLocaleString('en-IN')}</span>
              {appliedCoupon && (
                <span className="text-[10px] line-through text-stone-400 font-normal">
                  ₹{baseSubtotal.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenLeadModal}
            disabled={calculation.totalPrice === 0}
            className="bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 disabled:opacity-50 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>{isMl ? 'PDF കൊട്ടേഷൻ' : 'Get PDF Quote'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
