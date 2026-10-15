'use client';

import React, { useState } from 'react';
import {
  PriceRates,
  CustomerLead,
  StudioContactConfig,
  PromoOffer,
  HighlightBoard,
  CustomPrintItem,
} from '@/types';
import {
  Shield,
  Sliders,
  Users,
  Tag,
  Save,
  RotateCcw,
  Phone,
  MessageCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Trash2,
  Plus,
  MapPin,
  Mail,
  LogOut,
  LayoutTemplate,
  Gift,
  Film,
  Camera,
  Eye,
  FileText,
  ExternalLink,
  X,
  CreditCard,
  Sparkles,
  ArrowRight,
  BookOpen,
  Coffee,
  HardDrive,
} from 'lucide-react';
import { DEFAULT_RATES, DEFAULT_STUDIO_CONTACT, DEFAULT_OFFERS, DEFAULT_HIGHLIGHT_BOARDS, KERALA_EVENTS, DEFAULT_DELIVERABLES, DEFAULT_CUSTOM_PRINTS } from '@/constants/defaults';
import { calculateCustomQuote, CalculationResult } from '@/utils/calculator';
import { PdfQuotationView } from '@/components/PdfQuotationView';

interface AdminDashboardProps {
  rates: PriceRates;
  setRates: React.Dispatch<React.SetStateAction<PriceRates>>;
  leads: CustomerLead[];
  setLeads: React.Dispatch<React.SetStateAction<CustomerLead[]>>;
  studioContact: StudioContactConfig;
  setStudioContact: React.Dispatch<React.SetStateAction<StudioContactConfig>>;
  offers: PromoOffer[];
  setOffers: React.Dispatch<React.SetStateAction<PromoOffer[]>>;
  highlightBoards: HighlightBoard[];
  setHighlightBoards: React.Dispatch<React.SetStateAction<HighlightBoard[]>>;
  customPrintItems?: CustomPrintItem[];
  setCustomPrintItems?: React.Dispatch<React.SetStateAction<CustomPrintItem[]>>;
  onCloseAdmin: () => void;
  language?: 'en' | 'ml';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  rates,
  setRates,
  leads,
  setLeads,
  studioContact,
  setStudioContact,
  offers,
  setOffers,
  highlightBoards,
  setHighlightBoards,
  customPrintItems = DEFAULT_CUSTOM_PRINTS,
  setCustomPrintItems,
  onCloseAdmin,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const [activeAdminTab, setActiveAdminTab] = useState<'rates' | 'prints' | 'leads' | 'contact' | 'offers' | 'boards'>('leads');
  const [tempRates, setTempRates] = useState<PriceRates>(rates);
  const [tempContact, setTempContact] = useState<StudioContactConfig>(studioContact);
  const [tempCustomPrints, setTempCustomPrints] = useState<CustomPrintItem[]>(customPrintItems);
  const [savedSuccess, setSavedSuccess] = useState('');
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // New Print Item Form State
  const [newPrintItem, setNewPrintItem] = useState<Partial<CustomPrintItem>>({
    nameEn: '',
    nameMl: '',
    price: 500,
    unitName: 'Nos',
    descriptionEn: '',
    descriptionMl: '',
    icon: 'printer',
  });

  // New Offer Form State
  const [newOffer, setNewOffer] = useState<Partial<PromoOffer>>({
    title: '',
    titleMl: '',
    badge: 'Limited Offer',
    description: '',
    validTill: '2026-12-31',
    posterUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    active: true,
  });

  // New Highlight Board Form State
  const [newBoard, setNewBoard] = useState<Partial<HighlightBoard>>({
    title: '',
    titleMl: '',
    tag: 'Special Package',
    price: 95000,
    description: '',
    features: ['Wedding Day & Reception Complete Coverage', 'Full HD Edited Video & 4K Highlight', '35-Sheet Premium Album'],
  });

  // Sync temp states
  React.useEffect(() => {
    setTempRates(rates);
  }, [rates]);

  React.useEffect(() => {
    setTempContact(studioContact);
  }, [studioContact]);

  React.useEffect(() => {
    setTempCustomPrints(customPrintItems);
  }, [customPrintItems]);

  const showNotification = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => setSavedSuccess(''), 4000);
  };

  const handleRateChange = (field: keyof PriceRates, val: number) => {
    setTempRates((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleAlbumFinishRateChange = (finishKey: string, val: number) => {
    setTempRates((prev) => ({
      ...prev,
      albumFinishes: {
        ...prev.albumFinishes,
        [finishKey]: val,
      },
    }));
  };

  const handleUpdateCustomPrintPrice = (id: string, price: number) => {
    setTempCustomPrints((prev) =>
      prev.map((it) => (it.id === id ? { ...it, price } : it))
    );
  };

  const handleSaveCustomPrints = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (setCustomPrintItems) {
      setCustomPrintItems(tempCustomPrints);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_custom_prints', JSON.stringify(tempCustomPrints));
    }
    showNotification(isMl ? 'അഡീഷണൽ പ്രിന്റ് നിരക്കുകൾ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Additional prints updated successfully!');
  };

  const handleAddNewPrintItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrintItem.nameEn?.trim() || !newPrintItem.price) {
      alert(isMl ? 'ദയവായി പേരും നിരക്കും നൽകുക' : 'Please provide item name and price');
      return;
    }
    const id = `print_${Date.now()}`;
    const newItem: CustomPrintItem = {
      id,
      nameEn: newPrintItem.nameEn.trim(),
      nameMl: newPrintItem.nameMl?.trim() || newPrintItem.nameEn.trim(),
      price: Number(newPrintItem.price) || 0,
      unitName: newPrintItem.unitName || 'Nos',
      descriptionEn: newPrintItem.descriptionEn || '',
      descriptionMl: newPrintItem.descriptionMl || newPrintItem.descriptionEn || '',
      icon: newPrintItem.icon || 'printer',
    };

    const updated = [...tempCustomPrints, newItem];
    setTempCustomPrints(updated);
    if (setCustomPrintItems) {
      setCustomPrintItems(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_custom_prints', JSON.stringify(updated));
    }
    setNewPrintItem({
      nameEn: '',
      nameMl: '',
      price: 500,
      unitName: 'Nos',
      descriptionEn: '',
      descriptionMl: '',
      icon: 'printer',
    });
    showNotification(isMl ? 'പുതിയ അഡീഷണൽ പ്രിന്റ് സെക്ഷൻ ആഡ് ചെയ്തു!' : 'New additional print item added!');
  };

  const handleDeletePrintItem = (id: string) => {
    if (confirm(isMl ? 'ഈ പ്രിന്റ് ഐറ്റം ഒഴിവാക്കണോ?' : 'Delete this print item?')) {
      const updated = tempCustomPrints.filter((it) => it.id !== id);
      setTempCustomPrints(updated);
      if (setCustomPrintItems) {
        setCustomPrintItems(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_custom_prints', JSON.stringify(updated));
      }
      showNotification(isMl ? 'പ്രിന്റ് ഐറ്റം നീക്കം ചെയ്തു' : 'Print item deleted');
    }
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    setRates(tempRates);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_rates', JSON.stringify(tempRates));
      localStorage.setItem('lumina_wedding_rates', JSON.stringify(tempRates));
    }
    showNotification(isMl ? 'നിരക്കുകൾ വിജയകരമായി അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Rates saved successfully!');
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setStudioContact(tempContact);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_wedding_contact', JSON.stringify(tempContact));
    }
    showNotification(isMl ? 'സ്റ്റുഡിയോ കോൺടാക്റ്റ് വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Studio contact details updated!');
  };

  const handleResetRates = () => {
    if (confirm(isMl ? 'എല്ലാ നിരക്കുകളും ഡീഫോൾട്ട് റേറ്റുകളിലേക്ക് മാറ്റണോ?' : 'Reset all rates to defaults?')) {
      setTempRates(DEFAULT_RATES);
      setRates(DEFAULT_RATES);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lumina_wedding_rates');
      }
      showNotification(isMl ? 'ഡീഫോൾട്ട് റേറ്റുകളിലേക്ക് മാറ്റി' : 'Reset to default rates');
    }
  };

  const updateLeadStatus = (leadIndex: number, newStatus: CustomerLead['status']) => {
    setLeads((prev) => {
      const updated = [...prev];
      updated[leadIndex] = {
        ...updated[leadIndex],
        status: newStatus,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteLead = (leadIndex: number) => {
    if (confirm(isMl ? 'ഈ ലീഡ് ഒഴിവാക്കണോ?' : 'Delete this customer lead?')) {
      setLeads((prev) => {
        const updated = prev.filter((_, idx) => idx !== leadIndex);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title?.trim()) {
      alert('Please enter offer title');
      return;
    }

    const offerItem: PromoOffer = {
      id: `offer_${Date.now()}`,
      title: newOffer.title || 'Special Deal',
      titleMl: newOffer.titleMl || newOffer.title || 'പ്രത്യേക ഓഫർ',
      badge: newOffer.badge || 'Season Special',
      description: newOffer.description || 'Exclusive wedding photography package offer',
      validTill: newOffer.validTill || '2026-12-31',
      posterUrl: newOffer.posterUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      active: true,
    };

    setOffers((prev) => {
      const updated = [offerItem, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina_wedding_offers', JSON.stringify(updated));
      }
      return updated;
    });

    setNewOffer({
      title: '',
      titleMl: '',
      badge: 'Limited Offer',
      description: '',
      validTill: '2026-12-31',
      posterUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      active: true,
    });

    showNotification(isMl ? 'പുതിയ ഓഫർ വിജയകരമായി ചേർത്തു!' : 'New offer poster added!');
  };

  const handleDeleteOffer = (id: string) => {
    if (confirm(isMl ? 'ഈ ഓഫർ ഒഴിവാക്കണോ?' : 'Delete this offer?')) {
      setOffers((prev) => {
        const updated = prev.filter((o) => o.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_offers', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  const handleAddBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoard.title?.trim()) {
      alert('Please enter package title');
      return;
    }

    const boardItem: HighlightBoard = {
      id: `board_${Date.now()}`,
      title: newBoard.title || 'Featured Package',
      titleMl: newBoard.titleMl || newBoard.title || 'പ്രത്യേക പാക്കേജ്',
      tag: newBoard.tag || 'Special Offer',
      price: Number(newBoard.price) || 85000,
      description: newBoard.description || 'Complete wedding photography bundle',
      features: newBoard.features && newBoard.features.length > 0 ? newBoard.features : ['Wedding Day Coverage', 'Main Album', '4K Video'],
    };

    setHighlightBoards((prev) => {
      const updated = [boardItem, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina_wedding_boards', JSON.stringify(updated));
      }
      return updated;
    });

    setNewBoard({
      title: '',
      titleMl: '',
      tag: 'Special Package',
      price: 95000,
      description: '',
      features: ['Wedding Day & Reception Complete Coverage', 'Full HD Edited Video & 4K Highlight', '35-Sheet Premium Album'],
    });

    showNotification(isMl ? 'പുതിയ ഹൈലൈറ്റ് പാക്കേജ് ബോർഡ് ചേർത്തു!' : 'New Highlight Package Board added!');
  };

  const handleDeleteBoard = (id: string) => {
    if (confirm(isMl ? 'ഈ ബോർഡ് ഒഴിവാക്കണോ?' : 'Delete this package board?')) {
      setHighlightBoards((prev) => {
        const updated = prev.filter((b) => b.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_boards', JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner with Close / Exit Button */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-stone-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Master Control & Management</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isMl ? 'സ്റ്റുഡിയോ അഡ്മിൻ പാനൽ' : 'Studio Admin Portal'}
          </h2>
          <p className="text-stone-400 text-xs sm:text-sm mt-1">
            {isMl
              ? 'നിരക്കുകൾ, ടീസർ & ഹൈലൈറ്റ് റേറ്റുകൾ, ഓഫറുകൾ, പോസ്റ്ററുകൾ, സ്റ്റുഡിയോ ഫോൺ & വാട്ട്സാപ്പ് വിവരങ്ങൾ നിയന്ത്രിക്കുക'
              : 'Manage pricing rates, highlight/teaser videos, promo offers & posters, studio contact & leads'}
          </p>
        </div>

        {/* Exit Admin Button */}
        <button
          type="button"
          onClick={onCloseAdmin}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg transition self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>{isMl ? 'അഡ്മിൻ പാനൽ ക്ലോസ് ചെയ്യുക' : 'Close Admin & Exit'}</span>
        </button>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap gap-2 mb-8 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 text-xs font-bold text-stone-700">
        <button
          type="button"
          onClick={() => setActiveAdminTab('rates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'rates'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isMl ? 'റേറ്റ് കാർഡ്' : 'Rate Card'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('prints')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'prints'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isMl ? `അഡീഷണൽ പ്രിന്റുകൾ (${tempCustomPrints.length})` : `Additional Prints (${tempCustomPrints.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'contact'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{isMl ? 'ഫോൺ, WhatsApp & സ്ഥലം' : 'Phone, WhatsApp & Location'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('offers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'offers'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>{isMl ? `ഓഫറുകൾ & പോസ്റ്ററുകൾ (${offers.length})` : `Offers & Posters (${offers.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('boards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'boards'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <LayoutTemplate className="w-4 h-4" />
          <span>{isMl ? `ഹൈലൈറ്റ് ബോർഡുകൾ (${highlightBoards.length})` : `Highlight Boards (${highlightBoards.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('leads')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'leads'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isMl ? `കസ്റ്റമർ ലീഡുകൾ (${leads.length})` : `Customer Leads (${leads.length})`}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* 1. Rates Management Tab */}
      {activeAdminTab === 'rates' && (
        <form onSubmit={handleSaveRates} className="space-y-6 animate-fade-in">
          {/* Crew Rates */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {isMl ? 'ഫോട്ടോഗ്രാഫർ & വീഡിയോഗ്രാഫർ പെർ-ഡേ റേറ്റ്' : 'Crew Daily Rates'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              {isMl
                ? 'ഓരോ ഇവന്റിലെയും ഫോട്ടോഗ്രാഫർമാരുടെ ഒരു ദിവസത്തെ അടിസ്ഥാന നിരക്കുകൾ'
                : 'Base per-day rates for crew members per event'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Traditional Photographer (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.traditionalPhotographer}
                  onChange={(e) =>
                    handleRateChange('traditionalPhotographer', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Traditional Videographer (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.traditionalVideographer}
                  onChange={(e) =>
                    handleRateChange('traditionalVideographer', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Candid Photographer (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.candidPhotographer}
                  onChange={(e) =>
                    handleRateChange('candidPhotographer', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Candid Videographer / Cinematographer (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.candidVideographer}
                  onChange={(e) =>
                    handleRateChange('candidVideographer', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Video Highlights & Teaser Rates (User specifically requested this!) */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-stone-900">
                {isMl ? 'ഹൈലൈറ്റ് വീഡിയോ & ടീസർ നിരക്കുകൾ' : 'Highlight Video & Teaser Rates'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              {isMl
                ? 'സിനിമാറ്റിക് ഹൈലൈറ്റ് വീഡിയോ, ടീസർ പ്രൊമോ, 4K വീഡിയോ നിരക്കുകൾ'
                : 'Configure rates for Cinematic Highlight Video, Teaser Promo, 4K and Reels'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Cinematic Highlight Video (3-5 Mins) (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.highlightVideo}
                  onChange={(e) =>
                    handleRateChange('highlightVideo', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Cinematic Teaser Promo (1-2 Mins) (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.teaserVideo || 3500}
                  onChange={(e) =>
                    handleRateChange('teaserVideo', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Length Traditional Video (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.fullLengthVideo}
                  onChange={(e) =>
                    handleRateChange('fullLengthVideo', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  4K Ultra HD Resolution Add-on (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.resolution4kAddon}
                  onChange={(e) =>
                    handleRateChange('resolution4kAddon', Number(e.target.value))
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Aerial & Broadcast Rates */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {isMl ? 'ഡ്രോൺ, ലൈവ് സ്ട്രീമിംഗ് & ഇൻസ്റ്റന്റ് പ്രിന്റിംഗ്' : 'Aerial Drone & Live Streaming Rates'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              {isMl ? 'ഓരോ ഇവന്റിലെയും ഡ്രോൺ, യൂട്യൂബ് ലൈവ്, ഓഡിറ്റോറിയം സ്ക്രീൻ ചാർജുകൾ' : 'Rates per event for special broadcast amenities'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Aerial Drone Shoot (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.dronePerEvent}
                  onChange={(e) => handleRateChange('dronePerEvent', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  YouTube Live Broadcast (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.youtubeLivePerEvent}
                  onChange={(e) => handleRateChange('youtubeLivePerEvent', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Auditorium In-Hall Live Display (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.auditoriumLivePerEvent}
                  onChange={(e) => handleRateChange('auditoriumLivePerEvent', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Photo Live Printing (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.photoLivePrintingPerEvent}
                  onChange={(e) => handleRateChange('photoLivePrintingPerEvent', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Photo Frames & Album Base Rates */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              {isMl ? 'ആൽബം & ഫോട്ടോ ഫ്രെയിമുകൾ' : 'Albums & Photo Frame Rates'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              {isMl ? 'മെയിൻ ആൽബം ബേസ് റേറ്റ്, അധിക പേജ് നിരക്കുകൾ, പ്രീസെറ്റ് ഫ്രെയിം നിരക്കുകൾ' : 'Base album and preset frame rates'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Base Album Rate (30 Sheets) (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.baseAlbumRate}
                  onChange={(e) => handleRateChange('baseAlbumRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Extra Sheet Rate (Per Sheet) (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.extraSheetRate}
                  onChange={(e) => handleRateChange('extraSheetRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  8x12 Frame Rate (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.frame_8x12}
                  onChange={(e) => handleRateChange('frame_8x12', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  18x12 Frame Rate (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.frame_18x12}
                  onChange={(e) => handleRateChange('frame_18x12', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  15x20 Frame Rate (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.frame_15x20}
                  onChange={(e) => handleRateChange('frame_15x20', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Per Reel Rate (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.reelRate}
                  onChange={(e) => handleRateChange('reelRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Pen Drive Rate (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.penDriveRate}
                  onChange={(e) => handleRateChange('penDriveRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mini Album Rate (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.miniAlbumRate}
                  onChange={(e) => handleRateChange('miniAlbumRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Custom Keepsake Box (Pen Drive) (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.penDriveBoxRate ?? 1800}
                  onChange={(e) => handleRateChange('penDriveBoxRate', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50"
                />
              </div>
            </div>
          </div>

          {/* Main Album Paper & Finish Rates */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-stone-900">
                {isMl ? 'മെയിൻ വെഡ്ഡിംഗ് ആൽബം ഫിനിഷ് നിരക്കുകൾ' : 'Album Paper & Cover Finish Rates'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-5">
              {isMl
                ? 'നോർമൽ, പ്രീമിയം, എക്സ്ട്രാ പ്രീമിയം, ലെതർ, ഗ്ലാസ്, ഫുൾ ഗ്ലാസ് ആൽബം കവറുകളുടെ റേറ്റ് അപ്‌ഡേറ്റ് ചെയ്യുക'
                : 'Configure rates for Normal, Premium, Extra Premium, Leather, Glass, and Full Glass Album Covers'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Normal Cover / നോർമൽ (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.albumFinishes?.normal ?? 0}
                  onChange={(e) => handleAlbumFinishRateChange('normal', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Premium Cover / പ്രീമിയം (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.albumFinishes?.premium ?? 1500}
                  onChange={(e) => handleAlbumFinishRateChange('premium', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Extra Premium Cover / എക്സ്ട്രാ പ്രീമിയം (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.albumFinishes?.extra_premium ?? 2500}
                  onChange={(e) => handleAlbumFinishRateChange('extra_premium', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Leather Cover / ലെതർ (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.albumFinishes?.leather ?? 3500}
                  onChange={(e) => handleAlbumFinishRateChange('leather', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Glass Cover / ഗ്ലാസ് (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.albumFinishes?.glass ?? 4500}
                  onChange={(e) => handleAlbumFinishRateChange('glass', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Glass Cover / ഫുൾ ഗ്ലാസ് (₹)
                </label>
                <input
                  type="number"
                  value={tempRates.albumFinishes?.full_glass ?? 6000}
                  onChange={(e) => handleAlbumFinishRateChange('full_glass', Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetRates}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isMl ? 'ഡീഫോൾട്ട് റേറ്റുകളിലേക്ക് മാറ്റുക' : 'Reset to Defaults'}</span>
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{isMl ? 'നിരക്കുകൾ സേവ് ചെയ്യുക (Save Rates)' : 'Save All Rates'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Additional Print Products & Dynamic Creation Tab */}
      {activeAdminTab === 'prints' && (
        <div className="space-y-6 animate-fade-in">
          {/* List of Current Print Items */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {isMl ? 'അഡീഷണൽ പ്രിന്റ് & ഫ്രെയിം ഉൽപ്പന്നങ്ങൾ' : 'Additional Print & Keepsake Items'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {isMl
                    ? 'മന്ത്ലി കലണ്ടർ, 12 മന്ത് കലണ്ടർ, ഗ്ലാസ് കലണ്ടർ, ടേബിൾ ടോപ്പ് കലണ്ടർ എന്നിവയുടെ വില മാറ്റുകയോ പുതിയ സെക്ഷനുകൾ ആഡ് ചെയ്യുകയോ ചെയ്യാം'
                    : 'Manage prices for calendars, mugs, mini albums, and add new custom print deliverables'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSaveCustomPrints()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition self-start sm:self-auto"
              >
                <Save className="w-4 h-4" />
                <span>{isMl ? 'പ്രിന്റ് നിരക്കുകൾ സേവ് ചെയ്യുക' : 'Save Print Rates'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tempCustomPrints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-white transition flex flex-col justify-between shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">
                          {isMl ? item.nameMl : item.nameEn}
                        </h4>
                        <span className="text-[11px] text-stone-500 font-medium block">
                          {isMl ? item.nameEn : item.nameMl}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeletePrintItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded-lg transition"
                        title={isMl ? 'ഒഴിവാക്കുക' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-2">
                      {isMl ? item.descriptionMl : item.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-stone-600">
                      {isMl ? 'റേറ്റ് (₹):' : 'Rate (₹):'}
                    </span>
                    <div className="relative flex-1 max-w-[140px]">
                      <span className="absolute left-2.5 top-2 text-xs font-bold text-stone-400">₹</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleUpdateCustomPrintPrice(item.id, Number(e.target.value))}
                        className="w-full pl-6 pr-2.5 py-1.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form to Add New Additional Print Product */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-1">
              <Plus className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-black text-stone-900">
                {isMl ? 'പുതിയ അഡീഷണൽ പ്രിന്റ് സെക്ഷൻ ആഡ് ചെയ്യുക' : 'Add New Additional Print Product'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 mb-6">
              {isMl
                ? 'പുതിയ ഉൽപ്പന്നത്തിന്റെ പേരും നിരക്കും നൽകിയാൽ അത് കസ്റ്റമൈസർ പേജിൽ ലഭ്യമാകും'
                : 'Define a new keepsake product with custom pricing that immediately appears in the customer deliverables tab'}
            </p>

            <form onSubmit={handleAddNewPrintItem} className="space-y-4 max-w-3xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഇംഗ്ലീഷ് പേര് (Name in English) *' : 'Item Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Glass Calendar / Luxury Photo Frame"
                    value={newPrintItem.nameEn}
                    onChange={(e) => setNewPrintItem({ ...newPrintItem, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'മലയാളം പേര് (Name in Malayalam)' : 'Item Name (Malayalam)'}
                  </label>
                  <input
                    type="text"
                    placeholder="ഉദാ: ഗ്ലാസ് കലണ്ടർ / ഫോട്ടോ ഫ്രെയിം"
                    value={newPrintItem.nameMl}
                    onChange={(e) => setNewPrintItem({ ...newPrintItem, nameMl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'റേറ്റ് (Price ₹) *' : 'Price / Rate (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="e.g. 1500"
                    value={newPrintItem.price}
                    onChange={(e) => setNewPrintItem({ ...newPrintItem, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'യൂണിറ്റ് (Unit Name)' : 'Unit Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="Nos / Pieces / Copies"
                    value={newPrintItem.unitName}
                    onChange={(e) => setNewPrintItem({ ...newPrintItem, unitName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'വിവരണം (Description)' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Premium HD UV Printed Acrylic Glass Calendar"
                  value={newPrintItem.descriptionEn}
                  onChange={(e) =>
                    setNewPrintItem({
                      ...newPrintItem,
                      descriptionEn: e.target.value,
                      descriptionMl: newPrintItem.descriptionMl || e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'സെക്ഷൻ ആഡ് ചെയ്യുക (Add Section)' : 'Add Print Product Section'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Studio Contact, Destination & WhatsApp Settings (User specifically requested this!) */}
      {activeAdminTab === 'contact' && (
        <form onSubmit={handleSaveContact} className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in max-w-3xl">
          <div>
            <h3 className="text-xl font-black text-stone-900">
              {isMl ? 'അഡ്മിൻ ഫോൺ നമ്പർ, ഡെസ്റ്റിനേഷൻ & WhatsApp ക്രമീകരണങ്ങൾ' : 'Studio Contact & Location Settings'}
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              {isMl
                ? 'ഇവിടെ നൽകുന്ന വിവരങ്ങൾ വെബ്സൈറ്റിന്റെ ടോപ്പ് ബാറിലും, WhatsApp ചാറ്റ് ബട്ടണിലും, PDF കൊട്ടേഷനിലും കാണിക്കും'
                : 'These details reflect immediately on website headers, WhatsApp direct enquiry links, and PDF quotes'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'അഡ്മിൻ / സ്റ്റുഡിയോ ഫോൺ നമ്പർ (Phone Number)' : 'Studio Phone Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={tempContact.phone}
                  onChange={(e) => setTempContact({ ...tempContact, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'WhatsApp നമ്പർ (നമ്പർ മാത്രം, ഉദാ: 919876543210)' : 'WhatsApp Number (Country code + 10 digits)'}
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={tempContact.whatsapp}
                  onChange={(e) => setTempContact({ ...tempContact, whatsapp: e.target.value })}
                  placeholder="919876543210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Destination / Location Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'സ്റ്റുഡിയോ ഡെസ്റ്റിനേഷൻ / ലൊക്കേഷൻ (Location & Destination)' : 'Studio Location / Destination'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={tempContact.destination}
                  onChange={(e) => setTempContact({ ...tempContact, destination: e.target.value })}
                  placeholder="കായംകുളം, ആലപ്പുഴ (Kayamkulam, Kerala)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Studio Email */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'സ്റ്റുഡിയോ ഇമെയിൽ (Studio Email)' : 'Studio Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-blue-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={tempContact.email}
                  onChange={(e) => setTempContact({ ...tempContact, email: e.target.value })}
                  placeholder="frameluweddings@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>{isMl ? 'വിവരങ്ങൾ സേവ് ചെയ്യുക' : 'Save Contact Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Offers & Promotional Posters Manager (User specifically requested this!) */}
      {activeAdminTab === 'offers' && (
        <div className="space-y-8 animate-fade-in">
          {/* Add New Offer Form */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-stone-900 mb-1">
              {isMl ? 'പുതിയ ഓഫറും പോസ്റ്ററും ചേർക്കുക' : 'Add New Promotional Offer & Poster'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              {isMl
                ? 'ഫ്രണ്ട് എൻഡിലെ ഓഫർ സെക്ഷനിലേക്ക് പുതിയ പ്രൊമോഷണൽ പോസ്റ്ററും ഡിസ്കൗണ്ടും ചേർക്കാം'
                : 'Add promotional banners and deals visible in the customer Offers section'}
            </p>

            <form onSubmit={handleAddOffer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Offer Title (English) *
                </label>
                <input
                  type="text"
                  placeholder="Wedding Season Special Combo"
                  value={newOffer.title || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Offer Title (മലയാളം)
                </label>
                <input
                  type="text"
                  placeholder="വെഡ്ഡിംഗ് സീസൺ സ്പെഷ്യൽ കോംബോ"
                  value={newOffer.titleMl || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, titleMl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Offer Badge / Tag (e.g. 20% OFF / Free Drone)
                </label>
                <input
                  type="text"
                  placeholder="Limited Period • 20% OFF"
                  value={newOffer.badge || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, badge: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Valid Till (Date)
                </label>
                <input
                  type="date"
                  value={newOffer.validTill || '2026-12-31'}
                  onChange={(e) => setNewOffer({ ...newOffer, validTill: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Poster Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newOffer.posterUrl || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, posterUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Description / Offer Inclusions
                </label>
                <textarea
                  rows={2}
                  placeholder="Book both sides and receive free drone coverage..."
                  value={newOffer.description || ''}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'ഓഫർ പോസ്റ്റർ ആഡ് ചെയ്യുക' : 'Publish Offer Poster'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Offers List */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-stone-900 mb-4">
              {isMl ? 'നിലവിലെ ഓഫറുകൾ' : 'Existing Live Offers'} ({offers.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-stone-100">
                    <img
                      src={offer.posterUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-amber-500 text-stone-900 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {offer.badge}
                    </span>
                  </div>

                  <div className="p-4 flex-1">
                    <h4 className="font-bold text-sm text-stone-900">{offer.titleMl || offer.title}</h4>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{offer.description}</p>
                    <p className="text-[10px] font-semibold text-amber-700 mt-2">
                      Valid Till: {offer.validTill}
                    </p>
                  </div>

                  <div className="p-3 border-t border-stone-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Highlight Boards Manager (User specifically requested this!) */}
      {activeAdminTab === 'boards' && (
        <div className="space-y-8 animate-fade-in">
          {/* Add Board Form */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-stone-900 mb-1">
              {isMl ? 'പുതിയ ഹൈലൈറ്റ് പാക്കേജ് ബോർഡ് ചേർക്കുക' : 'Add New Highlight Package Board'}
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              {isMl
                ? 'ഫ്രണ്ട് എൻഡിൽ ഡിസ്പ്ലേ ചെയ്യാനുള്ള ഫീച്ചേർഡ് പാക്കേജ് ബോർഡുകൾ ഇവിടെ തയ്യാറാക്കാം'
                : 'Create featured packages to display as highlight showcase boards on the frontend'}
            </p>

            <form onSubmit={handleAddBoard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Package Name (English) *
                </label>
                <input
                  type="text"
                  placeholder="Royal Emerald Package"
                  value={newBoard.title || ''}
                  onChange={(e) => setNewBoard({ ...newBoard, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Package Name (മലയാളം)
                </label>
                <input
                  type="text"
                  placeholder="റോയൽ എമറാൾഡ് പാക്കേജ്"
                  value={newBoard.titleMl || ''}
                  onChange={(e) => setNewBoard({ ...newBoard, titleMl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Package Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="125000"
                  value={newBoard.price || ''}
                  onChange={(e) => setNewBoard({ ...newBoard, price: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Badge Tag (e.g. Most Popular / Ultra Luxury)
                </label>
                <input
                  type="text"
                  placeholder="Best Seller"
                  value={newBoard.tag || ''}
                  onChange={(e) => setNewBoard({ ...newBoard, tag: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="Complete signature coverage with candid photography & 4K video..."
                  value={newBoard.description || ''}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="2 Candid Photographers, 4K Drone, 40 Sheet Acrylic Album, 3 Reels"
                  onChange={(e) =>
                    setNewBoard({
                      ...newBoard,
                      features: e.target.value.split(',').map((f) => f.trim()),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'പാക്കേജ് ബോർഡ് ചേർക്കുക' : 'Create Highlight Board'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Boards List */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black text-stone-900 mb-4">
              {isMl ? 'നിലവിലെ ഹൈലൈറ്റ് ബോർഡുകൾ' : 'Existing Highlight Boards'} ({highlightBoards.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {highlightBoards.map((b) => (
                <div
                  key={b.id}
                  className="border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-2">
                      {b.tag}
                    </span>
                    <h4 className="font-extrabold text-base text-stone-900">{b.titleMl || b.title}</h4>
                    <p className="text-lg font-black text-amber-700 mt-1">₹{b.price.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-stone-500 mt-2">{b.description}</p>

                    <ul className="mt-3 space-y-1 text-xs text-stone-600">
                      {b.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteBoard(b.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Customer Leads CRM Tab */}
      {activeAdminTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-black text-stone-900">
                {isMl ? 'കസ്റ്റമർ എൻക്വയറികളും കൊട്ടേഷനുകളും' : 'Customer Leads & Quotations'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                {isMl
                  ? 'വെബ്സൈറ്റ് വഴി സൈൻ-ഇൻ ചെയ്ത ഉപഭോക്താക്കളുടെയും PDF കൊട്ടേഷൻ എടുത്തവരുടെയും വിവരങ്ങൾ'
                  : 'Customer inquiries received from website registrations and PDF quotations'}
              </p>
            </div>
            <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1 rounded-full text-xs">
              {isMl ? `ആകെ ലീഡുകൾ: ${leads.length}` : `Total Leads: ${leads.length}`}
            </span>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">പുതിയ ലീഡുകൾ ഒന്നും ലഭിച്ചിട്ടില്ല</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-200 bg-stone-50 text-stone-700">
                    <th className="py-3 px-3 font-bold">{isMl ? 'കസ്റ്റമർ പേര്' : 'Name'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'മൊബൈൽ' : 'Phone'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'സ്ഥലം' : 'Place'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'വിവാഹ തീയതി' : 'Wedding Date'}</th>
                    <th className="py-3 px-3 font-bold text-right">{isMl ? 'എസ്റ്റിമേറ്റ് തുക' : 'Total Amount'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isMl ? 'സ്റ്റാറ്റസ്' : 'Status'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isMl ? 'പ്ലാൻ വിവരങ്ങൾ' : 'Plan Details'}</th>
                    <th className="py-3 px-3 font-bold text-right">{isMl ? 'ആക്ഷൻസ്' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {leads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-3 font-black text-stone-900 cursor-pointer" onClick={() => setSelectedLead(lead)}>
                        <span>{lead.name}</span>
                        {lead.email && (
                          <span className="block text-[10px] text-stone-400 font-normal">
                            {lead.email}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-800">{lead.phone}</td>
                      <td className="py-3 px-3 text-stone-600">{lead.place || lead.address || 'കായംകുളം'}</td>
                      <td className="py-3 px-3 text-stone-600">
                        {lead.weddingDate || 'തീരുമാനിച്ചിട്ടില്ല'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-amber-700">
                        ₹{(lead.totalPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <select
                          value={lead.status || 'New'}
                          onChange={(e) =>
                            updateLeadStatus(
                              idx,
                              e.target.value as CustomerLead['status']
                            )
                          }
                          className="bg-stone-100 border border-stone-200 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-800"
                        >
                          <option value="New">പുതിയത് (New)</option>
                          <option value="Contacted">വിളിച്ചു (Contacted)</option>
                          <option value="Quoted">കൊട്ടേഷൻ അയച്ചു</option>
                          <option value="Booked">ബുക്കിംഗ് ഉറപ്പിച്ചു (Booked)</option>
                          <option value="Completed">പൂർത്തിയായി</option>
                        </select>
                      </td>

                      {/* View Plan Details Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition active:scale-95"
                          title="View complete package chosen by customer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isMl ? 'പ്ലാൻ കാണുക' : 'View Plan'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right space-x-1">
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                          title="Call directly"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsPdfModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
                          title="Preview & Download PDF Quotation"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteLead(idx)}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Customer Plan Details & Quotation Inspector Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl relative border border-stone-200 my-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Customer Plan Breakdown
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {selectedLead.name} - Selected Wedding Package
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedLead.place || selectedLead.address} • Phone: {selectedLead.phone}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="my-5 p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700">Quick Actions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* PDF Quote Button */}
                <button
                  type="button"
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Preview & Download PDF</span>
                </button>

                {/* WhatsApp Full Plan Button */}
                <a
                  href={`https://wa.me/91${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${(() => {
                    const baseSubtotal = selectedLead.totalPrice || 0;
                    const tax = selectedLead.taxAmount || Math.round(baseSubtotal * 0.18);
                    const grandTotal = selectedLead.grandTotal || (baseSubtotal + tax);
                    const advance = Math.round(grandTotal * 0.25);
                    const onShoot = Math.round(grandTotal * 0.50);
                    const delivery = grandTotal - advance - onShoot;

                    let msg = `*FRAMELU WEDDING COMPANY - WEDDING PHOTOGRAPHY QUOTATION*\n`;
                    msg += `Dear ${selectedLead.name},\n`;
                    msg += `Thank you for choosing Framelu Wedding Company! Here is the complete breakdown of your customized package:\n\n`;
                    msg += `*EVENT DETAILS:*\n`;
                    msg += `• Wedding Date: ${selectedLead.weddingDate || 'TBD'}\n`;
                    msg += `• Venue: ${selectedLead.venueLocation || selectedLead.place || selectedLead.address || 'Kerala'}\n`;
                    msg += `• Scope: ${selectedLead.side === 'groom' ? 'Groom Side' : selectedLead.side === 'bride' ? 'Bride Side' : 'Both Sides Combined'}\n\n`;

                    if (selectedLead.groomEvents) {
                      const activeGroom = KERALA_EVENTS.filter((e) => selectedLead.groomEvents?.[e.id]?.enabled);
                      if (activeGroom.length > 0) {
                        msg += `*🤵 GROOM SIDE CEREMONIES & CREW:*\n`;
                        activeGroom.forEach((evt) => {
                          const cfg = selectedLead.groomEvents?.[evt.id];
                          if (cfg) {
                            const crew: string[] = [];
                            if (cfg.traditionalPhotographers) crew.push(`${cfg.traditionalPhotographers} Traditional Photo`);
                            if (cfg.traditionalVideographers) crew.push(`${cfg.traditionalVideographers} Traditional Video`);
                            if (cfg.candidPhotographers) crew.push(`${cfg.candidPhotographers} Candid Photo`);
                            if (cfg.candidVideographers) crew.push(`${cfg.candidVideographers} Cinematic Video`);
                            if (cfg.drone) crew.push(`4K Drone Aerial`);
                            if (cfg.youtubeLive) crew.push(`YouTube Live`);
                            if (cfg.auditoriumLive) crew.push(`Hall LED Live`);
                            if (cfg.photoLivePrinting) crew.push(`Guest Live Printing`);
                            msg += `• ${evt.nameEn}: ${crew.join(', ')}\n`;
                          }
                        });
                        msg += `\n`;
                      }
                    }

                    if (selectedLead.brideEvents) {
                      const activeBride = KERALA_EVENTS.filter((e) => selectedLead.brideEvents?.[e.id]?.enabled);
                      if (activeBride.length > 0) {
                        msg += `*👰 BRIDE SIDE CEREMONIES & CREW:*\n`;
                        activeBride.forEach((evt) => {
                          const cfg = selectedLead.brideEvents?.[evt.id];
                          if (cfg) {
                            const crew: string[] = [];
                            if (cfg.traditionalPhotographers) crew.push(`${cfg.traditionalPhotographers} Traditional Photo`);
                            if (cfg.traditionalVideographers) crew.push(`${cfg.traditionalVideographers} Traditional Video`);
                            if (cfg.candidPhotographers) crew.push(`${cfg.candidPhotographers} Candid Photo`);
                            if (cfg.candidVideographers) crew.push(`${cfg.candidVideographers} Cinematic Video`);
                            if (cfg.drone) crew.push(`4K Drone Aerial`);
                            if (cfg.youtubeLive) crew.push(`YouTube Live`);
                            if (cfg.auditoriumLive) crew.push(`Hall LED Live`);
                            if (cfg.photoLivePrinting) crew.push(`Guest Live Printing`);
                            msg += `• ${evt.nameEn}: ${crew.join(', ')}\n`;
                          }
                        });
                        msg += `\n`;
                      }
                    }

                    if (selectedLead.deliverables) {
                      const d = selectedLead.deliverables;
                      msg += `*📦 DELIVERABLES & KEEPSAKES:*\n`;
                      msg += `• Video Quality: ${d.videoQuality === '4k' ? '4K Ultra HD' : 'Full HD 1080p'}\n`;
                      const films: string[] = [];
                      if (d.fullLengthVideo) films.push('Full Length Traditional Film');
                      if (d.highlightVideo) films.push('Cinematic Highlight (3-5 min)');
                      if (d.teaserVideo) films.push('Cinematic Teaser Promo');
                      if (d.reelsCount) films.push(`${d.reelsCount} Social Reels`);
                      const coverName = (() => {
                        const t = d.albumPaperType;
                        if (t === 'normal') return 'Normal Cover';
                        if (t === 'premium') return 'Premium Cover';
                        if (t === 'extra_premium') return 'Extra Premium Cover';
                        if (t === 'leather') return 'Leather Cover';
                        if (t === 'glass' || t === 'acrylic_cover') return 'Glass Cover';
                        if (t === 'full_glass' || t === 'velvet_box') return 'Full Glass Cover';
                        return (t ? t.replace(/_/g, ' ') : 'Normal') + ' Cover';
                      })();
                      if (d.mainAlbumsCount) msg += `• Main Album: ${d.mainAlbumsCount} Nos (${d.mainAlbumSheets} Sheets, ${coverName})\n`;
                      const frames: string[] = [];
                      if (d.frames_8x12) frames.push(`${d.frames_8x12} Nos 8x12`);
                      if (d.frames_18x12) frames.push(`${d.frames_18x12} Nos 18x12`);
                      if (d.frames_15x20) frames.push(`${d.frames_15x20} Nos 15x20 Master Canvas`);
                      if (frames.length) msg += `• Photo Frames: ${frames.join(', ')}\n`;
                      msg += `\n`;
                    }

                    msg += `*FINANCIAL SUMMARY:*\n`;
                    msg += `• Package Base Subtotal: ₹${baseSubtotal.toLocaleString('en-IN')}\n`;
                    msg += `• GST (18%): ₹${tax.toLocaleString('en-IN')}\n`;
                    msg += `• *Grand Total (Incl. Tax): ₹${grandTotal.toLocaleString('en-IN')}*\n\n`;
                    msg += `*PAYMENT SCHEDULE:*\n`;
                    msg += `1. Advance Booking (25%): ₹${advance.toLocaleString('en-IN')}\n`;
                    msg += `2. On Shoot Completion (50%): ₹${onShoot.toLocaleString('en-IN')}\n`;
                    msg += `3. On Final Delivery (25%): ₹${delivery.toLocaleString('en-IN')}\n\n`;
                    msg += `Best Regards,\n*Framelu Wedding Company*\nPhone: ${studioContact.phone}\n${studioContact.destination}`;
                    return encodeURIComponent(msg);
                  })()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Full Plan to WhatsApp</span>
                </a>

                {/* Direct Call */}
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Customer</span>
                </a>
              </div>
            </div>

            {/* Plan Details Content */}
            <div className="space-y-5 text-xs">
              {/* Event & Ceremony Summary */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <h4 className="font-black text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Ceremonies & Allocated Crews</span>
                </h4>

                {/* Groom Side */}
                {selectedLead.groomEvents && (
                  <div className="mb-3">
                    <span className="font-extrabold text-amber-900 block mb-1">
                      🤵 Groom Side Events:
                    </span>
                    <div className="space-y-1.5">
                      {KERALA_EVENTS.filter((e) => selectedLead.groomEvents?.[e.id]?.enabled).map((evt) => {
                        const cfg = selectedLead.groomEvents?.[evt.id];
                        return (
                          <div key={evt.id} className="p-2 bg-white rounded-xl border border-stone-200">
                            <span className="font-bold text-stone-900">{evt.nameEn}</span>
                            <div className="flex flex-wrap gap-1.5 text-[10px] mt-1 text-stone-600">
                              {cfg?.traditionalPhotographers ? <span>{cfg.traditionalPhotographers} Trad Photo</span> : null}
                              {cfg?.traditionalVideographers ? <span>• {cfg.traditionalVideographers} Trad Video</span> : null}
                              {cfg?.candidPhotographers ? <span>• {cfg.candidPhotographers} Candid Photo</span> : null}
                              {cfg?.candidVideographers ? <span>• {cfg.candidVideographers} Cinematic Video</span> : null}
                              {cfg?.drone ? <span>• 4K Drone</span> : null}
                              {cfg?.youtubeLive ? <span>• YouTube Live</span> : null}
                              {cfg?.auditoriumLive ? <span>• Hall Live Display</span> : null}
                              {cfg?.photoLivePrinting ? <span>• Live Printing</span> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bride Side */}
                {selectedLead.brideEvents && (
                  <div>
                    <span className="font-extrabold text-rosewood-900 block mb-1">
                      👰 Bride Side Events:
                    </span>
                    <div className="space-y-1.5">
                      {KERALA_EVENTS.filter((e) => selectedLead.brideEvents?.[e.id]?.enabled).map((evt) => {
                        const cfg = selectedLead.brideEvents?.[evt.id];
                        return (
                          <div key={evt.id} className="p-2 bg-white rounded-xl border border-stone-200">
                            <span className="font-bold text-stone-900">{evt.nameEn}</span>
                            <div className="flex flex-wrap gap-1.5 text-[10px] mt-1 text-stone-600">
                              {cfg?.traditionalPhotographers ? <span>{cfg.traditionalPhotographers} Trad Photo</span> : null}
                              {cfg?.traditionalVideographers ? <span>• {cfg.traditionalVideographers} Trad Video</span> : null}
                              {cfg?.candidPhotographers ? <span>• {cfg.candidPhotographers} Candid Photo</span> : null}
                              {cfg?.candidVideographers ? <span>• {cfg.candidVideographers} Cinematic Video</span> : null}
                              {cfg?.drone ? <span>• 4K Drone</span> : null}
                              {cfg?.youtubeLive ? <span>• YouTube Live</span> : null}
                              {cfg?.auditoriumLive ? <span>• Hall Live Display</span> : null}
                              {cfg?.photoLivePrinting ? <span>• Live Printing</span> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Deliverables Summary */}
              {selectedLead.deliverables && (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-black text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-amber-600" />
                    <span>Deliverables & Keepsakes</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Video Output</span>
                      <span className="font-bold text-stone-900">
                        {selectedLead.deliverables.videoQuality === '4k' ? '4K Ultra HD' : 'Full HD (1080p)'}
                      </span>
                      <div className="text-[11px] text-stone-600 mt-1">
                        {selectedLead.deliverables.fullLengthVideo ? 'Full Film • ' : ''}
                        {selectedLead.deliverables.highlightVideo ? '3-5 min Highlight • ' : ''}
                        {selectedLead.deliverables.teaserVideo ? 'Teaser Promo • ' : ''}
                        {selectedLead.deliverables.reelsCount ? `${selectedLead.deliverables.reelsCount} Reels` : ''}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Master Albums</span>
                      <span className="font-bold text-stone-900">
                        {selectedLead.deliverables.mainAlbumsCount} Albums ({selectedLead.deliverables.mainAlbumSheets} Sheets)
                      </span>
                      <p className="text-[11px] text-stone-600 mt-0.5 capitalize">
                        Cover: {(() => {
                          const t = selectedLead.deliverables.albumPaperType;
                          if (t === 'normal') return 'Normal Cover';
                          if (t === 'premium') return 'Premium Cover';
                          if (t === 'extra_premium') return 'Extra Premium Cover';
                          if (t === 'leather') return 'Leather Cover';
                          if (t === 'glass' || t === 'acrylic_cover') return 'Glass Cover';
                          if (t === 'full_glass' || t === 'velvet_box') return 'Full Glass Cover';
                          return (t ? t.replace(/_/g, ' ') : 'Normal') + ' Cover';
                        })()}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Preset Photo Frames</span>
                      <p className="text-[11px] text-stone-700 font-bold">
                        {selectedLead.deliverables.frames_8x12 ? `8x12 (${selectedLead.deliverables.frames_8x12})  ` : ''}
                        {selectedLead.deliverables.frames_18x12 ? `18x12 (${selectedLead.deliverables.frames_18x12})  ` : ''}
                        {selectedLead.deliverables.frames_15x20 ? `15x20 Master Canvas (${selectedLead.deliverables.frames_15x20})` : ''}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Media & Add-ons</span>
                      <p className="text-[11px] text-stone-700 font-bold">
                        {selectedLead.deliverables.penDriveCount ? `USB Pen Drives: ${selectedLead.deliverables.penDriveCount}  ` : ''}
                        {selectedLead.deliverables.penDriveBoxCount ? `Boxes: ${selectedLead.deliverables.penDriveBoxCount}  ` : ''}
                        {selectedLead.deliverables.miniAlbumsCount ? `Mini Albums: ${selectedLead.deliverables.miniAlbumsCount}  ` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Calculation & Divided Payment Schedule */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">
                      Estimated Total Investment
                    </span>
                    <span className="text-2xl font-black text-white">
                      ₹{((selectedLead.totalPrice || 0) + Math.round((selectedLead.totalPrice || 0) * 0.18)).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      (Base: ₹{(selectedLead.totalPrice || 0).toLocaleString('en-IN')} + GST 18%: ₹{Math.round((selectedLead.totalPrice || 0) * 0.18).toLocaleString('en-IN')})
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Current Status</span>
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-bold inline-block border border-amber-500/30">
                      {selectedLead.status || 'New'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700">
                    <span className="text-[10px] text-stone-400 font-bold block">1. Advance (25%)</span>
                    <span className="font-extrabold text-amber-300">
                      ₹{Math.round(((selectedLead.totalPrice || 0) * 1.18) * 0.25).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700">
                    <span className="text-[10px] text-stone-400 font-bold block">2. On Shoot (50%)</span>
                    <span className="font-extrabold text-amber-300">
                      ₹{Math.round(((selectedLead.totalPrice || 0) * 1.18) * 0.50).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700">
                    <span className="text-[10px] text-stone-400 font-bold block">3. Final Delivery (25%)</span>
                    <span className="font-extrabold text-amber-300">
                      ₹{Math.round(((selectedLead.totalPrice || 0) * 1.18) * 0.25).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Quotation Preview Modal from Admin */}
      {selectedLead && isPdfModalOpen && (
        <PdfQuotationView
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          lead={selectedLead}
          side={selectedLead.side || 'both'}
          calculation={{
            totalPrice: selectedLead.totalPrice || 0,
            items: [],
            eventTotals: {},
            deliverablesTotal: 0,
            groomCrewTotal: 0,
            brideCrewTotal: 0,
          }}
          studioContact={studioContact}
          language={language}
          groomEvents={selectedLead.groomEvents}
          brideEvents={selectedLead.brideEvents}
          deliverables={selectedLead.deliverables}
        />
      )}
    </div>
  );
};
