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
} from '@/types';
import {
  DEFAULT_RATES,
  DEFAULT_DELIVERABLES,
  KERALA_EVENTS,
  DEFAULT_STUDIO_CONTACT,
  DEFAULT_OFFERS,
  DEFAULT_HIGHLIGHT_BOARDS,
  DEFAULT_CUSTOM_PRINTS,
} from '@/constants/defaults';
import { calculateCustomQuote, BreakdownItem } from '@/utils/calculator';
import { Navbar } from '@/components/Navbar';
import { SideSelector } from '@/components/SideSelector';
import { EventsCrewCustomizer } from '@/components/EventsCrewCustomizer';
import { DeliverablesCustomizer } from '@/components/DeliverablesCustomizer';
import { LiveStickyPricing } from '@/components/LiveStickyPricing';
import { LeadCaptureModal } from '@/components/LeadCaptureModal';
import { CustomerAuthModal } from '@/components/CustomerAuthModal';
import { PdfQuotationView } from '@/components/PdfQuotationView';
import { OtherServicesSection } from '@/components/OtherServicesSection';
import { OffersAndHighlightBoards } from '@/components/OffersAndHighlightBoards';
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
} from 'lucide-react';

export default function Home() {
  // Language State: Defaults to 'en' (English) as requested by user!
  const [language, setLanguage] = useState<'en' | 'ml'>('en');

  // Customer Navigation tabs: 'studio' | 'offers' | 'services'
  const [activeTab, setActiveTab] = useState<'studio' | 'offers' | 'services'>('studio');

  // Customer User Authentication State
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);

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

  // Rates State (Synced with localStorage)
  const [rates, setRates] = useState<PriceRates>(DEFAULT_RATES);

  // Custom Additional Print Items State (Synced with localStorage)
  const [customPrintItems, setCustomPrintItems] = useState<CustomPrintItem[]>(DEFAULT_CUSTOM_PRINTS);

  // Leads CRM State (Synced with localStorage)
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

  // Initialize Default Events
  const buildInitialEvents = (): Record<EventId, EventCrewConfig> => {
    const initial: Partial<Record<EventId, EventCrewConfig>> = {};
    for (const evt of KERALA_EVENTS) {
      if (evt.id === 'wedding_day') {
        initial[evt.id] = {
          enabled: true,
          venue: 'Royal Auditorium, Kayamkulam',
          date: '2026-12-20',
          traditionalPhotographers: 1,
          traditionalVideographers: 1,
          candidPhotographers: 1,
          candidVideographers: 0,
          drone: true,
          youtubeLive: false,
          auditoriumLive: true,
          photoLivePrinting: false,
        };
      } else if (evt.id === 'reception') {
        initial[evt.id] = {
          enabled: true,
          venue: 'Royal Auditorium, Kayamkulam',
          date: '2026-12-20',
          traditionalPhotographers: 1,
          traditionalVideographers: 1,
          candidPhotographers: 0,
          candidVideographers: 0,
          drone: false,
          youtubeLive: false,
          auditoriumLive: false,
          photoLivePrinting: false,
        };
      } else {
        initial[evt.id] = {
          enabled: false,
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
      }
    }
    return initial as Record<EventId, EventCrewConfig>;
  };

  const [groomEvents, setGroomEvents] = useState<Record<EventId, EventCrewConfig>>(buildInitialEvents());
  const [brideEvents, setBrideEvents] = useState<Record<EventId, EventCrewConfig>>(buildInitialEvents());
  const [deliverables, setDeliverables] = useState<DeliverablesConfig>(DEFAULT_DELIVERABLES);

  // Load saved state on client mount
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
      } else {
        const sampleLeads: CustomerLead[] = [
          {
            id: `FWC-2026-1082`,
            name: 'Vishnu & Parvathi',
            phone: '9847112233',
            email: 'vishnu.p@gmail.com',
            address: 'Kayamkulam Town, Alappuzha',
            place: 'Kayamkulam',
            weddingDate: '2026-11-15',
            venueLocation: 'Grand Palace Auditorium, Kayamkulam',
            status: 'Contacted',
            side: 'both',
            totalPrice: 145000,
            taxAmount: 26100,
            grandTotal: 171100,
            groomEvents: buildInitialEvents(),
            brideEvents: buildInitialEvents(),
            deliverables: DEFAULT_DELIVERABLES,
            createdAt: '2026-10-12T10:30:00Z',
          },
          {
            id: `FWC-2026-1149`,
            name: 'Nikhil & Sruthi',
            phone: '9447556677',
            email: 'nikhil.sruthi@gmail.com',
            address: 'Haripad, Alappuzha',
            place: 'Haripad',
            weddingDate: '2026-12-05',
            venueLocation: 'Haripad Kshetram Auditorium',
            status: 'New',
            side: 'groom',
            totalPrice: 98500,
            taxAmount: 17730,
            grandTotal: 116230,
            groomEvents: buildInitialEvents(),
            brideEvents: buildInitialEvents(),
            deliverables: DEFAULT_DELIVERABLES,
            createdAt: '2026-10-14T08:15:00Z',
          },
        ];
        setLeads(sampleLeads);
      }
    }
  }, []);

  // Language switcher handler
  const handleToggleLanguage = () => {
    const nextLang = language === 'ml' ? 'en' : 'ml';
    setLanguage(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_lang', nextLang);
    }
  };

  // Calculate live quote
  const calculation = calculateCustomQuote(
    side,
    groomEvents,
    brideEvents,
    deliverables,
    rates,
    customPrintItems
  );

  // Remove specific item from Live Sticky Pricing
  const handleRemoveItem = (item: BreakdownItem) => {
    const id = item.id;

    if (id.startsWith('groom_')) {
      const parts = id.split('_');
      const evtId = (parts[1] + (parts[2] && parts[2] !== 'trad' && parts[2] !== 'candid' && parts[2] !== 'drone' && parts[2] !== 'yt' && parts[2] !== 'hall' && parts[2] !== 'live' ? `_${parts[2]}` : '')) as EventId;

      setGroomEvents((prev) => {
        const existing = prev[evtId];
        if (!existing) return prev;
        const updated = { ...existing };
        if (id.includes('trad_photo')) updated.traditionalPhotographers = 0;
        if (id.includes('trad_video')) updated.traditionalVideographers = 0;
        if (id.includes('candid_photo')) updated.candidPhotographers = 0;
        if (id.includes('candid_video')) updated.candidVideographers = 0;
        if (id.includes('drone')) updated.drone = false;
        if (id.includes('yt_live')) updated.youtubeLive = false;
        if (id.includes('hall_live')) updated.auditoriumLive = false;
        if (id.includes('live_print')) updated.photoLivePrinting = false;
        return { ...prev, [evtId]: updated };
      });
      return;
    }

    if (id.startsWith('bride_')) {
      const parts = id.split('_');
      const evtId = (parts[1] + (parts[2] && parts[2] !== 'trad' && parts[2] !== 'candid' && parts[2] !== 'drone' && parts[2] !== 'yt' && parts[2] !== 'hall' && parts[2] !== 'live' ? `_${parts[2]}` : '')) as EventId;

      setBrideEvents((prev) => {
        const existing = prev[evtId];
        if (!existing) return prev;
        const updated = { ...existing };
        if (id.includes('trad_photo')) updated.traditionalPhotographers = 0;
        if (id.includes('trad_video')) updated.traditionalVideographers = 0;
        if (id.includes('candid_photo')) updated.candidPhotographers = 0;
        if (id.includes('candid_video')) updated.candidVideographers = 0;
        if (id.includes('drone')) updated.drone = false;
        if (id.includes('yt_live')) updated.youtubeLive = false;
        if (id.includes('hall_live')) updated.auditoriumLive = false;
        if (id.includes('live_print')) updated.photoLivePrinting = false;
        return { ...prev, [evtId]: updated };
      });
      return;
    }

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

  // Customer Registration / Sign-in Success
  const handleCustomerAuthSuccess = (u: CustomerUser) => {
    setCustomerUser(u);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_user', JSON.stringify(u));
    }

    const newLead: CustomerLead = {
      id: `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      name: u.name,
      phone: u.phone,
      email: u.email,
      address: u.address,
      place: u.place,
      weddingDate: activeLead.weddingDate || '2026-12-20',
      venueLocation: activeLead.venueLocation || u.place,
      status: 'New',
      side,
      groomEvents,
      brideEvents,
      deliverables,
      totalPrice: calculation.totalPrice,
      taxAmount: Math.round(calculation.totalPrice * 0.18),
      grandTotal: calculation.totalPrice + Math.round(calculation.totalPrice * 0.18),
      createdAt: new Date().toISOString(),
    };

    setActiveLead(newLead);

    // Auto record in CRM leads
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('framlu_wedding_user');
      localStorage.removeItem('lumina_wedding_user');
    }
  };

  // PDF Quotation Lead Submit
  const handleLeadSubmit = (leadData: CustomerLead) => {
    const fullLead: CustomerLead = {
      ...leadData,
      id: leadData.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      side,
      groomEvents,
      brideEvents,
      deliverables,
      totalPrice: calculation.totalPrice,
      taxAmount: Math.round(calculation.totalPrice * 0.18),
      grandTotal: calculation.totalPrice + Math.round(calculation.totalPrice * 0.18),
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

    setIsPdfModalOpen(true);
  };

  // Handle Board selection from Offers tab
  const handleSelectBoard = (board: HighlightBoard) => {
    setActiveTab('studio');
    window.scrollTo({ top: 350, behavior: 'smooth' });
    if (!customerUser) {
      setIsCustomerAuthModalOpen(true);
    }
  };

  const isMl = language === 'ml';

  return (
    <div className="min-h-screen bg-stone-50 pb-28 lg:pb-12 text-stone-900">
      {/* Navigation Header (Frontend - No admin buttons) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCustomerAuthModal={() => setIsCustomerAuthModalOpen(true)}
        customerUser={customerUser}
        onCustomerLogout={handleCustomerLogout}
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

          <div className="flex flex-col lg:flex-row gap-8 items-start">
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
              />
            </div>

            {/* Right Column: Live Sticky Summary Bar */}
            <LiveStickyPricing
              calculation={calculation}
              onRemoveItem={handleRemoveItem}
              onOpenLeadModal={() => {
                if (!customerUser) {
                  setIsCustomerAuthModalOpen(true);
                } else {
                  setIsLeadModalOpen(true);
                }
              }}
              language={language}
              whatsappNumber={studioContact.whatsapp}
            />
          </div>
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

      {/* 3. Other Services Tab */}
      {activeTab === 'services' && (
        <OtherServicesSection
          language={language}
          studioContact={studioContact}
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

      {/* Branded PDF Quotation View Modal with Back & Edit, WhatsApp Enquiry, 18% Tax, Divided Milestones */}
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
      />
    </div>
  );
}
