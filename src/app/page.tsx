'use client';

import React, { useState, useEffect } from 'react';
import {
  SideSelection,
  EventId,
  EventCrewConfig,
  DeliverablesConfig,
  PriceRates,
  CustomerLead,
  CustomerUser,
  StudioContactConfig,
  PromoOffer,
  HighlightBoard,
  CustomPrintItem,
  SelectedOtherService,
  OtherServicePackage,
  ServiceCategory,
  GalleryProject,
  CouponCode,
  StudioUser,
  PhotoshootType,
  PhotoshootConfig,
} from '@/types';
import {
  DEFAULT_RATES,
  DEFAULT_DELIVERABLES,
  ZERO_DELIVERABLES,
  KERALA_EVENTS,
  DEFAULT_STUDIO_CONTACT,
  DEFAULT_OFFERS,
  DEFAULT_HIGHLIGHT_BOARDS,
  DEFAULT_CUSTOM_PRINTS,
  DEFAULT_OTHER_SERVICES,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_GALLERY_PROJECTS,
  DEFAULT_COUPONS,
  DEFAULT_PHOTOSHOOTS,
} from '@/constants/defaults';
import { calculateCustomQuote, BreakdownItem } from '@/utils/calculator';
import {
  subscribeStudioContact,
  subscribePriceRates,
  subscribeCustomPrints,
  subscribePromoOffers,
  subscribeHighlightBoards,
  subscribeOtherServices,
  subscribeServiceCategories,
  subscribeCustomerLeads,
  subscribeGalleryProjects,
  saveLeadToCloud,
  subscribeCoupons,
  subscribePhotoshoots,
} from '@/lib/firestoreSync';
import { Navbar } from '@/components/Navbar';
import { SideSelector } from '@/components/SideSelector';
import { EventsCrewCustomizer } from '@/components/EventsCrewCustomizer';
import { DeliverablesCustomizer } from '@/components/DeliverablesCustomizer';
import { LiveStickyPricing } from '@/components/LiveStickyPricing';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { CustomerAuthModal } from '@/components/CustomerAuthModal';
import { StudioAuthModal } from '@/components/StudioAuthModal';
import { PdfQuotationView } from '@/components/PdfQuotationView';
import { OtherServicesSection } from '@/components/OtherServicesSection';
import { OffersAndHighlightBoards } from '@/components/OffersAndHighlightBoards';
import { GallerySection } from '@/components/GallerySection';
import { PhotoshootSection } from '@/components/PhotoshootSection';
import {
  Sparkles,
  MapPin,
  Heart,
  Shield,
  Lock,
  UserCheck,
  ArrowRight,
  Gift,
  CheckCircle2,
  RotateCcw,
  Check,
  Layers,
  Zap,
} from 'lucide-react';

export default function Home() {
  // Language State: Defaults to 'en' (English) as requested by user!
  const [language, setLanguage] = useState<'en' | 'ml'>('en');

  // Customer Navigation tabs: 'studio' | 'offers' | 'services' | 'gallery'
  const [activeTab, setActiveTab] = useState<'studio' | 'offers' | 'services' | 'gallery'>('studio');

  // Active Photoshoot Category: 'wedding' | 'birthday' | 'anniversary' | 'baby_shower' | 'baby_photoshoot' | 'newborn_baby' | 'model_photoshoot'
  const [selectedPhotoshoot, setSelectedPhotoshoot] = useState<PhotoshootType>('wedding');

  // Gallery Projects State (Synced with localStorage & Cloud Firestore)
  const [galleryProjects, setGalleryProjects] = useState<GalleryProject[]>(DEFAULT_GALLERY_PROJECTS);

  // Customer User Authentication State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);

  // Studio Partner Authentication State (B2B Studio Portal)
  const [studioUser, setStudioUser] = useState<StudioUser | null>(null);
  const [isStudioAuthModalOpen, setIsStudioAuthModalOpen] = useState(false);

  // Coupons State & Active Applied Coupon
  const [coupons, setCoupons] = useState<CouponCode[]>(DEFAULT_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | null>(null);

  // Photoshoot Packages State (Synced with localStorage & Cloud Firestore)
  const [photoshoots, setPhotoshoots] = useState<PhotoshootConfig[]>(Object.values(DEFAULT_PHOTOSHOOTS));

  // Modals state
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Studio Customizer Flow State
  const [side, setSide] = useState<SideSelection>('both');

  // Dynamic Studio Contact Settings (Phone, Destination, WhatsApp)
  const [studioContact, setStudioContact] = useState<StudioContactConfig>(DEFAULT_STUDIO_CONTACT);

  // Offers and Highlight Boards State
  const [offers, setOffers] = useState<PromoOffer[]>(DEFAULT_OFFERS);
  const [highlightBoards, setHighlightBoards] = useState<HighlightBoard[]>(DEFAULT_HIGHLIGHT_BOARDS);

  // Service Categories State (Synced with localStorage & Cloud Firestore)
  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_SERVICE_CATEGORIES);

  // Active Selected Package Board & Discount State
  const [activePackageBoard, setActivePackageBoard] = useState<HighlightBoard | null>(null);
  const [packageDiscount, setPackageDiscount] = useState<number>(0);

  // Other Services Packages & User Selected Other Services
  const [otherServices, setOtherServices] = useState<OtherServicePackage[]>(DEFAULT_OTHER_SERVICES);
  const [selectedOtherServices, setSelectedOtherServices] = useState<SelectedOtherService[]>([]);

  // Rates State (Synced with localStorage & Cloud Firestore)
  const [rates, setRates] = useState<PriceRates>(DEFAULT_RATES);

  // Custom Additional Print Items State (Synced with localStorage & Cloud Firestore)
  const [customPrintItems, setCustomPrintItems] = useState<CustomPrintItem[]>(DEFAULT_CUSTOM_PRINTS);

  // Leads CRM State (Synced with localStorage & Cloud Firestore)
  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [activeLead, setActiveLead] = useState<CustomerLead>({
    name: 'Arun Krishna',
    phone: '9847123456',
    email: 'arun.krishna@gmail.com',
    address: 'Kayamkulam, Alappuzha',
    place: 'Kayamkulam',
    weddingDate: '2026-12-20',
    venueLocation: 'Royal Auditorium, Kayamkulam',
  });

  // Initialize Default Events: Starts completely unchecked/0 crew so initial estimate is ₹0
  const buildInitialEvents = (): Record<EventId, EventCrewConfig> => {
    const initial: Partial<Record<EventId, EventCrewConfig>> = {};
    for (const evt of KERALA_EVENTS) {
      initial[evt.id] = {
        enabled: false,
        venue: '',
        date: '',
        traditionalPhotographers: 0,
        traditionalVideographers: 0,
        candidPhotographers: 0,
        candidVideographers: 0,
        drone: false,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      };
    }
    return initial as Record<EventId, EventCrewConfig>;
  };

  const [groomEvents, setGroomEvents] = useState<Record<EventId, EventCrewConfig>>(buildInitialEvents());
  const [brideEvents, setBrideEvents] = useState<Record<EventId, EventCrewConfig>>(buildInitialEvents());
  // Starts with ZERO_DELIVERABLES so total estimate on initial page load is ₹0
  const [deliverables, setDeliverables] = useState<DeliverablesConfig>(ZERO_DELIVERABLES);

  // Load saved state on client mount & subscribe to Cloud Firestore real-time updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('framlu_lang') || localStorage.getItem('lumina_lang');
      if (savedLang === 'ml' || savedLang === 'en') {
        setLanguage(savedLang);
      } else {
        setLanguage('en'); // Defaults to English
      }

      const savedContact = localStorage.getItem('framlu_wedding_contact') || localStorage.getItem('lumina_wedding_contact');
      if (savedContact) {
        try {
          setStudioContact(JSON.parse(savedContact));
        } catch (e) {
          console.error(e);
        }
      }

      const savedOffers = localStorage.getItem('framlu_wedding_offers') || localStorage.getItem('lumina_wedding_offers');
      if (savedOffers) {
        try {
          setOffers(JSON.parse(savedOffers));
        } catch (e) {
          console.error(e);
        }
      }

      const savedBoards = localStorage.getItem('framlu_wedding_boards') || localStorage.getItem('lumina_wedding_boards');
      if (savedBoards) {
        try {
          setHighlightBoards(JSON.parse(savedBoards));
        } catch (e) {
          console.error(e);
        }
      }

      const savedRates = localStorage.getItem('framlu_wedding_rates') || localStorage.getItem('lumina_wedding_rates');
      if (savedRates) {
        try {
          const parsed = JSON.parse(savedRates);
          setRates({
            ...DEFAULT_RATES,
            ...parsed,
            albumFinishes: {
              ...DEFAULT_RATES.albumFinishes,
              ...(parsed.albumFinishes || {}),
            },
          });
        } catch (e) {
          console.error(e);
        }
      }

      const savedCustomPrints = localStorage.getItem('framlu_wedding_custom_prints');
      if (savedCustomPrints) {
        try {
          setCustomPrintItems(JSON.parse(savedCustomPrints));
        } catch (e) {
          console.error(e);
        }
      }

      const savedServices = localStorage.getItem('framlu_wedding_other_services');
      if (savedServices) {
        try {
          setOtherServices(JSON.parse(savedServices));
        } catch (e) {
          console.error(e);
        }
      }

      const savedUser = localStorage.getItem('framlu_wedding_user') || localStorage.getItem('lumina_wedding_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          setCustomerUser(u);
          setActiveLead((prev) => ({
            ...prev,
            name: u.name,
            phone: u.phone,
            email: u.email,
            address: u.address,
            place: u.place,
          }));
        } catch (e) {
          console.error(e);
        }
      }

      const savedLeads = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      if (savedLeads) {
        try {
          setLeads(JSON.parse(savedLeads));
        } catch (e) {
          console.error(e);
        }
      }
      const savedCats = localStorage.getItem('framlu_service_categories');
      if (savedCats) {
        try {
          setCategories(JSON.parse(savedCats));
        } catch (e) {
          console.error(e);
        }
      }

      const savedGallery = localStorage.getItem('framlu_gallery_projects');
      if (savedGallery) {
        try {
          setGalleryProjects(JSON.parse(savedGallery));
        } catch (e) {
          console.error(e);
        }
      }

      const savedStudio = localStorage.getItem('framlu_studio_partner');
      if (savedStudio) {
        try {
          setStudioUser(JSON.parse(savedStudio));
        } catch (e) {
          console.error(e);
        }
      }

      const savedCoupons = localStorage.getItem('framlu_coupons');
      if (savedCoupons) {
        try {
          setCoupons(JSON.parse(savedCoupons));
        } catch (e) {
          console.error(e);
        }
      }

      const savedPhotoshoots = localStorage.getItem('framlu_wedding_photoshoots');
      if (savedPhotoshoots) {
        try {
          setPhotoshoots(JSON.parse(savedPhotoshoots));
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Real-Time Cross-Device Sync with Cloud Firestore
    const unsubContact = subscribeStudioContact((c) => setStudioContact(c));
    const unsubRates = subscribePriceRates((r) => setRates((prev) => ({ ...prev, ...r })));
    const unsubPrints = subscribeCustomPrints((p) => setCustomPrintItems(p));
    const unsubOffers = subscribePromoOffers((o) => setOffers(o));
    const unsubBoards = subscribeHighlightBoards((b) => setHighlightBoards(b));
    const unsubServices = subscribeOtherServices((s) => setOtherServices(s));
    const unsubCategories = subscribeServiceCategories((c) => setCategories(c));
    const unsubLeads = subscribeCustomerLeads((l) => setLeads(l));
    const unsubGallery = subscribeGalleryProjects((g) => setGalleryProjects(g));
    const unsubCoupons = subscribeCoupons((cp) => setCoupons(cp));
    const unsubPhotoshoots = subscribePhotoshoots((p) => {
      if (p && p.length > 0) setPhotoshoots(p);
    });

    return () => {
      unsubContact();
      unsubRates();
      unsubPrints();
      unsubOffers();
      unsubBoards();
      unsubServices();
      unsubCategories();
      unsubLeads();
      unsubGallery();
      unsubCoupons();
      unsubPhotoshoots();
    };
  }, []);

  // Language switcher handler
  const handleToggleLanguage = () => {
    const nextLang = language === 'ml' ? 'en' : 'ml';
    setLanguage(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_lang', nextLang);
    }
  };

  // Calculate live quote (includes photography crew, deliverables, custom prints, package discount, and other services)
  const calculation = calculateCustomQuote(
    side,
    groomEvents,
    brideEvents,
    deliverables,
    rates,
    customPrintItems,
    selectedOtherServices,
    packageDiscount,
    activePackageBoard?.title,
    activePackageBoard?.titleMl
  );

  // Remove specific item from Live Sticky Pricing (Trash icon handler)
  const handleRemoveItem = (item: BreakdownItem) => {
    const id = item.id;

    // 1. Custom Print Items (e.g. Acrylic Calendar, Ceramic Mug, Keepsake Mini Album)
    if (id.startsWith('custom_print_')) {
      const cpId = id.replace('custom_print_', '');
      setDeliverables((prev) => {
        const nextCounts = { ...(prev.customPrintCounts || {}) };
        delete nextCounts[cpId];
        const updated: DeliverablesConfig = {
          ...prev,
          customPrintCounts: nextCounts,
        };
        // Reset legacy count fields if applicable
        if (cpId === 'mini_album' || cpId === 'mini_pocket_album') updated.miniAlbumsCount = 0;
        if (cpId === 'photo_mug' || cpId === 'ceramic_mug') updated.photoMugsCount = 0;
        if (cpId === 'wall_calendar' || cpId === 'wall_calendar_12m') updated.wallCalendarsCount = 0;
        if (cpId === 'table_calendar' || cpId === 'table_top_calendar') updated.tableTopCalendarsCount = 0;
        return updated;
      });
      return;
    }

    // 2. Other Wedding Services (e.g. Kerala Traditional Sadhya, Stage Decor, Bridal Makeup)
    if (id.startsWith('other_service_')) {
      const pkgId = id.replace('other_service_', '');
      setSelectedOtherServices((prev) => prev.filter((s) => s.packageId !== pkgId));
      return;
    }

    // 3. Groom Event Crew Items
    if (id.startsWith('groom_')) {
      const suffixes = [
        { s: '_trad_photo', fn: (e: EventCrewConfig) => { e.traditionalPhotographers = 0; } },
        { s: '_trad_video', fn: (e: EventCrewConfig) => { e.traditionalVideographers = 0; } },
        { s: '_candid_photo', fn: (e: EventCrewConfig) => { e.candidPhotographers = 0; } },
        { s: '_candid_video', fn: (e: EventCrewConfig) => { e.candidVideographers = 0; } },
        { s: '_drone', fn: (e: EventCrewConfig) => { e.drone = false; } },
        { s: '_yt_live', fn: (e: EventCrewConfig) => { e.youtubeLive = false; } },
        { s: '_hall_live', fn: (e: EventCrewConfig) => { e.auditoriumLive = false; } },
        { s: '_live_print', fn: (e: EventCrewConfig) => { e.photoLivePrinting = false; } },
      ];
      for (const { s, fn } of suffixes) {
        if (id.endsWith(s)) {
          const evtId = id.slice('groom_'.length, id.length - s.length) as EventId;
          setGroomEvents((prev) => {
            const existing = prev[evtId];
            if (!existing) return prev;
            const updated = { ...existing };
            fn(updated);
            return { ...prev, [evtId]: updated };
          });
          return;
        }
      }
    }

    // 4. Bride Event Crew Items
    if (id.startsWith('bride_')) {
      const suffixes = [
        { s: '_trad_photo', fn: (e: EventCrewConfig) => { e.traditionalPhotographers = 0; } },
        { s: '_trad_video', fn: (e: EventCrewConfig) => { e.traditionalVideographers = 0; } },
        { s: '_candid_photo', fn: (e: EventCrewConfig) => { e.candidPhotographers = 0; } },
        { s: '_candid_video', fn: (e: EventCrewConfig) => { e.candidVideographers = 0; } },
        { s: '_drone', fn: (e: EventCrewConfig) => { e.drone = false; } },
        { s: '_yt_live', fn: (e: EventCrewConfig) => { e.youtubeLive = false; } },
        { s: '_hall_live', fn: (e: EventCrewConfig) => { e.auditoriumLive = false; } },
        { s: '_live_print', fn: (e: EventCrewConfig) => { e.photoLivePrinting = false; } },
      ];
      for (const { s, fn } of suffixes) {
        if (id.endsWith(s)) {
          const evtId = id.slice('bride_'.length, id.length - s.length) as EventId;
          setBrideEvents((prev) => {
            const existing = prev[evtId];
            if (!existing) return prev;
            const updated = { ...existing };
            fn(updated);
            return { ...prev, [evtId]: updated };
          });
          return;
        }
      }
    }

    // 5. Deliverables & Merchandise
    setDeliverables((prev) => {
      const updated = { ...prev };
      if (id === 'res_4k_upgrade') updated.videoQuality = 'hd';
      if (id === 'full_video') updated.fullLengthVideo = false;
      if (id === 'highlight_video') updated.highlightVideo = false;
      if (id === 'teaser_video') updated.teaserVideo = false;
      if (id === 'reels') updated.reelsCount = 0;
      if (id === 'pendrive') updated.penDriveCount = 0;
      if (id === 'pendrive_box') updated.penDriveBoxCount = 0;
      if (id === 'main_albums') updated.mainAlbumsCount = 0;
      if (id === 'album_paper') updated.albumPaperType = 'normal';
      if (id === 'frame_8x12') updated.frames_8x12 = 0;
      if (id === 'frame_18x12') updated.frames_18x12 = 0;
      if (id === 'frame_15x20') updated.frames_15x20 = 0;
      if (id === 'mini_album') updated.miniAlbumsCount = 0;
      if (id === 'photo_mug') updated.photoMugsCount = 0;
      if (id === 'wall_calendar') updated.wallCalendarsCount = 0;
      if (id === 'table_calendar') updated.tableTopCalendarsCount = 0;
      return updated;
    });
  };

  // Reset quote completely back to ₹0
  const handleResetToZero = () => {
    setActivePackageBoard(null);
    setPackageDiscount(0);
    setAppliedCoupon(null);
    setGroomEvents(buildInitialEvents());
    setBrideEvents(buildInitialEvents());
    setDeliverables(ZERO_DELIVERABLES);
    setSelectedOtherServices([]);
  };

  // Apply a Popular Wedding Package Plan from Highlight Bar to Customizer (Requirement 1)
  const handleApplyHighlightBoard = (board: HighlightBoard) => {
    setActivePackageBoard(board);
    setSelectedPhotoshoot('wedding');
    setActiveLead((prev) => ({
      ...prev,
      leadType: 'wedding',
      photoshootType: undefined,
      photoshootDetails: undefined,
      totalPrice: board.price,
    }));

    const pSide = board.presetConfig?.side || 'both';
    setSide(pSide);

    // Build fresh target events matching the package card specifications
    const targetGroomEvents = buildInitialEvents();
    const targetBrideEvents = buildInitialEvents();

    const events = board.presetConfig?.events;

    if (events?.weddingDayCrew) {
      targetGroomEvents.wedding_day = {
        enabled: true,
        venue: '',
        date: '',
        traditionalPhotographers: events.weddingDayCrew.tradPhoto ?? 1,
        traditionalVideographers: events.weddingDayCrew.tradVideo ?? 1,
        candidPhotographers: events.weddingDayCrew.candidPhoto ?? 0,
        candidVideographers: events.weddingDayCrew.candidVideo ?? 0,
        drone: !!events.weddingDayCrew.drone,
        youtubeLive: board.id === 'board_royal',
        auditoriumLive: board.id === 'board_royal',
        photoLivePrinting: board.id === 'board_royal',
      };
      if (pSide === 'both' && (board.id === 'board_royal' || board.price >= 140000)) {
        targetBrideEvents.wedding_day = { ...targetGroomEvents.wedding_day };
      }
    } else {
      // Default fallback wedding day crew based on price
      targetGroomEvents.wedding_day = {
        enabled: true,
        venue: '',
        date: '',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: board.price >= 80000 ? 1 : 0,
        candidVideographers: board.price >= 80000 ? 1 : 0,
        drone: board.price >= 80000,
        youtubeLive: board.price >= 140000,
        auditoriumLive: board.price >= 140000,
        photoLivePrinting: board.price >= 140000,
      };
    }

    if (events?.receptionCrew) {
      targetGroomEvents.reception = {
        enabled: true,
        venue: '',
        date: '',
        traditionalPhotographers: events.receptionCrew.tradPhoto ?? 1,
        traditionalVideographers: events.receptionCrew.tradVideo ?? 1,
        candidPhotographers: events.receptionCrew.candidPhoto ?? 0,
        candidVideographers: events.receptionCrew.candidVideo ?? 0,
        drone: !!events.receptionCrew.drone,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      };
    }

    if (board.id === 'board_royal' || board.price >= 150000) {
      targetGroomEvents.pre_wedding = {
        enabled: true,
        venue: '',
        date: '',
        traditionalPhotographers: 0,
        traditionalVideographers: 0,
        candidPhotographers: 1,
        candidVideographers: 1,
        drone: false,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      };
    }

    // Build target deliverables matching package card features
    const pDeliv = board.presetConfig?.deliverables;
    const isLuxury = board.price >= 140000;
    const isMedium = board.price >= 80000;

    const targetDeliv: DeliverablesConfig = {
      ...ZERO_DELIVERABLES,
      videoQuality: pDeliv?.videoQuality || (isMedium ? '4k' : 'hd'),
      fullLengthVideo: true,
      highlightVideo: pDeliv?.highlightVideo ?? isMedium,
      teaserVideo: pDeliv?.teaserVideo ?? isMedium,
      reelsCount: pDeliv?.reels ?? (isLuxury ? 4 : isMedium ? 2 : 0),
      penDriveCount: 1,
      penDriveBoxCount: isMedium ? 1 : 0,
      mainAlbumsCount: pDeliv?.mainAlbums ?? (isLuxury ? 2 : 1),
      mainAlbumSheets: pDeliv?.mainSheets ?? (isLuxury ? 45 : isMedium ? 35 : 30),
      albumPaperType: (pDeliv?.albumCover as any) || (isLuxury ? 'full_glass' : isMedium ? 'glass' : 'normal'),
      frames_8x12: !isMedium ? 2 : 0,
      frames_18x12: isMedium ? 1 : 0,
      frames_15x20: isLuxury ? 1 : 0,
      miniAlbumsCount: isLuxury ? 2 : 0,
    };

    setGroomEvents(targetGroomEvents);
    setBrideEvents(targetBrideEvents);
    setDeliverables(targetDeliv);

    // Calculate raw quote for the package items at standard rates
    const rawQuote = calculateCustomQuote(
      pSide,
      targetGroomEvents,
      targetBrideEvents,
      targetDeliv,
      rates,
      customPrintItems,
      []
    );

    // Calculate exact discount so that: rawQuote.totalPrice - discount === board.price
    const discount = Math.max(0, rawQuote.totalPrice - board.price);
    setPackageDiscount(discount);

    // Smooth scroll to customizer
    const el = document.getElementById('wedding-customizer-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Coupon application handler
  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const matched = coupons.find(
      (cp) => cp.code.trim().toUpperCase() === cleanCode && cp.active
    );
    if (!matched) {
      return {
        success: false,
        message:
          language === 'ml'
            ? 'അസാധുവായ കൂപ്പൺ കോഡ്! ദയവായി പരിശോധിക്കുക.'
            : 'Invalid or inactive coupon code. Please check and try again.',
      };
    }

    if (matched.minAmount && calculation.totalPrice < matched.minAmount) {
      return {
        success: false,
        message:
          language === 'ml'
            ? `ഈ കൂപ്പൺ ഉപയോഗിക്കാൻ കുറഞ്ഞത് ₹${matched.minAmount.toLocaleString('en-IN')} വേണം!`
            : `Minimum order amount of ₹${matched.minAmount.toLocaleString('en-IN')} required for this coupon!`,
      };
    }

    setAppliedCoupon(matched);
    return {
      success: true,
      message:
        language === 'ml'
          ? `കൂപ്പൺ ${matched.code} വിജയകരമായി ചേർത്തു! (${matched.discountPercentage}% കിഴിവ് ലഭിച്ചു)`
          : `Coupon ${matched.code} applied successfully! (${matched.discountPercentage}% OFF)`,
    };
  };

  // Customer Registration / Sign-in Success
  const handleCustomerAuthSuccess = async (u: CustomerUser) => {
    // If Studio was logged in, log out Studio Partner mode so there is no confusion
    if (studioUser) {
      setStudioUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('framlu_studio_partner');
        localStorage.removeItem('wedding_studio_user');
      }
    }

    setCustomerUser(u);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_user', JSON.stringify(u));
    }

    const isStandalone = activeLead?.leadType === 'standalone_photoshoot' && selectedPhotoshoot !== 'wedding';
    const baseSub = isStandalone
      ? (activeLead.totalPrice || activeLead.photoshootDetails?.totalPrice || calculation.totalPrice)
      : calculation.totalPrice;

    const discountPct = appliedCoupon?.discountPercentage || 0;
    const discountAmt = discountPct > 0 ? Math.round((baseSub * discountPct) / 100) : 0;
    const discountedTotal = Math.max(0, baseSub - discountAmt);
    const tax = Math.round(discountedTotal * 0.18);

    const newLead: CustomerLead = {
      id: `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: u.name,
      phone: u.phone,
      email: u.email,
      address: u.address,
      place: u.place,
      weddingDate: isStandalone ? (activeLead.photoshootDetails?.date || activeLead.weddingDate || '2026-12-20') : (activeLead.weddingDate || '2026-12-20'),
      venueLocation: isStandalone ? (activeLead.photoshootDetails?.venueLocation || activeLead.venueLocation || u.place) : (activeLead.venueLocation || u.place),
      status: 'New',
      leadType: isStandalone ? 'standalone_photoshoot' : 'wedding',
      photoshootType: isStandalone ? activeLead.photoshootType : undefined,
      photoshootDetails: isStandalone ? activeLead.photoshootDetails : undefined,
      side,
      groomEvents: isStandalone ? undefined : groomEvents,
      brideEvents: isStandalone ? undefined : brideEvents,
      deliverables: isStandalone && activeLead.photoshootDetails?.deliverables ? activeLead.photoshootDetails.deliverables : deliverables,
      selectedServices: selectedOtherServices,
      totalPrice: baseSub,
      couponCode: appliedCoupon?.code,
      discountPercentage: discountPct,
      discountAmount: discountAmt,
      grandTotalAfterDiscount: discountedTotal,
      taxAmount: tax,
      grandTotal: discountedTotal + tax,
      source: 'customer',
      createdBy: 'customer',
      createdAt: new Date().toISOString(),
    };

    setActiveLead(newLead);

    // Auto record in CRM leads (Local & Cloud Firestore)
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    // Save to Cloud Firestore in background
    await saveLeadToCloud(newLead);
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('framlu_wedding_user');
      localStorage.removeItem('lumina_wedding_user');
    }
  };

  // Studio Partner login handlers (Requirement 2: If customer is logged in, log out customer first)
  const handleOpenStudioAuthModal = () => {
    if (customerUser) {
      handleCustomerLogout();
    }
    setIsStudioAuthModalOpen(true);
  };

  const handleStudioAuthSuccess = (st: StudioUser) => {
    // Ensure customer user is logged out when studio partner logs in
    handleCustomerLogout();
    setStudioUser(st);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_studio_partner', JSON.stringify(st));
      localStorage.setItem('wedding_studio_user', JSON.stringify(st));
    }
  };

  const handleStudioLogout = () => {
    setStudioUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('framlu_studio_partner');
      localStorage.removeItem('wedding_studio_user');
    }
  };

  // PDF Quotation Lead Submit
  const handleLeadSubmit = async (leadData: CustomerLead) => {
    const isStandalone = activeLead?.leadType === 'standalone_photoshoot' && selectedPhotoshoot !== 'wedding';
    const baseSub = isStandalone
      ? (activeLead.totalPrice || activeLead.photoshootDetails?.totalPrice || calculation.totalPrice)
      : calculation.totalPrice;

    const discountPct = appliedCoupon?.discountPercentage || 0;
    const discountAmt = discountPct > 0 ? Math.round((baseSub * discountPct) / 100) : 0;
    const discountedTotal = Math.max(0, baseSub - discountAmt);
    const tax = Math.round(discountedTotal * 0.18);
    const isStudio = !!studioUser;

    const fullLead: CustomerLead = {
      ...leadData,
      id: leadData.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      leadType: isStandalone ? 'standalone_photoshoot' : 'wedding',
      photoshootType: isStandalone ? activeLead.photoshootType : undefined,
      photoshootDetails: isStandalone ? activeLead.photoshootDetails : undefined,
      side,
      groomEvents: isStandalone ? undefined : groomEvents,
      brideEvents: isStandalone ? undefined : brideEvents,
      deliverables: isStandalone && activeLead.photoshootDetails?.deliverables ? activeLead.photoshootDetails.deliverables : deliverables,
      selectedServices: selectedOtherServices,
      totalPrice: baseSub,
      couponCode: appliedCoupon?.code,
      discountPercentage: discountPct,
      discountAmount: discountAmt,
      grandTotalAfterDiscount: discountedTotal,
      taxAmount: tax,
      grandTotal: discountedTotal + tax,
      source: isStudio ? 'studio' : 'customer',
      createdBy: isStudio ? 'studio' : 'customer',
      studioBranding: studioUser || undefined,
      createdAt: new Date().toISOString(),
    };

    setActiveLead(fullLead);
    setIsLeadModalOpen(false);

    setLeads((prev) => {
      const updated = [fullLead, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    // Save lead to Cloud Firestore
    await saveLeadToCloud(fullLead);

    setIsPdfModalOpen(true);
  };

  // Handle Board selection from Offers tab
  const handleSelectBoard = (board: HighlightBoard) => {
    handleApplyHighlightBoard(board);
    setActiveTab('studio');
    if (!customerUser && !studioUser) {
      setIsCustomerAuthModalOpen(true);
    }
  };

  const isMl = language === 'ml';

  return (
    <div className="min-h-screen bg-stone-50 pb-28 lg:pb-12 text-stone-900">
      {/* Navigation Header (Frontend - Clear active mode highlight) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCustomerAuthModal={() => {
          if (studioUser) {
            handleStudioLogout();
          }
          setIsCustomerAuthModalOpen(true);
        }}
        customerUser={customerUser}
        onCustomerLogout={handleCustomerLogout}
        studioUser={studioUser}
        openStudioAuthModal={handleOpenStudioAuthModal}
        onStudioLogout={handleStudioLogout}
        studioContact={studioContact}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Hero Section (Visible in Studio and Offers) */}
      {(activeTab === 'studio' || activeTab === 'offers') && (
        <section className="bg-gradient-to-b from-stone-900 via-stone-900 to-stone-800 text-white py-12 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4a323_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Framelu Wedding Company
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
              {isMl ? 'നിങ്ങളുടെ വിവാഹ ഫോട്ടോഗ്രാഫി പാക്കേജ്' : 'Customize Your Wedding Photography'} <br />
              <span className="bg-gradient-to-r from-amber-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                {isMl ? 'തത്സമയം കസ്റ്റമൈസ് ചെയ്യാം' : 'Live & Completely Transparent'}
              </span>
            </h1>
            <p className="text-stone-300 text-xs sm:text-base max-w-2xl mx-auto mt-3 font-normal leading-relaxed">
              {isMl
                ? 'വരന്റെയും വധുവിന്റെയും ഭാഗത്തെ ചടങ്ങുകൾ, ഫോട്ടോഗ്രാഫർമാർ, 4K വീഡിയോ, ആൽബങ്ങൾ, ഫ്രെയിമുകൾ എന്നിവ തിരഞ്ഞെടുത്ത് കൃത്യമായ ബഡ്ജറ്റ് എസ്റ്റിമേറ്റ് അറിയൂ.'
                : 'Select Bride & Groom ceremonies, venue locations, cinematography crew, 4K video, albums and preset frames with instant live pricing.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6 text-xs text-stone-300">
              <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{studioContact.destination}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isMl ? '100% ഫ്ലെക്സിബിൾ പ്രൈസിംഗ്' : '100% Transparent Rates'}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                <span>{isMl ? 'ഇൻസ്റ്റന്റ് PDF കൊട്ടേഷൻ' : 'Instant PDF Quotation'}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 1. Main Studio Customizer Tab */}
      {activeTab === 'studio' && (
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Customer Verification Gate Banner */}
          {!customerUser ? (
            <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-rosewood-500/10 to-amber-500/10 rounded-3xl border-2 border-dashed border-amber-400/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {isMl
                      ? 'കസ്റ്റം പാക്കേജ് തയ്യാറാക്കാൻ നിങ്ങളുടെ വിവരങ്ങൾ നൽകുക'
                      : 'Unlock Full Custom Photography Package Access'}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    {isMl
                      ? 'നിങ്ങളുടെ പേര്, ഫോൺ നമ്പർ, ഇമെയിൽ, മേൽവിലാസം, സ്ഥലം എന്നിവ നൽകി ലോഗിൻ ചെയ്തതിനു ശേഷം മാത്രമേ പാക്കേജ് കസ്റ്റമൈസ് ചെയ്യാൻ സാധിക്കൂ.'
                      : 'Please sign in with your Name, Mobile, Email, Address, and Place to unlock full customization for all events and deliverables.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomerAuthModalOpen(true)}
                className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md transition hover:shadow-lg"
              >
                <span>{isMl ? 'സൈൻ-ഇൻ ചെയ്ത് കസ്റ്റമൈസ് ചെയ്യുക' : 'Sign In to Customize'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isMl ? 'ലോഗിൻ ചെയ്തിരിക്കുന്നു:' : 'Signed in as:'}{' '}
                  <strong className="font-extrabold">{customerUser.name}</strong> ({customerUser.place} • {customerUser.phone})
                </span>
              </div>
              <span className="text-[10px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                {isMl ? 'കസ്റ്റം എഡിറ്റിംഗ് സജീവം' : 'Custom Editing Active'}
              </span>
            </div>
          )}

          {/* Photoshoot Types Switcher & Dedicated Customizer */}
          <PhotoshootSection
            language={language}
            selectedPhotoshoot={selectedPhotoshoot}
            onSelectPhotoshoot={(shoot) => {
              setSelectedPhotoshoot(shoot);
              if (shoot === 'wedding') {
                setActiveLead((prev) => ({
                  ...prev,
                  leadType: 'wedding',
                  photoshootType: undefined,
                  photoshootDetails: undefined,
                  totalPrice: calculation.totalPrice,
                }));
              }
            }}
            photoshoots={photoshoots}
            rates={rates}
            onAddAsAddon={(service) => {
              setSelectedOtherServices((prev) => {
                const filtered = prev.filter((s) => s.packageId !== service.packageId);
                return [...filtered, service];
              });
              // Clear standalone mode and reset to wedding package mode
              setActiveLead((prev) => ({
                ...prev,
                leadType: 'wedding',
                photoshootType: undefined,
                photoshootDetails: undefined,
                totalPrice: calculation.totalPrice,
              }));
            }}
            onRemoveAddon={(packageId) => {
              setSelectedOtherServices((prev) => prev.filter((s) => s.packageId !== packageId));
            }}
            isAddonSelected={(packageId) => selectedOtherServices.some((s) => s.packageId === packageId)}
            onInstantStandaloneQuote={(shootSummary) => {
              const isStudio = !!studioUser;
              setActiveLead((prev) => ({
                ...prev,
                totalPrice: shootSummary.price,
                notes: shootSummary.notes,
                leadType: 'standalone_photoshoot',
                photoshootType: shootSummary.photoshootType,
                photoshootDetails: shootSummary.photoshootDetails,
                source: isStudio ? 'studio' : 'customer',
                createdBy: isStudio ? 'studio' : 'customer',
                studioBranding: studioUser || undefined,
              }));
              if (!customerUser && !studioUser) {
                setIsCustomerAuthModalOpen(true);
              } else {
                setIsLeadModalOpen(true);
              }
            }}
            studioContact={studioContact}
          />

          {/* Wedding Customizer (Rendered when Wedding is active or when building package) */}
          {selectedPhotoshoot === 'wedding' && (
            <>
              {/* Popular Wedding Package Plans Highlight Bar */}
              <div className="mb-8 p-5 sm:p-6 bg-gradient-to-br from-amber-500/10 via-stone-100 to-amber-500/5 rounded-3xl border border-amber-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-stone-900">
                    <Sparkles className="w-3 h-3" />
                    {isMl ? 'ജനപ്രിയ പാക്കേജുകൾ' : 'Popular Highlight Plans'}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    {isMl ? '• ക്ലിക്ക് ചെയ്ത് കസ്റ്റമൈസ് ചെയ്യാം' : '• Click any card to customize'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {isMl ? 'പ്രധാന വിവാഹ പാക്കേജ് പ്ലാനുകൾ' : 'Popular Wedding Package Plans'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  {isMl
                    ? 'ഒരു റെഡിമെയ്ഡ് പാക്കേജ് തിരഞ്ഞെടുത്ത് തത്സമയം മാറ്റങ്ങൾ വരുത്താം. അല്ലെങ്കിൽ താഴെ നിന്നും ₹0 മുതൽ സ്വയം ബിൽഡ് ചെയ്യാം.'
                    : 'Select a curated package to start with, or customize crew, 4K video & albums completely from ₹0 below.'}
                </p>
              </div>

              {calculation.totalPrice > 0 && (
                <button
                  type="button"
                  onClick={handleResetToZero}
                  className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs"
                  title="Clear estimate back to ₹0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isMl ? 'എസ്റ്റിമേറ്റ് ₹0 ആക്കുക' : 'Reset Estimate (₹0)'}</span>
                </button>
              )}
            </div>

            {/* Package Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {highlightBoards.map((board) => {
                const isActive =
                  activePackageBoard?.id === board.id ||
                  (calculation.totalPrice > 0 && Math.abs(calculation.totalPrice - board.price) < 100);

                return (
                  <div
                    key={board.id}
                    onClick={() => handleApplyHighlightBoard(board)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleApplyHighlightBoard(board);
                      }
                    }}
                    className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none group hover:-translate-y-0.5 ${
                      isActive
                        ? 'bg-gradient-to-b from-amber-500/25 via-amber-100/70 to-white border-2 border-amber-500 shadow-xl ring-4 ring-amber-400/30 scale-[1.01]'
                        : board.popular
                        ? 'bg-gradient-to-b from-amber-500/10 via-white to-amber-50/40 border-2 border-amber-300 shadow-md hover:border-amber-400 hover:shadow-lg'
                        : 'bg-white border border-stone-250 shadow-xs hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    {isActive ? (
                      <span className="absolute -top-3.5 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-md flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {isMl ? 'നിലവിലെ പാക്കേജ്' : 'Currently Active Plan'}
                      </span>
                    ) : board.tag ? (
                      <span
                        className={`absolute -top-3.5 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${
                          board.popular
                            ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
                            : 'bg-stone-850 text-amber-300'
                        }`}
                      >
                        {board.tag}
                      </span>
                    ) : null}

                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-lg font-black text-stone-900 leading-snug group-hover:text-amber-800 transition">
                          {isMl && board.titleMl ? board.titleMl : board.title}
                        </h3>
                      </div>
                      {board.titleMl && !isMl && (
                        <p className="text-[11px] text-stone-500 font-medium mb-1">{board.titleMl}</p>
                      )}

                      <div className="my-3.5 flex items-baseline gap-2 pb-3 border-b border-stone-150">
                        <span className="text-3xl font-black text-stone-900 tracking-tight">
                          ₹{board.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-stone-500 font-bold">
                          {isMl ? '+ നികുതി' : '+ GST'}
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 mb-4 leading-relaxed line-clamp-2">
                        {board.description}
                      </p>

                      <div className="space-y-2 mb-5 text-xs text-stone-750 font-medium">
                        {board.features.slice(0, 4).map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyHighlightBoard(board);
                      }}
                      className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : board.popular
                          ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white shadow-md hover:shadow-lg'
                          : 'bg-stone-900 hover:bg-stone-850 text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isActive ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{isMl ? 'പാക്കേജ് സെലക്ട് ചെയ്തിരിക്കുന്നു' : 'Active Plan Selected'}</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300" />
                          <span>{isMl ? 'കസ്റ്റം ദിസ് പ്ലാൻ' : 'Customize This Plan'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="wedding-customizer-section" className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Customizer Main Columns */}
            <div
              className={`flex-1 w-full min-w-0 transition-opacity ${
                !customerUser ? 'opacity-85 pointer-events-auto' : ''
              }`}
              onClickCapture={(e) => {
                if (!customerUser) {
                  setIsCustomerAuthModalOpen(true);
                }
              }}
            >
              {/* Step 1: Side Selector */}
              <SideSelector
                selectedSide={side}
                onSelectSide={setSide}
                language={language}
              />

              {/* Step 2: Events & Crew Customizer with Venue & Date */}
              <EventsCrewCustomizer
                side={side}
                groomEvents={groomEvents}
                brideEvents={brideEvents}
                setGroomEvents={setGroomEvents}
                setBrideEvents={setBrideEvents}
                rates={rates}
                language={language}
              />

              {/* Step 3: Deliverables & Merchandise Customizer with Teaser */}
              <DeliverablesCustomizer
                deliverables={deliverables}
                setDeliverables={setDeliverables}
                rates={rates}
                language={language}
                customPrintItems={customPrintItems}
                onNavigateToOtherServices={() => {
                  setActiveTab('services');
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 50);
                }}
              />
            </div>

            {/* Right Column: Live Sticky Summary Bar */}
            <LiveStickyPricing
              calculation={calculation}
              onRemoveItem={handleRemoveItem}
              onReset={handleResetToZero}
              onOpenLeadModal={() => {
                setActiveLead((prev) => ({
                  ...prev,
                  leadType: 'wedding',
                  photoshootType: undefined,
                  photoshootDetails: undefined,
                  totalPrice: calculation.totalPrice,
                }));
                if (!customerUser && !studioUser) {
                  setIsCustomerAuthModalOpen(true);
                } else {
                  setIsLeadModalOpen(true);
                }
              }}
              language={language}
              whatsappNumber={studioContact.whatsapp}
              coupons={coupons}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => setAppliedCoupon(null)}
              onNavigateToOtherServices={() => {
                setActiveTab('services');
                setTimeout(() => {
                  const el = document.getElementById('other-services-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }, 80);
              }}
              onNavigateToPhotography={() => {
                setActiveTab('studio');
                setTimeout(() => {
                  const el = document.getElementById('wedding-customizer-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }, 80);
              }}
            />
          </div>
          </>
          )}
        </main>
      )}

      {/* 2. Offers & Highlight Boards Tab */}
      {activeTab === 'offers' && (
        <OffersAndHighlightBoards
          offers={offers}
          highlightBoards={highlightBoards}
          studioContact={studioContact}
          onSelectBoard={handleSelectBoard}
          language={language}
        />
      )}

      {/* 3. Other Services Tab (Food Catering, Stage Decor, Bridal Makeup, Luxury Cars, Cards, Honeymoon) */}
      {activeTab === 'services' && (
        <OtherServicesSection
          language={language}
          studioContact={studioContact}
          categories={categories}
          packages={otherServices}
          selectedServices={selectedOtherServices}
          onAddService={(service) => {
            setSelectedOtherServices((prev) => {
              const filtered = prev.filter((s) => s.packageId !== service.packageId);
              return [...filtered, service];
            });
          }}
          onRemoveService={(packageId) => {
            setSelectedOtherServices((prev) => prev.filter((s) => s.packageId !== packageId));
          }}
          onNavigateToCustomizer={(shootType) => {
            setActiveTab('studio');
            if (shootType) {
              setSelectedPhotoshoot(shootType as PhotoshootType);
            }
            setTimeout(() => {
              const el = document.getElementById('photoshoot-catalog-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 60);
          }}
          onProceedToQuotation={() => {
            setActiveLead((prev) => ({
              ...prev,
              leadType: 'wedding',
              photoshootType: undefined,
              photoshootDetails: undefined,
              totalPrice: calculation.totalPrice,
            }));
            if (!customerUser && !studioUser) {
              setIsCustomerAuthModalOpen(true);
            } else {
              setIsLeadModalOpen(true);
            }
          }}
        />
      )}

      {/* 4. Gallery & Works Showcase Tab with Category Filters & Customer Reviews */}
      {activeTab === 'gallery' && (
        <GallerySection
          projects={galleryProjects}
          language={language}
          studioContact={studioContact}
          onNavigateToCustomizer={() => setActiveTab('studio')}
        />
      )}

      {/* Customer Registration / Sign In Modal */}
      <CustomerAuthModal
        isOpen={isCustomerAuthModalOpen}
        onClose={() => setIsCustomerAuthModalOpen(false)}
        onSuccess={handleCustomerAuthSuccess}
        language={language}
      />

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
        initialLead={activeLead}
        totalPrice={calculation.totalPrice}
        language={language}
      />

      {/* Studio Partner Registration / Login Modal (B2B Studio Portal) */}
      <StudioAuthModal
        isOpen={isStudioAuthModalOpen}
        onClose={() => setIsStudioAuthModalOpen(false)}
        onSuccess={handleStudioAuthSuccess}
        language={language}
      />

      {/* Branded PDF Quotation View Modal with Back & Edit, WhatsApp Enquiry, 18% Tax, Divided Milestones, Other Services */}
      <PdfQuotationView
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        lead={activeLead}
        side={side}
        calculation={calculation}
        studioContact={studioContact}
        language={language}
        groomEvents={groomEvents}
        brideEvents={brideEvents}
        deliverables={deliverables}
        customPrintItems={customPrintItems}
        selectedServices={selectedOtherServices}
        appliedCoupon={appliedCoupon}
        studioUser={studioUser}
      />
    </div>
  );
}
