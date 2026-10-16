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
  Calendar,
  X,
  Users,
  Check,
} from 'lucide-react';
import { CouponCode, SelectedOtherService, OtherServicePackage } from '@/types';
import { DEFAULT_OTHER_SERVICES } from '@/constants/defaults';

interface LiveStickyPricingProps {
  calculation: CalculationResult;
  onRemoveItem: (item: BreakdownItem) => void;
  onOpenLeadModal: () => void;
  onReset?: () => void;
  onNavigateToOtherServices?: () => void;
  onNavigateToPhotography?: () => void;
  selectedOtherServices?: SelectedOtherService[];
  onUpdateOtherService?: (service: SelectedOtherService) => void;
  language?: 'en' | 'ml';
  whatsappNumber?: string;
  coupons?: CouponCode[];
  appliedCoupon?: CouponCode | null;
  onApplyCoupon?: (code: string) => { success: boolean; message: string };
  onRemoveCoupon?: () => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}

export const LiveStickyPricing: React.FC<LiveStickyPricingProps> = ({
  calculation,
  onRemoveItem,
  onOpenLeadModal,
  onReset,
  onNavigateToOtherServices,
  onNavigateToPhotography,
  selectedOtherServices = [],
  onUpdateOtherService,
  language = 'en',
  whatsappNumber = '916238747722',
  coupons = [],
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  isLoggedIn = false,
  onRequireLogin,
}) => {
  const isMl = language === 'ml';
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Add-on / Other Service Editing State
  const [editingAddon, setEditingAddon] = useState<SelectedOtherService | null>(null);
  const [addonEditDate, setAddonEditDate] = useState<string>('');
  const [addonEditPrice, setAddonEditPrice] = useState<number>(0);

  // Photoshoot specific state
  const [addonEditHours, setAddonEditHours] = useState<number>(3);
  const [addonEditPhotos, setAddonEditPhotos] = useState<number>(1);
  const [addonEditVideos, setAddonEditVideos] = useState<number>(0);
  const [addonEditReels, setAddonEditReels] = useState<number>(0);
  const [addonEditDrone, setAddonEditDrone] = useState<boolean>(false);

  // Catering (Guests), Invitations (Cards), and Custom Options state
  const [addonEditGuests, setAddonEditGuests] = useState<number | string>(300);
  const [addonEditCards, setAddonEditCards] = useState<number | string>(300);
  const [addonEditSelectedOptions, setAddonEditSelectedOptions] = useState<string[]>([]);

  // Find the package definition from catalog
  const editingPackage = editingAddon
    ? DEFAULT_OTHER_SERVICES.find((p) => p.id === editingAddon.packageId)
    : undefined;
  const isPhotoshoot =
    editingAddon?.category === 'photoshoot' ||
    editingAddon?.packageId.startsWith('photoshoot') ||
    !!editingAddon?.photoshootType;
  const isFood =
    editingAddon?.category === 'food_catering' || editingPackage?.category === 'food_catering';
  const isCards =
    editingAddon?.category === 'invitations' || editingPackage?.category === 'invitations';

  const calculateRecalculatedPrice = (
    pkg: OtherServicePackage | undefined,
    guests: number,
    cards: number,
    optIds: string[]
  ) => {
    if (!pkg) return Number(addonEditPrice) || 0;
    let base = 0;
    if (pkg.pricingType === 'per_guest') {
      const rate = pkg.pricePerUnit || pkg.price;
      base = rate * Math.max(1, guests);
    } else if (pkg.pricingType === 'per_card') {
      const rate = pkg.pricePerUnit || pkg.price;
      base = rate * Math.max(1, cards);
    } else {
      base = pkg.price;
    }

    if (pkg.customOptions) {
      for (const opt of pkg.customOptions) {
        if (optIds.includes(opt.id) && opt.price) {
          base += opt.price;
        }
      }
    }
    return base;
  };

  const handleGuestsChange = (newCount: number) => {
    const val = Math.max(1, newCount);
    setAddonEditGuests(val);
    if (editingPackage && editingPackage.pricingType === 'per_guest') {
      setAddonEditPrice(
        calculateRecalculatedPrice(editingPackage, val, Number(addonEditCards) || 0, addonEditSelectedOptions)
      );
    }
  };

  const handleCardsChange = (newCount: number) => {
    const val = Math.max(1, newCount);
    setAddonEditCards(val);
    if (editingPackage && editingPackage.pricingType === 'per_card') {
      setAddonEditPrice(
        calculateRecalculatedPrice(editingPackage, Number(addonEditGuests) || 0, val, addonEditSelectedOptions)
      );
    }
  };

  const handleToggleOption = (optId: string) => {
    const newOpts = addonEditSelectedOptions.includes(optId)
      ? addonEditSelectedOptions.filter((id) => id !== optId)
      : [...addonEditSelectedOptions, optId];
    setAddonEditSelectedOptions(newOpts);
    if (editingPackage) {
      setAddonEditPrice(
        calculateRecalculatedPrice(editingPackage, Number(addonEditGuests) || 0, Number(addonEditCards) || 0, newOpts)
      );
    }
  };

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

  const handleGetQuotationCtaClick = () => {
    if (!isLoggedIn && onRequireLogin) {
      onRequireLogin();
      return;
    }
    onOpenLeadModal();
  };

  const handleOpenEditAddon = (item: BreakdownItem) => {
    if (!isLoggedIn && onRequireLogin) {
      onRequireLogin();
      return;
    }
    const pkgId = item.id.replace('other_service_', '');
    const pkgDef = DEFAULT_OTHER_SERVICES.find((p) => p.id === pkgId);
    const found = selectedOtherServices.find((s) => s.packageId === pkgId) || {
      packageId: pkgId,
      category: pkgDef?.category || 'general',
      title: item.title,
      titleMl: item.titleMl,
      price: item.totalPrice,
      unitPrice: item.unitPrice,
    };

    setEditingAddon(found);
    setAddonEditDate(found.date || '');
    setAddonEditPrice(found.price || item.totalPrice);

    // Food guests
    const initialGuests = found.guestCount || pkgDef?.baseGuestCount || 300;
    setAddonEditGuests(initialGuests);

    // Cards
    const initialCards = found.cardCount || pkgDef?.baseCardCount || 300;
    setAddonEditCards(initialCards);

    // Photoshoot
    setAddonEditHours(found.sessionHours || 3);
    setAddonEditPhotos(found.photographers || 1);
    setAddonEditVideos(found.videographers || 0);
    setAddonEditReels(found.reelsCount || 0);
    setAddonEditDrone(!!found.drone);

    // Custom options
    const activeOpts: string[] = [];
    if (pkgDef?.customOptions && found.customSelections) {
      for (const opt of pkgDef.customOptions) {
        const isMatched = found.customSelections.some(
          (sel) =>
            sel === opt.id ||
            sel.toLowerCase() === opt.label.toLowerCase() ||
            (opt.labelMl && sel.includes(opt.labelMl)) ||
            sel.includes(opt.label)
        );
        if (isMatched) {
          activeOpts.push(opt.id);
        }
      }
    }
    setAddonEditSelectedOptions(activeOpts);
  };

  const handleSaveAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddon || !onUpdateOtherService) return;
    const pkgDef = DEFAULT_OTHER_SERVICES.find((p) => p.id === editingAddon.packageId);
    const category = editingAddon.category || pkgDef?.category || 'general';
    const isPhotoshootItem =
      category === 'photoshoot' ||
      editingAddon.packageId.startsWith('photoshoot') ||
      !!editingAddon.photoshootType;
    const isFoodItem = category === 'food_catering' || pkgDef?.category === 'food_catering';
    const isCardsItem = category === 'invitations' || pkgDef?.category === 'invitations';

    let customSelections: string[] = [];

    if (isPhotoshootItem) {
      customSelections = [
        `${addonEditHours} ${isMl ? 'മണിക്കൂർ ഷൂട്ട്' : 'Hours'}`,
        `${addonEditPhotos} ${isMl ? 'ഫോട്ടോഗ്രാഫർ' : 'Photo'}`,
        addonEditVideos > 0 ? `${addonEditVideos} ${isMl ? 'വീഡിയോഗ്രാഫർ' : 'Video'}` : '',
        addonEditReels > 0 ? `${addonEditReels} ${isMl ? 'റീൽസ്' : 'Reels'}` : '',
        addonEditDrone ? (isMl ? 'ഡ്രോൺ' : 'Drone') : '',
        addonEditDate ? `${isMl ? 'തീയതി' : 'Date'}: ${addonEditDate}` : '',
      ].filter(Boolean);
    } else {
      // Non-photoshoot (Catering, Decor, Makeup, Invitations, Cars, Honeymoon, etc.)
      const optLabels = (pkgDef?.customOptions || [])
        .filter((o) => addonEditSelectedOptions.includes(o.id))
        .map((o) => (isMl && o.labelMl ? o.labelMl : o.label));

      const guestsNum = isFoodItem ? Math.max(1, Number(addonEditGuests) || 1) : undefined;
      const cardsNum = isCardsItem ? Math.max(1, Number(addonEditCards) || 1) : undefined;

      customSelections = [
        isFoodItem && guestsNum ? `${guestsNum} ${isMl ? 'അതിഥികൾ (Guests)' : 'Guests'}` : '',
        isCardsItem && cardsNum ? `${cardsNum} ${isMl ? 'കാർഡുകൾ (Cards)' : 'Cards'}` : '',
        ...optLabels,
        addonEditDate ? `${isMl ? 'തീയതി' : 'Date'}: ${addonEditDate}` : '',
      ].filter(Boolean);
    }

    const finalGuests = isFoodItem ? Math.max(1, Number(addonEditGuests) || 1) : undefined;
    const finalCards = isCardsItem ? Math.max(1, Number(addonEditCards) || 1) : undefined;
    const finalPrice = Math.max(0, Number(addonEditPrice) || 0);

    const updated: SelectedOtherService = {
      ...editingAddon,
      category,
      date: addonEditDate,
      price: finalPrice,
      customSelections,
      guestCount: finalGuests,
      cardCount: finalCards,
      sessionHours: isPhotoshootItem ? addonEditHours : undefined,
      photographers: isPhotoshootItem ? addonEditPhotos : undefined,
      videographers: isPhotoshootItem ? addonEditVideos : undefined,
      reelsCount: isPhotoshootItem ? addonEditReels : undefined,
      drone: isPhotoshootItem ? addonEditDrone : undefined,
    };

    onUpdateOtherService(updated);
    setEditingAddon(null);
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
                  {isMl ? 'തത്സമയ തുക' : 'Live Estimate'}
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
                const matchedService = selectedOtherServices.find((s) => s.packageId === pkgId);
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-amber-800 font-semibold">
                            {item.qty > 1 ? `${item.qty} Units x ₹${item.unitPrice.toLocaleString('en-IN')}` : isMl ? 'പാക്കേജ് ആഡ്-ഓൺ' : 'Service Add-on'}
                          </span>
                          {matchedService?.date && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-950 rounded flex items-center gap-0.5">
                              <Calendar className="w-2.5 h-2.5 text-amber-700" />
                              <span>{matchedService.date}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-black text-stone-900 mr-1">
                        ₹{item.totalPrice.toLocaleString('en-IN')}
                      </span>
                      {onUpdateOtherService && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditAddon(item)}
                          className="text-amber-800 hover:text-amber-950 p-1 hover:bg-amber-100 rounded-lg transition"
                          title={isMl ? 'തീയതിയും വിവരങ്ങളും മാറ്റുക' : 'Edit shoot date & options'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
              onClick={handleGetQuotationCtaClick}
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
            {otherServiceItems.map((item) => {
              const pkgId = item.id.replace('other_service_', '');
              const matchedService = selectedOtherServices.find((s) => s.packageId === pkgId);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-stone-200 text-xs"
                >
                  <div className="flex-1 mr-2 min-w-0">
                    <p className="font-bold text-stone-800 truncate">{isMl ? item.titleMl : item.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-stone-500">
                        {item.qty} Qty x ₹{item.unitPrice.toLocaleString('en-IN')}
                      </span>
                      {matchedService?.date && (
                        <span className="text-[9px] font-bold px-1 bg-amber-100 text-amber-900 rounded">
                          📅 {matchedService.date}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-stone-900">
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </span>
                    {onUpdateOtherService && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddon(item)}
                        className="text-amber-800 p-1 hover:bg-amber-100 rounded-lg"
                        title="Edit date and details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item)}
                      className="text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
            onClick={handleGetQuotationCtaClick}
            disabled={calculation.totalPrice === 0}
            className="bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 disabled:opacity-50 text-white font-black py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 text-xs"
          >
            <FileText className="w-4 h-4" />
            <span>{isMl ? 'PDF കൊട്ടേഷൻ' : 'Get PDF Quote'}</span>
          </button>
        </div>
      </div>

      {/* Edit Service / Package Modal (Category-Aware: Photography only for photoshoots, Food/Decor/Makeup custom options for other services) */}
      {editingAddon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-stone-200 animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setEditingAddon(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                {isPhotoshoot ? (
                  <Camera className="w-5 h-5" />
                ) : isFood ? (
                  <UtensilsCrossed className="w-5 h-5" />
                ) : isCards ? (
                  <Mail className="w-5 h-5" />
                ) : editingAddon.category === 'luxury_cars' ? (
                  <Car className="w-5 h-5" />
                ) : editingAddon.category === 'event_planning' ? (
                  <Palette className="w-5 h-5" />
                ) : editingAddon.category === 'honeymoon' ? (
                  <Plane className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900 leading-snug">
                  {isMl ? editingAddon.titleMl || editingAddon.title : editingAddon.title}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {isPhotoshoot
                    ? isMl
                      ? 'ഷൂട്ട് തീയതിയും ക്രമീകരണങ്ങളും തിരുത്തുക'
                      : 'Edit shoot date and package configuration'
                    : isMl
                    ? 'തീയതിയും സർവീസ് വിവരങ്ങളും തിരുത്തുക'
                    : 'Edit service date and package options'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAddon} noValidate className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {isPhotoshoot
                    ? isMl
                      ? 'ഷൂട്ട് തീയതി (Shoot Date)'
                      : 'Shoot Date'
                    : isMl
                    ? 'സർവീസ് / ഇവന്റ് തീയതി (Service Date)'
                    : 'Service Date'}
                </label>
                <input
                  type="date"
                  value={addonEditDate}
                  onChange={(e) => setAddonEditDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-800 mt-1">
                  {isMl
                    ? 'ഈ തീയതി ഡാഷ്‌ബോർഡിലെ ഇവന്റ് കലണ്ടറിൽ കാണിക്കും'
                    : 'This date will reflect on the Dashboard Event Calendar'}
                </p>
              </div>

              {/* 1. PHOTOSHOOT CREW CONTROLS (Only rendered when category is photoshoot) */}
              {isPhotoshoot && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">
                      {isMl ? 'മണിക്കൂറുകൾ (Hours)' : 'Session Hours'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAddonEditHours(Math.max(1, addonEditHours - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{addonEditHours}</span>
                      <button
                        type="button"
                        onClick={() => setAddonEditHours(addonEditHours + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">
                      {isMl ? 'ഫോട്ടോഗ്രാഫർമാർ' : 'Photographers'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAddonEditPhotos(Math.max(1, addonEditPhotos - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{addonEditPhotos}</span>
                      <button
                        type="button"
                        onClick={() => setAddonEditPhotos(addonEditPhotos + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">
                      {isMl ? 'വീഡിയോഗ്രാഫർമാർ' : 'Videographers'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAddonEditVideos(Math.max(0, addonEditVideos - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{addonEditVideos}</span>
                      <button
                        type="button"
                        onClick={() => setAddonEditVideos(addonEditVideos + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">
                      {isMl ? 'ഇൻസ്റ്റാഗ്രാം റീൽസ്' : 'Reels Count'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAddonEditReels(Math.max(0, addonEditReels - 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold w-4 text-center">{addonEditReels}</span>
                      <button
                        type="button"
                        onClick={() => setAddonEditReels(addonEditReels + 1)}
                        className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center justify-between text-xs cursor-pointer pt-1 border-t border-stone-200">
                    <span className="font-bold text-stone-700">
                      {isMl ? '4K ഡ്രോൺ ഷൂട്ട്' : '4K Drone Aerial'}
                    </span>
                    <input
                      type="checkbox"
                      checked={addonEditDrone}
                      onChange={(e) => setAddonEditDrone(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                  </label>
                </div>
              )}

              {/* 2. CATERING: GUESTS COUNT (For food & feast packages) */}
              {isFood && (
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-700" />
                      <span>
                        {isMl
                          ? 'ഭക്ഷണം നൽകേണ്ട അതിഥികളുടെ എണ്ണം (Guests):'
                          : 'Guests / Plates to Serve:'}
                      </span>
                    </span>
                    <span className="text-amber-800 text-[11px] font-bold">
                      ₹
                      {editingPackage?.pricePerUnit ||
                        editingPackage?.price ||
                        editingAddon.unitPrice ||
                        350}{' '}
                      / {isMl ? 'പ്ലേറ്റ്' : 'plate'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-amber-200">
                    <button
                      type="button"
                      onClick={() => handleGuestsChange((Number(addonEditGuests) || 0) - 50)}
                      className="w-9 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition text-xs"
                    >
                      -50
                    </button>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={addonEditGuests}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setAddonEditGuests(raw);
                        const num = parseInt(raw, 10);
                        if (!isNaN(num) && num > 0) {
                          if (editingPackage && editingPackage.pricingType === 'per_guest') {
                            setAddonEditPrice(
                              calculateRecalculatedPrice(
                                editingPackage,
                                num,
                                Number(addonEditCards) || 0,
                                addonEditSelectedOptions
                              )
                            );
                          }
                        }
                      }}
                      className="w-24 text-center font-black text-sm text-stone-900 border-none outline-hidden bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleGuestsChange((Number(addonEditGuests) || 0) + 50)}
                      className="w-9 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center transition text-xs"
                    >
                      +50
                    </button>
                  </div>
                </div>
              )}

              {/* 3. INVITATIONS: CARDS COUNT */}
              {isCards && (
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-700" />
                      <span>
                        {isMl ? 'പ്രിന്റ് ചെയ്യേണ്ട ആകെ കാർഡുകൾ:' : 'Total Cards to Print:'}
                      </span>
                    </span>
                    <span className="text-amber-800 text-[11px] font-bold">
                      ₹{editingPackage?.pricePerUnit || editingPackage?.price || 95} /{' '}
                      {isMl ? 'കാർഡ്' : 'card'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1.5 border border-amber-200">
                    <button
                      type="button"
                      onClick={() => handleCardsChange((Number(addonEditCards) || 0) - 50)}
                      className="w-9 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition text-xs"
                    >
                      -50
                    </button>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={addonEditCards}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setAddonEditCards(raw);
                        const num = parseInt(raw, 10);
                        if (!isNaN(num) && num > 0) {
                          if (editingPackage && editingPackage.pricingType === 'per_card') {
                            setAddonEditPrice(
                              calculateRecalculatedPrice(
                                editingPackage,
                                Number(addonEditGuests) || 0,
                                num,
                                addonEditSelectedOptions
                              )
                            );
                          }
                        }
                      }}
                      className="w-24 text-center font-black text-sm text-stone-900 border-none outline-hidden bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleCardsChange((Number(addonEditCards) || 0) + 50)}
                      className="w-9 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center transition text-xs"
                    >
                      +50
                    </button>
                  </div>
                </div>
              )}

              {/* 4. CUSTOM ADD-ONS / OPTIONS (For any service that has custom options) */}
              {!isPhotoshoot &&
                editingPackage?.customOptions &&
                editingPackage.customOptions.length > 0 && (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                    <span className="text-xs font-bold text-stone-700 block">
                      {isMl
                        ? 'കസ്റ്റം ചോയ്‌സുകൾ / അധിക ഓപ്ഷനുകൾ:'
                        : 'Custom Add-ons & Choices:'}
                    </span>
                    <div className="space-y-1.5">
                      {editingPackage.customOptions.map((opt) => {
                        const isChecked = addonEditSelectedOptions.includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              isChecked
                                ? 'bg-amber-50 border-amber-400 font-bold text-amber-950 shadow-2xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleOption(opt.id)}
                                className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                              />
                              <span>{isMl && opt.labelMl ? opt.labelMl : opt.label}</span>
                            </div>
                            {opt.price ? (
                              <span className="text-xs font-black text-stone-900 ml-2 shrink-0">
                                +₹{opt.price.toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* 5. PACKAGE INCLUSIONS (Shows features for non-photoshoots) */}
              {!isPhotoshoot &&
                editingPackage?.features &&
                editingPackage.features.length > 0 && (
                  <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5">
                    <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider block">
                      {isMl
                        ? 'പാക്കേജിൽ ഉൾപ്പെടുന്നവ (Inclusions):'
                        : 'Included in Service Package:'}
                    </span>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {editingPackage.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Price Field */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  {isMl ? 'ആകെ തുക (Rate / Total Price ₹)' : 'Rate / Total Price (₹)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={addonEditPrice}
                  onChange={(e) =>
                    setAddonEditPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingAddon(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900"
                >
                  {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{isMl ? 'സേവ് ചെയ്യുക' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
