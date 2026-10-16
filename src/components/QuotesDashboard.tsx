'use client';

import React, { useState, useMemo } from 'react';
import { CustomerLead, AppUserSession, StudioContactConfig } from '@/types';
import { KERALA_EVENTS } from '@/constants/defaults';
import {
  PlusCircle,
  FileText,
  Download,
  Share2,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  User,
  Trash2,
  Edit3,
  Camera,
  Sparkles,
  Utensils,
  CheckCircle2,
  ArrowRight,
  Clock,
  Tag,
  Building2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  AlertTriangle,
  LogIn,
  Check,
  Loader2,
} from 'lucide-react';

export interface CalendarEventItem {
  quote: CustomerLead;
  eventId: string;
  eventNameEn: string;
  eventNameMl: string;
  side?: 'groom' | 'bride' | 'both';
  dateStr: string; // YYYY-MM-DD
  venue?: string;
  clientName: string;
  phone?: string;
  amount: number;
  status: string;
  isPhotoshoot?: boolean;
  eventKey?: string;
  servicePackageId?: string;
}

interface QuotesDashboardProps {
  userSession: AppUserSession | null;
  leads: CustomerLead[];
  onStartNewQuote: (serviceType?: 'wedding' | 'photoshoot' | 'other_services', prefilledDate?: string) => void;
  onViewPdf: (lead: CustomerLead) => void;
  onSendWhatsApp: (lead: CustomerLead) => void;
  onEditLead: (lead: CustomerLead) => void;
  onDeleteLead?: (leadId: string) => void;
  onUpdateLeadStatus?: (leadId: string, status: CustomerLead['status']) => void;
  onUpdateLeadDateAndStatus?: (leadId: string, newDate: string, newStatus?: CustomerLead['status'], eventKey?: string) => Promise<void> | void;
  onOpenLogin?: () => void;
  language?: 'en' | 'ml';
  studioContact: StudioContactConfig;
}

export const QuotesDashboard: React.FC<QuotesDashboardProps> = ({
  userSession,
  leads,
  onStartNewQuote,
  onViewPdf,
  onSendWhatsApp,
  onEditLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onUpdateLeadDateAndStatus,
  onOpenLogin,
  language = 'en',
  studioContact,
}) => {
  const isMl = language === 'ml';

  // Active Calendar Date View (defaults to current date/month or October 2026)
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 9, 1));
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const [seasonSelect, setSeasonSelect] = useState<'2026_2027' | '2025_2026'>('2026_2027');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Event Date & Status Rescheduling State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editDateInput, setEditDateInput] = useState<string>('');
  const [editStatusInput, setEditStatusInput] = useState<CustomerLead['status']>('Draft');
  const [isSavingEventDate, setIsSavingEventDate] = useState(false);
  const [savedSuccessEventId, setSavedSuccessEventId] = useState<string | null>(null);

  // Requirement 4: Greeting is ALWAYS in English.
  // When not logged in, NEVER display Bhavana or dummy names!
  const currentHour = new Date().getHours();
  const greetingText =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening';

  const isLoggedIn = !!userSession;
  const displayName = userSession
    ? userSession.studioName || userSession.name
    : '';

  // Studio Profile Completeness Check
  const isStudio = userSession?.role === 'studio';
  const isStudioProfileComplete = isStudio && !!(
    (userSession.studioName?.trim() || userSession.name?.trim()) &&
    userSession.phone?.trim() &&
    userSession.email?.trim() &&
    (userSession.address?.trim() || userSession.place?.trim())
  );

  // Requirement 2: Strict User / Studio Dashboard Isolation
  // When logged out, quotes list is EMPTY. Only show quotes that belong to this login ID.
  const userPhone = userSession?.phone?.replace(/\D/g, '').slice(-10);
  const userEmail = userSession?.email?.toLowerCase().trim();
  const userId = userSession?.userId?.toLowerCase().trim();

  const userQuotes = useMemo(() => {
    if (!userSession) return [];

    return leads.filter((l) => {
      // Exclude dummy test leads
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
        const studioRoleMatch = l.createdByRole === 'studio' || l.source === 'studio' || l.createdBy === 'studio' || !!l.studioBranding;
        const studioNameMatch = !!(
          userSession.studioName &&
          userSession.studioName.toLowerCase().trim() !== 'studio partner' &&
          userSession.studioName.toLowerCase().trim() !== 'framelu studio partner' &&
          l.studioBranding?.studioName?.toLowerCase().trim() === userSession.studioName.toLowerCase().trim()
        );
        const matchesUser = emailMatches || phoneMatches || userIdMatches || studioNameMatch;
        return matchesUser && studioRoleMatch;
      } else {
        // Customer session: NEVER show quotes made in Studio mode
        const isCustomerQuote = l.createdByRole !== 'studio' && l.source !== 'studio';
        return (emailMatches || phoneMatches || userIdMatches) && isCustomerQuote;
      }
    });
  }, [leads, userSession, userPhone, userEmail, userId]);

  // Requirement 3: KPI Metrics Calculations without hardcoded dummy counts
  const quoteRequestsCount = userQuotes.filter((q) => q.status === 'Access Sent' || q.source === 'customer').length;
  // Real draft count - only quotes that are drafts / unsubmitted
  const draftQuotesCount = userQuotes.filter((q) => q.status === 'Draft' || q.status === 'Under Review').length;
  const sentQuotesCount = userQuotes.filter((q) => q.status === 'Access Sent' || q.status === 'Quoted').length;
  const confirmedCount = userQuotes.filter((q) => q.status === 'Confirmed' || q.status === 'Booked').length;

  // Calendar Helpers for Mon-Sun Grid
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth(); // 0-indexed (9 = October)
  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesMl = ['ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മേയ്', 'ജൂൺ', 'ജൂലൈ', 'ഓഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ'];
  const currentMonthName = isMl ? monthNamesMl[currentMonth] : monthNamesEn[currentMonth];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedCalendarDay(null);
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedCalendarDay(null);
  };

  // Requirement 3 & Screenshot 2: Year and Month quick jump selectors
  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const handleYearChange = (year: number) => {
    setCalendarDate(new Date(year, currentMonth, 1));
    setSelectedCalendarDay(null);
  };
  const handleMonthChange = (monthIdx: number) => {
    setCalendarDate(new Date(currentYear, monthIdx, 1));
    setSelectedCalendarDay(null);
  };

  // Build calendar matrix (MON - SUN)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Map quotes to granular calendar day events (Groom events, Bride events, Photoshoot, Wedding)
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventItem[]> = {};

    const addEvent = (dateStr: string, item: CalendarEventItem) => {
      if (!dateStr || dateStr.length < 10) return;
      const cleanDate = dateStr.slice(0, 10);
      if (!map[cleanDate]) map[cleanDate] = [];
      map[cleanDate].push(item);
    };

    for (const q of userQuotes) {
      let subEventsFound = false;

      // Check Groom Events
      if (q.groomEvents) {
        for (const evt of KERALA_EVENTS) {
          const cfg = q.groomEvents[evt.id];
          if (cfg && (cfg.enabled || cfg.date)) {
            const targetDate = cfg.date || q.weddingDate;
            if (targetDate) {
              subEventsFound = true;
              addEvent(targetDate, {
                quote: q,
                eventId: `${q.id}-groom-${evt.id}`,
                eventKey: `${q.id}-groom-${evt.id}`,
                eventNameEn: `${evt.nameEn} (Groom)`,
                eventNameMl: `${evt.nameMl} (വരൻ)`,
                side: 'groom',
                dateStr: targetDate.slice(0, 10),
                venue: cfg.venue || q.venueLocation || q.place,
                clientName: q.name || 'Client',
                phone: q.phone,
                amount: q.grandTotal || q.totalPrice || 0,
                status: q.status || 'Draft',
              });
            }
          }
        }
      }

      // Check Bride Events
      if (q.brideEvents) {
        for (const evt of KERALA_EVENTS) {
          const cfg = q.brideEvents[evt.id];
          if (cfg && (cfg.enabled || cfg.date)) {
            const targetDate = cfg.date || q.weddingDate;
            if (targetDate) {
              subEventsFound = true;
              addEvent(targetDate, {
                quote: q,
                eventId: `${q.id}-bride-${evt.id}`,
                eventKey: `${q.id}-bride-${evt.id}`,
                eventNameEn: `${evt.nameEn} (Bride)`,
                eventNameMl: `${evt.nameMl} (വധു)`,
                side: 'bride',
                dateStr: targetDate.slice(0, 10),
                venue: cfg.venue || q.venueLocation || q.place,
                clientName: q.name || 'Client',
                phone: q.phone,
                amount: q.grandTotal || q.totalPrice || 0,
                status: q.status || 'Draft',
              });
            }
          }
        }
      }

      // Check Standalone Photoshoot or Photoshoot details
      if (q.photoshootDetails?.date || q.photoshootDetails?.shootDate) {
        const pDate = q.photoshootDetails.date || q.photoshootDetails.shootDate;
        if (pDate) {
          subEventsFound = true;
          const pName = q.photoshootType || 'Photoshoot';
          addEvent(pDate, {
            quote: q,
            eventId: `${q.id}-photoshoot`,
            eventKey: `${q.id}-photoshoot`,
            eventNameEn: `${pName} Photoshoot`,
            eventNameMl: `${pName} ഫോട്ടോഷൂട്ട്`,
            dateStr: pDate.slice(0, 10),
            venue: q.photoshootDetails.venueLocation || q.venueLocation || q.place,
            clientName: q.name || 'Client',
            phone: q.phone,
            amount: q.grandTotal || q.totalPrice || 0,
            status: q.status || 'Draft',
            isPhotoshoot: true,
          });
        }
      }

      // Check Add-on Photoshoots in selectedServices
      if (q.selectedServices && Array.isArray(q.selectedServices)) {
        for (const srv of q.selectedServices) {
          const sDate = srv.date;
          if (sDate && sDate.length >= 10) {
            subEventsFound = true;
            addEvent(sDate, {
              quote: q,
              eventId: `${q.id}-addon-${srv.packageId}`,
              eventKey: `${q.id}-addon-${srv.packageId}`,
              eventNameEn: `${srv.title || 'Add-on Photoshoot'}`,
              eventNameMl: `${srv.titleMl || srv.title || 'ഫോട്ടോഷൂട്ട് ആഡ്-ഓൺ'}`,
              dateStr: sDate.slice(0, 10),
              venue: srv.venue || q.venueLocation || q.place,
              clientName: q.name || 'Client',
              phone: q.phone,
              amount: srv.price || 0,
              status: q.status || 'Draft',
              isPhotoshoot: true,
              servicePackageId: srv.packageId,
            });
          }
        }
      }

      // Fallback if no sub-event specific dates were found, but weddingDate exists
      if (!subEventsFound && q.weddingDate) {
        addEvent(q.weddingDate, {
          quote: q,
          eventId: `${q.id}-main`,
          eventKey: `${q.id}-main`,
          eventNameEn: q.leadType === 'standalone_photoshoot' ? 'Photoshoot Event' : 'Wedding Ceremony',
          eventNameMl: q.leadType === 'standalone_photoshoot' ? 'ഫോട്ടോഷൂട്ട് ഇവന്റ്' : 'വിവാഹ ചടങ്ങ്',
          dateStr: q.weddingDate.slice(0, 10),
          venue: q.venueLocation || q.place,
          clientName: q.name || 'Client',
          phone: q.phone,
          amount: q.grandTotal || q.totalPrice || 0,
          status: q.status || 'Draft',
        });
      }
    }

    return map;
  }, [userQuotes]);

  // Upcoming events in the future (sorted ascending by date)
  const upcomingEvents = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const list: CalendarEventItem[] = [];

    Object.entries(eventsByDate).forEach(([dateStr, items]) => {
      if (dateStr >= todayStr) {
        list.push(...items);
      }
    });

    return list.sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [eventsByDate]);

  // Events on selected day
  const selectedDateStr = selectedCalendarDay
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedCalendarDay).padStart(2, '0')}`
    : null;
  const eventsOnSelectedDay = selectedDateStr ? (eventsByDate[selectedDateStr] || []) : [];

  const handleToggleEditEvent = (evtItem: CalendarEventItem) => {
    if (editingEventId === evtItem.eventId) {
      setEditingEventId(null);
    } else {
      setEditingEventId(evtItem.eventId);
      setEditDateInput(evtItem.dateStr || '');
      setEditStatusInput((evtItem.status as CustomerLead['status']) || 'Draft');
      setSavedSuccessEventId(null);
    }
  };

  const handleSaveEventDateAndStatus = async (evtItem: CalendarEventItem) => {
    if (!editDateInput || !evtItem.quote.id) return;
    setIsSavingEventDate(true);
    try {
      if (onUpdateLeadDateAndStatus) {
        await onUpdateLeadDateAndStatus(
          evtItem.quote.id,
          editDateInput,
          editStatusInput,
          evtItem.eventKey
        );
      } else if (onUpdateLeadStatus && editStatusInput !== evtItem.status) {
        onUpdateLeadStatus(evtItem.quote.id, editStatusInput);
      }
      setSavedSuccessEventId(evtItem.eventId);
      setTimeout(() => {
        setEditingEventId(null);
        setSavedSuccessEventId(null);
      }, 1000);
    } catch (e) {
      console.error('Failed to save date and status:', e);
    } finally {
      setIsSavingEventDate(false);
    }
  };

  // Requirement 3: Filtered quotes for the bottom list with status filter
  const filteredQuotes = useMemo(() => {
    return userQuotes.filter((q) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'confirmed' && q.status !== 'Confirmed' && q.status !== 'Booked') return false;
        if (statusFilter === 'draft' && q.status !== 'Draft' && q.status !== 'Under Review') return false;
        if (statusFilter === 'sent' && q.status !== 'Access Sent' && q.status !== 'Quoted' && q.status !== 'Sent') return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (q.name || '').toLowerCase().includes(query);
        const phoneMatch = (q.phone || '').includes(query);
        const placeMatch = (q.place || q.venueLocation || '').toLowerCase().includes(query);
        const idMatch = (q.id || '').toLowerCase().includes(query);
        if (!nameMatch && !phoneMatch && !placeMatch && !idMatch) return false;
      }
      return true;
    });
  }, [userQuotes, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in text-stone-900">
      {/* 1. TOP OPERATING SYSTEM HEADER (Requirement 4: English greeting, no fake names) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-1">
            {isMl ? 'സ്റ്റുഡിയോ ഓപ്പറേറ്റിംഗ് സിസ്റ്റം' : 'STUDIO OPERATING SYSTEM'}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-stone-900">
            {isLoggedIn ? `${greetingText}, ${displayName}` : `${greetingText}, Guest`}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {isLoggedIn
              ? (isMl
                  ? `ലോഗിൻ ചെയ്തിരിക്കുന്നത്: ${userSession?.email || userSession?.phone}`
                  : `Signed in as: ${userSession?.email || userSession?.phone}`)
              : (isMl
                  ? 'നിങ്ങളുടെ ഡാഷ്‌ബോർഡും ബുക്കിംഗുകളും കാണാൻ ദയവായി ലോഗിൻ ചെയ്യുക.'
                  : 'Please sign in to view and manage your personalized quotes and calendar.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {!isLoggedIn && onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In to Dashboard'}</span>
            </button>
          )}

          {/* Season Selector Dropdown */}
          <div className="relative">
            <select
              value={seasonSelect}
              onChange={(e) => setSeasonSelect(e.target.value as any)}
              className="appearance-none bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs sm:text-sm font-bold py-2.5 pl-3.5 pr-8 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="2026_2027">2026 – 2027 Season</option>
              <option value="2025_2026">2025 – 2026 Season</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none text-xs">
              ▼
            </span>
          </div>

          {/* "+ New Quote" Sleek Black Button */}
          <button
            type="button"
            onClick={() => {
              if (!isLoggedIn && onOpenLogin) {
                onOpenLogin();
                return;
              }
              onStartNewQuote('wedding');
            }}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer"
          >
            <span className="text-base font-normal leading-none">+</span>
            <span>{isMl ? 'പുതിയ കൊട്ടേഷൻ' : 'New Quote'}</span>
          </button>
        </div>
      </div>

      {/* Non-logged in notice banner */}
      {!isLoggedIn && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-950">
                {isMl ? 'സ്വകാര്യ ഡാഷ്‌ബോർഡ് ആക്‌സസ്' : 'Personal Dashboard Isolation'}
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {isMl
                  ? 'നിങ്ങളുടെ ഇമെയിൽ ഐഡി ഉപയോഗിച്ച് ലോഗിൻ ചെയ്താൽ മാത്രമേ നിങ്ങളുടെ സ്റ്റുഡിയോയുടെ കൊട്ടേഷനുകൾ ഇവിടെ ദൃശ്യമാകൂ.'
                  : 'Please sign in with your Email ID to access your studio/customer quotations and calendar.'}
              </p>
            </div>
          </div>
          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs transition"
            >
              {isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In Now'}
            </button>
          )}
        </div>
      )}

      {/* 2. FOUR KPI STAT CARDS (QUOTE REQUESTS, DRAFT QUOTES, SENT QUOTES, CONFIRMED) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Quote Requests */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
          <span className="text-[10px] font-black tracking-wider uppercase text-stone-400 block mb-1">
            {isMl ? 'കൊട്ടേഷൻ അപേക്ഷകൾ' : 'QUOTE REQUESTS'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {quoteRequestsCount}
          </div>
          <span className="text-xs text-stone-500 font-medium block mt-1">
            {isMl ? 'വെബ്‌സൈറ്റ് ലീഡുകൾ' : 'Website Leads'}
          </span>
        </div>

        {/* Card 2: Draft Quotes (Requirement 3: strictly real unsubmitted count, no forced 1) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
          <span className="text-[10px] font-black tracking-wider uppercase text-stone-400 block mb-1">
            {isMl ? 'ഡ്രാഫ്റ്റ് കൊട്ടേഷനുകൾ' : 'DRAFT QUOTES'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {draftQuotesCount}
          </div>
          <span className="text-xs text-stone-500 font-medium block mt-1">
            {isMl ? 'സബ്മിറ്റ് ചെയ്യാത്തവ' : 'Under Review / Drafts'}
          </span>
        </div>

        {/* Card 3: Sent Quotes */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
          <span className="text-[10px] font-black tracking-wider uppercase text-stone-400 block mb-1">
            {isMl ? 'അയച്ച കൊട്ടേഷനുകൾ' : 'SENT QUOTES'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {sentQuotesCount}
          </div>
          <span className="text-xs text-stone-500 font-medium block mt-1">
            {isMl ? 'കപ്പിൾസിന് നൽകിയത്' : 'With Couples'}
          </span>
        </div>

        {/* Card 4: Confirmed */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition">
          <span className="text-[10px] font-black tracking-wider uppercase text-stone-400 block mb-1">
            {isMl ? 'സ്ഥിരീകരിച്ച ബുക്കിംഗ്' : 'CONFIRMED'}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {confirmedCount}
          </div>
          <span className="text-xs text-stone-500 font-medium block mt-1">
            {isMl ? 'ബുക്ക് ചെയ്ത തീയതികൾ' : 'Booked Dates'}
          </span>
        </div>
      </div>

      {/* Studio Profile Completeness Status Card */}
      {isLoggedIn && isStudio && (
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
          isStudioProfileComplete
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/90 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isStudioProfileComplete ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {isStudioProfileComplete ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black">
                  {isStudioProfileComplete
                    ? (isMl ? 'സ്റ്റുഡിയോ പ്രൊഫൈൽ വെരിഫൈഡ് ആണ്' : 'Studio Profile Complete (Verified Partner)')
                    : (isMl ? 'സ്റ്റുഡിയോ പ്രൊഫൈൽ പൂർത്തിയാക്കുക' : 'Please Complete Studio Profile')}
                </h4>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isStudioProfileComplete ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                }`}>
                  {isStudioProfileComplete ? '100% Complete' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs opacity-80 mt-0.5">
                {isStudioProfileComplete
                  ? `${userSession?.studioName || userSession?.name} • 📞 ${userSession?.phone} • ✉️ ${userSession?.email} • 📍 ${userSession?.place || 'കായംകുളം'}`
                  : (isMl
                      ? 'കൊട്ടേഷനുകളിൽ ശരിയായ സ്റ്റുഡിയോ വിവരങ്ങൾ നൽകുന്നതിനായി പ്രൊഫൈൽ പൂർത്തിയാക്കുക.'
                      : 'Studio name, phone, and address are required to issue official branded proposals.')}
              </p>
            </div>
          </div>
          {!isStudioProfileComplete && onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-xs transition cursor-pointer"
            >
              {isMl ? 'പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക' : 'Complete Profile'}
            </button>
          )}
        </div>
      )}

      {/* 3. MAIN ANALYTICS WINDOW: EVENTS CALENDAR (LEFT 2/3) + TIMELINE (RIGHT 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN: EVENTS CALENDAR (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Calendar Top Header with Quick Month/Year Selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  {isMl ? 'ഇവന്റ്സ് കലണ്ടർ' : 'Events Calendar'}
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isMl ? 'സ്റ്റുഡിയോ ബുക്കിംഗുകളും ഇവന്റ് ഷെഡ്യൂളും' : 'Studio bookings and event schedule'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start sm:self-center">
                {/* Legend: Booked & Conflict */}
                <div className="flex items-center gap-3 text-xs font-semibold text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block ring-2 ring-amber-200" />
                    <span className="text-[11px]">{isMl ? 'ബുക്കിംഗ്' : 'Booked Event'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block ring-2 ring-rose-200" />
                    <span className="text-[11px]">{isMl ? 'കോൺഫ്ലിക്റ്റ് / ഒന്നിലധികം' : 'Multiple / Conflict'}</span>
                  </div>
                </div>

                {/* Month and Year Quick-Switch Selector */}
                <div className="flex items-center gap-1 border border-stone-200 bg-stone-50 rounded-2xl px-2 py-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1 hover:bg-stone-200 rounded-lg text-stone-600 transition cursor-pointer"
                    title="Previous Month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Month Dropdown */}
                  <select
                    value={currentMonth}
                    onChange={(e) => handleMonthChange(Number(e.target.value))}
                    className="bg-transparent text-xs sm:text-sm font-black text-stone-800 py-1 px-1 focus:outline-none cursor-pointer"
                  >
                    {monthNamesEn.map((m, idx) => (
                      <option key={m} value={idx}>
                        {isMl ? monthNamesMl[idx] : m}
                      </option>
                    ))}
                  </select>

                  {/* Year Dropdown */}
                  <select
                    value={currentYear}
                    onChange={(e) => handleYearChange(Number(e.target.value))}
                    className="bg-transparent text-xs sm:text-sm font-black text-stone-800 py-1 px-1 focus:outline-none cursor-pointer"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-stone-200 rounded-lg text-stone-600 transition cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Days Header: MON TUE WED THU FRI SAT SUN */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-black text-stone-400 mb-2 uppercase tracking-wider">
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
              <div>SUN</div>
            </div>

            {/* Calendar Day Cells Grid (Highlights dates with active work/bookings) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Previous Month's Trailing Days */}
              {Array.from({ length: startingDayOfWeek }).map((_, idx) => {
                const prevDay = totalDaysInPrevMonth - startingDayOfWeek + idx + 1;
                return (
                  <div
                    key={`prev-${idx}`}
                    className="h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-stone-100 bg-stone-50/50 text-stone-300 text-xs font-semibold select-none"
                  >
                    {prevDay}
                  </div>
                );
              })}

              {/* Current Month's Days */}
              {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayEvents = eventsByDate[dateKey] || [];
                const isSelected = selectedCalendarDay === day;
                const hasConflict = dayEvents.length > 1;
                const hasBooking = dayEvents.length > 0;
                const isConfirmedDay = !hasConflict && dayEvents.some((e) => e.status === 'Confirmed' || e.status === 'Booked');
                const isCompletedDay = !hasConflict && !isConfirmedDay && dayEvents.some((e) => e.status === 'Completed');

                return (
                  <div
                    key={`curr-${day}`}
                    onClick={() => setSelectedCalendarDay(isSelected ? null : day)}
                    className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'border-amber-600 bg-amber-100/90 shadow-md ring-2 ring-amber-500'
                        : hasConflict
                        ? 'border-rose-400 bg-rose-50/90 hover:bg-rose-100/90 shadow-xs ring-1 ring-rose-300'
                        : isConfirmedDay
                        ? 'border-emerald-400 bg-emerald-50/90 hover:bg-emerald-100/90 shadow-xs ring-1 ring-emerald-300'
                        : isCompletedDay
                        ? 'border-blue-400 bg-blue-50/90 hover:bg-blue-100/90 shadow-xs ring-1 ring-blue-300'
                        : hasBooking
                        ? 'border-amber-400 bg-amber-50/90 hover:bg-amber-100/90 shadow-xs ring-1 ring-amber-300'
                        : 'border-stone-150 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs sm:text-sm font-bold ${
                        isSelected
                          ? 'text-amber-950 font-black'
                          : hasConflict
                          ? 'text-rose-950 font-black'
                          : isConfirmedDay
                          ? 'text-emerald-950 font-black'
                          : isCompletedDay
                          ? 'text-blue-950 font-black'
                          : hasBooking
                          ? 'text-amber-950 font-black'
                          : 'text-stone-800'
                      }`}>
                        {day}
                      </span>
                      {hasBooking && (
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            hasConflict
                              ? 'bg-rose-600 ring-2 ring-rose-200'
                              : isConfirmedDay
                              ? 'bg-emerald-600 ring-2 ring-emerald-200'
                              : isCompletedDay
                              ? 'bg-blue-600 ring-2 ring-blue-200'
                              : 'bg-amber-600 ring-2 ring-amber-200'
                          }`}
                          title={
                            hasConflict
                              ? `${dayEvents.length} Bookings / Conflict!`
                              : isConfirmedDay
                              ? `${dayEvents.length} Confirmed / Booked Event(s)`
                              : isCompletedDay
                              ? `${dayEvents.length} Completed Event(s)`
                              : `${dayEvents.length} Event(s)`
                          }
                        />
                      )}
                    </div>

                    {/* Booking indicator badge inside cell */}
                    {hasBooking && (
                      <div className={`truncate text-[9px] sm:text-[10px] font-extrabold px-1 py-0.5 rounded border mt-1 shadow-2xs ${
                        hasConflict
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : isConfirmedDay
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                          : isCompletedDay
                          ? 'bg-blue-100 text-blue-950 border-blue-300'
                          : 'bg-white/95 text-amber-950 border-amber-300'
                      }`}>
                        <span className="truncate block font-bold">
                          {hasConflict
                            ? `⚠️ ${dayEvents.length} ${isMl ? 'ബുക്കിംഗ്' : 'Events'}`
                            : `${dayEvents[0].clientName?.split(' ')[0]}: ${isMl ? dayEvents[0].eventNameMl.split(' ')[0] : dayEvents[0].eventNameEn.split(' ')[0]}`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Date Panel - Shows All Events on Clicked Date */}
          {selectedCalendarDay && (
            <div className="mt-5 p-4 sm:p-5 bg-amber-50/90 border border-amber-300/80 rounded-3xl animate-fade-in space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-amber-200">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-black text-amber-950 text-sm sm:text-base">
                    {selectedCalendarDay} {currentMonthName} {currentYear}
                  </span>
                  {eventsOnSelectedDay.length > 0 && (
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      eventsOnSelectedDay.length > 1
                        ? 'bg-rose-200 text-rose-900 flex items-center gap-1'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {eventsOnSelectedDay.length > 1 && <AlertTriangle className="w-3 h-3 text-rose-700" />}
                      <span>{eventsOnSelectedDay.length} {isMl ? 'വർക്ക് / ഇവന്റുകൾ' : 'Events Scheduled'}</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCalendarDay(null)}
                  className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer"
                >
                  {isMl ? 'ക്ലോസ് ചെയ്യുക ✕' : 'Close ✕'}
                </button>
              </div>

              {/* If events exist on selected day: show all of them with actions */}
              {eventsOnSelectedDay.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-amber-950 font-bold">
                    {isMl
                      ? `ഈ തീയതിയിൽ എടുത്ത വർക്കുകൾ (${eventsOnSelectedDay.length}):`
                      : `Booked events on this date (${eventsOnSelectedDay.length}):`}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eventsOnSelectedDay.map((evtItem) => (
                      <div
                        key={evtItem.eventId}
                        className="p-3.5 rounded-2xl bg-white border border-amber-300/80 shadow-xs space-y-2 text-xs text-stone-800"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-black text-stone-900 text-sm truncate">{evtItem.clientName}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                              {isMl ? evtItem.eventNameMl : evtItem.eventNameEn}
                            </span>
                          </div>
                          <span className="font-mono font-black text-amber-800 text-sm shrink-0">
                            ₹{evtItem.amount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-stone-600 font-medium">
                          {evtItem.phone && <span>📞 {evtItem.phone}</span>}
                          {evtItem.venue && <span className="truncate max-w-[200px]">📍 {evtItem.venue}</span>}
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                            evtItem.status === 'Confirmed' || evtItem.status === 'Booked'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {evtItem.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => onViewPdf(evtItem.quote)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[10px] font-bold transition cursor-pointer"
                          >
                            PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => onSendWhatsApp(evtItem.quote)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                          >
                            <Share2 className="w-2.5 h-2.5" />
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isLoggedIn && onOpenLogin) {
                                onOpenLogin();
                                return;
                              }
                              handleToggleEditEvent(evtItem);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                              editingEventId === evtItem.eventId
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300'
                            }`}
                            title="Change date or event confirmation status"
                          >
                            <CalendarIcon className="w-3 h-3 text-amber-800" />
                            <span>{isMl ? 'ഡേറ്റ് & സ്റ്റാറ്റസ് മാറ്റുക' : 'Edit Date / Status'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isLoggedIn && onOpenLogin) {
                                onOpenLogin();
                                return;
                              }
                              onEditLead(evtItem.quote);
                            }}
                            className="p-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer ml-auto"
                            title="Full Edit Quote"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inline Reschedule Date & Change Status Editor */}
                        {editingEventId === evtItem.eventId && (
                          <div className="mt-2.5 p-3 rounded-2xl bg-gradient-to-b from-amber-50 to-white border-2 border-amber-400 shadow-md space-y-2.5 animate-fade-in text-left">
                            <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                              <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                                <CalendarIcon className="w-3.5 h-3.5 text-amber-700" />
                                <span>{isMl ? 'തീയതിയും സ്റ്റാറ്റസും അപ്‌ഡേറ്റ് ചെയ്യുക' : 'Reschedule Date & Status'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => setEditingEventId(null)}
                                className="text-[10px] font-bold text-stone-400 hover:text-stone-700"
                              >
                                ✕
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600 block mb-1">
                                  {isMl ? 'പുതിയ തീയതി (Date)' : 'Select New Date'}
                                </label>
                                <input
                                  type="date"
                                  value={editDateInput}
                                  onChange={(e) => setEditDateInput(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-black uppercase tracking-wider text-stone-600 block mb-1">
                                  {isMl ? 'സ്റ്റാറ്റസ് (Status)' : 'Quotation Status'}
                                </label>
                                <select
                                  value={editStatusInput}
                                  onChange={(e) => setEditStatusInput(e.target.value as any)}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 shadow-2xs cursor-pointer"
                                >
                                  <option value="Draft">Draft (ഡ്രാഫ്റ്റ് - Amber)</option>
                                  <option value="Confirmed">Confirmed / Booked (കൺഫേം ചെയ്തത് - Green)</option>
                                  <option value="Completed">Work Completed (വർക്ക് കഴിഞ്ഞു - Blue)</option>
                                  <option value="Under Review">Under Review (പരിശോധനയിൽ)</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80">
                              <div className="text-[10px] font-bold">
                                {savedSuccessEventId === evtItem.eventId ? (
                                  <span className="text-emerald-700 flex items-center gap-1 animate-fade-in">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{isMl ? 'വിജയകരമായി സേവ് ചെയ്തു!' : 'Saved to calendar!'}</span>
                                  </span>
                                ) : (
                                  <span className="text-stone-400 text-[9px]">
                                    {isMl ? 'സേവ് ചെയ്യുമ്പോൾ കലണ്ടറിൽ തീയതി മാറും' : 'Changes update the calendar immediately'}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingEventId(null)}
                                  className="px-2 py-1 text-[11px] font-bold text-stone-500 hover:text-stone-800 cursor-pointer"
                                >
                                  {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  disabled={isSavingEventDate || !editDateInput}
                                  onClick={() => handleSaveEventDateAndStatus(evtItem)}
                                  className="px-3.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-850 active:scale-95 text-white font-black text-xs transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {isSavingEventDate ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                  ) : (
                                    <Check className="w-3 h-3 text-amber-400" />
                                  )}
                                  <span>{isMl ? 'സേവ് ചെയ്യുക' : 'Save Changes'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Option to add another quote on this date */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isLoggedIn && onOpenLogin) {
                          onOpenLogin();
                          return;
                        }
                        onStartNewQuote('wedding', selectedDateStr || undefined);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-950 hover:bg-stone-850 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isMl ? '+ ഈ തീയതിയിൽ മറ്റൊരു കൊട്ടേഷൻ കൂടെ ചേർക്കുക' : '+ Add Another Quote on This Date'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* If no quotation on this date, show Add New Quote section */
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-amber-900 font-medium">
                    {isMl
                      ? 'ഈ തീയതിയിൽ ഇതുവരെ വർക്കുകളോ ബുക്കിംഗുകളോ ഷെഡ്യൂൾ ചെയ്തിട്ടില്ല.'
                      : 'No quotes or bookings scheduled for this date.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoggedIn && onOpenLogin) {
                        onOpenLogin();
                        return;
                      }
                      onStartNewQuote('wedding', selectedDateStr || undefined);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-950 hover:bg-stone-850 text-white text-xs font-black transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isMl
                        ? `ഈ തീയതിക്ക് പുതിയ കൊട്ടേഷൻ നിർമ്മിക്കുക (${selectedCalendarDay} ${currentMonthName})`
                        : `+ Create Quote for ${selectedCalendarDay} ${currentMonthName}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TIMELINE - UPCOMING EVENTS */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            {/* Timeline Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-0.5">
                  {isMl ? 'ടൈംലൈൻ' : 'TIMELINE'}
                </span>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">
                  {isMl ? 'വരാനിരിക്കുന്ന ഇവന്റുകൾ' : 'Upcoming Events'}
                </h3>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {upcomingEvents.length} {isMl ? 'ഇവന്റുകൾ' : 'Upcoming'}
              </span>
            </div>

            {/* Timeline content */}
            {upcomingEvents.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <CalendarIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed font-normal">
                  {isMl
                    ? 'ഇന്നത്തെ തീയതിക്ക് ശേഷം വരാനിരിക്കുന്ന ഇവന്റുകൾ ഒന്നും ലിസ്റ്റ് ചെയ്തിട്ടില്ല.'
                    : 'No upcoming events scheduled after today.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {upcomingEvents.map((evtItem) => (
                  <div
                    key={evtItem.eventId}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 hover:border-amber-400 transition text-left space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <h4 className="text-xs sm:text-sm font-black text-stone-900 truncate">
                          {evtItem.clientName}
                        </h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 shrink-0">
                          {isMl ? evtItem.eventNameMl : evtItem.eventNameEn}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
                        ₹{evtItem.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-stone-500 font-medium">
                      <span className="flex items-center gap-1 text-amber-700 font-bold">
                        <CalendarIcon className="w-3 h-3 text-amber-600" />
                        {evtItem.dateStr}
                      </span>
                      {evtItem.venue && (
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {evtItem.venue}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-stone-150">
                      <button
                        type="button"
                        onClick={() => onViewPdf(evtItem.quote)}
                        className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[10px] font-bold transition cursor-pointer"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => onSendWhatsApp(evtItem.quote)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Share2 className="w-2.5 h-2.5" />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => onEditLead(evtItem.quote)}
                        className="p-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 transition cursor-pointer ml-auto"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Link: View all scheduled events */}
          <div className="pt-4 border-t border-stone-100 text-center">
            <a
              href="#all-quotes-section"
              className="text-xs font-bold text-stone-500 hover:text-stone-900 transition inline-flex items-center gap-1"
            >
              <span>{isMl ? 'എല്ലാ ഇവന്റുകളും കാണുക' : 'View all scheduled events'}</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. QUICK SERVICE CREATION CARDS */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-stone-850 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-3">
          {isMl ? 'സർവീസ് തിരഞ്ഞെടുത്ത് കൊട്ടേഷൻ ആരംഭിക്കുക' : 'Start a New Quote by Service'}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Wedding */}
          <div
            onClick={() => onStartNewQuote('wedding')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {isMl ? 'വിവാഹ ഫോട്ടോഗ്രാഫി' : 'Wedding Photography'}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {isMl ? 'ഇവന്റുകൾ, ക്രൂ & ആൽബങ്ങൾ' : 'Events, Crew, 4K & Albums'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </div>

          {/* Option 2: Photoshoot */}
          <div
            onClick={() => onStartNewQuote('photoshoot')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-rose-400/50 cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {isMl ? 'പ്രത്യേക ഫോട്ടോഷൂട്ട്' : 'Special Photoshoots'}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {isMl ? 'ബർത്ത്ഡേ, ബേബി, മോഡൽ' : 'Birthday, Baby Shower, Model'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </div>

          {/* Option 3: Other Services */}
          <div
            onClick={() => onStartNewQuote('other_services')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white">
                  {isMl ? 'മറ്റ് വെഡ്ഡിംഗ് സർവീസുകൾ' : 'Other Wedding Services'}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {isMl ? 'സദ്യ, സ്റ്റേജ് ഡെക്കോർ, മേക്കപ്പ്' : 'Catering, Decor, Makeup & Cars'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* 5. ALL QUOTES LIST SECTION (Requirement 3: Status Filtering) */}
      <div id="all-quotes-section" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              {isMl ? 'തയ്യാറാക്കിയ എല്ലാ കൊട്ടേഷനുകളും' : 'All Quotations & Bookings'}
            </h2>
            <p className="text-stone-500 text-xs">
              {isMl
                ? `ആകെ ${filteredQuotes.length} കൊട്ടേഷനുകൾ ലഭ്യമാണ്`
                : `${filteredQuotes.length} total quotes in system`}
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isMl ? 'തിരയുക (പേര്, ഫോൺ)...' : 'Search by name, phone...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-250 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 w-44 sm:w-52"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-stone-250 text-xs font-bold bg-white focus:outline-none cursor-pointer"
            >
              <option value="all">{isMl ? 'എല്ലാ സ്റ്റാറ്റസും (All)' : 'All Status'}</option>
              <option value="confirmed">{isMl ? 'കൺഫേംഡ് ബുക്കിംഗ് (Confirmed)' : 'Confirmed Bookings'}</option>
              <option value="sent">{isMl ? 'അയച്ച കൊട്ടേഷനുകൾ (Sent)' : 'Sent to Client'}</option>
              <option value="draft">{isMl ? 'ഡ്രാഫ്റ്റ് (Draft / Under Review)' : 'Draft / Under Review'}</option>
            </select>
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl border-2 border-dashed border-stone-250 bg-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900">
              {isMl ? 'കൊട്ടേഷനുകൾ ഒന്നും കണ്ടെത്തിയില്ല' : 'No Quotations Found'}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
              {!isLoggedIn
                ? (isMl
                    ? 'നിങ്ങളുടെ അക്കൗണ്ടിലുള്ള കൊട്ടേഷനുകൾ കാണാൻ ദയവായി ലോഗിൻ ചെയ്യുക.'
                    : 'Please sign in to see your quotes, or click "+ New Quote" to build a new proposal.')
                : (isMl
                    ? 'നിങ്ങളുടെ ആദ്യത്തെ കൊട്ടേഷൻ നിർമ്മിക്കാൻ മുകളിലുള്ള "+ New Quote" ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.'
                    : 'Click "+ New Quote" above to build your first wedding or photoshoot quotation.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredQuotes.map((quote) => {
              const quoteAmount = quote.grandTotal || quote.totalPrice || 0;
              const quoteNo = quote.id || 'FWC-QUOTE';
              const isConfirmed = quote.status === 'Confirmed' || quote.status === 'Booked';

              return (
                <div
                  key={quoteNo}
                  className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        #{quoteNo}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : quote.status === 'Draft'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {quote.status || 'Active Quote'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-stone-900">
                      {quote.name || 'Valued Client'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3.5 text-xs text-stone-500 font-medium">
                      {quote.weddingDate && (
                        <div className="flex items-center gap-1 text-amber-700 font-bold">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                          <span>{quote.weddingDate}</span>
                        </div>
                      )}
                      {quote.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{quote.phone}</span>
                        </div>
                      )}
                      {(quote.venueLocation || quote.place) && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          <span className="truncate max-w-[200px]">{quote.venueLocation || quote.place}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="flex flex-col md:items-end justify-between gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block">
                        Estimated Total
                      </span>
                      <span className="text-xl font-black text-amber-700 block">
                        ₹{quoteAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Versatile Status Selector */}
                      {onUpdateLeadStatus && (
                        <div className="relative">
                          <select
                            value={quote.status || 'Draft'}
                            onChange={(e) => onUpdateLeadStatus(quote.id || '', e.target.value as any)}
                            className={`appearance-none py-1.5 pl-2.5 pr-6 rounded-xl text-xs font-black transition cursor-pointer border shadow-2xs ${
                              quote.status === 'Confirmed' || quote.status === 'Booked'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : quote.status === 'Completed'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-stone-50 text-stone-700 border-stone-250'
                            }`}
                            title={isMl ? 'സ്റ്റാറ്റസ് മാറ്റുക' : 'Change Status'}
                          >
                            <option value="Draft">Draft (ഡ്രാഫ്റ്റ്)</option>
                            <option value="Access Sent">Sent (അയച്ചു)</option>
                            <option value="Confirmed">Confirmed (കൺഫേംഡ്)</option>
                            <option value="Completed">Completed (പൂർത്തിയായി)</option>
                          </select>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-stone-500">
                            ▼
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => onViewPdf(quote)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition cursor-pointer"
                        title="View Official Quotation PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-stone-600" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSendWhatsApp(quote)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        title="Send quotation via WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditLead(quote)}
                        className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition cursor-pointer"
                        title="Edit Quote"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteLead && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(isMl ? 'ഈ കൊട്ടേഷൻ നീക്കം ചെയ്യണോ?' : 'Delete this quotation?')) {
                              onDeleteLead(quote.id || '');
                            }
                          }}
                          className="p-1.5 rounded-xl bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Quote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
