'use client';

import React, { useState } from 'react';
import { OtherServicePackage, StudioContactConfig, SelectedOtherService, ServiceCategory } from '@/types';
import { DEFAULT_OTHER_SERVICES, DEFAULT_SERVICE_CATEGORIES } from '@/constants/defaults';
import {
  Sparkles,
  Check,
  MessageCircle,
  Plus,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  Sliders,
  ArrowRight,
  ArrowLeft,
  Users,
  Mail,
  ChevronRight,
  Gift,
  FileText,
  Clock,
} from 'lucide-react';

interface OtherServicesSectionProps {
  language?: 'en' | 'ml';
  studioContact?: StudioContactConfig;
  packages?: OtherServicePackage[];
  categories?: ServiceCategory[];
  selectedServices?: SelectedOtherService[];
  onAddService?: (service: SelectedOtherService) => void;
  onRemoveService?: (packageId: string) => void;
  onProceedToQuotation?: () => void;
  onBackToDeliverables?: () => void;
  onNavigateToCustomizer?: (photoshootType?: string) => void;
}

export const OtherServicesSection: React.FC<OtherServicesSectionProps> = ({
  language = 'en',
  studioContact = { whatsapp: '916238747722' } as StudioContactConfig,
  packages = DEFAULT_OTHER_SERVICES,
  categories = DEFAULT_SERVICE_CATEGORIES,
  selectedServices = [],
  onAddService,
  onRemoveService,
  onProceedToQuotation,
  onBackToDeliverables,
  onNavigateToCustomizer,
}) => {
  const isMl = language === 'ml';

  // Current view: 'categories' (Category Overview) or specific category id (e.g. 'food_catering')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  // Modal State for custom add-ons
  const [activeModalPackage, setActiveModalPackage] = useState<OtherServicePackage | null>(null);
  const [selectedCustomOptions, setSelectedCustomOptions] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState<number>(300);
  const [cardCount, setCardCount] = useState<number>(300);

  const allPackages = packages && packages.length > 0 ? packages : DEFAULT_OTHER_SERVICES;
  const allCategories = categories && categories.length > 0 ? categories : DEFAULT_SERVICE_CATEGORIES;

  // Selected Category Object
  const currentCategoryObj = allCategories.find((c) => c.id === activeCategoryId);

  // Packages in the active category
  const categoryPackages = activeCategoryId
    ? allPackages.filter((p) => p.category === activeCategoryId)
    : [];

  const isPackageSelected = (pkgId: string) => {
    return selectedServices.some((s) => s.packageId === pkgId);
  };

  const getSelectedService = (pkgId: string) => {
    return selectedServices.find((s) => s.packageId === pkgId);
  };

  const openPackageDetail = (pkg: OtherServicePackage) => {
    setActiveModalPackage(pkg);
    const existing = getSelectedService(pkg.id);

    if (existing && existing.customSelections) {
      setSelectedCustomOptions(existing.customSelections);
    } else {
      setSelectedCustomOptions([]);
    }

    if (pkg.category === 'food_catering') {
      setGuestCount(existing?.guestCount || pkg.baseGuestCount || 300);
    } else if (pkg.category === 'invitations') {
      setCardCount(existing?.cardCount || pkg.baseCardCount || 300);
    }
  };

  const toggleOption = (optId: string) => {
    setSelectedCustomOptions((prev) =>
      prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    );
  };

  // Calculate price for a package given its options and count
  const calculatePackageFinalPrice = (
    pkg: OtherServicePackage,
    optIds: string[] = [],
    guests: number = guestCount,
    cards: number = cardCount
  ) => {
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

    // Add optional custom selections
    if (pkg.customOptions) {
      for (const opt of pkg.customOptions) {
        if (optIds.includes(opt.id) && opt.price) {
          base += opt.price;
        }
      }
    }
    return base;
  };

  const handleSaveModalService = () => {
    if (!activeModalPackage || !onAddService) return;

    const optLabels = (activeModalPackage.customOptions || [])
      .filter((o) => selectedCustomOptions.includes(o.id))
      .map((o) => (isMl && o.labelMl ? o.labelMl : o.label));

    const finalPrice = calculatePackageFinalPrice(
      activeModalPackage,
      selectedCustomOptions,
      guestCount,
      cardCount
    );

    const isFood = activeModalPackage.category === 'food_catering';
    const isCards = activeModalPackage.category === 'invitations';

    onAddService({
      packageId: activeModalPackage.id,
      category: activeModalPackage.category,
      title: activeModalPackage.title,
      titleMl: activeModalPackage.titleMl,
      price: finalPrice,
      customSelections: optLabels,
      guestCount: isFood ? guestCount : undefined,
      cardCount: isCards ? cardCount : undefined,
      unitPrice: activeModalPackage.pricePerUnit || activeModalPackage.price,
    });

    setActiveModalPackage(null);
  };

  // Quick Direct Add
  const handleDirectAdd = (pkg: OtherServicePackage, currentCount?: number) => {
    if (!onAddService) return;
    const isFood = pkg.category === 'food_catering';
    const isCards = pkg.category === 'invitations';
    const count = currentCount || (isFood ? 300 : isCards ? 300 : 1);

    const finalPrice = calculatePackageFinalPrice(pkg, [], isFood ? count : 300, isCards ? count : 300);

    onAddService({
      packageId: pkg.id,
      category: pkg.category,
      title: pkg.title,
      titleMl: pkg.titleMl,
      price: finalPrice,
      customSelections: [],
      guestCount: isFood ? count : undefined,
      cardCount: isCards ? count : undefined,
      unitPrice: pkg.pricePerUnit || pkg.price,
    });
  };

  return (
    <div id="other-services-section" className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-100 to-rose-100 text-amber-900 border border-amber-200/80 mb-2.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          {isMl ? 'ഘട്ടം 4 • മറ്റ് സർവീസുകൾ' : 'Step 4 • Complete Wedding Solutions'}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
          {isMl ? 'മറ്റ് പ്രീമിയം വെഡ്ഡിംഗ് സർവീസുകൾ' : 'Complete Wedding Services & Arrangements'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-2 leading-relaxed">
          {isMl
            ? 'ഫോട്ടോഗ്രാഫിക്ക് പുറമെ പരമ്പരാഗത സദ്യ, നോൺ-വെജ് ബഫെ, റോയൽ സ്റ്റേജ് ഡെക്കോർ, ബ്രൈഡൽ മേക്കപ്പ്, വെഡ്ഡിംഗ് കാർഡുകൾ, ലക്ഷ്വറി കാറുകൾ എന്നിവ തിരഞ്ഞെടുക്കുക'
            : 'Select authentic Kerala Sadhya, wedding buffets, grand stage decor, bridal makeover, invitation cards & honeymoon packages to complete your wedding quotation.'}
        </p>
      </div>

      {/* VIEW MODE 1: MAIN CATEGORIES LIST (Default View) */}
      {!activeCategoryId ? (
        <div>
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200">
            <div>
              <h3 className="text-lg font-black text-stone-900">
                {isMl ? 'സർവീസ് കാറ്റഗറികൾ തിരഞ്ഞെടുക്കുക' : 'Explore Service Categories'}
              </h3>
              <p className="text-xs text-stone-500">
                {isMl ? 'പാക്കേജുകൾ കാണുന്നതിനായി കാറ്റഗറിയിൽ ക്ലിക്ക് ചെയ്യുക' : 'Click any category card below to view all available packages'}
              </p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
              {allCategories.length} {isMl ? 'കാറ്റഗറികൾ' : 'Categories Available'}
            </span>
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCategories.map((cat) => {
              const catPkgs = allPackages.filter((p) => p.category === cat.id);
              const selectedInCat = selectedServices.filter((s) => s.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="group relative bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Category Image with Gradient */}
                    <div className="relative h-56 w-full overflow-hidden bg-stone-100">
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                        {cat.badge ? (
                          <span className="bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                            {cat.badge}
                          </span>
                        ) : <div />}

                        {selectedInCat > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{selectedInCat} {isMl ? 'പ്ലാനിൽ ചേർത്തു' : 'Selected'}</span>
                          </span>
                        )}
                      </div>

                      {/* Bottom Image Overlay Title */}
                      <div className="absolute bottom-3.5 left-4 right-4">
                        <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5 drop-shadow-xs">
                          {catPkgs.length} {isMl ? 'പാക്കേജുകൾ ലഭ്യമാണ്' : 'Packages Available'}
                        </span>
                        <h4 className="text-xl font-black text-white drop-shadow-md leading-tight">
                          {isMl ? cat.nameMl || cat.name : cat.name}
                        </h4>
                      </div>
                    </div>

                    {/* Category Description */}
                    <div className="p-5">
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {isMl ? cat.descriptionMl || cat.description : cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom CTA (See More Button - NO Custom Add on Main Category Card as requested!) */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-500 group-hover:text-amber-800 transition">
                        {isMl ? 'പാക്കേജ് വിവരങ്ങൾ കാണുക' : 'Explore Packages'}
                      </span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 group-hover:bg-gradient-to-r group-hover:from-amber-600 group-hover:to-amber-700 text-white text-xs font-black shadow-xs transition duration-200"
                      >
                        <span>{isMl ? 'സീ മോർ (See More)' : 'See More'}</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: SPECIFIC CATEGORY PACKAGES LIST */
        <div>
          {/* Back & Breadcrumb Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveCategoryId(null)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-bold text-xs shadow-2xs transition active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isMl ? 'എല്ലാ കാറ്റഗറികളും' : 'All Categories'}</span>
              </button>

              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                  {currentCategoryObj ? (isMl ? currentCategoryObj.nameMl : currentCategoryObj.name) : 'Packages'}
                </h3>
                <p className="text-[11px] text-stone-500 line-clamp-1">
                  {currentCategoryObj ? (isMl ? currentCategoryObj.descriptionMl : currentCategoryObj.description) : ''}
                </p>
              </div>
            </div>

            {/* Category Quick Pill Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {allCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategoryId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeCategoryId === c.id
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {isMl ? c.nameMl.split('(')[0] : c.name.split('(')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryPackages.map((pkg) => {
              const selected = isPackageSelected(pkg.id);
              const currentSelected = getSelectedService(pkg.id);
              const isFood = pkg.category === 'food_catering';
              const isCards = pkg.category === 'invitations';

              const currentGuests = currentSelected?.guestCount || pkg.baseGuestCount || 300;
              const currentCards = currentSelected?.cardCount || pkg.baseCardCount || 300;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border transition duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl ${
                    selected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-gradient-to-b from-emerald-50/20 via-white to-white'
                      : 'border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div>
                    {/* Image & Badges */}
                    <div
                      className="relative h-52 w-full overflow-hidden bg-stone-100 cursor-pointer group"
                      onClick={() => openPackageDetail(pkg)}
                    >
                      <img
                        src={pkg.imageUrl}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-106 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                      {pkg.badge && (
                        <span className="absolute top-3 left-3 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                          {pkg.badge}
                        </span>
                      )}

                      {selected && (
                        <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isMl ? 'പ്ലാനിൽ ചേർത്തു' : 'Added to Plan'}</span>
                        </span>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end text-white">
                        <span className="text-[11px] font-bold bg-stone-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-lg">
                          {isFood
                            ? isMl ? 'സദ്യ & ഫുഡ് കേറ്ററിംഗ്' : 'Food & Catering'
                            : isCards
                            ? isMl ? 'വെഡ്ഡിംഗ് കാർഡുകൾ' : 'Wedding Cards'
                            : isMl ? 'പ്രീമിയം പാക്കേജ്' : 'Premium Package'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPackageDetail(pkg);
                          }}
                          className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isMl ? 'ഡീറ്റെയിൽസ്' : 'Details'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-black text-stone-900 leading-snug">
                        {isMl ? pkg.titleMl : pkg.title}
                      </h3>
                      {isMl && pkg.title && (
                        <p className="text-xs font-semibold text-amber-700 mt-0.5 mb-2">
                          {pkg.title}
                        </p>
                      )}
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                        {pkg.description}
                      </p>

                      {/* Food Guest Count Counter input field (Requirement 3) */}
                      {isFood && (
                        <div className="mb-4 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-amber-700" />
                              <span>{isMl ? 'ആകെ അതിഥികളുടെ എണ്ണം (Guests):' : 'Total Guests to Serve:'}</span>
                            </span>
                            <span className="text-amber-800 text-[11px]">
                              ₹{pkg.pricePerUnit || pkg.price} / {isMl ? 'പ്ലേറ്റ്' : 'plate'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1 border border-amber-200">
                            <button
                              type="button"
                              onClick={() => {
                                const newCount = Math.max(50, (selected ? currentGuests : guestCount) - 50);
                                if (selected) {
                                  handleDirectAdd(pkg, newCount);
                                } else {
                                  setGuestCount(newCount);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition"
                            >
                              -50
                            </button>

                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={selected ? currentGuests : guestCount}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value) || 1);
                                if (selected) {
                                  handleDirectAdd(pkg, val);
                                } else {
                                  setGuestCount(val);
                                }
                              }}
                              className="w-24 text-center font-black text-sm text-stone-900 border-none outline-hidden bg-transparent"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newCount = (selected ? currentGuests : guestCount) + 50;
                                if (selected) {
                                  handleDirectAdd(pkg, newCount);
                                } else {
                                  setGuestCount(newCount);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center transition"
                            >
                              +50
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Wedding Card Count Counter input field (Requirement 3) */}
                      {isCards && pkg.pricingType === 'per_card' && (
                        <div className="mb-4 p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-950 mb-1.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-amber-700" />
                              <span>{isMl ? 'ആകെ കാർഡുകളുടെ എണ്ണം (Cards):' : 'Total Number of Cards:'}</span>
                            </span>
                            <span className="text-amber-800 text-[11px]">
                              ₹{pkg.pricePerUnit || pkg.price} / {isMl ? 'കാർഡ്' : 'card'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 bg-white rounded-xl p-1 border border-amber-200">
                            <button
                              type="button"
                              onClick={() => {
                                const newCount = Math.max(50, (selected ? currentCards : cardCount) - 50);
                                if (selected) {
                                  handleDirectAdd(pkg, newCount);
                                } else {
                                  setCardCount(newCount);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold flex items-center justify-center transition"
                            >
                              -50
                            </button>

                            <input
                              type="number"
                              min="1"
                              step="any"
                              value={selected ? currentCards : cardCount}
                              onChange={(e) => {
                                const val = Math.max(1, Number(e.target.value) || 1);
                                if (selected) {
                                  handleDirectAdd(pkg, val);
                                } else {
                                  setCardCount(val);
                                }
                              }}
                              className="w-24 text-center font-black text-sm text-stone-900 border-none outline-hidden bg-transparent"
                            />

                            <button
                              type="button"
                              onClick={() => {
                                const newCount = (selected ? currentCards : cardCount) + 50;
                                if (selected) {
                                  handleDirectAdd(pkg, newCount);
                                } else {
                                  setCardCount(newCount);
                                }
                              }}
                              className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center transition"
                            >
                              +50
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Features List */}
                      <ul className="space-y-1.5 text-xs text-stone-600 mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-100">
                        {pkg.features.slice(0, 4).map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Footer CTA */}
                  <div className="p-5 pt-0">
                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">
                          {selected
                            ? isMl ? 'തിരഞ്ഞെടുത്ത തുക' : 'Selected Total'
                            : isFood
                            ? isMl ? `ആകെ തുക (${guestCount} പേർക്ക്)` : `Total for ${guestCount} Guests`
                            : isCards && pkg.pricingType === 'per_card'
                            ? isMl ? `ആകെ തുക (${cardCount} കാർഡുകൾ)` : `Total for ${cardCount} Cards`
                            : isMl ? 'പാക്കേജ് നിരക്ക്' : 'Package Rate'}
                        </span>
                        <span className="text-lg font-black text-stone-900">
                          ₹{(
                            selected
                              ? currentSelected!.price
                              : calculatePackageFinalPrice(pkg, [], isFood ? guestCount : 300, isCards ? cardCount : 300)
                          ).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {selected ? (
                          <button
                            type="button"
                            onClick={() => onRemoveService && onRemoveService(pkg.id)}
                            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs transition"
                            title={isMl ? 'പ്ലാനിൽ നിന്നും ഒഴിവാക്കുക' : 'Remove from Plan'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isMl ? 'ഒഴിവാക്കുക' : 'Remove'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (pkg.category === 'photoshoot' && onNavigateToCustomizer) {
                                const shootKey = pkg.id.replace('photoshoot_', '');
                                onNavigateToCustomizer(shootKey);
                              } else {
                                openPackageDetail(pkg);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-sm transition active:scale-95"
                          >
                            <Sliders className="w-3.5 h-3.5 text-amber-200" />
                            <span>
                              {pkg.id === 'photoshoot_wedding'
                                ? (isMl ? 'വെഡ്ഡിംഗ് പ്ലാനർ' : 'Wedding Planner')
                                : (isMl ? 'കസ്റ്റം & ചേർക്കുക' : 'Custom & Add')}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAILED PACKAGE CUSTOMIZATION MODAL */}
      {activeModalPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-4 max-h-[92vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveModalPackage(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                {activeModalPackage.category === 'food_catering'
                  ? isMl ? 'സദ്യ & ഫുഡ് കേറ്ററിംഗ്' : 'Food & Catering'
                  : activeModalPackage.category === 'event_planning'
                  ? isMl ? 'സ്റ്റേജ് ഡെക്കോർ & ഇവന്റ്സ്' : 'Stage Decor & Styling'
                  : activeModalPackage.category === 'makeup'
                  ? isMl ? 'ബ്രൈഡൽ മേക്കപ്പ്' : 'Bridal Makeup'
                  : activeModalPackage.category === 'invitations'
                  ? isMl ? 'വെഡ്ഡിംഗ് കാർഡുകൾ' : 'Wedding Cards'
                  : isMl ? 'വെഡ്ഡിംഗ് സർവീസ്' : 'Wedding Service'}
              </span>
              {activeModalPackage.badge && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded-full">
                  {activeModalPackage.badge}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              {isMl ? activeModalPackage.titleMl : activeModalPackage.title}
            </h3>
            {isMl && activeModalPackage.title && (
              <p className="text-xs font-bold text-amber-700 mb-4">
                {activeModalPackage.title}
              </p>
            )}

            {/* Demo Image Showcase */}
            <div className="h-56 sm:h-64 w-full rounded-2xl overflow-hidden mb-5 border border-stone-200 shadow-inner relative">
              <img
                src={activeModalPackage.imageUrl}
                alt={activeModalPackage.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* In-Modal Guest Count / Card Count Selector */}
            {activeModalPackage.category === 'food_catering' && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-700" />
                    <span>{isMl ? 'ഭക്ഷണം നൽകേണ്ട അതിഥികളുടെ എണ്ണം (Guest Count):' : 'Total Guests to Serve:'}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    ₹{activeModalPackage.pricePerUnit || activeModalPackage.price} / {isMl ? 'പ്ലേറ്റ്' : 'plate'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestCount((prev) => Math.max(50, prev - 50))}
                    className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-xl border border-amber-300 text-xs shadow-2xs"
                  >
                    -50
                  </button>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                    className="flex-1 text-center font-black text-base py-2 rounded-xl border border-amber-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setGuestCount((prev) => prev + 50)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-2xs"
                  >
                    +50
                  </button>
                </div>
              </div>
            )}

            {activeModalPackage.category === 'invitations' && activeModalPackage.pricingType === 'per_card' && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-700" />
                    <span>{isMl ? 'പ്രിന്റ് ചെയ്യേണ്ട ആകെ കാർഡുകളുടെ എണ്ണം:' : 'Total Invitation Cards:'}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    ₹{activeModalPackage.pricePerUnit || activeModalPackage.price} / {isMl ? 'കാർഡ്' : 'card'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCardCount((prev) => Math.max(50, prev - 50))}
                    className="px-3.5 py-2 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-xl border border-amber-300 text-xs shadow-2xs"
                  >
                    -50
                  </button>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={cardCount}
                    onChange={(e) => setCardCount(Math.max(1, Number(e.target.value) || 1))}
                    className="flex-1 text-center font-black text-base py-2 rounded-xl border border-amber-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCardCount((prev) => prev + 50)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-2xs"
                  >
                    +50
                  </button>
                </div>
              </div>
            )}

            {/* Inclusions */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isMl ? 'പാക്കേജിൽ ഉൾപ്പെടുന്നവ (Inclusions):' : 'What is Included in Package:'}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeModalPackage.features.map((feat, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 flex items-start gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Options */}
            {activeModalPackage.customOptions && activeModalPackage.customOptions.length > 0 && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 mb-1 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-700" />
                  <span>{isMl ? 'കസ്റ്റം ചോയ്‌സുകൾ (Custom Add-ons)' : 'Custom Choices & Add-ons:'}</span>
                </h4>
                <div className="space-y-2 mt-3">
                  {activeModalPackage.customOptions.map((opt) => {
                    const isChecked = selectedCustomOptions.includes(opt.id);
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-amber-100/90 border-amber-400 font-bold text-amber-950'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOption(opt.id)}
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

            {/* Modal Bottom Price & Save */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">
                  {isMl ? 'ആകെ തുക (Total Package Amount)' : 'Calculated Package Total'}
                </span>
                <span className="text-2xl font-black text-amber-800">
                  ₹{calculatePackageFinalPrice(activeModalPackage, selectedCustomOptions, guestCount, cardCount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={`https://wa.me/${studioContact.whatsapp || '916238747722'}?text=${encodeURIComponent(
                    `Hello Framelu Weddings, I am interested in customizing ${activeModalPackage.title}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleSaveModalService}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'പ്ലാനിൽ ചേർക്കുക (Add to Plan)' : 'Add to Wedding Plan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Navigation Buttons at Bottom (Requirement 4) */}
      <div className="mt-12 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            if (onBackToDeliverables) {
              onBackToDeliverables();
            } else {
              const el = document.getElementById('deliverables-customizer-section') || document.getElementById('wedding-customizer-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs sm:text-sm shadow-2xs transition cursor-pointer active:scale-98"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isMl ? 'ആൽബം & ഡെലിവറബിൾസ് പരിശോധിക്കുക' : 'Back to Deliverables'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onProceedToQuotation) onProceedToQuotation();
            else {
              const el = document.getElementById('wedding-customizer-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-lg transition active:scale-98"
        >
          <FileText className="w-4 h-4" />
          <span>{isMl ? 'കൊട്ടേഷൻ റിവ്യൂ & PDF ഡൗൺലോഡ് 📄' : 'Review & Get PDF Quotation 📄'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
