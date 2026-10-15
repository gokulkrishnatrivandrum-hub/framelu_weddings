'use client';

import React, { useState } from 'react';
import {
  PriceRates,
  CustomerLead,
  StudioContactConfig,
  PromoOffer,
  HighlightBoard,
  CustomPrintItem,
  OtherServicePackage,
  ServiceCategory,
  GalleryProject,
  CouponCode,
  PhotoshootConfig,
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
  UtensilsCrossed,
  Search,
  Filter,
  CheckSquare,
  Square,
  Download,
  Upload,
  Image as ImageIcon,
  FolderPlus,
  Layers,
  Instagram,
  Youtube,
  Facebook,
  Star,
  Quote,
  Edit2,
  Ticket,
  ChevronDown,
} from 'lucide-react';
import {
  DEFAULT_RATES,
  DEFAULT_STUDIO_CONTACT,
  DEFAULT_OFFERS,
  DEFAULT_HIGHLIGHT_BOARDS,
  KERALA_EVENTS,
  DEFAULT_DELIVERABLES,
  DEFAULT_CUSTOM_PRINTS,
  DEFAULT_OTHER_SERVICES,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_GALLERY_PROJECTS,
  DEFAULT_COUPONS,
  DEFAULT_PHOTOSHOOTS,
} from '@/constants/defaults';
import { calculateCustomQuote, CalculationResult } from '@/utils/calculator';
import { PdfQuotationView } from '@/components/PdfQuotationView';
import {
  savePriceRatesToCloud,
  saveStudioContactToCloud,
  saveCustomPrintsToCloud,
  savePromoOffersToCloud,
  saveHighlightBoardsToCloud,
  saveOtherServicesToCloud,
  saveServiceCategoriesToCloud,
  deleteLeadFromCloud,
  bulkDeleteLeadsFromCloud,
  saveLeadToCloud,
  saveGalleryProjectsToCloud,
  saveCouponsToCloud,
  savePhotoshootsToCloud,
} from '@/lib/firestoreSync';

// Reusable Image Upload & Device File Browser Component
interface ImageUploadFieldProps {
  label: string;
  imageUrl: string;
  onChange: (val: string) => void;
  isMl?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  imageUrl,
  onChange,
  isMl,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(isMl ? 'ഫയൽ സൈസ് 5MB ൽ താഴെ ആയിരിക്കണം' : 'Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-stone-700">{label}</label>
        <span className="text-[10px] text-stone-400 font-medium">
          {isMl ? 'ഡിവൈസിൽ നിന്ന് തിരഞ്ഞെടുക്കാം' : 'Browse from device or enter URL'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300 shadow-2xs">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-1 text-center">
              <Upload className="w-5 h-5 mb-1 text-stone-400" />
              <span className="text-[9px] font-bold">{isMl ? 'ഫോട്ടോ ഇല്ല' : 'No photo'}</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-black flex items-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isMl ? 'ഫോട്ടോ ബ്രൗസ് ചെയ്യുക' : 'Browse Device Photo'}</span>
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition"
              >
                {isMl ? 'ഒഴിവാക്കുക' : 'Clear'}
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder={isMl ? 'അല്ലെങ്കിൽ ഇമേജ് URL നൽകുക (https://...)' : 'Or enter direct image URL'}
            value={imageUrl || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-stone-250 text-xs bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
      </div>
    </div>
  );
};

// Helper to get color theme and labels for lead status in Admin Dashboard
export const getLeadStatusConfig = (status?: string, isMl: boolean = true) => {
  switch (status) {
    case 'New':
      return {
        label: isMl ? 'പുതിയത് (New)' : 'New Lead',
        shortLabel: isMl ? 'പുതിയത്' : 'New',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 ring-1 ring-blue-400/30',
        dotClass: 'bg-blue-500 shadow-xs',
        selectClass: 'bg-blue-50 text-blue-950 border-blue-300 hover:bg-blue-100 focus:ring-blue-500',
        borderLeft: 'border-l-4 border-l-blue-500',
        colorName: 'blue',
      };
    case 'Contacted':
      return {
        label: isMl ? 'വിളിച്ചു (Contacted)' : 'Contacted',
        shortLabel: isMl ? 'വിളിച്ചു' : 'Contacted',
        badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 ring-1 ring-amber-400/30',
        dotClass: 'bg-amber-500 shadow-xs',
        selectClass: 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100 focus:ring-amber-500',
        borderLeft: 'border-l-4 border-l-amber-500',
        colorName: 'amber',
      };
    case 'Quoted':
      return {
        label: isMl ? 'കൊട്ടേഷൻ അയച്ചു (Quoted)' : 'Quoted',
        shortLabel: isMl ? 'കൊട്ടേഷൻ അയച്ചു' : 'Quoted',
        badgeClass: 'bg-purple-100 text-purple-950 border-purple-300 ring-1 ring-purple-400/30',
        dotClass: 'bg-purple-600 shadow-xs',
        selectClass: 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100 focus:ring-purple-500',
        borderLeft: 'border-l-4 border-l-purple-500',
        colorName: 'purple',
      };
    case 'Booked':
      return {
        label: isMl ? 'ബുക്കിംഗ് ഉറപ്പിച്ചു (Booked)' : 'Booked',
        shortLabel: isMl ? 'ബുക്കിംഗ്' : 'Booked',
        badgeClass: 'bg-rose-100 text-rose-950 border-rose-300 ring-1 ring-rose-400/30',
        dotClass: 'bg-rose-600 shadow-xs',
        selectClass: 'bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100 focus:ring-rose-500',
        borderLeft: 'border-l-4 border-l-rose-500',
        colorName: 'rose',
      };
    case 'Completed':
      return {
        label: isMl ? 'പൂർത്തിയായി (Completed)' : 'Completed',
        shortLabel: isMl ? 'പൂർത്തിയായി' : 'Completed',
        badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300 ring-1 ring-emerald-400/30',
        dotClass: 'bg-emerald-600 shadow-xs',
        selectClass: 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-500',
        borderLeft: 'border-l-4 border-l-emerald-500',
        colorName: 'emerald',
      };
    default:
      return {
        label: isMl ? 'പുതിയത് (New)' : 'New Lead',
        shortLabel: isMl ? 'പുതിയത്' : 'New',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 ring-1 ring-blue-400/30',
        dotClass: 'bg-blue-500 shadow-xs',
        selectClass: 'bg-blue-50 text-blue-950 border-blue-300 hover:bg-blue-100 focus:ring-blue-500',
        borderLeft: 'border-l-4 border-l-blue-500',
        colorName: 'blue',
      };
  }
};

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
  otherServices?: OtherServicePackage[];
  setOtherServices?: React.Dispatch<React.SetStateAction<OtherServicePackage[]>>;
  categories?: ServiceCategory[];
  setCategories?: React.Dispatch<React.SetStateAction<ServiceCategory[]>>;
  galleryProjects?: GalleryProject[];
  setGalleryProjects?: React.Dispatch<React.SetStateAction<GalleryProject[]>>;
  coupons?: CouponCode[];
  setCoupons?: React.Dispatch<React.SetStateAction<CouponCode[]>>;
  photoshoots?: PhotoshootConfig[];
  setPhotoshoots?: React.Dispatch<React.SetStateAction<PhotoshootConfig[]>>;
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
  otherServices = DEFAULT_OTHER_SERVICES,
  setOtherServices,
  categories = DEFAULT_SERVICE_CATEGORIES,
  setCategories,
  galleryProjects = DEFAULT_GALLERY_PROJECTS,
  setGalleryProjects,
  coupons = DEFAULT_COUPONS,
  setCoupons,
  photoshoots = Object.values(DEFAULT_PHOTOSHOOTS),
  setPhotoshoots,
  onCloseAdmin,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const [activeAdminTab, setActiveAdminTab] = useState<'rates' | 'prints' | 'leads' | 'contact' | 'offers' | 'boards' | 'services' | 'gallery' | 'coupons' | 'photoshoots'>('leads');
  const [tempRates, setTempRates] = useState<PriceRates>(rates);
  const [tempContact, setTempContact] = useState<StudioContactConfig>(studioContact);
  const [tempCustomPrints, setTempCustomPrints] = useState<CustomPrintItem[]>(customPrintItems);
  const [tempServices, setTempServices] = useState<OtherServicePackage[]>(otherServices || DEFAULT_OTHER_SERVICES);
  const [tempCategories, setTempCategories] = useState<ServiceCategory[]>(categories || DEFAULT_SERVICE_CATEGORIES);
  const [tempGalleryProjects, setTempGalleryProjects] = useState<GalleryProject[]>(galleryProjects || DEFAULT_GALLERY_PROJECTS);
  const [tempCoupons, setTempCoupons] = useState<CouponCode[]>(coupons || DEFAULT_COUPONS);
  const [tempPhotoshoots, setTempPhotoshoots] = useState<PhotoshootConfig[]>(photoshoots || Object.values(DEFAULT_PHOTOSHOOTS));
  const [editingPhotoshoot, setEditingPhotoshoot] = useState<PhotoshootConfig | null>(null);
  const [isEditPhotoshootModalOpen, setIsEditPhotoshootModalOpen] = useState(false);
  const [leadSourceFilter, setLeadSourceFilter] = useState<'all' | 'customer' | 'studio'>('all');
  const [newPhotoshoot, setNewPhotoshoot] = useState<Partial<PhotoshootConfig>>({
    id: '',
    title: '',
    titleMl: '',
    tag: 'Special Shoot',
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
    description: '',
    hours: 4,
    locationType: 'Single Location',
    crew: {
      photographers: 1,
      videographers: 0,
      reelsCount: 2,
      drone: false,
    },
    deliverables: {
      gradedPhotosCount: 100,
      videoQuality: 'hd',
      teaserVideo: false,
      fullLengthVideo: false,
      reelsCount: 2,
      mainAlbumsCount: 0,
      mainAlbumSheets: 30,
      albumPaperType: 'matte',
      frames_8x12: 0,
      frames_18x12: 0,
      frames_15x20: 0,
      penDriveCount: 0,
      penDriveBoxCount: 0,
      miniAlbumsCount: 0,
    },
    features: ['100+ High-Resolution Graded Photos', 'Master Retouched Portraits', 'High-Speed Cloud Drive Delivery'],
    active: true,
  });
  const [editingService, setEditingService] = useState<OtherServicePackage | null>(null);
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<CouponCode>>({
    code: '',
    discountPercentage: 10,
    description: '',
    descriptionMl: '',
    minAmount: 0,
    active: true,
    isPublic: false,
  });
  const [couponTypeFilter, setCouponTypeFilter] = useState<'all' | 'public' | 'private'>('all');
  const [savedSuccess, setSavedSuccess] = useState('');
  const [selectedLead, setSelectedLead] = useState<CustomerLead | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Gallery Filter & New Project State
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [newProject, setNewProject] = useState<Partial<GalleryProject>>({
    title: '',
    titleMl: '',
    category: 'photography',
    clientName: '',
    venueLocation: '',
    eventDate: '2026-01-20',
    coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    galleryImages: [],
    description: '',
    descriptionMl: '',
    clientReview: {
      reviewerName: '',
      rating: 5,
      comment: '',
      commentMl: '',
      date: 'Jan 2026',
    },
    featured: true,
  });

  // Other Services Sub-tab: 'packages' or 'categories'
  const [servicesSubTab, setServicesSubTab] = useState<'packages' | 'categories'>('packages');

  // Leads Checkbox & Filter States
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [placeFilter, setPlaceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [placeSearchQuery, setPlaceSearchQuery] = useState<string>('');

  // Other Services Filter & Add Form State
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [newService, setNewService] = useState<Partial<OtherServicePackage>>({
    category: 'food_catering',
    title: '',
    titleMl: '',
    price: 35000,
    pricingType: 'fixed',
    baseGuestCount: 500,
    baseCardCount: 300,
    pricePerUnit: 350,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular Feast',
    features: ['28 Authentic Kerala Sadhya Dishes', 'Palada Payasam & Ada Pradhaman', 'Uniformed Catering Serving Team'],
  });

  // New Category Form State
  const [newCategory, setNewCategory] = useState<Partial<ServiceCategory>>({
    name: '',
    nameMl: '',
    description: '',
    descriptionMl: '',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular',
  });

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
    bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
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

  React.useEffect(() => {
    if (otherServices) {
      setTempServices(otherServices);
    }
  }, [otherServices]);

  React.useEffect(() => {
    if (categories) {
      setTempCategories(categories);
    }
  }, [categories]);

  React.useEffect(() => {
    if (galleryProjects) {
      setTempGalleryProjects(galleryProjects);
    }
  }, [galleryProjects]);

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

  const handleSaveCustomPrints = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (setCustomPrintItems) {
      setCustomPrintItems(tempCustomPrints);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_custom_prints', JSON.stringify(tempCustomPrints));
    }
    await saveCustomPrintsToCloud(tempCustomPrints);
    showNotification(isMl ? 'അഡീഷണൽ പ്രിന്റ് നിരക്കുകൾ ക്ലൗഡിലും ലോക്കലിലും സേവ് ചെയ്തു!' : 'Additional prints synced to cloud & saved successfully!');
  };

  const handleAddNewPrintItem = async (e: React.FormEvent) => {
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
    await saveCustomPrintsToCloud(updated);
    setNewPrintItem({
      nameEn: '',
      nameMl: '',
      price: 500,
      unitName: 'Nos',
      descriptionEn: '',
      descriptionMl: '',
      icon: 'printer',
    });
    showNotification(isMl ? 'പുതിയ അഡീഷണൽ പ്രിന്റ് സെക്ഷൻ ആഡ് ചെയ്തു!' : 'New additional print item added and synced!');
  };

  const handleDeletePrintItem = async (id: string) => {
    if (confirm(isMl ? 'ഈ പ്രിന്റ് ഐറ്റം ഒഴിവാക്കണോ?' : 'Delete this print item?')) {
      const updated = tempCustomPrints.filter((it) => it.id !== id);
      setTempCustomPrints(updated);
      if (setCustomPrintItems) {
        setCustomPrintItems(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_custom_prints', JSON.stringify(updated));
      }
      await saveCustomPrintsToCloud(updated);
      showNotification(isMl ? 'പ്രിന്റ് ഐറ്റം നീക്കം ചെയ്തു' : 'Print item deleted');
    }
  };

  const handleSaveRates = async (e: React.FormEvent) => {
    e.preventDefault();
    setRates(tempRates);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_rates', JSON.stringify(tempRates));
      localStorage.setItem('lumina_wedding_rates', JSON.stringify(tempRates));
    }
    await savePriceRatesToCloud(tempRates);
    showNotification(isMl ? 'നിരക്കുകൾ ക്ലൗഡിലും ലൈവ് ആയി അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Rates saved & synced live to cloud!');
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudioContact(tempContact);
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_contact', JSON.stringify(tempContact));
      localStorage.setItem('lumina_wedding_contact', JSON.stringify(tempContact));
    }
    await saveStudioContactToCloud(tempContact);
    showNotification(isMl ? 'സ്റ്റുഡിയോ കോൺടാക്റ്റ് വിവരങ്ങൾ ക്ലൗഡിൽ ലൈവ് ആയി അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Studio contact synced live to cloud!');
  };

  const handleResetRates = async () => {
    if (confirm(isMl ? 'എല്ലാ നിരക്കുകളും ഡീഫോൾട്ട് റേറ്റുകളിലേക്ക് മാറ്റണോ?' : 'Reset all rates to defaults?')) {
      setTempRates(DEFAULT_RATES);
      setRates(DEFAULT_RATES);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lumina_wedding_rates');
        localStorage.removeItem('framlu_wedding_rates');
      }
      await savePriceRatesToCloud(DEFAULT_RATES);
      showNotification(isMl ? 'ഡീഫോൾട്ട് റേറ്റുകളിലേക്ക് മാറ്റി' : 'Reset to default rates');
    }
  };

  const updateLeadStatus = async (leadIdOrIndex: string | number, newStatus: CustomerLead['status']) => {
    let index = typeof leadIdOrIndex === 'number'
      ? leadIdOrIndex
      : leads.findIndex((l) => l.id === leadIdOrIndex);

    if (index === -1) return;

    const updatedLead = {
      ...leads[index],
      status: newStatus,
    };
    setLeads((prev) => {
      const updated = [...prev];
      updated[index] = updatedLead;
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
        localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
      }
      return updated;
    });

    if (selectedLead && (selectedLead.id === updatedLead.id || selectedLead.phone === updatedLead.phone)) {
      setSelectedLead(updatedLead);
    }

    await saveLeadToCloud(updatedLead);
    showNotification(isMl ? `സ്റ്റാറ്റസ് ${newStatus} ആക്കി മാറ്റി` : `Status updated to ${newStatus}`);
  };

  const deleteLead = async (leadIndex: number) => {
    const targetLead = leads[leadIndex];
    if (confirm(isMl ? 'ഈ ലീഡ് ഒഴിവാക്കണോ?' : 'Delete this customer lead?')) {
      if (targetLead?.id) {
        await deleteLeadFromCloud(targetLead.id);
      }
      setLeads((prev) => {
        const updated = prev.filter((_, idx) => idx !== leadIndex);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        }
        return updated;
      });
      showNotification(isMl ? 'ലീഡ് നീക്കം ചെയ്തു' : 'Lead deleted');
    }
  };

  const handleBulkDeleteLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    if (
      confirm(
        isMl
          ? `തിരഞ്ഞെടുത്ത ${selectedLeadIds.length} കസ്റ്റമർ ലീഡുകൾ സ്ഥിരമായി ഒഴിവാക്കണോ?`
          : `Permanently delete ${selectedLeadIds.length} selected leads?`
      )
    ) {
      await bulkDeleteLeadsFromCloud(selectedLeadIds);
      setLeads((prev) => {
        const updated = prev.filter((l) => !l.id || !selectedLeadIds.includes(l.id));
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        }
        return updated;
      });
      setSelectedLeadIds([]);
      showNotification(
        isMl
          ? `${selectedLeadIds.length} ലീഡുകൾ വിജയകരമായി നീക്കം ചെയ്തു!`
          : `${selectedLeadIds.length} leads deleted successfully!`
      );
    }
  };

  // Download All / Filtered Customer Leads as PDF Table
  const handleDownloadCustomerDataPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header Banner
      doc.setFillColor(136, 19, 55); // Rosewood
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FRAMELU WEDDINGS & EVENTS', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL CUSTOMER LEADS, INQUIRIES & BOOKING PACKAGES REPORT', 14, 17);
      doc.text(
        `Destination: ${studioContact.destination || 'Kayamkulam, Kerala'}  |  Phone: ${studioContact.phone || '+91 6238747722'}  |  WhatsApp: +${studioContact.whatsapp || '916238747722'}`,
        14,
        23
      );

      const nowStr = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      doc.setFontSize(8.5);
      doc.text(`Generated: ${nowStr}  |  Total Leads: ${displayedLeads.length}`, pageWidth - 14, 23, { align: 'right' });

      // Table Header Row
      let startY = 35;
      doc.setFillColor(245, 240, 235);
      doc.rect(14, startY, pageWidth - 28, 9, 'F');
      doc.setDrawColor(210, 195, 185);
      doc.line(14, startY + 9, pageWidth - 14, startY + 9);

      doc.setTextColor(50, 40, 35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);

      const colX = {
        sl: 16,
        name: 26,
        phone: 72,
        place: 104,
        weddingDate: 144,
        packageDetails: 176,
        status: 242,
        amount: pageWidth - 16,
      };

      doc.text('Sl', colX.sl, startY + 6);
      doc.text('Customer Name', colX.name, startY + 6);
      doc.text('Phone Number', colX.phone, startY + 6);
      doc.text('Address / Place', colX.place, startY + 6);
      doc.text('Wedding Date', colX.weddingDate, startY + 6);
      doc.text('Package Details & Summary', colX.packageDetails, startY + 6);
      doc.text('Status', colX.status, startY + 6);
      doc.text('Total (INR)', colX.amount, startY + 6, { align: 'right' });

      // Table Rows
      let currentY = startY + 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      displayedLeads.forEach((lead, index) => {
        if (currentY > pageHeight - 18) {
          doc.addPage();
          currentY = 20;

          // Header on new page
          doc.setFillColor(245, 240, 235);
          doc.rect(14, currentY - 6, pageWidth - 28, 8, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
          doc.text('Sl', colX.sl, currentY - 1);
          doc.text('Customer Name', colX.name, currentY - 1);
          doc.text('Phone Number', colX.phone, currentY - 1);
          doc.text('Address / Place', colX.place, currentY - 1);
          doc.text('Wedding Date', colX.weddingDate, currentY - 1);
          doc.text('Package Details', colX.packageDetails, currentY - 1);
          doc.text('Status', colX.status, currentY - 1);
          doc.text('Total (INR)', colX.amount, currentY - 1, { align: 'right' });
          currentY += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
        }

        if (index % 2 === 0) {
          doc.setFillColor(253, 252, 250);
          doc.rect(14, currentY - 5, pageWidth - 28, 9, 'F');
        }

        doc.setDrawColor(235, 230, 225);
        doc.line(14, currentY + 4, pageWidth - 14, currentY + 4);

        doc.setTextColor(40, 40, 40);
        doc.text(String(index + 1), colX.sl, currentY);

        doc.setFont('helvetica', 'bold');
        doc.text((lead.name || 'Anonymous').substring(0, 24), colX.name, currentY);
        doc.setFont('helvetica', 'normal');

        doc.text(lead.phone || '-', colX.phone, currentY);

        const place = lead.place || lead.address || 'Kayamkulam';
        doc.text(place.substring(0, 22), colX.place, currentY);

        doc.text(lead.weddingDate || 'TBD', colX.weddingDate, currentY);

        let pkgSummary = 'Custom Wedding Package';
        if (lead.side) {
          pkgSummary += ` (${lead.side === 'both' ? 'Dual Side' : lead.side === 'groom' ? 'Groom' : 'Bride'})`;
        }
        if (lead.selectedServices && lead.selectedServices.length > 0) {
          pkgSummary += ` + ${lead.selectedServices.length} Services`;
        }
        doc.text(pkgSummary.substring(0, 34), colX.packageDetails, currentY);

        doc.text(lead.status || 'New', colX.status, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 40, 30);
        doc.text(`Rs. ${(lead.totalPrice || 0).toLocaleString('en-IN')}`, colX.amount, currentY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);

        currentY += 9;
      });

      doc.save(`Framelu_Customer_Leads_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export customer leads PDF:', err);
      alert('PDF generation failed. Please try again.');
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
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

    const updated = [offerItem, ...offers];
    setOffers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_wedding_offers', JSON.stringify(updated));
      localStorage.setItem('framlu_wedding_offers', JSON.stringify(updated));
    }
    await savePromoOffersToCloud(updated);

    setNewOffer({
      title: '',
      titleMl: '',
      badge: 'Limited Offer',
      description: '',
      validTill: '2026-12-31',
      posterUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      active: true,
    });

    showNotification(isMl ? 'പുതിയ ഓഫർ ക്ലൗഡിൽ ലൈവ് ആയി ചേർത്തു!' : 'New offer poster added & synced live!');
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm(isMl ? 'ഈ ഓഫർ ഒഴിവാക്കണോ?' : 'Delete this offer?')) {
      const updated = offers.filter((o) => o.id !== id);
      setOffers(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina_wedding_offers', JSON.stringify(updated));
        localStorage.setItem('framlu_wedding_offers', JSON.stringify(updated));
      }
      await savePromoOffersToCloud(updated);
      showNotification(isMl ? 'ഓഫർ നീക്കം ചെയ്തു' : 'Offer deleted');
    }
  };

  const handleAddBoard = async (e: React.FormEvent) => {
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
      popular: newBoard.popular || false,
      bannerUrl: newBoard.bannerUrl || '',
      presetConfig: {
        side: 'both',
        events: {
          weddingDayCrew: {
            tradPhoto: 1,
            tradVideo: 1,
            candidPhoto: Number(newBoard.price) >= 70000 ? 1 : 0,
            candidVideo: Number(newBoard.price) >= 120000 ? 1 : 0,
            drone: Number(newBoard.price) >= 90000,
          },
          receptionCrew: {
            tradPhoto: 1,
            tradVideo: 1,
            candidPhoto: Number(newBoard.price) >= 90000 ? 1 : 0,
            candidVideo: 0,
          },
        },
        deliverables: {
          videoQuality: Number(newBoard.price) >= 70000 ? '4k' : 'hd',
          mainAlbums: 1,
          mainSheets: Number(newBoard.price) >= 120000 ? 40 : 30,
          albumCover: Number(newBoard.price) >= 100000 ? 'leatherette_box' : 'matte_laminate',
          highlightVideo: true,
          teaserVideo: Number(newBoard.price) >= 70000,
          reels: Number(newBoard.price) >= 70000 ? 2 : 0,
        },
      },
    };

    const updated = [boardItem, ...highlightBoards];
    setHighlightBoards(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_wedding_boards', JSON.stringify(updated));
      localStorage.setItem('framlu_wedding_boards', JSON.stringify(updated));
    }
    await saveHighlightBoardsToCloud(updated);

    setNewBoard({
      title: '',
      titleMl: '',
      tag: 'Special Package',
      price: 95000,
      description: '',
      bannerUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      features: ['Wedding Day & Reception Complete Coverage', 'Full HD Edited Video & 4K Highlight', '35-Sheet Premium Album'],
    });

    showNotification(isMl ? 'പുതിയ ഹൈലൈറ്റ് പാക്കേജ് ബോർഡ് ക്ലൗഡിൽ ചേർത്തു!' : 'New Highlight Package Board added & synced!');
  };

  const handleDeleteBoard = async (id: string) => {
    if (confirm(isMl ? 'ഈ ബോർഡ് ഒഴിവാക്കണോ?' : 'Delete this package board?')) {
      const updated = highlightBoards.filter((b) => b.id !== id);
      setHighlightBoards(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lumina_wedding_boards', JSON.stringify(updated));
        localStorage.setItem('framlu_wedding_boards', JSON.stringify(updated));
      }
      await saveHighlightBoardsToCloud(updated);
      showNotification(isMl ? 'പാക്കേജ് ബോർഡ് നീക്കം ചെയ്തു' : 'Package board deleted');
    }
  };

  // Category Handlers (Add new category with photo file browse)
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name?.trim()) {
      alert(isMl ? 'ദയവായി കാറ്റഗറിയുടെ പേര് നൽകുക' : 'Please provide category name');
      return;
    }

    const catId =
      newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24) ||
      `cat_${Date.now()}`;

    const newCatItem: ServiceCategory = {
      id: catId,
      name: newCategory.name.trim(),
      nameMl: newCategory.nameMl?.trim() || newCategory.name.trim(),
      description: newCategory.description || '',
      descriptionMl: newCategory.descriptionMl || newCategory.description || '',
      imageUrl:
        newCategory.imageUrl ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      badge: newCategory.badge || '',
    };

    const updated = [...tempCategories, newCatItem];
    setTempCategories(updated);
    if (setCategories) {
      setCategories(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_service_categories', JSON.stringify(updated));
    }
    await saveServiceCategoriesToCloud(updated);

    setNewCategory({
      name: '',
      nameMl: '',
      description: '',
      descriptionMl: '',
      imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      badge: '',
    });

    showNotification(
      isMl ? 'പുതിയ കാറ്റഗറി ക്ലൗഡിൽ ലൈവ് ആയി ചേർത്തു!' : 'New category added & synced live!'
    );
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm(isMl ? 'ഈ കാറ്റഗറി ഒഴിവാക്കണോ?' : 'Delete this category?')) {
      const updated = tempCategories.filter((c) => c.id !== catId);
      setTempCategories(updated);
      if (setCategories) {
        setCategories(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_service_categories', JSON.stringify(updated));
      }
      await saveServiceCategoriesToCloud(updated);
      showNotification(isMl ? 'കാറ്റഗറി നീക്കം ചെയ്തു' : 'Category deleted');
    }
  };

  // Other Services Handlers (Food/Catering, Decor, Makeup, Cars, Cards, etc.)
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title?.trim() || !newService.price) {
      alert(isMl ? 'ദയവായി പേരും നിരക്കും നൽകുക' : 'Please provide service name and price');
      return;
    }

    const featuresList = Array.isArray(newService.features)
      ? newService.features
      : typeof newService.features === 'string'
      ? (newService.features as string).split(',').map((s) => s.trim()).filter(Boolean)
      : ['Quality service assurance', 'Dedicated professional team'];

    const newPkg: OtherServicePackage = {
      id: `svc_${Date.now()}`,
      category: newService.category || 'food_catering',
      title: newService.title.trim(),
      titleMl: newService.titleMl?.trim() || newService.title.trim(),
      price: Number(newService.price) || 0,
      pricingType: newService.pricingType || 'fixed',
      baseGuestCount: newService.pricingType === 'per_guest' ? (newService.baseGuestCount || 500) : undefined,
      baseCardCount: newService.pricingType === 'per_card' ? (newService.baseCardCount || 300) : undefined,
      pricePerUnit:
        newService.pricingType === 'per_guest' || newService.pricingType === 'per_card'
          ? (newService.pricePerUnit || Number(newService.price))
          : undefined,
      description: newService.description || '',
      imageUrl: newService.imageUrl || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      badge: newService.badge || '',
      features: featuresList,
    };

    const updated = [newPkg, ...tempServices];
    setTempServices(updated);
    if (setOtherServices) {
      setOtherServices(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_other_services', JSON.stringify(updated));
    }
    await saveOtherServicesToCloud(updated);

    setNewService({
      category: newService.category || 'food_catering',
      title: '',
      titleMl: '',
      price: 35000,
      pricingType: 'fixed',
      baseGuestCount: 500,
      baseCardCount: 300,
      pricePerUnit: 350,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
      badge: 'Popular Feast',
      features: ['28 Authentic Kerala Sadhya Dishes', 'Palada Payasam & Ada Pradhaman', 'Uniformed Catering Serving Team'],
    });

    showNotification(isMl ? 'പുതിയ സർവീസ് പാക്കേജ് ക്ലൗഡിൽ ലൈവ് ആയി ചേർത്തു!' : 'New service package added & synced live!');
  };

  const handleStartEditService = (pkg: OtherServicePackage) => {
    setEditingService({ ...pkg });
    setIsEditServiceModalOpen(true);
  };

  const handleSaveEditedService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const updated = tempServices.map((s) => (s.id === editingService.id ? editingService : s));
    setTempServices(updated);
    if (setOtherServices) {
      setOtherServices(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_other_services', JSON.stringify(updated));
    }
    await saveOtherServicesToCloud(updated);
    setIsEditServiceModalOpen(false);
    setEditingService(null);
    showNotification(isMl ? 'സർവീസ് കാർഡ് വിവരങ്ങളും ഇമേജും വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു!' : 'Service card details & image updated successfully!');
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code?.trim() || !newCoupon.discountPercentage) {
      alert(isMl ? 'ദയവായി കൂപ്പൺ കോഡും ഡിസ്കൗണ്ട് ശതമാനവും നൽകുക' : 'Please provide coupon code and discount percentage');
      return;
    }

    const couponItem: CouponCode = {
      id: `coupon_${Date.now()}`,
      code: newCoupon.code.trim().toUpperCase(),
      discountPercentage: Number(newCoupon.discountPercentage) || 10,
      description: newCoupon.description?.trim() || 'Festival Offer',
      descriptionMl: newCoupon.descriptionMl?.trim() || newCoupon.description?.trim() || 'പ്രത്യേക ഓഫർ ഡിസ്കൗണ്ട്',
      minAmount: Number(newCoupon.minAmount) || 0,
      active: true,
      validTill: newCoupon.validTill || '2026-12-31',
      isPublic: !!newCoupon.isPublic,
      createdAt: new Date().toISOString(),
    };

    const updated = [couponItem, ...tempCoupons.filter((c) => c.code.toUpperCase() !== couponItem.code)];
    setTempCoupons(updated);
    if (setCoupons) {
      setCoupons(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_coupons', JSON.stringify(updated));
    }
    await saveCouponsToCloud(updated);

    setNewCoupon({
      code: '',
      discountPercentage: 10,
      description: '',
      descriptionMl: '',
      minAmount: 0,
      active: true,
      isPublic: false,
    });

    showNotification(
      isMl
        ? `പുതിയ ${couponItem.isPublic ? 'പബ്ലിക് ഡെമോ' : 'പേഴ്സണൽ'} കൂപ്പൺ കോഡ് ലൈവ് ആയി ചേർത്തു!`
        : `New ${couponItem.isPublic ? 'public demo' : 'personal'} coupon code added & synced live!`
    );
  };

  const handleToggleCoupon = async (id: string) => {
    const updated = tempCoupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    setTempCoupons(updated);
    if (setCoupons) {
      setCoupons(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_coupons', JSON.stringify(updated));
    }
    await saveCouponsToCloud(updated);
    showNotification(isMl ? 'കൂപ്പൺ സ്റ്റാറ്റസ് മാറ്റി' : 'Coupon status updated');
  };

  const handleTogglePublicCoupon = async (id: string) => {
    const updated = tempCoupons.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c));
    setTempCoupons(updated);
    if (setCoupons) {
      setCoupons(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_coupons', JSON.stringify(updated));
    }
    await saveCouponsToCloud(updated);
    showNotification(isMl ? 'കൂപ്പൺ പബ്ലിക് / പേഴ്സണൽ സ്റ്റാറ്റസ് മാറ്റി' : 'Coupon public visibility updated');
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm(isMl ? 'ഈ കൂപ്പൺ കോഡ് ഒഴിവാക്കണോ?' : 'Delete this coupon code?')) {
      const updated = tempCoupons.filter((c) => c.id !== id);
      setTempCoupons(updated);
      if (setCoupons) {
        setCoupons(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_coupons', JSON.stringify(updated));
      }
      await saveCouponsToCloud(updated);
      showNotification(isMl ? 'കൂപ്പൺ നീക്കം ചെയ്തു' : 'Coupon deleted');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm(isMl ? 'ഈ സർവീസ് പാക്കേജ് ഒഴിവാക്കണോ?' : 'Delete this service package?')) {
      const updated = tempServices.filter((s) => s.id !== id);
      setTempServices(updated);
      if (setOtherServices) {
        setOtherServices(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_other_services', JSON.stringify(updated));
      }
      await saveOtherServicesToCloud(updated);
      showNotification(isMl ? 'സർവീസ് പാക്കേജ് നീക്കം ചെയ്തു' : 'Service package deleted');
    }
  };

  const handleAddGalleryProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title?.trim() || !newProject.clientName?.trim() || !newProject.venueLocation?.trim()) {
      alert(isMl ? 'ദയവായി പ്രോജക്റ്റ് പേര്, ക്ലയന്റ് പേര്, സ്ഥലം എന്നിവ നൽകുക' : 'Please provide project title, client name and venue location');
      return;
    }

    const projectItem: GalleryProject = {
      id: `project_${Date.now()}`,
      title: newProject.title.trim(),
      titleMl: newProject.titleMl?.trim() || newProject.title.trim(),
      category: newProject.category || 'photography',
      clientName: newProject.clientName.trim(),
      venueLocation: newProject.venueLocation.trim(),
      eventDate: newProject.eventDate || '2026-01-20',
      coverImage: newProject.coverImage || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      galleryImages: newProject.galleryImages && newProject.galleryImages.length > 0 ? newProject.galleryImages : [newProject.coverImage || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80'],
      description: newProject.description || '',
      descriptionMl: newProject.descriptionMl || newProject.description || '',
      clientReview: {
        reviewerName: newProject.clientReview?.reviewerName?.trim() || newProject.clientName.trim(),
        rating: Number(newProject.clientReview?.rating) || 5,
        comment: newProject.clientReview?.comment?.trim() || 'Exceptional experience with Framelu Wedding Company! Highly recommended.',
        commentMl: newProject.clientReview?.commentMl?.trim() || 'ഫ്രെംലു വെഡ്ഡിംഗ് ടീമിന്റെ വർക്ക് വളരെ മികച്ചതായിരുന്നു! ഹൃദയം നിറഞ്ഞ നന്ദി.',
        date: newProject.clientReview?.date || '2026',
      },
      featured: true,
    };

    const updated = [projectItem, ...tempGalleryProjects];
    setTempGalleryProjects(updated);
    if (setGalleryProjects) {
      setGalleryProjects(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_gallery_projects', JSON.stringify(updated));
    }
    await saveGalleryProjectsToCloud(updated);

    setNewProject({
      title: '',
      titleMl: '',
      category: 'photography',
      clientName: '',
      venueLocation: '',
      eventDate: '2026-01-20',
      coverImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      galleryImages: [],
      description: '',
      descriptionMl: '',
      clientReview: {
        reviewerName: '',
        rating: 5,
        comment: '',
        commentMl: '',
        date: 'Jan 2026',
      },
      featured: true,
    });

    showNotification(isMl ? 'പുതിയ പ്രോജക്റ്റും കസ്റ്റമർ റിവ്യൂവും ഗാലറിയിൽ ചേർത്തു!' : 'New project & customer review added to gallery & synced live!');
  };

  const handleDeleteGalleryProject = async (id: string) => {
    if (confirm(isMl ? 'ഈ പ്രോജക്റ്റ് ഗാലറിയിൽ നിന്ന് ഒഴിവാക്കണോ?' : 'Delete this project from gallery?')) {
      const updated = tempGalleryProjects.filter((p) => p.id !== id);
      setTempGalleryProjects(updated);
      if (setGalleryProjects) {
        setGalleryProjects(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_gallery_projects', JSON.stringify(updated));
      }
      await saveGalleryProjectsToCloud(updated);
      showNotification(isMl ? 'പ്രോജക്റ്റ് നീക്കം ചെയ്തു' : 'Project deleted from gallery');
    }
  };

  const handleAddNewPhotoshoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoshoot.title?.trim() || !newPhotoshoot.price) {
      alert(isMl ? 'ദയവായി ഫോട്ടോഷൂട്ട് പേരും നിരക്കും നൽകുക' : 'Please provide photoshoot title and price');
      return;
    }
    const shootId = newPhotoshoot.id?.trim() || `photoshoot_${Date.now()}`;
    const shootItem: PhotoshootConfig = {
      type: (shootId as any),
      id: shootId,
      title: newPhotoshoot.title.trim(),
      titleEn: newPhotoshoot.title.trim(),
      titleMl: newPhotoshoot.titleMl?.trim() || newPhotoshoot.title.trim(),
      tag: newPhotoshoot.tag?.trim() || 'Special Shoot',
      price: Number(newPhotoshoot.price) || 0,
      basePrice: Number(newPhotoshoot.price) || 0,
      imageUrl: newPhotoshoot.imageUrl || 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
      description: newPhotoshoot.description || '',
      hours: Number(newPhotoshoot.hours) || 4,
      locationType: newPhotoshoot.locationType || 'Single Location',
      crew: {
        photographers: Number(newPhotoshoot.crew?.photographers) || 1,
        videographers: Number(newPhotoshoot.crew?.videographers) || 0,
        reelsCount: Number(newPhotoshoot.crew?.reelsCount) || 0,
        drone: !!newPhotoshoot.crew?.drone,
      },
      deliverables: {
        gradedPhotosCount: Number(newPhotoshoot.deliverables?.gradedPhotosCount) || 100,
        videoQuality: newPhotoshoot.deliverables?.videoQuality || 'hd',
        teaserVideo: !!newPhotoshoot.deliverables?.teaserVideo,
        fullLengthVideo: !!newPhotoshoot.deliverables?.fullLengthVideo,
        reelsCount: Number(newPhotoshoot.deliverables?.reelsCount) || Number(newPhotoshoot.crew?.reelsCount) || 0,
        mainAlbumsCount: Number(newPhotoshoot.deliverables?.mainAlbumsCount) || 0,
        mainAlbumSheets: Number(newPhotoshoot.deliverables?.mainAlbumSheets) || 30,
        albumPaperType: newPhotoshoot.deliverables?.albumPaperType || 'matte',
        frames_8x12: Number(newPhotoshoot.deliverables?.frames_8x12) || 0,
        frames_18x12: Number(newPhotoshoot.deliverables?.frames_18x12) || 0,
        frames_15x20: Number(newPhotoshoot.deliverables?.frames_15x20) || 0,
        penDriveCount: Number(newPhotoshoot.deliverables?.penDriveCount) || 0,
        penDriveBoxCount: Number(newPhotoshoot.deliverables?.penDriveBoxCount) || 0,
        miniAlbumsCount: Number(newPhotoshoot.deliverables?.miniAlbumsCount) || 0,
      },
      features: newPhotoshoot.features && newPhotoshoot.features.length > 0
        ? newPhotoshoot.features
        : ['100+ High-Resolution Graded Photos', 'Master Retouched Portraits', 'High-Speed Cloud Drive Delivery'],
      active: newPhotoshoot.active ?? true,
    };

    const updated = [...tempPhotoshoots, shootItem];
    setTempPhotoshoots(updated);
    if (setPhotoshoots) {
      setPhotoshoots(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_photoshoots', JSON.stringify(updated));
    }
    await savePhotoshootsToCloud(updated);
    setNewPhotoshoot({
      id: '',
      title: '',
      titleMl: '',
      tag: 'Special Shoot',
      price: 15000,
      imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80',
      description: '',
      hours: 4,
      locationType: 'Single Location',
      crew: { photographers: 1, videographers: 0, reelsCount: 2, drone: false },
      deliverables: { gradedPhotosCount: 100, videoQuality: 'hd', teaserVideo: false, fullLengthVideo: false, reelsCount: 2, mainAlbumsCount: 0, mainAlbumSheets: 30, albumPaperType: 'matte', frames_8x12: 0, frames_18x12: 0, frames_15x20: 0, penDriveCount: 0, penDriveBoxCount: 0, miniAlbumsCount: 0 },
      features: ['100+ High-Resolution Graded Photos', 'Master Retouched Portraits', 'High-Speed Cloud Drive Delivery'],
      active: true,
    });
    showNotification(isMl ? 'പുതിയ ഫോട്ടോഗ്രാഫി വിഭാഗം വിജയകരമായി ചേർത്തു!' : 'New photography package added & synced live!');
  };

  const handleUpdatePhotoshoot = async (updatedShoot: PhotoshootConfig) => {
    const updated = tempPhotoshoots.map((p) => (p.id === updatedShoot.id || p.type === updatedShoot.type ? updatedShoot : p));
    setTempPhotoshoots(updated);
    if (setPhotoshoots) {
      setPhotoshoots(updated);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('framlu_wedding_photoshoots', JSON.stringify(updated));
    }
    await savePhotoshootsToCloud(updated);
    setIsEditPhotoshootModalOpen(false);
    setEditingPhotoshoot(null);
    showNotification(isMl ? 'ഫോട്ടോഗ്രാഫി പാക്കേജ് വിവരങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്തു!' : 'Photoshoot package updated & synced live!');
  };

  const handleDeletePhotoshoot = async (idOrType: string) => {
    if (confirm(isMl ? 'ഈ ഫോട്ടോഗ്രാഫി വിഭാഗം ഒഴിവാക്കണോ?' : 'Delete this photoshoot package?')) {
      const updated = tempPhotoshoots.filter((p) => p.id !== idOrType && p.type !== idOrType);
      setTempPhotoshoots(updated);
      if (setPhotoshoots) {
        setPhotoshoots(updated);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('framlu_wedding_photoshoots', JSON.stringify(updated));
      }
      await savePhotoshootsToCloud(updated);
      showNotification(isMl ? 'ഫോട്ടോഗ്രാഫി വിഭാഗം നീക്കം ചെയ്തു' : 'Photoshoot package deleted');
    }
  };

  // Filtered Leads
  const uniquePlaces = Array.from(
    new Set(leads.map((l) => l.place?.trim() || l.address?.split(',')[0]?.trim()).filter(Boolean))
  );

  const displayedLeads = leads.filter((lead) => {
    const loc = (lead.place || lead.address || '').toLowerCase();
    const matchesPlace =
      placeFilter === 'all' || loc.includes(placeFilter.toLowerCase());
    const matchesSearch =
      !placeSearchQuery.trim() ||
      lead.name.toLowerCase().includes(placeSearchQuery.toLowerCase()) ||
      lead.phone.includes(placeSearchQuery) ||
      loc.includes(placeSearchQuery.toLowerCase()) ||
      (lead.studioBranding?.studioName || '').toLowerCase().includes(placeSearchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || (lead.status || 'New') === statusFilter;
    const isStudio = lead.source === 'studio' || !!lead.studioBranding;
    const matchesSource =
      leadSourceFilter === 'all' ||
      (leadSourceFilter === 'studio' && isStudio) ||
      (leadSourceFilter === 'customer' && !isStudio);
    return matchesPlace && matchesSearch && matchesStatus && matchesSource;
  });

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === displayedLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(displayedLeads.map((l) => l.id || '').filter(Boolean));
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

        <button
          type="button"
          onClick={() => setActiveAdminTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'services'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>{isMl ? `മറ്റ് സർവീസുകൾ (${tempServices.length})` : `Other Services (${tempServices.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'gallery'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>{isMl ? `ഗാലറി & വർക്കുകൾ (${tempGalleryProjects.length})` : `Gallery & Works (${tempGalleryProjects.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('coupons')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'coupons'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>{isMl ? `കൂപ്പൺ കോഡുകൾ (${tempCoupons.length})` : `Coupons (${tempCoupons.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('photoshoots')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'photoshoots'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>{isMl ? `ഫോട്ടോഗ്രാഫി വിഭാഗങ്ങൾ (${tempPhotoshoots.length})` : `Photoshoot Packages (${tempPhotoshoots.length})`}</span>
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

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'കളർ ഗ്രേഡഡ് ഫോട്ടോ നിരക്ക് (₹/ഫോട്ടോ)' : 'Color Graded Photo Rate (₹/Photo)'}
                </label>
                <input
                  type="number"
                  value={tempRates.photoGradingRate ?? 30}
                  onChange={(e) => handleRateChange('photoGradingRate', Number(e.target.value))}
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

            {/* Social Media Pages & Links Section (User specifically requested this!) */}
            <div className="pt-4 border-t border-stone-200">
              <h4 className="text-sm font-black text-stone-900 mb-1 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-rose-500" />
                <span>{isMl ? 'സോഷ്യൽ മീഡിയ പേജുകൾ & ലിങ്കുകൾ' : 'Social Media Pages & Links'}</span>
              </h4>
              <p className="text-xs text-stone-500 mb-4">
                {isMl
                  ? 'ഇവിടെ നൽകുന്ന സോഷ്യൽ മീഡിയ ലിങ്കുകൾ വെബ്സൈറ്റിന്റെ മുകളിലെ ടോപ്പ് ബാറിലും ഗാലറിയിലും ഫൂട്ടറിലും ലഭ്യമാകും'
                  : 'These links will be clickable across the website top bar, gallery, and enquiry sections.'}
              </p>

              <div className="space-y-3">
                {/* Instagram */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'Instagram പ്രൊഫൈൽ ലിങ്ക് (Instagram URL)' : 'Instagram Profile URL'}
                  </label>
                  <div className="relative">
                    <Instagram className="w-4 h-4 text-rose-500 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={tempContact.instagram || ''}
                      onChange={(e) => setTempContact({ ...tempContact, instagram: e.target.value })}
                      placeholder="https://instagram.com/frameluweddings"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* YouTube */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'YouTube ചാനൽ ലിങ്ക് (YouTube URL)' : 'YouTube Channel URL'}
                  </label>
                  <div className="relative">
                    <Youtube className="w-4 h-4 text-red-600 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={tempContact.youtube || ''}
                      onChange={(e) => setTempContact({ ...tempContact, youtube: e.target.value })}
                      placeholder="https://youtube.com/@frameluweddings"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'Facebook പേജ് ലിങ്ക് (Facebook URL)' : 'Facebook Page URL'}
                  </label>
                  <div className="relative">
                    <Facebook className="w-4 h-4 text-blue-600 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={tempContact.facebook || ''}
                      onChange={(e) => setTempContact({ ...tempContact, facebook: e.target.value })}
                      placeholder="https://facebook.com/frameluweddings"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
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
                <ImageUploadField
                  label={isMl ? 'പോസ്റ്റർ ഫോട്ടോ (Poster Photo)' : 'Offer Poster Photo'}
                  imageUrl={newOffer.posterUrl || ''}
                  onChange={(val) => setNewOffer({ ...newOffer, posterUrl: val })}
                  isMl={isMl}
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
                <ImageUploadField
                  label={isMl ? 'പാക്കേജ് ഫോട്ടോ / ബാനർ (Package Banner Photo)' : 'Package Banner Photo'}
                  imageUrl={newBoard.bannerUrl || ''}
                  onChange={(val) => setNewBoard({ ...newBoard, bannerUrl: val })}
                  isMl={isMl}
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

      {/* Admin Tab: Customer Leads CRM Tab */}
      {activeAdminTab === 'leads' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm animate-fade-in">
          {/* Header & Global Stats */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-6 border-b border-stone-200">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {isMl ? 'കസ്റ്റമർ ഇൻഫർമേഷൻ & എൻക്വയറികൾ' : 'Customer Leads & Quotations CRM'}
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                {isMl
                  ? 'വെബ്സൈറ്റ് വഴി സൈൻ-ഇൻ ചെയ്തവരുടെയും കൊട്ടേഷൻ എടുത്തവരുടെയും വിവരങ്ങൾ • ലൈവ് ക്ലൗഡ് സിങ്ക്'
                  : 'Customer inquiries received from website registrations and PDF quotations (Live Cloud Sync)'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Bulk Delete Action Button */}
              {selectedLeadIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDeleteLeads}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition animate-pulse"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {isMl
                      ? `തിരഞ്ഞെടുത്തവ ഒഴിവാക്കുക (${selectedLeadIds.length})`
                      : `Delete Selected (${selectedLeadIds.length})`}
                  </span>
                </button>
              )}

              {/* Download Customer Data PDF Button */}
              <button
                type="button"
                onClick={handleDownloadCustomerDataPdf}
                disabled={displayedLeads.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition"
                title={isMl ? 'കസ്റ്റമർ ഡേറ്റ PDF ആയി ഡൗൺലോഡ് ചെയ്യുക' : 'Download Customer Report as PDF'}
              >
                <Download className="w-4 h-4" />
                <span>{isMl ? 'ഡേറ്റ PDF ഡൗൺലോഡ്' : 'Export Leads PDF'}</span>
              </button>

              <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-xl text-xs">
                {isMl ? `ആകെ: ${leads.length}` : `Total: ${leads.length}`}
              </span>
            </div>
          </div>

          {/* Lead Source Section: Direct Customer Quotes vs Studio Partner Quotes */}
          <div className="flex flex-wrap items-center gap-2 mb-6 p-2 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              type="button"
              onClick={() => setLeadSourceFilter('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                leadSourceFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isMl ? `എല്ലാ കൊട്ടേഷനുകളും (${leads.length})` : `All Quotes (${leads.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setLeadSourceFilter('customer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                leadSourceFilter === 'customer'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>
                {isMl
                  ? `കസ്റ്റമർ ഡയറക്റ്റ് കൊട്ടേഷൻ (${leads.filter((l) => l.source !== 'studio' && !l.studioBranding).length})`
                  : `Direct Customer Quotes (${leads.filter((l) => l.source !== 'studio' && !l.studioBranding).length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLeadSourceFilter('studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                leadSourceFilter === 'studio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>
                {isMl
                  ? `സ്റ്റുഡിയോ പാർട്ണർ കൊട്ടേഷൻ (${leads.filter((l) => l.source === 'studio' || !!l.studioBranding).length})`
                  : `Studio Partner Quotes (${leads.filter((l) => l.source === 'studio' || !!l.studioBranding).length})`}
              </span>
            </button>
          </div>

          {/* Place Filter & Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={isMl ? 'കസ്റ്റമർ പേര്, ഫോൺ നമ്പർ, സ്ഥലം എന്നിവ തിരയുക...' : 'Search customer by name, phone or place...'}
                value={placeSearchQuery}
                onChange={(e) => setPlaceSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Place Dropdown Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={placeFilter}
                onChange={(e) => setPlaceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{isMl ? 'എല്ലാ സ്ഥലങ്ങളും (All Places)' : 'All Locations'}</option>
                {uniquePlaces.map((pl, i) => (
                  <option key={i} value={pl}>
                    {pl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-black text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{isMl ? 'സ്റ്റാറ്റസ് പ്രകാരം:' : 'Filter by Status:'}</span>
            </span>

            {/* All Leads Pill */}
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                statusFilter === 'all'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{isMl ? 'എല്ലാം (All)' : 'All'}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                  statusFilter === 'all' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {leads.length}
              </span>
            </button>

            {/* Status-specific Filter Buttons */}
            {(['New', 'Contacted', 'Quoted', 'Booked', 'Completed'] as const).map((st) => {
              const cfg = getLeadStatusConfig(st, isMl);
              const count = leads.filter((l) => (l.status || 'New') === st).length;
              const isActive = statusFilter === st;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                    isActive
                      ? `${cfg.badgeClass} ring-2 ring-offset-1`
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${cfg.dotClass}`} />
                  <span>{cfg.shortLabel}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive ? 'bg-white/80 text-stone-900' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Leads Table */}
          {displayedLeads.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">
                {placeSearchQuery || placeFilter !== 'all' || statusFilter !== 'all'
                  ? isMl
                    ? 'ഈ ഫിൽറ്ററിൽ ലീഡുകൾ ഒന്നും കണ്ടെത്തിയില്ല'
                    : 'No leads found matching current filter'
                  : isMl
                  ? 'പുതിയ ലീഡുകൾ ഒന്നും ലഭിച്ചിട്ടില്ല'
                  : 'No customer leads recorded yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-200 bg-stone-100/70 text-stone-700">
                    {/* Header Select All Checkbox */}
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          displayedLeads.length > 0 &&
                          selectedLeadIds.length === displayedLeads.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                        title={isMl ? 'എല്ലാം തിരഞ്ഞെടുക്കുക' : 'Select All'}
                      />
                    </th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'കസ്റ്റമർ പേര്' : 'Name'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'മൊബൈൽ' : 'Phone'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'സ്ഥലം & അഡ്രസ്' : 'Place & Address'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'വിവാഹ തീയതി' : 'Wedding Date'}</th>
                    <th className="py-3 px-3 font-bold text-right">{isMl ? 'എസ്റ്റിമേറ്റ് തുക' : 'Total Amount'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isMl ? 'സ്റ്റാറ്റസ്' : 'Status'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isMl ? 'പ്ലാൻ വിവരങ്ങൾ' : 'Plan Details'}</th>
                    <th className="py-3 px-3 font-bold text-right">{isMl ? 'ആക്ഷൻസ്' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedLeads.map((lead, idx) => {
                    const isChecked = lead.id ? selectedLeadIds.includes(lead.id) : false;
                    const statusCfg = getLeadStatusConfig(lead.status || 'New', isMl);

                    return (
                      <tr
                        key={lead.id || idx}
                        className={`transition ${
                          isChecked ? 'bg-amber-50/70' : 'hover:bg-stone-50'
                        } ${statusCfg.borderLeft}`}
                      >
                        {/* Row Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => lead.id && toggleSelectLead(lead.id)}
                            className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                          />
                        </td>

                        <td
                          className="py-3 px-3 font-black text-stone-900 cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{lead.name}</span>
                            {lead.studioBranding && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200">
                                🏢 Studio Quote
                              </span>
                            )}
                            {lead.leadType === 'standalone_photoshoot' && (
                              <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                                📷 {lead.photoshootDetails?.title || 'Photoshoot'}
                              </span>
                            )}
                          </div>
                          {lead.studioBranding ? (
                            <span className="block text-[10px] text-indigo-800 font-bold mt-0.5">
                              Studio: {lead.studioBranding.studioName} ({lead.studioBranding.ownerName})
                            </span>
                          ) : null}
                          {lead.email && (
                            <span className="block text-[10px] text-stone-400 font-normal">
                              {lead.email}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-semibold text-stone-800">{lead.phone}</td>
                        <td className="py-3 px-3 text-stone-600">
                          <span className="font-bold text-stone-800 block">
                            {lead.place || lead.address?.split(',')[0] || 'കായംകുളം'}
                          </span>
                          {lead.studioBranding && (
                            <span className="text-[10px] text-indigo-700 font-semibold block">
                              Studio Place: {lead.studioBranding.place || lead.studioBranding.address}
                            </span>
                          )}
                          {lead.address && (
                            <span className="text-[10px] text-stone-400 block line-clamp-1">
                              {lead.address}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-stone-600">
                          {lead.leadType === 'standalone_photoshoot' && lead.photoshootDetails?.date
                            ? lead.photoshootDetails.date
                            : (lead.weddingDate || 'തീരുമാനിച്ചിട്ടില്ല')}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-amber-700">
                          ₹{(lead.totalPrice || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusCfg.dotClass}`} />
                            <select
                              value={lead.status || 'New'}
                              onChange={(e) =>
                                updateLeadStatus(
                                  lead.id || idx,
                                  e.target.value as CustomerLead['status']
                                )
                              }
                              className={`border rounded-lg px-2 py-1 text-[11px] font-black cursor-pointer shadow-2xs transition focus:outline-hidden focus:ring-2 ${statusCfg.selectClass}`}
                            >
                              <option value="New" className="bg-white text-blue-900 font-bold">
                                🔵 {isMl ? 'പുതിയത് (New)' : 'New Lead'}
                              </option>
                              <option value="Contacted" className="bg-white text-amber-900 font-bold">
                                🟡 {isMl ? 'വിളിച്ചു (Contacted)' : 'Contacted'}
                              </option>
                              <option value="Quoted" className="bg-white text-purple-900 font-bold">
                                🟣 {isMl ? 'കൊട്ടേഷൻ അയച്ചു (Quoted)' : 'Quoted'}
                              </option>
                              <option value="Booked" className="bg-white text-rose-900 font-bold">
                                🔴 {isMl ? 'ബുക്കിംഗ് ഉറപ്പിച്ചു (Booked)' : 'Booked'}
                              </option>
                              <option value="Completed" className="bg-white text-emerald-900 font-bold">
                                🟢 {isMl ? 'പൂർത്തിയായി (Completed)' : 'Completed'}
                              </option>
                            </select>
                          </div>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. Other Services Management Tab (Food/Catering, Decor, Makeup, Cars, etc.) */}
      {activeAdminTab === 'services' && (
        <div className="space-y-8 animate-fade-in">
          {/* Sub-tab switcher: Packages vs Categories */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200 w-fit">
            <button
              type="button"
              onClick={() => setServicesSubTab('packages')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                servicesSubTab === 'packages'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>
                {isMl
                  ? `സർവീസ് പാക്കേജുകൾ (${tempServices.length})`
                  : `Service Packages (${tempServices.length})`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setServicesSubTab('categories')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                servicesSubTab === 'categories'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>
                {isMl
                  ? `കാറ്റഗറികൾ (${tempCategories.length})`
                  : `Categories (${tempCategories.length})`}
              </span>
            </button>
          </div>

          {/* VIEW 1: MANAGE CATEGORIES */}
          {servicesSubTab === 'categories' && (
            <div className="space-y-8 animate-fade-in">
              {/* Add New Category Form */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
                  <div>
                    <h3 className="text-xl font-black text-stone-900">
                      {isMl ? 'പുതിയ കാറ്റഗറി ചേർക്കുക' : 'Add New Service Category'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {isMl
                        ? 'ഫുഡ്, ഡെക്കോർ, മേക്കപ്പ്, കാർഡുകൾ, ടൂർസ് തുടങ്ങിയ പുതിയ സർവീസ് കാറ്റഗറികൾ ഇവിടെ ബ്രൗസ് ചെയ്ത് ഫോട്ടോ വെച്ച് ചേർക്കാം'
                        : 'Create new service categories with custom photo and titles to display in frontend.'}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                    {isMl ? `ആകെ: ${tempCategories.length}` : `Total Categories: ${tempCategories.length}`}
                  </span>
                </div>

                <form onSubmit={handleAddCategory} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'കാറ്റഗറി പേര് (English Name) *' : 'Category Name (English) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Wedding Stage Decor"
                        value={newCategory.name || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'മലയാളം പേര് (Malayalam Name) *' : 'Malayalam Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. വെഡ്ഡിംഗ് സ്റ്റേജ് ഡെക്കോർ"
                        value={newCategory.nameMl || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, nameMl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'ബാഡ്ജ് (Badge - Optional)' : 'Badge (Optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Popular / New / Trending"
                        value={newCategory.badge || ''}
                        onChange={(e) => setNewCategory({ ...newCategory, badge: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'വിവരണക്കുറിപ്പ് (Short Description)' : 'Short Description'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional flower mandapams, modern LED backdrops & lighting themes"
                      value={newCategory.description || ''}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Category Image with local file browser */}
                  <ImageUploadField
                    label={isMl ? 'കാറ്റഗറി ഫോട്ടോ (Category Cover Image)' : 'Category Cover Image'}
                    imageUrl={newCategory.imageUrl || ''}
                    onChange={(val) => setNewCategory({ ...newCategory, imageUrl: val })}
                    isMl={isMl}
                  />

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isMl ? 'പുതിയ കാറ്റഗറി ക്ലൗഡിൽ ചേർക്കുക' : 'Save Category to Cloud'}</span>
                  </button>
                </form>
              </div>

              {/* Existing Categories Grid */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-black text-stone-900 mb-4">
                  {isMl ? 'നിലവിലുള്ള കാറ്റഗറികൾ' : 'Active Service Categories'} ({tempCategories.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {tempCategories.map((cat) => {
                    const packageCount = tempServices.filter((s) => s.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between bg-white"
                      >
                        <div>
                          <div className="relative h-36 w-full overflow-hidden bg-stone-100">
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            {cat.badge && (
                              <span className="absolute top-2 right-2 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                {cat.badge}
                              </span>
                            )}
                            <span className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {packageCount} {isMl ? 'പാക്കേജുകൾ' : 'Packages'}
                            </span>
                          </div>

                          <div className="p-4">
                            <h4 className="font-black text-sm text-stone-900 leading-snug">
                              {cat.nameMl}
                            </h4>
                            <p className="text-xs font-semibold text-rosewood-700 mb-1">{cat.name}</p>
                            {cat.description && (
                              <p className="text-xs text-stone-500 line-clamp-2 mt-1">{cat.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex justify-between items-center text-xs">
                          <span className="text-[10px] text-stone-400 font-mono">ID: {cat.id}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold transition cursor-pointer"
                            title="Delete category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isMl ? 'ഡിലീറ്റ്' : 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: MANAGE PACKAGES (WITH LOCAL FILE BROWSE & PRICING TYPES) */}
          {servicesSubTab === 'packages' && (
            <div className="space-y-8 animate-fade-in">
              {/* Add New Service Form */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
                  <div>
                    <h3 className="text-xl font-black text-stone-900">
                      {isMl ? 'പുതിയ സർവീസ് പാക്കേജ് ചേർക്കുക' : 'Add New Service Package'}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      {isMl
                        ? 'ഫോട്ടോ ബ്രൗസ് ചെയ്ത് തിരഞ്ഞെടുത്ത് സദ്യ, സ്റ്റേജ് ഡെക്കോർ, മേക്കപ്പ്, കാർഡുകൾ എന്നിവയുടെ പുതിയ പാക്കേജ് തയ്യാറാക്കാം'
                        : 'Add and manage food catering, stage decor, bridal makeup, luxury cars, cards and honeymoon packages.'}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                    {isMl ? `ആകെ: ${tempServices.length}` : `Total Services: ${tempServices.length}`}
                  </span>
                </div>

                <form onSubmit={handleAddService} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Dynamic Category Selector */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'സർവീസ് കാറ്റഗറി (Category) *' : 'Service Category *'}
                      </label>
                      <select
                        value={newService.category}
                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        {tempCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {isMl ? cat.nameMl : cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'പാക്കേജ് പേര് (English Title) *' : 'Package Title (English) *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Royal Malabar Dum Biryani Feast"
                        value={newService.title || ''}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'മലയാളം പേര് (Malayalam Title) *' : 'Malayalam Title *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. റോയൽ മലബാർ ദം ബിരിയാണി ഫീസ്റ്റ്"
                        value={newService.titleMl || ''}
                        onChange={(e) => setNewService({ ...newService, titleMl: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Pricing Type & Rates */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'പ്രൈസിംഗ് രീതി (Pricing Type) *' : 'Pricing Type *'}
                      </label>
                      <select
                        value={newService.pricingType || 'fixed'}
                        onChange={(e) => {
                          const pType = e.target.value as 'fixed' | 'per_guest' | 'per_card';
                          setNewService({
                            ...newService,
                            pricingType: pType,
                            pricePerUnit: pType === 'per_guest' ? 350 : pType === 'per_card' ? 95 : undefined,
                            baseGuestCount: pType === 'per_guest' ? 500 : undefined,
                            baseCardCount: pType === 'per_card' ? 300 : undefined,
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="fixed">{isMl ? 'നിശ്ചിത പാക്കേജ് നിരക്ക് (Fixed Total Price)' : 'Fixed Total Price (₹)'}</option>
                        <option value="per_guest">{isMl ? 'സദ്യ ഒരാൾക്ക് നിരക്ക് (Per Guest - Food)' : 'Per Guest Price (₹ / guest)'}</option>
                        <option value="per_card">{isMl ? 'ഇൻവിറ്റേഷൻ കാർഡ് ഒരെണ്ണത്തിന് (Per Card)' : 'Per Card Price (₹ / card)'}</option>
                      </select>
                    </div>

                    {newService.pricingType === 'per_guest' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            {isMl ? 'ഒരാൾക്ക് നിരക്ക് (₹ Per Guest) *' : 'Rate Per Guest (₹) *'}
                          </label>
                          <input
                            type="number"
                            required
                            placeholder="350"
                            value={newService.pricePerUnit || newService.price || ''}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                pricePerUnit: Number(e.target.value),
                                price: Number(e.target.value) * (newService.baseGuestCount || 500),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            {isMl ? 'സാധാരണ ഗസ്റ്റ് കൗണ്ട് (Base Guests)' : 'Default Guest Count'}
                          </label>
                          <input
                            type="number"
                            placeholder="500"
                            value={newService.baseGuestCount || 500}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                baseGuestCount: Number(e.target.value),
                                price: (newService.pricePerUnit || 350) * Number(e.target.value),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </>
                    ) : newService.pricingType === 'per_card' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            {isMl ? 'ഒരു കാർഡിന് നിരക്ക് (₹ Per Card) *' : 'Rate Per Card (₹) *'}
                          </label>
                          <input
                            type="number"
                            required
                            placeholder="95"
                            value={newService.pricePerUnit || newService.price || ''}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                pricePerUnit: Number(e.target.value),
                                price: Number(e.target.value) * (newService.baseCardCount || 300),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            {isMl ? 'സാധാരണ കാർഡുകളുടെ എണ്ണം (Base Cards)' : 'Default Card Count'}
                          </label>
                          <input
                            type="number"
                            placeholder="300"
                            value={newService.baseCardCount || 300}
                            onChange={(e) =>
                              setNewService({
                                ...newService,
                                baseCardCount: Number(e.target.value),
                                price: (newService.pricePerUnit || 95) * Number(e.target.value),
                              })
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            {isMl ? 'നിശ്ചിത നിരക്ക് (Total Price in ₹) *' : 'Total Package Price (₹) *'}
                          </label>
                          <input
                            type="number"
                            required
                            placeholder="35000"
                            value={newService.price || ''}
                            onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            {isMl ? 'ബാഡ്ജ് (Badge - Optional)' : 'Badge (Optional)'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Popular Feast / Trending"
                            value={newService.badge || ''}
                            onChange={(e) => setNewService({ ...newService, badge: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Image Upload with Device File Browser */}
                  <ImageUploadField
                    label={isMl ? 'സർവീസ് ഫോട്ടോ (Service Package Photo)' : 'Service Package Photo'}
                    imageUrl={newService.imageUrl || ''}
                    onChange={(val) => setNewService({ ...newService, imageUrl: val })}
                    isMl={isMl}
                  />

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'വിവരണക്കുറിപ്പ് (Description)' : 'Service Description'}
                    </label>
                    <textarea
                      rows={2}
                      value={newService.description || ''}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Details about dishes, decorations, car models, or inclusions..."
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'ഫീച്ചറുകൾ (കോമ ഇട്ട് നൽകുക / Features separated by comma)' : 'Key Features (comma separated)'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 28 authentic items, Special Palada Payasam, Parippu & Ghee, Uniformed serving team"
                      value={
                        Array.isArray(newService.features)
                          ? newService.features.join(', ')
                          : (newService.features as any) || ''
                      }
                      onChange={(e) =>
                        setNewService({
                          ...newService,
                          features: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isMl ? 'സർവീസ് പാക്കേജ് ക്ലൗഡിൽ ചേർക്കുക' : 'Add Service Package to Cloud'}</span>
                  </button>
                </form>
              </div>

              {/* Existing Services Grid */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <h3 className="text-lg font-black text-stone-900">
                    {isMl ? 'നിലവിലുള്ള മറ്റ് സർവീസുകൾ' : 'Active Other Services & Packages'}
                  </h3>

                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-stone-400" />
                    <select
                      value={serviceCategoryFilter}
                      onChange={(e) => setServiceCategoryFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50"
                    >
                      <option value="all">{isMl ? 'എല്ലാ കാറ്റഗറികളും' : 'All Categories'}</option>
                      {tempCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {isMl ? c.nameMl : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tempServices
                    .filter((s) => serviceCategoryFilter === 'all' || s.category === serviceCategoryFilter)
                    .map((pkg) => {
                      const catObj = tempCategories.find((c) => c.id === pkg.category);
                      const catName = isMl ? (catObj?.nameMl || pkg.category) : (catObj?.name || pkg.category);

                      return (
                        <div
                          key={pkg.id}
                          className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between bg-white"
                        >
                          <div>
                            <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                              <img
                                src={pkg.imageUrl}
                                alt={pkg.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              {pkg.badge && (
                                <span className="absolute top-2 right-2 bg-amber-500 text-stone-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                  {pkg.badge}
                                </span>
                              )}
                              <span className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                                {catName}
                              </span>
                            </div>

                            <div className="p-4">
                              <h4 className="font-bold text-sm text-stone-900 leading-snug">{pkg.titleMl}</h4>
                              <p className="text-xs font-semibold text-rosewood-700 mb-1">{pkg.title}</p>
                              <p className="text-xs text-stone-500 line-clamp-2 mb-3">{pkg.description}</p>

                              <div className="flex items-baseline gap-1.5">
                                {pkg.pricingType === 'per_guest' ? (
                                  <>
                                    <span className="text-base font-black text-stone-900">
                                      ₹{(pkg.pricePerUnit || 350).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-stone-500 font-bold">
                                      / {isMl ? 'ഒരാൾക്ക്' : 'guest'}
                                    </span>
                                  </>
                                ) : pkg.pricingType === 'per_card' ? (
                                  <>
                                    <span className="text-base font-black text-stone-900">
                                      ₹{(pkg.pricePerUnit || 95).toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-xs text-stone-500 font-bold">
                                      / {isMl ? 'കാർഡ്' : 'card'}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-base font-black text-stone-900 block">
                                    ₹{pkg.price.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEditService(pkg)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-bold transition cursor-pointer border border-amber-200"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{isMl ? 'എഡിറ്റ് ചെയ്യുക' : 'Edit'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteService(pkg.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isMl ? 'ഡിലീറ്റ് ചെയ്യുക' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Gallery & Work Showcase Portfolio Management Tab (User specifically requested this!) */}
      {activeAdminTab === 'gallery' && (
        <div className="space-y-8 animate-fade-in">
          {/* Add New Project & Customer Review Form */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-amber-600" />
                  <span>{isMl ? 'പുതിയ വർക്കും കസ്റ്റമർ റിവ്യൂവും ചേർക്കുക' : 'Add New Portfolio Project & Review'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {isMl
                    ? 'ഫോട്ടോ ഡിവൈസിൽ നിന്ന് ബ്രൗസ് ചെയ്ത് തിരഞ്ഞെടുത്ത് ചെയ്ത വർക്കുകൾ, സ്ഥലം, ക്ലയന്റ് പേര്, കസ്റ്റമർ റിവ്യൂ എന്നിവ കാറ്റഗറി തിരിച്ച് ഗാലറിയിൽ ചേർക്കാം'
                    : 'Upload portfolio projects with local device photos, venue location, couple names, and verified 5-star customer reviews.'}
                </p>
              </div>

              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-full shrink-0">
                {isMl ? `ആകെ പ്രോജക്റ്റുകൾ: ${tempGalleryProjects.length}` : `Total Projects: ${tempGalleryProjects.length}`}
              </span>
            </div>

            <form onSubmit={handleAddGalleryProject} className="space-y-6">
              {/* Category, Title & Client */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Dynamic Category Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'സർവീസ് കാറ്റഗറി (Category) *' : 'Service Category *'}
                  </label>
                  <select
                    value={newProject.category}
                    onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="photography">{isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി' : 'Wedding Photography'}</option>
                    {tempCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {isMl ? cat.nameMl : cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Title English */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പ്രോജക്റ്റ് പേര് (English Title) *' : 'Project Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Palace Wedding at Bolgatty"
                    value={newProject.title || ''}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Project Title Malayalam */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'മലയാളം പേര് (Malayalam Title)' : 'Malayalam Title'}
                  </label>
                  <input
                    type="text"
                    placeholder="ഉദാ: ബോൾഗാട്ടി പാലസ് റോയൽ വെഡ്ഡിംഗ്"
                    value={newProject.titleMl || ''}
                    onChange={(e) => setNewProject({ ...newProject, titleMl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Client Name, Venue Location & Event Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ക്ലയന്റ് / വധൂവരന്മാർ (Client / Couple Names) *' : 'Client / Couple Names *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul & Anjali"
                    value={newProject.clientName || ''}
                    onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'വേദി / സ്ഥലം (Venue & Location) *' : 'Venue & Location *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramada Resort & Lawns, Kumarakom"
                    value={newProject.venueLocation || ''}
                    onChange={(e) => setNewProject({ ...newProject, venueLocation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഇവന്റ് തീയതി (Event Date)' : 'Event Date'}
                  </label>
                  <input
                    type="date"
                    value={newProject.eventDate || '2026-01-20'}
                    onChange={(e) => setNewProject({ ...newProject, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Local File Browser / Cover Photo with ImageUploadField */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <ImageUploadField
                  label={isMl ? 'പ്രോജക്റ്റ് കവർ ഫോട്ടോ (ഡിവൈസിൽ നിന്ന് നേരിട്ട് ബ്രൗസ് ചെയ്യാം)' : 'Project Cover Photo (Browse Device File or URL)'}
                  imageUrl={newProject.coverImage || ''}
                  onChange={(val) => setNewProject({ ...newProject, coverImage: val })}
                  isMl={isMl}
                />
              </div>

              {/* Short Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പ്രോജക്റ്റ് വിവരണം (English Description)' : 'Project Summary (English)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 3-day luxury destination wedding with 4K multi-cam coverage and grand drone aesthetics."
                    value={newProject.description || ''}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'മലയാളം വിവരണം (Malayalam Description)' : 'Malayalam Summary'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="ഉദാ: കുമരകം ബാക്ക്‌വാട്ടർ റിസോർട്ടിൽ നടന്ന 3 ദിവസത്തെ അതിമനോഹരമായ വിവാഹ ചടങ്ങുകൾ."
                    value={newProject.descriptionMl || ''}
                    onChange={(e) => setNewProject({ ...newProject, descriptionMl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* ATTACHED VERIFIED CUSTOMER REVIEW SECTION */}
              <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 rounded-2xl border border-amber-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h4 className="text-sm font-black text-stone-900">
                    {isMl ? 'പ്രോജക്റ്റുമായി ബന്ധിപ്പിച്ച കസ്റ്റമർ റിവ്യൂ (Customer Review for Project)' : 'Attached Verified Customer Review'}
                  </h4>
                </div>
                <p className="text-xs text-stone-600">
                  {isMl
                    ? 'ഈ പ്രോജക്റ്റ് ചെയ്ത ക്ലയന്റിന്റെ റിവ്യൂവും റേറ്റിംഗും ഇവിടെ ചേർക്കുക. ഗാലറിയിൽ ഇത് കാർഡിന്റെ കൂടെ പ്രദർശിപ്പിക്കും.'
                    : 'Attach client testimonials and star ratings that display automatically on this project card.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'റിവ്യൂ ചെയ്ത ആളുടെ പേര്' : 'Reviewer Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={newProject.clientName || 'e.g. Rahul & Anjali'}
                      value={newProject.clientReview?.reviewerName || ''}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          clientReview: {
                            ...newProject.clientReview,
                            reviewerName: e.target.value,
                            rating: newProject.clientReview?.rating || 5,
                            comment: newProject.clientReview?.comment || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'സ്റ്റാർ റേറ്റിംഗ് (Rating 1-5)' : 'Star Rating'}
                    </label>
                    <select
                      value={newProject.clientReview?.rating || 5}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          clientReview: {
                            ...newProject.clientReview,
                            reviewerName: newProject.clientReview?.reviewerName || '',
                            rating: Number(e.target.value),
                            comment: newProject.clientReview?.comment || '',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                      <option value={3}>⭐⭐⭐ 3 Stars (Good)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'റിവ്യൂ തീയതി / മാസം' : 'Review Month / Date'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jan 2026"
                      value={newProject.clientReview?.date || 'Jan 2026'}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          clientReview: {
                            ...newProject.clientReview,
                            reviewerName: newProject.clientReview?.reviewerName || '',
                            rating: newProject.clientReview?.rating || 5,
                            comment: newProject.clientReview?.comment || '',
                            date: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'കസ്റ്റമർ റിവ്യൂ കമന്റ് (English Review)' : 'Customer Review Comment (English)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Framelu Weddings made our special day timeless! Highly professional team."
                      value={newProject.clientReview?.comment || ''}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          clientReview: {
                            ...newProject.clientReview,
                            reviewerName: newProject.clientReview?.reviewerName || '',
                            rating: newProject.clientReview?.rating || 5,
                            comment: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'മലയാളം റിവ്യൂ കമന്റ് (Malayalam Review)' : 'Customer Review Comment (Malayalam)'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder="ഉദാ: ഫ്രെംലു വെഡ്ഡിംഗ് ടീമിന്റെ വർക്ക് വളരെ മികച്ചതായിരുന്നു! ഹൃദയം നിറഞ്ഞ നന്ദി."
                      value={newProject.clientReview?.commentMl || ''}
                      onChange={(e) =>
                        setNewProject({
                          ...newProject,
                          clientReview: {
                            ...newProject.clientReview,
                            reviewerName: newProject.clientReview?.reviewerName || '',
                            rating: newProject.clientReview?.rating || 5,
                            comment: newProject.clientReview?.comment || '',
                            commentMl: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'പുതിയ പ്രോജക്റ്റ് ഗാലറിയിൽ ചേർക്കുക' : 'Save Project to Gallery & Cloud'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Projects Showcase List */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {isMl ? 'നിലവിലുള്ള ഗാലറി പ്രോജക്റ്റുകൾ' : 'Existing Gallery Projects'} ({tempGalleryProjects.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isMl
                    ? 'ഫ്രണ്ട് എൻഡ് ഗാലറിയിൽ പ്രദർശിപ്പിക്കുന്ന വർക്കുകൾ'
                    : 'Portfolio showcases active in customer gallery tab'}
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <select
                  value={galleryCategoryFilter}
                  onChange={(e) => setGalleryCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-stone-50"
                >
                  <option value="all">{isMl ? 'എല്ലാ കാറ്റഗറികളും' : 'All Categories'}</option>
                  <option value="photography">{isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി' : 'Photography'}</option>
                  {tempCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isMl ? c.nameMl : c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tempGalleryProjects
                .filter((p) => galleryCategoryFilter === 'all' || p.category === galleryCategoryFilter)
                .map((project) => {
                  const catObj = tempCategories.find((c) => c.id === project.category);
                  const catName = project.category === 'photography'
                    ? (isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി' : 'Wedding Photography')
                    : (isMl ? (catObj?.nameMl || project.category) : (catObj?.name || project.category));

                  return (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between bg-white group"
                    >
                      <div>
                        {/* Image Thumbnail */}
                        <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <span className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md">
                            {catName}
                          </span>
                          {project.eventDate && (
                            <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                              {project.eventDate}
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="p-4 space-y-2">
                          <h4 className="font-black text-sm text-stone-900 leading-snug">
                            {isMl && project.titleMl ? project.titleMl : project.title}
                          </h4>

                          <div className="space-y-1 text-xs text-stone-600">
                            <div className="flex items-center gap-1.5 font-semibold text-rosewood-700">
                              <span>🤵👰 {project.clientName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-stone-500">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span className="truncate">{project.venueLocation}</span>
                            </div>
                          </div>

                          {/* Client Review Card preview */}
                          {project.clientReview && (
                            <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-0.5 text-amber-500">
                                  {Array.from({ length: project.clientReview.rating || 5 }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-500" />
                                  ))}
                                </div>
                                <span className="text-[10px] font-bold text-amber-800">
                                  {project.clientReview.reviewerName}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-600 italic line-clamp-2">
                                "{isMl && project.clientReview.commentMl ? project.clientReview.commentMl : project.clientReview.comment}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer with Delete */}
                      <div className="p-4 pt-0 border-t border-stone-100 mt-2 flex justify-between items-center text-xs">
                        <span className="text-[10px] text-stone-400 font-mono">ID: {project.id.slice(-8)}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryProject(project.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isMl ? 'ഡിലീറ്റ്' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* 9. Coupons Management Tab (കൂപ്പൺ കോഡുകൾ) */}
      {activeAdminTab === 'coupons' && (
        <div className="space-y-8 animate-fade-in">
          {/* Create New Coupon Form */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-100">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
                  <Ticket className="w-6 h-6 text-amber-600" />
                  <span>{isMl ? 'പുതിയ കൂപ്പൺ കോഡ് സൃഷ്ടിക്കുക' : 'Create New Coupon Code'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {isMl
                    ? 'ഉപഭോക്താക്കൾക്ക് തത്സമയ കിഴിവ് (ഡിസ്കൗണ്ട് ശതമാനം) നൽകാനുള്ള കൂപ്പൺ കോഡുകൾ ഇവിടെ ഉണ്ടാക്കാം'
                    : 'Generate discount promo codes for live client quotation calculations.'}
                </p>
              </div>

              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3.5 py-1.5 rounded-full shrink-0">
                {isMl ? `ആകെ കൂപ്പണുകൾ: ${tempCoupons.length}` : `Total Coupons: ${tempCoupons.length}`}
              </span>
            </div>

            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'കൂപ്പൺ കോഡ് (Coupon Code) *' : 'Coupon Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WEDDING10"
                    value={newCoupon.code || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-black uppercase bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഡിസ്കൗണ്ട് ശതമാനം (% Discount) *' : 'Discount Percentage (%) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={90}
                      placeholder="10"
                      value={newCoupon.discountPercentage || ''}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountPercentage: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-black text-stone-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'മിനിമം ഓർഡർ എമൗണ്ട് (₹)' : 'Minimum Order Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    value={newCoupon.minAmount || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'കാലാവധി (Valid Till)' : 'Valid Till'}
                  </label>
                  <input
                    type="date"
                    value={newCoupon.validTill || '2026-12-31'}
                    onChange={(e) => setNewCoupon({ ...newCoupon, validTill: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'വിവരണം (Description English)' : 'Description (English)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Special 10% wedding package discount"
                    value={newCoupon.description || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'വിവരണം (മലയാളം)' : 'Description (Malayalam)'}
                  </label>
                  <input
                    type="text"
                    placeholder="പ്രത്യേക 10% വിവാഹ പാക്കേജ് കിഴിവ്"
                    value={newCoupon.descriptionMl || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, descriptionMl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Public Demo Coupon Toggle Option */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                <label className="flex items-start sm:items-center justify-between cursor-pointer gap-4">
                  <div>
                    <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>🌐</span>
                      <span>{isMl ? 'പബ്ലിക് കൂപ്പൺ കോഡ് (ഡെമോ / ബുക്കിംഗ് പേജിലെ Try ലിസ്റ്റിൽ കാണിക്കുക)' : 'Public Demo Coupon (Display under "Try" chips on booking page)'}</span>
                    </span>
                    <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                      {isMl
                        ? 'ഈ ഓപ്ഷൻ ഓൺ ചെയ്താൽ മാത്രമേ ഉപഭോക്താക്കൾക്ക് തത്സമയം "Try: [COUPON (10% OFF)]" എന്ന് പരസ്യമായി കാണാൻ കഴിയൂ. ഓഫ് ചെയ്താൽ ഇത് രഹസ്യ പേഴ്സണൽ കൂപ്പൺ ആയിരിക്കും (ക്ലയന്റിന് കോഡ് അറിയാമെങ്കിൽ മാത്രം ടൈപ്പ് ചെയ്ത് അപ്ലൈ ചെയ്യാം).'
                        : 'When enabled, this coupon will be highlighted publicly as a clickable chip under "Try:" on the client booking customizer. When disabled, it stays as a private personal coupon.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!newCoupon.isPublic}
                    onChange={(e) => setNewCoupon({ ...newCoupon, isPublic: e.target.checked })}
                    className="w-5 h-5 rounded text-amber-600 accent-amber-600 cursor-pointer shrink-0 mt-1 sm:mt-0"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black flex items-center gap-2 transition shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{isMl ? 'കൂപ്പൺ കോഡ് ലൈവ് ആയി ചേർക്കുക' : 'Publish Coupon Code'}</span>
              </button>
            </form>
          </div>

          {/* Existing Coupons Table with Public/Private Filters */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {isMl ? 'നിലവിലുള്ള കൂപ്പൺ കോഡുകൾ' : 'Existing Coupon Codes'} ({tempCoupons.length})
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isMl
                    ? 'പബ്ലിക് ഡെമോ കൂപ്പണുകൾ ബുക്കിംഗ് പേജിൽ ഉപഭോക്താക്കൾക്ക് കാണാൻ കഴിയും. പേഴ്സണൽ കൂപ്പണുകൾ രഹസ്യമായിരിക്കും.'
                    : 'Public demo coupons appear under Try chips. Personal coupons are private.'}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCouponTypeFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    couponTypeFilter === 'all'
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {isMl ? `എല്ലാം (${tempCoupons.length})` : `All (${tempCoupons.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setCouponTypeFilter('public')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    couponTypeFilter === 'public'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  <span>🌐</span>
                  <span>{isMl ? `പബ്ലിക് ഡെമോ (${tempCoupons.filter((c) => c.isPublic).length})` : `Public (${tempCoupons.filter((c) => c.isPublic).length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCouponTypeFilter('private')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    couponTypeFilter === 'private'
                      ? 'bg-stone-700 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span>🔒</span>
                  <span>{isMl ? `പേഴ്സണൽ (${tempCoupons.filter((c) => !c.isPublic).length})` : `Personal (${tempCoupons.filter((c) => !c.isPublic).length})`}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Discount</th>
                    <th className="py-3 px-3">Min Order</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Valid Till</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {tempCoupons
                    .filter((coupon) => {
                      if (couponTypeFilter === 'public') return !!coupon.isPublic;
                      if (couponTypeFilter === 'private') return !coupon.isPublic;
                      return true;
                    })
                    .map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-stone-50/80">
                      <td className="py-3 px-3">
                        <span className="font-black text-stone-900 tracking-wider bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-mono">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleTogglePublicCoupon(coupon.id)}
                          title={isMl ? 'ക്ലിക്ക് ചെയ്ത് മാറ്റാം (Click to toggle)' : 'Click to toggle public visibility'}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold cursor-pointer transition ${
                            coupon.isPublic
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-300'
                          }`}
                        >
                          <span>{coupon.isPublic ? '🌐' : '🔒'}</span>
                          <span>{coupon.isPublic ? (isMl ? 'പബ്ലിക് ഡെമോ (Try-ൽ കാട്ടും)' : 'Public (In Try)') : (isMl ? 'പേഴ്സണൽ (രഹസ്യം)' : 'Personal (Private)')}</span>
                        </button>
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-700 text-sm">
                        {coupon.discountPercentage}% OFF
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-700">
                        {coupon.minAmount ? `₹${coupon.minAmount.toLocaleString('en-IN')}` : 'No Min'}
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        <p className="font-bold text-stone-800">{isMl ? (coupon.descriptionMl || coupon.description) : coupon.description}</p>
                      </td>
                      <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                        {coupon.validTill || 'Permanent'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleCoupon(coupon.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                            coupon.active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                        >
                          {coupon.active ? (isMl ? 'ആക്ടീവ് (Active)' : 'Active') : (isMl ? 'ഇനാക്ടീവ്' : 'Inactive')}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isMl ? 'ഡിലീറ്റ്' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Package Modal */}
      {isEditServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Edit Service Card
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {isMl ? 'സർവീസ് കാർഡ് വിവരങ്ങളും ഫോട്ടോയും എഡിറ്റ് ചെയ്യുക' : 'Edit Service Card & Image'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditServiceModalOpen(false);
                  setEditingService(null);
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedService} className="space-y-5 pt-4">
              {/* Image Editor */}
              <ImageUploadField
                label={isMl ? 'സർവീസ് കാർഡ് ഫോട്ടോ (Image from Device / URL)' : 'Service Card Photo'}
                imageUrl={editingService.imageUrl || ''}
                onChange={(val) => setEditingService({ ...editingService, imageUrl: val })}
                isMl={isMl}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'സർവീസ് പേര് (English Title) *' : 'Service Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.title}
                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'സർവീസ് പേര് (മലയാളം) *' : 'Service Title (Malayalam) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingService.titleMl}
                    onChange={(e) => setEditingService({ ...editingService, titleMl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'കാറ്റഗറി (Category)' : 'Category'}
                  </label>
                  <select
                    value={editingService.category}
                    onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50"
                  >
                    {tempCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {isMl ? c.nameMl : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പ്രൈസിംഗ് തരം (Pricing Type)' : 'Pricing Type'}
                  </label>
                  <select
                    value={editingService.pricingType}
                    onChange={(e) => setEditingService({ ...editingService, pricingType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold bg-stone-50"
                  >
                    <option value="fixed">{isMl ? 'ഫിക്സഡ് പാക്കേജ് നിരക്ക്' : 'Fixed Package Rate'}</option>
                    <option value="per_guest">{isMl ? 'ഒരാൾക്ക് (Per Guest)' : 'Per Guest Rate'}</option>
                    <option value="per_card">{isMl ? 'ഓരോ കാർഡിനും (Per Card)' : 'Per Card Rate'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പ്രൈസ് (₹) *' : 'Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingService.price}
                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-black text-amber-700 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'ബാഡ്ജ് (Badge - Optional)' : 'Badge (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Popular Feast, Luxury Choice"
                  value={editingService.badge || ''}
                  onChange={(e) => setEditingService({ ...editingService, badge: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'വിവരണം (Description)' : 'Description'}
                </label>
                <textarea
                  rows={2}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditServiceModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>{isMl ? 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Photoshoot Packages Management Tab (Standalone Photography & Videography Packages) */}
      {activeAdminTab === 'photoshoots' && (
        <div className="space-y-8 animate-fade-in">
          {/* Add New Photoshoot Package Form */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-600" />
                  <span>{isMl ? 'പുതിയ ഫോട്ടോഗ്രാഫി വിഭാഗം ചേർക്കുക' : 'Add New Photography Package'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {isMl
                    ? 'ബർത്ത്ഡേ, ആനിവേഴ്സറി, ബേബി ഷവർ, ന്യൂബോൺ ബേബി, മോഡൽ ഷൂട്ട് തുടങ്ങിയ പുതിയ ഫോട്ടോഗ്രാഫി വിഭാഗങ്ങളും നിരക്കുകളും ചേർക്കുക'
                    : 'Create custom photography sections with pricing, crew allocation, and deliverables.'}
                </p>
              </div>
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                {isMl ? `ആകെ പാക്കേജുകൾ: ${tempPhotoshoots.length}` : `Total Packages: ${tempPhotoshoots.length}`}
              </span>
            </div>

            <form onSubmit={handleAddNewPhotoshoot} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'വിഭാഗത്തിന്റെ പേര് (English) *' : 'Package Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Birthday Photoshoot"
                    value={newPhotoshoot.title || ''}
                    onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'മലയാളം പേര് (Malayalam Title) *' : 'Malayalam Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ബർത്ത്ഡേ ഫോട്ടോഷൂട്ട്"
                    value={newPhotoshoot.titleMl || ''}
                    onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, titleMl: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ബാഡ്ജ് / ടാഗ് (Tag)' : 'Badge / Tag'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Birthday Special / Baby Shower"
                    value={newPhotoshoot.tag || ''}
                    onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, tag: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ബേസ് പാക്കേജ് റേറ്റ് (Base Price ₹) *' : 'Base Package Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newPhotoshoot.price ?? 15000}
                    onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'കവറേജ് സമയം (Hours)' : 'Coverage Duration (Hours)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newPhotoshoot.hours ?? 4}
                    onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, hours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ലൊക്കേഷൻ ടൈപ്പ്' : 'Location Type'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Single Location / Outdoor / Studio"
                    value={newPhotoshoot.locationType || 'Single Location'}
                    onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, locationType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'വിവരണക്കുറിപ്പ് (Description)' : 'Package Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Professional cake smash, party highlights, candid moments and family portraits."
                  value={newPhotoshoot.description || ''}
                  onChange={(e) => setNewPhotoshoot({ ...newPhotoshoot, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Photoshoot Image with local device browser */}
              <ImageUploadField
                label={isMl ? 'ഫോട്ടോഷൂട്ട് കവർ ഫോട്ടോ (Cover Photo)' : 'Photoshoot Cover Photo'}
                imageUrl={newPhotoshoot.imageUrl || ''}
                onChange={(val) => setNewPhotoshoot({ ...newPhotoshoot, imageUrl: val })}
                isMl={isMl}
              />

              {/* Crew Allocation Sub-section */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
                  {isMl ? 'ക്രൂ & ക്യാമറ അലോക്കേഷൻ (Crew & Cameras)' : 'Crew & Equipment Allocation'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Photographers</label>
                    <input
                      type="number"
                      min={1}
                      value={newPhotoshoot.crew?.photographers ?? 1}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          crew: { ...(newPhotoshoot.crew as any), photographers: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Videographers</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.crew?.videographers ?? 0}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          crew: { ...(newPhotoshoot.crew as any), videographers: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Reels Count</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.crew?.reelsCount ?? 2}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          crew: { ...(newPhotoshoot.crew as any), reelsCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={!!newPhotoshoot.crew?.drone}
                        onChange={(e) =>
                          setNewPhotoshoot({
                            ...newPhotoshoot,
                            crew: { ...(newPhotoshoot.crew as any), drone: e.target.checked },
                          })
                        }
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span>4K Aerial Drone</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Deliverables Sub-section including Number of Photo Graded */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
                  {isMl ? 'ഡെലിവറി ചെയ്യുന്നവ (Deliverables & Graded Photos)' : 'Deliverables & Graded Photos'}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      {isMl ? 'ഗ്രേഡഡ് ഫോട്ടോകൾ (Graded Photos)' : 'Graded Photos Count'}
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={newPhotoshoot.deliverables?.gradedPhotosCount ?? 100}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), gradedPhotosCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold text-amber-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Video Resolution</label>
                    <select
                      value={newPhotoshoot.deliverables?.videoQuality || 'hd'}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), videoQuality: e.target.value as any },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    >
                      <option value="hd">Full HD (1080p)</option>
                      <option value="4k">4K Ultra HD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Albums Count</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.deliverables?.mainAlbumsCount ?? 0}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), mainAlbumsCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Album Sheets</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.deliverables?.mainAlbumSheets ?? 30}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), mainAlbumSheets: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">8x12 Frame</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.deliverables?.frames_8x12 ?? 0}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), frames_8x12: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">12x18 Frame</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.deliverables?.frames_18x12 ?? 0}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), frames_18x12: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">15x20 Canvas Frame</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.deliverables?.frames_15x20 ?? 0}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), frames_15x20: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">USB Pen Drive</label>
                    <input
                      type="number"
                      min={0}
                      value={newPhotoshoot.deliverables?.penDriveCount ?? 0}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), penDriveCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={!!newPhotoshoot.deliverables?.teaserVideo}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), teaserVideo: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                    <span>Teaser / Promo Film</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={!!newPhotoshoot.deliverables?.fullLengthVideo}
                      onChange={(e) =>
                        setNewPhotoshoot({
                          ...newPhotoshoot,
                          deliverables: { ...(newPhotoshoot.deliverables as any), fullLengthVideo: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                    <span>Full Length Event Film</span>
                  </label>
                </div>
              </div>

              {/* Features list */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'പ്രത്യേകതകൾ (Features - comma separated)' : 'Package Features (comma separated)'}
                </label>
                <input
                  type="text"
                  placeholder="100+ High-Resolution Graded Photos, Cinematic Portraits, High-Speed Drive Delivery"
                  value={newPhotoshoot.features ? newPhotoshoot.features.join(', ') : ''}
                  onChange={(e) =>
                    setNewPhotoshoot({
                      ...newPhotoshoot,
                      features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'ഫോട്ടോഗ്രാഫി വിഭാഗം ചേർക്കുക' : 'Add Photography Package'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Photoshoot Packages List */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-black text-stone-900">
                  {isMl ? 'നിലവിലെ ഫോട്ടോഗ്രാഫി വിഭാഗങ്ങൾ' : 'Existing Photography Packages'} ({tempPhotoshoots.length})
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {isMl
                    ? 'ഓരോ വിഭാഗത്തിന്റെയും വിവരങ്ങൾ എഡിറ്റ് ചെയ്യുകയോ ആവശ്യമെങ്കിൽ ഒഴിവാക്കുകയോ ചെയ്യാം'
                    : 'Edit package pricing, images, deliverables or delete sections'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tempPhotoshoots.map((shoot) => {
                const sId = shoot.id || shoot.type;
                return (
                  <div
                    key={sId}
                    className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-xs flex flex-col justify-between transition hover:shadow-md"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                        {shoot.imageUrl ? (
                          <img
                            src={shoot.imageUrl}
                            alt={shoot.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <Camera className="w-8 h-8" />
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {shoot.tag || 'Special Shoot'}
                        </span>
                        <span className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                          ₹{((shoot.price ?? shoot.basePrice) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-base text-stone-900 leading-tight">
                            {shoot.title || shoot.titleEn}
                          </h4>
                          {shoot.titleMl && (
                            <span className="text-[11px] text-stone-500 font-medium">
                              {shoot.titleMl}
                            </span>
                          )}
                        </div>

                        {shoot.description && (
                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {shoot.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold text-stone-700">
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                            ⏱️ {shoot.hours || shoot.sessionHours || 4} Hours
                          </span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                            📍 {shoot.locationType || 'Single Location'}
                          </span>
                          <span className="bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200">
                            📸 {shoot.crew?.photographers || 1} Photo
                          </span>
                          {(shoot.crew?.videographers || 0) > 0 && (
                            <span className="bg-purple-50 text-purple-900 px-2 py-0.5 rounded-md border border-purple-200">
                              🎥 {shoot.crew?.videographers} Video
                            </span>
                          )}
                          {((shoot.crew?.reelsCount || shoot.deliverables?.reelsCount || 0) > 0) && (
                            <span className="bg-pink-50 text-pink-900 px-2 py-0.5 rounded-md border border-pink-200">
                              📱 {shoot.crew?.reelsCount || shoot.deliverables?.reelsCount} Reels
                            </span>
                          )}
                          <span className="bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200">
                            ✨ {shoot.deliverables?.gradedPhotosCount || 100} Graded Photos
                          </span>
                          {(shoot.deliverables?.mainAlbumsCount || 0) > 0 && (
                            <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md border border-blue-200">
                              📖 {shoot.deliverables?.mainAlbumsCount} Album
                            </span>
                          )}
                        </div>

                        {shoot.features && shoot.features.length > 0 && (
                          <ul className="pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-600">
                            {shoot.features.slice(0, 3).map((feat, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="line-clamp-1">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhotoshoot({ ...shoot });
                          setIsEditPhotoshootModalOpen(true);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-black flex items-center justify-center gap-1.5 transition border border-amber-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isMl ? 'എഡിറ്റ്' : 'Edit Package'}</span>
                      </button>

                      {shoot.type !== 'wedding' && (
                        <button
                          type="button"
                          onClick={() => handleDeletePhotoshoot(sId)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                          title="Delete photoshoot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Edit Photoshoot Modal */}
      {isEditPhotoshootModalOpen && editingPhotoshoot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Edit Package
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {editingPhotoshoot.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditPhotoshootModalOpen(false);
                  setEditingPhotoshoot(null);
                }}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePhotoshoot(editingPhotoshoot);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={editingPhotoshoot.title}
                    onChange={(e) => setEditingPhotoshoot({ ...editingPhotoshoot, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Title (Malayalam)</label>
                  <input
                    type="text"
                    value={editingPhotoshoot.titleMl || ''}
                    onChange={(e) => setEditingPhotoshoot({ ...editingPhotoshoot, titleMl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tag Badge</label>
                  <input
                    type="text"
                    value={editingPhotoshoot.tag || ''}
                    onChange={(e) => setEditingPhotoshoot({ ...editingPhotoshoot, tag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Base Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={editingPhotoshoot.price}
                    onChange={(e) => setEditingPhotoshoot({ ...editingPhotoshoot, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold font-mono bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={editingPhotoshoot.hours || 4}
                    onChange={(e) => setEditingPhotoshoot({ ...editingPhotoshoot, hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold bg-stone-50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingPhotoshoot.description || ''}
                  onChange={(e) => setEditingPhotoshoot({ ...editingPhotoshoot, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white"
                />
              </div>

              <ImageUploadField
                label={isMl ? 'കവർ ഫോട്ടോ (Cover Photo)' : 'Photoshoot Cover Photo'}
                imageUrl={editingPhotoshoot.imageUrl || ''}
                onChange={(val) => setEditingPhotoshoot({ ...editingPhotoshoot, imageUrl: val })}
                isMl={isMl}
              />

              {/* Crew editing */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">Crew Coverage</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Photographers</label>
                    <input
                      type="number"
                      min={1}
                      value={editingPhotoshoot.crew?.photographers ?? 1}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          crew: { ...editingPhotoshoot.crew, photographers: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Videographers</label>
                    <input
                      type="number"
                      min={0}
                      value={editingPhotoshoot.crew?.videographers ?? 0}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          crew: { ...editingPhotoshoot.crew, videographers: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Reels</label>
                    <input
                      type="number"
                      min={0}
                      value={editingPhotoshoot.crew?.reelsCount ?? 0}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          crew: { ...editingPhotoshoot.crew, reelsCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-[11px]">
                      <input
                        type="checkbox"
                        checked={!!editingPhotoshoot.crew?.drone}
                        onChange={(e) =>
                          setEditingPhotoshoot({
                            ...editingPhotoshoot,
                            crew: { ...editingPhotoshoot.crew, drone: e.target.checked },
                          })
                        }
                        className="rounded text-amber-600 accent-amber-600"
                      />
                      <span>4K Drone</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Deliverables editing */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">Deliverables & Graded Photos</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Graded Photos</label>
                    <input
                      type="number"
                      min={0}
                      value={editingPhotoshoot.deliverables?.gradedPhotosCount ?? 100}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          deliverables: { ...(editingPhotoshoot.deliverables as any), gradedPhotosCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold text-amber-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Video Quality</label>
                    <select
                      value={editingPhotoshoot.deliverables?.videoQuality || 'hd'}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          deliverables: { ...(editingPhotoshoot.deliverables as any), videoQuality: e.target.value as any },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    >
                      <option value="hd">Full HD</option>
                      <option value="4k">4K Ultra HD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Albums</label>
                    <input
                      type="number"
                      min={0}
                      value={editingPhotoshoot.deliverables?.mainAlbumsCount || 0}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          deliverables: { ...(editingPhotoshoot.deliverables as any), mainAlbumsCount: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Sheets</label>
                    <input
                      type="number"
                      min={0}
                      value={editingPhotoshoot.deliverables?.mainAlbumSheets || 30}
                      onChange={(e) =>
                        setEditingPhotoshoot({
                          ...editingPhotoshoot,
                          deliverables: { ...(editingPhotoshoot.deliverables as any), mainAlbumSheets: Number(e.target.value) },
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Features (comma separated)</label>
                <input
                  type="text"
                  value={editingPhotoshoot.features ? editingPhotoshoot.features.join(', ') : ''}
                  onChange={(e) =>
                    setEditingPhotoshoot({
                      ...editingPhotoshoot,
                      features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditPhotoshootModalOpen(false);
                    setEditingPhotoshoot(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
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

            {/* Studio Partner Box if from Studio Login */}
            {selectedLead.studioBranding && (
              <div className="mt-3 p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                      🏢 Studio Partner Quote
                    </span>
                    <span className="text-xs font-black text-indigo-950">
                      {selectedLead.studioBranding.studioName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-indigo-800 font-semibold mt-1">
                    <span>Owner: {selectedLead.studioBranding.ownerName}</span>
                    <span>• Phone: {selectedLead.studioBranding.phone}</span>
                    <span>• Place: {selectedLead.studioBranding.place || selectedLead.studioBranding.address}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-white text-indigo-900 px-2.5 py-1 rounded-xl border border-indigo-200 shrink-0">
                  B2B Studio Portal
                </span>
              </div>
            )}

            {/* Standalone Photoshoot Box if Standalone Shoot */}
            {selectedLead.photoshootDetails && (
              <div className="mt-3 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center gap-3 shadow-2xs">
                {selectedLead.photoshootDetails.imageUrl && (
                  <img
                    src={selectedLead.photoshootDetails.imageUrl}
                    alt={selectedLead.photoshootDetails.title}
                    className="w-16 h-16 object-cover rounded-xl border border-amber-200 shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white px-2 py-0.5 rounded-full">
                      {selectedLead.photoshootDetails.tag || 'Standalone Shoot'}
                    </span>
                    <span className="text-xs font-bold text-stone-500">
                      {selectedLead.photoshootDetails.hours || 4} Hours • {selectedLead.photoshootDetails.locationType}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900 mt-0.5">
                    {selectedLead.photoshootDetails.title}
                  </h4>
                  <p className="text-[11px] text-stone-600 line-clamp-1">
                    {selectedLead.photoshootDetails.description}
                  </p>
                </div>
              </div>
            )}

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
                    <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">
                      {isMl ? 'നിലവിലെ സ്റ്റാറ്റസ്' : 'Current Status'}
                    </span>
                    {(() => {
                      const drawerStatusCfg = getLeadStatusConfig(selectedLead.status || 'New', isMl);
                      return (
                        <div className="inline-flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${drawerStatusCfg.dotClass}`} />
                          <select
                            value={selectedLead.status || 'New'}
                            onChange={(e) =>
                              updateLeadStatus(
                                selectedLead.id || 0,
                                e.target.value as CustomerLead['status']
                              )
                            }
                            className={`border rounded-lg px-2.5 py-1 text-xs font-black cursor-pointer shadow-xs transition focus:outline-hidden focus:ring-2 ${drawerStatusCfg.selectClass}`}
                          >
                            <option value="New" className="bg-white text-blue-900 font-bold">
                              🔵 {isMl ? 'പുതിയത് (New)' : 'New Lead'}
                            </option>
                            <option value="Contacted" className="bg-white text-amber-900 font-bold">
                              🟡 {isMl ? 'വിളിച്ചു (Contacted)' : 'Contacted'}
                            </option>
                            <option value="Quoted" className="bg-white text-purple-900 font-bold">
                              🟣 {isMl ? 'കൊട്ടേഷൻ അയച്ചു (Quoted)' : 'Quoted'}
                            </option>
                            <option value="Booked" className="bg-white text-rose-900 font-bold">
                              🔴 {isMl ? 'ബുക്കിംഗ് ഉറപ്പിച്ചു (Booked)' : 'Booked'}
                            </option>
                            <option value="Completed" className="bg-white text-emerald-900 font-bold">
                              🟢 {isMl ? 'പൂർത്തിയായി (Completed)' : 'Completed'}
                            </option>
                          </select>
                        </div>
                      );
                    })()}
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
            photographyTotal: selectedLead.totalPrice || 0,
            otherServicesTotal: 0,
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
