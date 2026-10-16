'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  AirlineReservation,
  CustomerAccessRequest,
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
  deleteLeadFromCloud,
  subscribeCoupons,
  subscribePhotoshoots,
  saveCustomerUserToCloud,
} from '@/lib/firestoreSync';
import { SidebarNav, MainNavTab } from '@/components/SidebarNav';
import { RoleAuthModal } from '@/components/RoleAuthModal';
import { QuotesDashboard } from '@/components/QuotesDashboard';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { SideSelector } from '@/components/SideSelector';
import { EventsCrewCustomizer } from '@/components/EventsCrewCustomizer';
import { DeliverablesCustomizer } from '@/components/DeliverablesCustomizer';
import { LiveStickyPricing } from '@/components/LiveStickyPricing';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { CustomerAuthModal } from '@/components/CustomerAuthModal';
import { CustomerDashboardModal } from '@/components/CustomerDashboardModal';
import { StudioAuthModal } from '@/components/StudioAuthModal';
import { PdfQuotationView } from '@/components/PdfQuotationView';
import { OtherServicesSection } from '@/components/OtherServicesSection';
import { OffersAndHighlightBoards } from '@/components/OffersAndHighlightBoards';
import { GallerySection } from '@/components/GallerySection';
import { PhotoshootSection } from '@/components/PhotoshootSection';
import { AiPlannerModal } from '@/components/AiPlannerModal';
import { AiChatbotWidget } from '@/components/AiChatbotWidget';
import { AppUserSession } from '@/types';
import {
  Sparkles,
  MapPin,
  Heart,
  Shield,
  Lock,
  LogIn,
  UserCheck,
  ArrowRight,
  Gift,
  CheckCircle2,
  RotateCcw,
  Check,
  Layers,
  Zap,
  Camera,
  Cake,
  Baby,
  GlassWater,
  Shirt,
} from 'lucide-react';

export default function Home() {
  // Language State: Defaults to 'en' (English) as requested by user!
  const [language, setLanguage] = useState<'en' | 'ml'>('en');

  // Main Left Sidebar Navigation tabs: 'dashboard' | 'new_quote' | 'quotes' | 'packages' | 'services' | 'gallery' | 'admin'
  const [currentNavTab, setCurrentNavTab] = useState<MainNavTab>('dashboard');

  // Unified Role User Session & Entry Authentication Modal (Requirement 2)
  const [userSession, setUserSession] = useState<AppUserSession | null>(null);
  const [isRoleAuthModalOpen, setIsRoleAuthModalOpen] = useState(false);

  // WhatsApp Share Modal (Requirement 4)
  const [isWhatsAppShareModalOpen, setIsWhatsAppShareModalOpen] = useState(false);
  const [selectedShareLead, setSelectedShareLead] = useState<CustomerLead | null>(null);

  // Service Type inside New Quote Builder: 'wedding' | 'photoshoot' | 'other_services' (Requirement 2 & 3)
  const [quoteServiceType, setQuoteServiceType] = useState<'wedding' | 'photoshoot' | 'other_services'>('wedding');

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
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isCustomerDashboardOpen, setIsCustomerDashboardOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);

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
  const [leads, setLeads] = useState<CustomerLead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });
  const [activeLead, setActiveLead] = useState<CustomerLead>({
    name: '',
    phone: '',
    email: '',
    address: '',
    place: 'കായംകുളം',
    weddingDate: '',
    venueLocation: '',
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
          const parsed = JSON.parse(savedLeads);
          const cleanLeads = Array.isArray(parsed)
            ? parsed.filter(
                (l: any) =>
                  !(l.name === 'Arun Krishna' && (l.phone === '9847123456' || l.email === 'arun.krishna@gmail.com')) &&
                  l.id !== 'FWC-QUOTE' &&
                  l.id !== 'FWC-2026-DUMMY'
              )
            : [];
          setLeads(cleanLeads);
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

      const savedUserSession = localStorage.getItem('lfb_user_session');
      if (savedUserSession) {
        try {
          const uSession = JSON.parse(savedUserSession);
          setUserSession(uSession);
        } catch (e) {
          console.error(e);
        }
      } else {
        // First visit: ask if Customer or Studio (Requirement 2)
        setIsRoleAuthModalOpen(true);
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
    const unsubLeads = subscribeCustomerLeads((l) => {
      const cleanLeads = l.filter(
        (lead) =>
          !(lead.name === 'Arun Krishna' && (lead.phone === '9847123456' || lead.email === 'arun.krishna@gmail.com')) &&
          lead.id !== 'FWC-QUOTE' &&
          lead.id !== 'FWC-2026-DUMMY'
      );
      setLeads(cleanLeads);
    });
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

  // Apply AI Smart Package directly into Live Planner
  const handleApplyAiPackage = (config: {
    crew: any;
    deliverables: any;
  }) => {
    if (!userSession) {
      setIsRoleAuthModalOpen(true);
      return;
    }
    // Switch to wedding photoshoot mode and quote builder
    setSelectedPhotoshoot('wedding');
    setQuoteServiceType('wedding');
    setCurrentNavTab('new_quote');
    setActivePackageBoard(null);
    setPackageDiscount(0);

    // Update wedding day crew for groom
    setGroomEvents((prev) => {
      const current = prev.wedding_day || {
        enabled: true,
        venue: '',
        date: '',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: 0,
        candidVideographers: 0,
        drone: false,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      };
      return {
        ...prev,
        wedding_day: {
          ...current,
          enabled: true,
          traditionalPhotographers: config.crew.traditionalPhotographers ?? config.crew.photographers ?? current.traditionalPhotographers,
          traditionalVideographers: config.crew.traditionalVideographers ?? config.crew.videographers ?? current.traditionalVideographers,
          candidPhotographers: config.crew.candidPhotographers ?? current.candidPhotographers,
          candidVideographers: config.crew.candidVideographers ?? config.crew.cinematicVideographers ?? current.candidVideographers,
          drone: config.crew.drone !== undefined ? config.crew.drone : (config.crew.dronePilots !== undefined ? config.crew.dronePilots > 0 : current.drone),
        },
      };
    });

    // Update wedding day crew for bride if applicable
    if (side === 'both' || side === 'bride') {
      setBrideEvents((prev) => {
        const current = prev.wedding_day || {
          enabled: true,
          venue: '',
          date: '',
          traditionalPhotographers: 1,
          traditionalVideographers: 1,
          candidPhotographers: 0,
          candidVideographers: 0,
          drone: false,
          youtubeLive: false,
          auditoriumLive: false,
          photoLivePrinting: false,
        };
        return {
          ...prev,
          wedding_day: {
            ...current,
            enabled: true,
            traditionalPhotographers: config.crew.traditionalPhotographers ?? config.crew.photographers ?? current.traditionalPhotographers,
            traditionalVideographers: config.crew.traditionalVideographers ?? config.crew.videographers ?? current.traditionalVideographers,
            candidPhotographers: config.crew.candidPhotographers ?? current.candidPhotographers,
            candidVideographers: config.crew.candidVideographers ?? config.crew.cinematicVideographers ?? current.candidVideographers,
            drone: config.crew.drone !== undefined ? config.crew.drone : (config.crew.dronePilots !== undefined ? config.crew.dronePilots > 0 : current.drone),
          },
        };
      });
    }

    // Update deliverables
    setDeliverables((prev) => ({
      ...prev,
      mainAlbumsCount: 1,
      mainAlbumSheets: config.deliverables.albumSheets || prev.mainAlbumSheets || 30,
      albumPaperType:
        config.deliverables.albumType === 'canvera'
          ? 'canvera'
          : config.deliverables.albumType === 'feather_touch'
          ? 'glass'
          : 'premium',
      teaserVideo: config.deliverables.teaserVideo ?? prev.teaserVideo,
      highlightVideo: config.deliverables.highlightFilm ?? prev.highlightVideo,
      fullLengthVideo: config.deliverables.fullDocumentary ?? prev.fullLengthVideo,
      reelsCount: config.deliverables.teaserVideo ? 2 : prev.reelsCount,
    }));

    // Scroll to customizer smoothly
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
    const session: AppUserSession = {
      role: 'customer',
      name: u.name,
      userId: u.username || u.userId || (u.email ? u.email.split('@')[0] : 'customer'),
      phone: u.phone,
      email: u.email,
      address: u.address,
      place: u.place || 'കായംകുളം',
      loggedInAt: new Date().toISOString(),
    };
    setUserSession(session);

    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_user', JSON.stringify(u));
      localStorage.setItem('lfb_user_session', JSON.stringify(session));
    }

    // Save/update user profile in Cloud Firestore
    saveCustomerUserToCloud(u).catch((err) => console.warn('Background save customer user note:', err));

    // Check if this customer already has existing saved leads by email, phone, or userId
    const cleanEmail = u.email?.trim().toLowerCase();
    const cleanPhone = u.phone?.replace(/\D/g, '').slice(-10);
    const cleanUserId = (u.username || u.userId || '').trim().toLowerCase();

    let candidateLeads = leads;
    if (candidateLeads.length === 0 && typeof window !== 'undefined') {
      const savedLeadsRaw = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      if (savedLeadsRaw) {
        try { candidateLeads = JSON.parse(savedLeadsRaw); } catch (e) {}
      }
    }

    const existingCustomerLead = candidateLeads.find((l) => {
      const lEmail = l.email?.trim().toLowerCase();
      const lPhone = (l.phone || '').replace(/\D/g, '').slice(-10);
      const lUserId = (l.userId || l.createdByUserId || '').trim().toLowerCase();
      return (
        (cleanEmail && lEmail === cleanEmail) ||
        (cleanPhone && lPhone === cleanPhone) ||
        (cleanUserId && lUserId === cleanUserId)
      );
    });

    if (existingCustomerLead) {
      // Restore customer's latest saved configuration so they can continue seamlessly
      if (existingCustomerLead.side) setSide(existingCustomerLead.side);
      if (existingCustomerLead.groomEvents) setGroomEvents(existingCustomerLead.groomEvents);
      if (existingCustomerLead.brideEvents) setBrideEvents(existingCustomerLead.brideEvents);
      if (existingCustomerLead.deliverables) setDeliverables(existingCustomerLead.deliverables);
      if (existingCustomerLead.selectedServices) setSelectedOtherServices(existingCustomerLead.selectedServices);
      if (existingCustomerLead.couponCode) {
        const found = coupons.find((c) => c.code === existingCustomerLead.couponCode);
        if (found) setAppliedCoupon(found);
      }
      setActiveLead(existingCustomerLead);
    } else {
      // First time lead creation for new email
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
        userId: session.userId,
        address: u.address,
        place: u.place,
        weddingDate: isStandalone ? (activeLead.photoshootDetails?.date || activeLead.weddingDate || '2026-12-20') : (activeLead.weddingDate || '2026-12-20'),
        venueLocation: isStandalone ? (activeLead.photoshootDetails?.venueLocation || activeLead.venueLocation || u.place) : (activeLead.venueLocation || u.place),
        status: 'Access Sent',
        leadType: isStandalone ? 'standalone_photoshoot' : 'wedding',
        photoshootType: isStandalone ? activeLead.photoshootType : undefined,
        photoshootDetails: isStandalone ? activeLead.photoshootDetails : undefined,
        side,
        groomEvents: isStandalone ? undefined : groomEvents,
        brideEvents: isStandalone ? undefined : brideEvents,
        deliverables: isStandalone && activeLead.photoshootDetails?.deliverables ? activeLead.photoshootDetails.deliverables : deliverables,
        selectedServices: selectedOtherServices,
        airlineReservations: u.airlineReservations || [],
        accessRequests: [
          {
            id: `ACC-INIT-${Date.now().toString().slice(-5)}`,
            title: `Customer Registered & Quotation Access Initialized`,
            titleMl: `കസ്റ്റമർ രജിസ്റ്റർ ചെയ്തു, കൊട്ടേഷൻ ആക്സസ് തയ്യാറായി`,
            type: 'quotation_access',
            requestedAt: new Date().toISOString(),
            status: 'Sent',
            notes: `Customer Email: ${u.email}`,
          },
        ],
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
    }

    // Proactively open Customer Dashboard so they can immediately see their data!
    setIsCustomerDashboardOpen(true);
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    setIsCustomerDashboardOpen(false);
    setEditingLeadId(null);
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

  // 1. Edit existing saved bill from Customer Dashboard
  const handleEditBill = (leadToEdit: CustomerLead) => {
    if (!userSession) {
      setIsRoleAuthModalOpen(true);
      return;
    }
    setEditingLeadId(leadToEdit.id || null);
    if (leadToEdit.side) setSide(leadToEdit.side);
    if (leadToEdit.groomEvents) setGroomEvents(leadToEdit.groomEvents);
    if (leadToEdit.brideEvents) setBrideEvents(leadToEdit.brideEvents);
    if (leadToEdit.deliverables) setDeliverables(leadToEdit.deliverables);
    if (leadToEdit.selectedServices) setSelectedOtherServices(leadToEdit.selectedServices);
    if (leadToEdit.couponCode) {
      const foundCoupon = coupons.find((c) => c.code === leadToEdit.couponCode);
      if (foundCoupon) setAppliedCoupon(foundCoupon);
    }
    if (leadToEdit.leadType === 'standalone_photoshoot' && leadToEdit.photoshootType) {
      setSelectedPhotoshoot(leadToEdit.photoshootType);
    }
    setActiveLead(leadToEdit);
    setCurrentNavTab('new_quote');
    if (leadToEdit.leadType === 'standalone_photoshoot') {
      setQuoteServiceType('photoshoot');
    } else {
      setQuoteServiceType('wedding');
    }

    // Smooth scroll to customizer
    if (typeof window !== 'undefined') {
      const builderEl = document.getElementById('wedding-builder');
      if (builderEl) {
        builderEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }
  };

  // 2. Resubmit / Re-send bill with updated timestamp and status
  const handleResubmitBill = async (leadToUpdate: CustomerLead) => {
    const updatedLead: CustomerLead = {
      ...leadToUpdate,
      lastEditedAt: new Date().toISOString(),
      revisionsCount: (leadToUpdate.revisionsCount || 0) + 1,
      status: 'Re-submitted',
    };

    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === updatedLead.id ? updatedLead : l));
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    await saveLeadToCloud(updatedLead);
  };

  // 3. Save currently edited bill from top banner
  const handleSaveEditedCurrentBill = async () => {
    if (!editingLeadId) return;

    const baseSub = calculation.totalPrice;
    const discountPct = appliedCoupon?.discountPercentage || 0;
    const discountAmt = discountPct > 0 ? Math.round((baseSub * discountPct) / 100) : 0;
    const discountedTotal = Math.max(0, baseSub - discountAmt);
    const tax = Math.round(discountedTotal * 0.18);

    const updatedLead: CustomerLead = {
      ...activeLead,
      id: editingLeadId,
      side,
      groomEvents,
      brideEvents,
      deliverables,
      selectedServices: selectedOtherServices,
      totalPrice: baseSub,
      couponCode: appliedCoupon?.code,
      discountPercentage: discountPct,
      discountAmount: discountAmt,
      grandTotalAfterDiscount: discountedTotal,
      taxAmount: tax,
      grandTotal: discountedTotal + tax,
      lastEditedAt: new Date().toISOString(),
      revisionsCount: (activeLead.revisionsCount || 0) + 1,
      status: 'Re-submitted',
    };

    setActiveLead(updatedLead);
    setEditingLeadId(null);

    setLeads((prev) => {
      const exists = prev.some((l) => l.id === updatedLead.id);
      const updated = exists ? prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)) : [updatedLead, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    await saveLeadToCloud(updatedLead);
    setIsPdfModalOpen(true);
  };

  // 4. Update Customer Airline Reservations in profile and Firestore
  const handleUpdateCustomerReservations = async (newReservations: AirlineReservation[]) => {
    if (customerUser) {
      const updatedUser: CustomerUser = {
        ...customerUser,
        airlineReservations: newReservations,
      };
      setCustomerUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_user', JSON.stringify(updatedUser));
      }

      if (activeLead && activeLead.email?.toLowerCase().trim() === customerUser.email.toLowerCase().trim()) {
        const updatedLead: CustomerLead = {
          ...activeLead,
          airlineReservations: newReservations,
          lastEditedAt: new Date().toISOString(),
        };
        setActiveLead(updatedLead);
        await saveLeadToCloud(updatedLead);
      }
    }
  };

  // 5. Send Customer Access Request to Studio
  const handleSendCustomerAccessRequest = async (request: CustomerAccessRequest) => {
    if (customerUser) {
      const currentReqs = customerUser.accessRequests || [];
      const updatedReqs = [request, ...currentReqs];
      const updatedUser: CustomerUser = {
        ...customerUser,
        accessRequests: updatedReqs,
      };
      setCustomerUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_user', JSON.stringify(updatedUser));
      }

      if (activeLead && activeLead.email?.toLowerCase().trim() === customerUser.email.toLowerCase().trim()) {
        const updatedLead: CustomerLead = {
          ...activeLead,
          accessRequests: updatedReqs,
          lastEditedAt: new Date().toISOString(),
        };
        setActiveLead(updatedLead);
        await saveLeadToCloud(updatedLead);
      }
    }
  };

  // PDF Quotation Lead Submit (Handles new lead or updating existing edited lead)
  const handleLeadSubmit = async (leadData: CustomerLead) => {
    const isStandalone = activeLead?.leadType === 'standalone_photoshoot' && selectedPhotoshoot !== 'wedding';
    const baseSub = isStandalone
      ? (activeLead.totalPrice || activeLead.photoshootDetails?.totalPrice || calculation.totalPrice)
      : calculation.totalPrice;

    const discountPct = appliedCoupon?.discountPercentage || 0;
    const discountAmt = discountPct > 0 ? Math.round((baseSub * discountPct) / 100) : 0;
    const discountedTotal = Math.max(0, baseSub - discountAmt);
    const tax = Math.round(discountedTotal * 0.18);
    const isStudio = userSession?.role === 'studio' || !!studioUser;

    const targetId = editingLeadId || leadData.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fullLead: CustomerLead = {
      ...leadData,
      id: targetId,
      userId: userSession?.userId || customerUser?.userId,
      userEmail: userSession?.email || customerUser?.email || leadData.email,
      userPhone: userSession?.phone || customerUser?.phone || leadData.phone,
      createdByUserId: userSession?.userId,
      createdByEmail: userSession?.email,
      createdByPhone: userSession?.phone,
      createdByRole: userSession?.role || (isStudio ? 'studio' : 'customer'),
      leadType: isStandalone ? 'standalone_photoshoot' : 'wedding',
      photoshootType: isStandalone ? activeLead.photoshootType : undefined,
      photoshootDetails: isStandalone ? activeLead.photoshootDetails : undefined,
      side,
      groomEvents: isStandalone ? undefined : groomEvents,
      brideEvents: isStandalone ? undefined : brideEvents,
      deliverables: isStandalone && activeLead.photoshootDetails?.deliverables ? activeLead.photoshootDetails.deliverables : deliverables,
      selectedServices: selectedOtherServices,
      airlineReservations: customerUser?.airlineReservations || activeLead.airlineReservations || [],
      accessRequests: activeLead.accessRequests || [],
      totalPrice: baseSub,
      couponCode: appliedCoupon?.code,
      discountPercentage: discountPct,
      discountAmount: discountAmt,
      grandTotalAfterDiscount: discountedTotal,
      taxAmount: tax,
      grandTotal: discountedTotal + tax,
      source: isStudio ? 'studio' : 'customer',
      createdBy: isStudio ? 'studio' : 'customer',
      studioBranding: studioUser || (userSession?.role === 'studio' ? {
        studioName: userSession.studioName || userSession.name,
        ownerName: userSession.name,
        phone: userSession.phone || '',
        email: userSession.email || '',
        address: userSession.address || userSession.place || 'Kayamkulam',
        place: userSession.place || 'Kayamkulam',
      } : undefined),
      createdAt: activeLead.createdAt || new Date().toISOString(),
      lastEditedAt: editingLeadId ? new Date().toISOString() : undefined,
      revisionsCount: editingLeadId ? (activeLead.revisionsCount || 0) + 1 : undefined,
      status: editingLeadId ? 'Re-submitted' : 'Access Sent',
    };

    setActiveLead(fullLead);
    setEditingLeadId(null);
    setIsLeadModalOpen(false);

    setLeads((prev) => {
      const exists = prev.some((l) => l.id === fullLead.id);
      const updated = exists ? prev.map((l) => (l.id === fullLead.id ? fullLead : l)) : [fullLead, ...prev];
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

  const handleRoleAuthSuccess = (session: AppUserSession) => {
    setUserSession(session);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lfb_user_session', JSON.stringify(session));
    }
    if (session.role === 'customer') {
      const custUser: CustomerUser = {
        name: session.name,
        userId: session.userId,
        phone: session.phone,
        email: session.email || `${session.userId || 'user'}@framluweddings.com`,
        address: session.address || session.place || 'Kayamkulam',
        place: session.place || 'Kayamkulam',
        registeredAt: session.loggedInAt,
      };
      setCustomerUser(custUser);
      setStudioUser(null);
      setActiveLead((prev) => ({
        ...prev,
        name: session.name,
        phone: session.phone,
        email: custUser.email,
        place: session.place || 'Kayamkulam',
        address: session.address || prev.address || '',
      }));
    } else {
      const stUser: StudioUser = {
        studioName: session.studioName || session.name,
        ownerName: session.name,
        phone: session.phone,
        email: session.email || 'studio@framluweddings.com',
        address: session.address || session.place || 'Kerala, India',
        place: session.place || 'Kayamkulam',
        registeredAt: session.loggedInAt,
      };
      setStudioUser(stUser);
      setCustomerUser(null);
      setActiveLead((prev) => ({
        ...prev,
        studioBranding: stUser,
      }));
    }
    setIsRoleAuthModalOpen(false);
  };

  const handleRoleLogout = () => {
    setUserSession(null);
    setCustomerUser(null);
    setStudioUser(null);
    setActiveLead({
      name: '',
      phone: '',
      email: '',
      address: '',
      place: 'കായംകുളം',
      weddingDate: '',
      venueLocation: '',
    });
    setEditingLeadId(null);
    setGroomEvents(buildInitialEvents());
    setBrideEvents(buildInitialEvents());
    setDeliverables(ZERO_DELIVERABLES);
    setSelectedOtherServices([]);
    setActivePackageBoard(null);
    setAppliedCoupon(null);
    setCurrentNavTab('dashboard');
    setQuoteServiceType('wedding');
    setSelectedPhotoshoot('wedding');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('lfb_user_session');
      localStorage.removeItem('framlu_wedding_user');
      localStorage.removeItem('lumina_wedding_user');
      localStorage.removeItem('framlu_studio_partner');
      localStorage.removeItem('wedding_studio_user');
      localStorage.removeItem('framlu_wedding_leads');
      localStorage.removeItem('lumina_wedding_leads');
    }
    setIsRoleAuthModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    setLeads((prev) => {
      const updated = prev.filter((l) => l.id !== leadId);
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });
    await deleteLeadFromCloud(leadId);
  };

  const handleStartNewQuote = (serviceType?: 'wedding' | 'photoshoot' | 'other_services', prefilledDate?: string) => {
    if (!userSession) {
      setIsRoleAuthModalOpen(true);
      return;
    }
    if (serviceType) {
      setQuoteServiceType(serviceType);
      if (serviceType === 'wedding') {
        setSelectedPhotoshoot('wedding');
      } else if (serviceType === 'photoshoot') {
        setSelectedPhotoshoot('birthday');
      }
    }
    const defaultDate = prefilledDate || '';
    if (defaultDate) {
      setActiveLead((prev) => ({
        ...prev,
        weddingDate: defaultDate,
      }));

      // Pre-set date on groomEvents and brideEvents
      setGroomEvents((prev) => {
        const updated = { ...prev };
        for (const evt of KERALA_EVENTS) {
          if (updated[evt.id]) {
            updated[evt.id] = {
              ...updated[evt.id],
              date: defaultDate,
            };
          }
        }
        return updated;
      });

      setBrideEvents((prev) => {
        const updated = { ...prev };
        for (const evt of KERALA_EVENTS) {
          if (updated[evt.id]) {
            updated[evt.id] = {
              ...updated[evt.id],
              date: defaultDate,
            };
          }
        }
        return updated;
      });
    }

    setCurrentNavTab('new_quote');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: CustomerLead['status']) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, status, lastEditedAt: new Date().toISOString() } : l));
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    const targetLead = leads.find((l) => l.id === leadId);
    if (targetLead) {
      await saveLeadToCloud({ ...targetLead, status, lastEditedAt: new Date().toISOString() });
    }
  };

  const handleUpdateLeadDateAndStatus = async (
    leadId: string,
    newDate: string,
    newStatus: CustomerLead['status'],
    eventKey?: string
  ) => {
    let updatedTargetLead: CustomerLead | null = null;

    setLeads((prev) => {
      const updated = prev.map((l) => {
        if (l.id !== leadId) return l;

        const updatedLead: CustomerLead = {
          ...l,
          status: newStatus,
          lastEditedAt: new Date().toISOString(),
        };

        if (eventKey) {
          if (eventKey.startsWith('groom-')) {
            const subId = eventKey.replace('groom-', '') as EventId;
            if (updatedLead.groomEvents) {
              updatedLead.groomEvents = {
                ...updatedLead.groomEvents,
                [subId]: {
                  ...(updatedLead.groomEvents[subId] || {}),
                  date: newDate,
                },
              };
            }
          } else if (eventKey.startsWith('bride-')) {
            const subId = eventKey.replace('bride-', '') as EventId;
            if (updatedLead.brideEvents) {
              updatedLead.brideEvents = {
                ...updatedLead.brideEvents,
                [subId]: {
                  ...(updatedLead.brideEvents[subId] || {}),
                  date: newDate,
                },
              };
            }
          } else if (eventKey.startsWith('addon-')) {
            const pkgId = eventKey.replace('addon-', '');
            if (updatedLead.selectedServices) {
              updatedLead.selectedServices = updatedLead.selectedServices.map((s) =>
                s.packageId === pkgId ? { ...s, date: newDate } : s
              );
            }
          } else if (eventKey === 'photoshoot' && updatedLead.photoshootDetails) {
            updatedLead.photoshootDetails = {
              ...updatedLead.photoshootDetails,
              date: newDate,
            };
          }
        }

        if (!eventKey || eventKey === 'wedding' || eventKey === 'primary' || updatedLead.leadType === 'standalone_photoshoot') {
          updatedLead.weddingDate = newDate;
          if (updatedLead.photoshootDetails) {
            updatedLead.photoshootDetails = {
              ...updatedLead.photoshootDetails,
              date: newDate,
            };
          }
        }

        updatedTargetLead = updatedLead;
        return updatedLead;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    if (updatedTargetLead) {
      await saveLeadToCloud(updatedTargetLead);
    }
  };

  const handleUpdateOtherService = (updatedService: SelectedOtherService) => {
    setSelectedOtherServices((prev) =>
      prev.map((s) => (s.packageId === updatedService.packageId ? updatedService : s))
    );
  };

  const handleEditQuoteFromDashboard = (leadToEdit: CustomerLead) => {
    if (!userSession) {
      setIsRoleAuthModalOpen(true);
      return;
    }
    handleEditBill(leadToEdit);
    setCurrentNavTab('new_quote');
    if (leadToEdit.leadType === 'standalone_photoshoot') {
      setQuoteServiceType('photoshoot');
    } else if (leadToEdit.leadType === 'other_services') {
      setQuoteServiceType('other_services');
    } else {
      setQuoteServiceType('wedding');
    }
  };

  const handleViewPdfFromDashboard = (lead: CustomerLead) => {
    setActiveLead(lead);
    setIsPdfModalOpen(true);
  };

  const handleWhatsAppFromDashboard = (lead: CustomerLead) => {
    setSelectedShareLead(lead);
    setIsWhatsAppShareModalOpen(true);
  };

  const handleSelectBoard = (board: HighlightBoard) => {
    if (!userSession) {
      setIsRoleAuthModalOpen(true);
      return;
    }
    handleApplyHighlightBoard(board);
    setCurrentNavTab('new_quote');
    setQuoteServiceType('wedding');
  };

  // Scoped quotes count for logged in user (resets to 0 when logged out)
  const userQuotes = useMemo(() => {
    if (!userSession) return [];
    const userPhone = userSession.phone?.replace(/\D/g, '').slice(-10);
    const userEmail = userSession.email?.toLowerCase().trim();
    const userId = userSession.userId?.toLowerCase().trim();

    return leads.filter((l) => {
      if (
        (l.name === 'Arun Krishna' && (l.phone === '9847123456' || l.email === 'arun.krishna@gmail.com')) ||
        l.id === 'FWC-QUOTE' ||
        l.id === 'FWC-2026-DUMMY'
      ) {
        return false;
      }

      const lPhone = (l.phone || '').replace(/\D/g, '').slice(-10);
      const lCreatedByPhone = (l.createdByPhone || '').replace(/\D/g, '').slice(-10);
      const lUserPhone = (l.userPhone || '').replace(/\D/g, '').slice(-10);
      const studioBrandingPhone = (l.studioBranding?.phone || '').replace(/\D/g, '').slice(-10);

      const lEmail = (l.email || '').toLowerCase().trim();
      const lUserEmail = (l.userEmail || '').toLowerCase().trim();
      const lCreatedByEmail = (l.createdByEmail || '').toLowerCase().trim();
      const studioBrandingEmail = (l.studioBranding?.email || '').toLowerCase().trim();

      const lUserId = (l.userId || '').toLowerCase().trim();
      const lCreatedByUserId = (l.createdByUserId || '').toLowerCase().trim();

      const phoneMatches = !!(
        userPhone &&
        (lPhone === userPhone ||
          lCreatedByPhone === userPhone ||
          lUserPhone === userPhone ||
          studioBrandingPhone === userPhone)
      );

      const emailMatches = !!(
        userEmail &&
        (lEmail === userEmail ||
          lUserEmail === userEmail ||
          lCreatedByEmail === userEmail ||
          studioBrandingEmail === userEmail)
      );

      const userIdMatches = !!(
        userId &&
        (lUserId === userId || lCreatedByUserId === userId)
      );

      if (userSession.role === 'studio') {
        const studioRoleMatch = l.createdByRole === 'studio' || l.source === 'studio' || l.createdBy === 'studio';
        const studioNameMatch = !!(
          userSession.studioName &&
          l.studioBranding?.studioName?.toLowerCase().trim() === userSession.studioName.toLowerCase().trim()
        );
        return emailMatches || phoneMatches || userIdMatches || studioNameMatch || (studioRoleMatch && (emailMatches || phoneMatches));
      } else {
        return emailMatches || phoneMatches || userIdMatches;
      }
    });
  }, [leads, userSession]);

  const isMl = language === 'ml';

  return (
    <div className="min-h-screen bg-stone-50 pb-28 lg:pb-12 text-stone-900 flex flex-col">
      {/* 1. Left Vertical Sidebar & Sticky Top Header */}
      <SidebarNav
        currentTab={currentNavTab}
        onSelectTab={(tab) => {
          if (tab === 'new_quote' && !userSession) {
            setIsRoleAuthModalOpen(true);
            return;
          }
          setCurrentNavTab(tab);
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        userSession={userSession}
        onOpenAuthModal={() => setIsRoleAuthModalOpen(true)}
        onLogout={handleRoleLogout}
        studioContact={studioContact}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        quotesCount={userSession ? userQuotes.length : 0}
      />

      {/* Main Content Area - Shifted right on large screens for vertical sidebar (w-64) */}
      <div className="lg:pl-64 flex-1 flex flex-col w-full">
        {/* EDITING SAVED BILL STICKY BANNER */}
        {editingLeadId && (
          <div className="sticky top-[60px] z-30 bg-gradient-to-r from-amber-800 via-stone-900 to-amber-900 text-white px-4 py-3 shadow-xl border-b border-amber-400/40 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <div>
                <span className="font-black text-amber-300">
                  {isMl ? `ബിൽ #${editingLeadId} എഡിറ്റ് ചെയ്യുന്നു` : `Editing Bill #${editingLeadId}`}
                </span>
                <span className="text-stone-300 ml-2 text-[11px] hidden sm:inline">
                  {isMl
                    ? 'ഇവന്റുകൾ, ക്രൂ, ആൽബം എന്നിവ താഴെ മാറ്റിയ ശേഷം സേവ് ചെയ്യുക.'
                    : 'Modify events, photography crew, or deliverables below, then click save.'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingLeadId(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition cursor-pointer"
              >
                {isMl ? 'റദ്ദാക്കുക' : 'Cancel Edit'}
              </button>
              <button
                type="button"
                onClick={handleSaveEditedCurrentBill}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isMl ? 'മാറ്റങ്ങൾ സേവ് ചെയ്ത് വീണ്ടും അയക്കുക' : 'Save Changes & Re-Send'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 1 & 3: DASHBOARD & QUOTES (Displays ONLY Quotes, with New Quote Builder prominently at top) */}
        {(currentNavTab === 'dashboard' || currentNavTab === 'quotes') && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
            <QuotesDashboard
              userSession={userSession}
              leads={leads}
              onStartNewQuote={handleStartNewQuote}
              onViewPdf={handleViewPdfFromDashboard}
              onSendWhatsApp={handleWhatsAppFromDashboard}
              onEditLead={handleEditQuoteFromDashboard}
              onDeleteLead={handleDeleteLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onUpdateLeadDateAndStatus={handleUpdateLeadDateAndStatus}
              onOpenLogin={() => setIsRoleAuthModalOpen(true)}
              language={language}
              studioContact={studioContact}
            />
          </main>
        )}

        {/* TAB 2: CREATE NEW QUOTE (Full Customizer with Service Selector & Live Sticky Pricing) */}
        {currentNavTab === 'new_quote' && (
          !userSession ? (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
              <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center shadow-sm space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {isMl ? 'കൊട്ടേഷൻ നിർമ്മിക്കുന്നതിന് സൈൻ ഇൻ ചെയ്യുക' : 'Sign In Required to Create Quotations'}
                  </h2>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {isMl
                      ? 'പുതിയ കൊട്ടേഷൻ തയ്യാറാക്കാനും റേറ്റ് കാൽക്കുലേഷൻ സേവ് ചെയ്യാനും ഗൂഗിൾ അല്ലെങ്കിൽ മൊബൈൽ ഒടിപി വഴി സൈൻ ഇൻ ചെയ്യുക. പാക്കേജുകളും സർവീസുകളും ലോഗിൻ ചെയ്യാതെ തന്നെ കാണാവുന്നതാണ്.'
                      : 'Please sign in with Google or Mobile OTP to create and manage custom quotations. You can freely explore our Packages, Services, and Gallery without signing in.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRoleAuthModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{isMl ? 'ഇപ്പോൾ സൈൻ ഇൻ ചെയ്യുക' : 'Sign In Now'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentNavTab('packages')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm transition cursor-pointer"
                  >
                    {isMl ? 'പാക്കേജുകൾ കാണുക' : 'Browse Packages'}
                  </button>
                </div>
              </div>
            </main>
          ) : (
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
            {/* Top Service Type Chooser for New Quote (Requirement 2 & 3) */}
            <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-sm mb-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block">
                    {isMl ? 'സ്റ്റെപ്പ് 1: സർവീസ് തിരഞ്ഞെടുക്കുക' : 'Step 1: Choose Service Type'}
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900">
                    {isMl ? 'നിങ്ങൾക്ക് ആവശ്യമുള്ള സർവീസ് ഏതാണ്?' : 'What type of service do you need?'}
                  </h2>
                </div>
                {quoteServiceType === 'wedding' && calculation.totalPrice > 0 && (
                  <button
                    type="button"
                    onClick={handleResetToZero}
                    className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isMl ? 'എസ്റ്റിമേറ്റ് ₹0 ആക്കുക' : 'Reset to ₹0'}</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setQuoteServiceType('wedding');
                    setSelectedPhotoshoot('wedding');
                  }}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                    quoteServiceType === 'wedding'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    quoteServiceType === 'wedding' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black block">
                      {isMl ? 'വിവാഹ ഫോട്ടോഗ്രാഫി' : 'Wedding Photography'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {isMl ? 'ഇവന്റുകൾ, ക്രൂ, 4K വീഡിയോ, ആൽബങ്ങൾ' : 'Events, Crew, Video & Albums'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuoteServiceType('photoshoot');
                    if (selectedPhotoshoot === 'wedding') setSelectedPhotoshoot('birthday');
                  }}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                    quoteServiceType === 'photoshoot'
                      ? 'border-rose-600 bg-rose-50/80 text-rose-950 shadow-xs ring-2 ring-rose-500/20'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    quoteServiceType === 'photoshoot' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black block">
                      {isMl ? 'പ്രത്യേക ഫോട്ടോഷൂട്ട്' : 'Special Photoshoots'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {isMl ? 'ബർത്ത്ഡേ, ബേബി ഷവർ, മോഡൽ' : 'Birthday, Baby Shower, Model'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQuoteServiceType('other_services')}
                  className={`p-3.5 rounded-2xl border text-left font-bold transition flex items-center gap-3 cursor-pointer ${
                    quoteServiceType === 'other_services'
                      ? 'border-amber-600 bg-amber-50/80 text-amber-950 shadow-xs ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    quoteServiceType === 'other_services' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black block">
                      {isMl ? 'മറ്റ് വെഡ്ഡിംഗ് സർവീസുകൾ' : 'Other Wedding Services'}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {isMl ? 'സദ്യ, സ്റ്റേജ് ഡെക്കോർ, മേക്കപ്പ്' : 'Catering, Decor, Makeup & Cars'}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 7 PACKAGE OPTIONS QUICK ESTIMATOR BAR (Requirement 2) */}
            <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-3xl border border-amber-200/90 p-4 sm:p-5 shadow-xs mb-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      {isMl ? '7 പാക്കേജ് ഓപ്ഷനുകൾ & ക്വിക്ക് എസ്റ്റിമേറ്റ്' : '7 Package Options & Quick Estimates'}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900 mt-0.5">
                    {isMl ? 'ഏത് പാക്കേജിന്റെയും എസ്റ്റിമേറ്റ് തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ റീസെറ്റ് ചെയ്യുക' : 'Select any package for instant estimate or reset to ₹0'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={handleResetToZero}
                  className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                  title={isMl ? 'എസ്റ്റിമേറ്റ് ₹0 ആക്കി റീസെറ്റ് ചെയ്യുക' : 'Reset estimate back to ₹0'}
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>{isMl ? 'എസ്റ്റിമേറ്റ് ₹0 ആക്കുക (Reset)' : 'Reset Estimate to ₹0'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {[
                  {
                    type: 'wedding',
                    titleEn: 'Wedding',
                    titleMl: 'വിവാഹം',
                    basePrice: DEFAULT_PHOTOSHOOTS.wedding?.basePrice || 45000,
                    icon: Camera,
                    tag: isMl ? 'ഫുൾ ഇവന്റ്' : 'Full Event',
                  },
                  {
                    type: 'birthday',
                    titleEn: 'Birthday',
                    titleMl: 'ബർത്ത്ഡേ',
                    basePrice: DEFAULT_PHOTOSHOOTS.birthday?.basePrice || 9500,
                    icon: Cake,
                    tag: isMl ? 'പാർട്ടി' : 'Cake Smash',
                  },
                  {
                    type: 'anniversary',
                    titleEn: 'Anniversary',
                    titleMl: 'ആനിവേഴ്സറി',
                    basePrice: DEFAULT_PHOTOSHOOTS.anniversary?.basePrice || 11000,
                    icon: Heart,
                    tag: isMl ? 'കപ്പിൾ' : 'Couple',
                  },
                  {
                    type: 'baby_shower',
                    titleEn: 'Baby Shower',
                    titleMl: 'ബേബി ഷവർ',
                    basePrice: DEFAULT_PHOTOSHOOTS.baby_shower?.basePrice || 8500,
                    icon: GlassWater,
                    tag: isMl ? 'മറ്റേണിറ്റി' : 'Maternity',
                  },
                  {
                    type: 'baby_photoshoot',
                    titleEn: 'Baby & Toddler',
                    titleMl: 'കിഡ്സ് & ബേബി',
                    basePrice: DEFAULT_PHOTOSHOOTS.baby_photoshoot?.basePrice || 8500,
                    icon: Baby,
                    tag: isMl ? 'തീം ഷൂട്ട്' : 'Theme',
                  },
                  {
                    type: 'newborn_baby',
                    titleEn: 'Newborn Baby',
                    titleMl: 'നവജാത ശിശു',
                    basePrice: DEFAULT_PHOTOSHOOTS.newborn_baby?.basePrice || 14000,
                    icon: UserCheck,
                    tag: isMl ? '5-30 ദിനങ്ങൾ' : '5-30 Days',
                  },
                  {
                    type: 'model_photoshoot',
                    titleEn: 'Model & Portfolio',
                    titleMl: 'മോഡലിംഗ്',
                    basePrice: DEFAULT_PHOTOSHOOTS.model_photoshoot?.basePrice || 12500,
                    icon: Shirt,
                    tag: isMl ? 'ഫാഷൻ' : 'Fashion',
                  },
                ].map((pkg) => {
                  const isSelected =
                    (pkg.type === 'wedding' && quoteServiceType === 'wedding') ||
                    (quoteServiceType === 'photoshoot' && selectedPhotoshoot === pkg.type);

                  return (
                    <button
                      key={pkg.type}
                      type="button"
                      onClick={() => {
                        if (pkg.type === 'wedding') {
                          setQuoteServiceType('wedding');
                          setSelectedPhotoshoot('wedding');
                        } else {
                          setQuoteServiceType('photoshoot');
                          setSelectedPhotoshoot(pkg.type as PhotoshootType);
                        }
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer select-none group relative ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/90 text-stone-900 shadow-md ring-2 ring-amber-400/40 -translate-y-0.5'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300 hover:bg-amber-50/30 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-amber-500 text-stone-900'
                              : 'bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800'
                          }`}
                        >
                          <pkg.icon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-stone-100 text-stone-500 group-hover:text-stone-700'
                          }`}
                        >
                          {isSelected ? '✓ സജീവം' : pkg.tag}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-black block leading-tight truncate">
                          {isMl ? pkg.titleMl : pkg.titleEn}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-[10px] text-stone-400 font-medium">
                            {isMl ? 'ആരംഭം' : 'From'}
                          </span>
                          <span className="text-xs font-black text-amber-800">
                            ₹{pkg.basePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SERVICE TYPE: WEDDING PHOTOGRAPHY */}
            {quoteServiceType === 'wedding' && (
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
                    </div>
                  </div>

                  {/* Highlight boards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {highlightBoards.map((board) => {
                      const isActive =
                        activePackageBoard?.id === board.id ||
                        (calculation.totalPrice > 0 && Math.abs(calculation.totalPrice - board.price) < 100);

                      return (
                        <div
                          key={board.id}
                          onClick={() => handleApplyHighlightBoard(board)}
                          className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none group hover:-translate-y-0.5 ${
                            isActive
                              ? 'bg-gradient-to-b from-amber-500/25 via-amber-100/70 to-white border-2 border-amber-500 shadow-xl ring-4 ring-amber-400/30 scale-[1.01]'
                              : board.popular
                              ? 'bg-gradient-to-b from-amber-500/10 via-white to-amber-50/40 border-2 border-amber-300 shadow-md hover:border-amber-400 hover:shadow-lg'
                              : 'bg-white border border-stone-250 shadow-xs hover:border-amber-400 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="text-lg font-black text-stone-900 leading-snug group-hover:text-amber-800 transition">
                                {isMl && board.titleMl ? board.titleMl : board.title}
                              </h3>
                            </div>
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
                          </div>
                          <button
                            type="button"
                            className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition ${
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-900 text-white group-hover:bg-amber-600'
                            }`}
                          >
                            <span>{isActive ? (isMl ? 'സെലക്ട് ചെയ്തിരിക്കുന്നു' : 'Selected') : (isMl ? 'ഈ പ്ലാൻ കസ്റ്റമൈസ് ചെയ്യുക' : 'Customize This Plan')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customizer Layout with Sticky Pricing */}
                <div id="wedding-customizer-section" className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="flex-1 w-full min-w-0">
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
                      defaultEventDate={activeLead.weddingDate}
                    />

                    {/* Step 3: Deliverables & Merchandise Customizer with Zero-Videographer handling */}
                    <DeliverablesCustomizer
                      deliverables={deliverables}
                      setDeliverables={setDeliverables}
                      rates={rates}
                      language={language}
                      customPrintItems={customPrintItems}
                      totalVideographers={calculation.totalVideographers || 0}
                      maxVideographersPerEvent={calculation.maxVideographersPerEvent || 0}
                      onNavigateToOtherServices={() => {
                        setQuoteServiceType('other_services');
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
                    selectedOtherServices={selectedOtherServices}
                    onUpdateOtherService={handleUpdateOtherService}
                    isLoggedIn={!!userSession}
                    onRequireLogin={() => setIsRoleAuthModalOpen(true)}
                    onOpenLeadModal={() => {
                      if (!userSession) {
                        setIsRoleAuthModalOpen(true);
                        return;
                      }
                      setActiveLead((prev) => ({
                        ...prev,
                        leadType: 'wedding',
                        photoshootType: undefined,
                        photoshootDetails: undefined,
                        totalPrice: calculation.totalPrice,
                      }));
                      setIsLeadModalOpen(true);
                    }}
                    language={language}
                    whatsappNumber={studioContact.whatsapp}
                    coupons={coupons}
                    appliedCoupon={appliedCoupon}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={() => setAppliedCoupon(null)}
                    onNavigateToOtherServices={() => {
                      setQuoteServiceType('other_services');
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 50);
                    }}
                    onNavigateToPhotography={() => {
                      setQuoteServiceType('wedding');
                      setTimeout(() => {
                        const el = document.getElementById('wedding-customizer-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                  />
                </div>
              </>
            )}

            {/* SERVICE TYPE: SPECIAL PHOTOSHOOTS */}
            {quoteServiceType === 'photoshoot' && (
              <PhotoshootSection
                language={language}
                selectedPhotoshoot={selectedPhotoshoot}
                onSelectPhotoshoot={(shoot) => {
                  if (shoot === 'wedding') {
                    setQuoteServiceType('wedding');
                    setSelectedPhotoshoot('wedding');
                  } else {
                    setSelectedPhotoshoot(shoot);
                  }
                }}
                onBackToWedding={() => {
                  setQuoteServiceType('wedding');
                  setSelectedPhotoshoot('wedding');
                }}
                photoshoots={photoshoots}
                rates={rates}
                initialDate={activeLead.weddingDate}
                onAddAsAddon={(service) => {
                  setSelectedOtherServices((prev) => {
                    const filtered = prev.filter((s) => s.packageId !== service.packageId);
                    return [...filtered, service];
                  });
                }}
                onRemoveAddon={(packageId) => {
                  setSelectedOtherServices((prev) => prev.filter((s) => s.packageId !== packageId));
                }}
                isAddonSelected={(packageId) => selectedOtherServices.some((s) => s.packageId === packageId)}
                onInstantStandaloneQuote={(shootSummary) => {
                  if (!userSession) {
                    setIsRoleAuthModalOpen(true);
                    return;
                  }
                  const isStudio = userSession?.role === 'studio';
                  setActiveLead((prev) => ({
                    ...prev,
                    weddingDate: shootSummary.photoshootDetails?.date || prev.weddingDate,
                    totalPrice: shootSummary.price,
                    notes: shootSummary.notes,
                    leadType: 'standalone_photoshoot',
                    photoshootType: shootSummary.photoshootType,
                    photoshootDetails: shootSummary.photoshootDetails,
                    source: isStudio ? 'studio' : 'customer',
                    createdBy: isStudio ? 'studio' : 'customer',
                    studioBranding: studioUser || undefined,
                  }));
                  setIsLeadModalOpen(true);
                }}
                studioContact={studioContact}
              />
            )}

            {/* SERVICE TYPE: OTHER SERVICES */}
            {quoteServiceType === 'other_services' && (
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
                  if (shootType) {
                    setQuoteServiceType('photoshoot');
                    setSelectedPhotoshoot(shootType as PhotoshootType);
                  } else {
                    setQuoteServiceType('wedding');
                  }
                }}
                onBackToDeliverables={() => {
                  setCurrentNavTab('new_quote');
                  setQuoteServiceType('wedding');
                  setTimeout(() => {
                    const el = document.getElementById('deliverables-customizer-section') || document.getElementById('wedding-customizer-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                onProceedToQuotation={() => {
                  if (!userSession) {
                    setIsRoleAuthModalOpen(true);
                    return;
                  }
                  setActiveLead((prev) => ({
                    ...prev,
                    leadType: 'wedding',
                    photoshootType: undefined,
                    photoshootDetails: undefined,
                    totalPrice: calculation.totalPrice,
                  }));
                  setIsLeadModalOpen(true);
                }}
              />
            )}
            </main>
          )
        )}

        {/* TAB 4: PACKAGES */}
        {currentNavTab === 'packages' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full space-y-8">
            <OffersAndHighlightBoards
              offers={offers}
              highlightBoards={highlightBoards}
              studioContact={studioContact}
              onSelectBoard={(board) => {
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                handleApplyHighlightBoard(board);
                setCurrentNavTab('new_quote');
                setQuoteServiceType('wedding');
              }}
              language={language}
            />
            <PhotoshootSection
              language={language}
              selectedPhotoshoot={selectedPhotoshoot}
              onSelectPhotoshoot={(shoot) => {
                if (shoot === 'wedding') {
                  if (!userSession) {
                    setIsRoleAuthModalOpen(true);
                    return;
                  }
                  setCurrentNavTab('new_quote');
                  setQuoteServiceType('wedding');
                  setSelectedPhotoshoot('wedding');
                } else {
                  setSelectedPhotoshoot(shoot);
                }
              }}
              onBackToWedding={() => {
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                setCurrentNavTab('new_quote');
                setQuoteServiceType('wedding');
                setSelectedPhotoshoot('wedding');
              }}
              photoshoots={photoshoots}
              rates={rates}
              onAddAsAddon={(service) => {
                setSelectedOtherServices((prev) => {
                  const filtered = prev.filter((s) => s.packageId !== service.packageId);
                  return [...filtered, service];
                });
              }}
              onRemoveAddon={(packageId) => {
                setSelectedOtherServices((prev) => prev.filter((s) => s.packageId !== packageId));
              }}
              isAddonSelected={(packageId) => selectedOtherServices.some((s) => s.packageId === packageId)}
              onInstantStandaloneQuote={(shootSummary) => {
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                const isStudio = userSession?.role === 'studio';
                setActiveLead((prev) => ({
                  ...prev,
                  weddingDate: shootSummary.photoshootDetails?.date || prev.weddingDate,
                  totalPrice: shootSummary.price,
                  notes: shootSummary.notes,
                  leadType: 'standalone_photoshoot',
                  photoshootType: shootSummary.photoshootType,
                  photoshootDetails: shootSummary.photoshootDetails,
                  source: isStudio ? 'studio' : 'customer',
                  createdBy: isStudio ? 'studio' : 'customer',
                  studioBranding: studioUser || undefined,
                }));
                setIsLeadModalOpen(true);
              }}
              studioContact={studioContact}
            />
          </main>
        )}

        {/* TAB 5: OTHER SERVICES */}
        {currentNavTab === 'services' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
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
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                if (shootType) {
                  setQuoteServiceType('photoshoot');
                  setSelectedPhotoshoot(shootType as PhotoshootType);
                } else {
                  setQuoteServiceType('wedding');
                }
                setCurrentNavTab('new_quote');
              }}
              onBackToDeliverables={() => {
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                setCurrentNavTab('new_quote');
                setQuoteServiceType('wedding');
                setTimeout(() => {
                  const el = document.getElementById('deliverables-customizer-section') || document.getElementById('wedding-customizer-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              onProceedToQuotation={() => {
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                setActiveLead((prev) => ({
                  ...prev,
                  leadType: 'wedding',
                  photoshootType: undefined,
                  photoshootDetails: undefined,
                  totalPrice: calculation.totalPrice,
                }));
                setIsLeadModalOpen(true);
              }}
            />
          </main>
        )}

        {/* TAB 6: GALLERY */}
        {currentNavTab === 'gallery' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
            <GallerySection
              projects={galleryProjects}
              language={language}
              studioContact={studioContact}
              onNavigateToCustomizer={() => {
                if (!userSession) {
                  setIsRoleAuthModalOpen(true);
                  return;
                }
                setCurrentNavTab('new_quote');
                setQuoteServiceType('wedding');
              }}
            />
          </main>
        )}

        {/* TAB 7: ADMIN / STUDIO CRM */}
        {currentNavTab === 'admin' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
            <AdminDashboard
              rates={rates}
              setRates={setRates}
              customPrintItems={customPrintItems}
              setCustomPrintItems={setCustomPrintItems}
              studioContact={studioContact}
              setStudioContact={setStudioContact}
              offers={offers}
              setOffers={setOffers}
              highlightBoards={highlightBoards}
              setHighlightBoards={setHighlightBoards}
              otherServices={otherServices}
              setOtherServices={setOtherServices}
              categories={categories}
              setCategories={setCategories}
              leads={leads}
              setLeads={setLeads}
              galleryProjects={galleryProjects}
              setGalleryProjects={setGalleryProjects}
              coupons={coupons}
              setCoupons={setCoupons}
              photoshoots={photoshoots}
              setPhotoshoots={setPhotoshoots}
              onCloseAdmin={() => setCurrentNavTab('dashboard')}
              language={language}
            />
          </main>
        )}
      </div>

      {/* MODALS */}

      {/* Role-based unified entry Auth Modal (Customer vs Studio) */}
      <RoleAuthModal
        isOpen={isRoleAuthModalOpen}
        onClose={() => setIsRoleAuthModalOpen(false)}
        onSuccess={handleRoleAuthSuccess}
        language={language}
        initialRole={userSession?.role || 'customer'}
      />

      {/* WhatsApp Share Modal with Customer / Studio / Other Phone routing & PDF inclusion */}
      {selectedShareLead && (
        <WhatsAppShareModal
          isOpen={isWhatsAppShareModalOpen}
          onClose={() => setIsWhatsAppShareModalOpen(false)}
          lead={selectedShareLead}
          calculation={calculation}
          userRole={userSession?.role || 'customer'}
          studioContact={studioContact}
          onDownloadPdf={() => {
            setActiveLead(selectedShareLead);
            setIsPdfModalOpen(true);
          }}
          language={language}
        />
      )}

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
        initialLead={activeLead}
        totalPrice={calculation.totalPrice}
        language={language}
      />

      {/* Customer Registration / Sign In Modal (Secondary) */}
      <CustomerAuthModal
        isOpen={isCustomerAuthModalOpen}
        onClose={() => setIsCustomerAuthModalOpen(false)}
        onSuccess={handleCustomerAuthSuccess}
        language={language}
      />

      {/* Customer Personal Dashboard Modal */}
      {customerUser && (
        <CustomerDashboardModal
          isOpen={isCustomerDashboardOpen}
          onClose={() => setIsCustomerDashboardOpen(false)}
          customerUser={customerUser}
          leads={leads}
          language={language}
          onEditBill={handleEditBill}
          onResubmitBill={handleResubmitBill}
          onViewPdf={(lead) => {
            setActiveLead(lead);
            setIsPdfModalOpen(true);
          }}
          onUpdateCustomerReservations={handleUpdateCustomerReservations}
          onSendAccessRequest={handleSendCustomerAccessRequest}
          studioContact={studioContact}
          onBrowseServices={() => {
            setCurrentNavTab('services');
          }}
          onCustomerLogout={handleRoleLogout}
        />
      )}

      {/* Studio Partner Registration / Login Modal */}
      <StudioAuthModal
        isOpen={isStudioAuthModalOpen}
        onClose={() => setIsStudioAuthModalOpen(false)}
        onSuccess={handleStudioAuthSuccess}
        language={language}
      />

      {/* Branded PDF Quotation View Modal */}
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

      {/* AI Wedding Planner & Timeline Scheduler Modal */}
      <AiPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        language={language}
        onApplyAiPackage={handleApplyAiPackage}
      />

      {/* Floating AI Wedding Chatbot Widget (Malayalam & English) */}
      <AiChatbotWidget
        language={language}
        openAiPlannerModal={() => setIsAiPlannerOpen(true)}
        whatsappNumber={studioContact.whatsapp}
      />
    </div>
  );
}
