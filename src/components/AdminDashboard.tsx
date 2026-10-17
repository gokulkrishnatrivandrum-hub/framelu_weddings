'use client';

import React, { useState, useMemo } from 'react';
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
  CustomerUser,
  StudioUser,
  RegisteredLoginUser,
} from '@/types';
import {
  Shield,
  Sliders,
  Users,
  User,
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
  KeyRound,
  ShieldCheck,
  Building2,
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
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
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
  deleteCustomerUserFromCloud,
  deleteStudioPartnerFromCloud,
  bulkDeleteUsersFromCloud,
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

// Helper to resolve complete events & deliverables plan for any lead (handles custom, synthetic, gold, royal)
export const resolvePlanForLead = (lead: CustomerLead) => {
  const hasGroomEvents = lead.groomEvents && Object.values(lead.groomEvents).some((e) => e && (e as any).enabled);
  const hasBrideEvents = lead.brideEvents && Object.values(lead.brideEvents).some((e) => e && (e as any).enabled);
  const hasDeliverables = lead.deliverables && (
    ((lead.deliverables.mainAlbumsCount || 0) > 0) ||
    lead.deliverables.fullLengthVideo ||
    lead.deliverables.highlightVideo ||
    (lead.deliverables as any).albumIncluded
  );

  const price = Number(lead.totalPrice) || 95000;
  const isRoyal = price >= 140000;
  const isGold = price >= 80000;

  // 1. Groom Events
  let groomEvents = lead.groomEvents;
  if (!hasGroomEvents) {
    groomEvents = {
      wedding_day: {
        enabled: true,
        venue: lead.venueLocation || lead.place || 'Wedding Hall',
        date: lead.weddingDate || '2026-10-30',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: isGold ? 1 : 0,
        candidVideographers: isGold ? 1 : 0,
        drone: isGold,
        youtubeLive: isRoyal,
        auditoriumLive: isRoyal,
        photoLivePrinting: isRoyal,
      },
      reception: {
        enabled: isGold,
        venue: lead.venueLocation || lead.place || 'Reception Hall',
        date: lead.weddingDate || '2026-10-30',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: 0,
        candidVideographers: 0,
        drone: isRoyal,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      },
      ...(isRoyal
        ? {
            pre_wedding: {
              enabled: true,
              venue: 'Scenic Outdoor',
              date: '',
              traditionalPhotographers: 0,
              traditionalVideographers: 0,
              candidPhotographers: 1,
              candidVideographers: 1,
              drone: false,
              youtubeLive: false,
              auditoriumLive: false,
              photoLivePrinting: false,
            },
          }
        : {}),
    } as any;
  }

  // 2. Bride Events
  let brideEvents = lead.brideEvents;
  if (!hasBrideEvents && (lead.side === 'both' || lead.side === 'bride')) {
    brideEvents = {
      wedding_day: {
        enabled: true,
        venue: lead.venueLocation || lead.place || 'Auditorium',
        date: lead.weddingDate || '2026-10-30',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: isGold ? 1 : 0,
        candidVideographers: isGold ? 1 : 0,
        drone: isGold,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      },
    } as any;
  }

  // 3. Deliverables
  let deliverables = lead.deliverables;
  if (!hasDeliverables) {
    deliverables = {
      videoQuality: isGold ? '4k' : 'hd',
      fullLengthVideo: true,
      highlightVideo: isGold,
      teaserVideo: true,
      reelsCount: isRoyal ? 4 : isGold ? 2 : 1,
      penDriveCount: 1,
      penDriveBoxCount: isGold ? 1 : 0,
      mainAlbumsCount: isRoyal ? 2 : 1,
      mainAlbumSheets: isRoyal ? 45 : isGold ? 35 : 30,
      albumPaperType: isRoyal ? 'full_glass' : isGold ? 'glass' : 'normal',
      frames_8x12: isGold ? 0 : 2,
      frames_18x12: isGold ? 1 : 0,
      frames_15x20: isRoyal ? 1 : 0,
      miniAlbumsCount: isRoyal ? 2 : 0,
      photoMugsCount: 0,
      wallCalendarsCount: 0,
      tableTopCalendarsCount: 0,
      gradedPhotosCount: isRoyal ? 200 : 100,
    } as any;
  }

  const packageName = lead.photoshootDetails?.title || (
    isRoyal
      ? 'Royal Diamond Grand Heritage Package (റോയൽ ഡയമണ്ട് ഗ്രാൻഡ് പാക്കേജ്)'
      : isGold
      ? 'Gold Cinematic Signature Package (ഗോൾഡ് സിനിമാറ്റിക് സിഗ്നേച്ചർ പാക്കേജ്)'
      : 'Silver Classic Wedding Package (സിൽവർ ക്ലാസിക് വെഡ്ഡിംഗ് പാക്കേജ്)'
  );

  return {
    groomEvents: groomEvents as Record<string, any>,
    brideEvents: brideEvents as Record<string, any> | undefined,
    deliverables: deliverables as any,
    packageName,
  };
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
  customerUsers?: CustomerUser[];
  setCustomerUsers?: React.Dispatch<React.SetStateAction<CustomerUser[]>>;
  studioPartners?: StudioUser[];
  setStudioPartners?: React.Dispatch<React.SetStateAction<StudioUser[]>>;
  onCloseAdmin?: () => void;
  onLogoutUser?: (userIdOrEmail: string) => void;
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
  customerUsers = [],
  setCustomerUsers,
  studioPartners = [],
  setStudioPartners,
  onCloseAdmin,
  onLogoutUser,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const [activeAdminTab, setActiveAdminTab] = useState<'rates' | 'prints' | 'leads' | 'logins' | 'contact' | 'offers' | 'boards' | 'services' | 'gallery' | 'coupons' | 'photoshoots'>('leads');
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
  const [editingOffer, setEditingOffer] = useState<PromoOffer | null>(null);
  const [isEditOfferModalOpen, setIsEditOfferModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<HighlightBoard | null>(null);
  const [isEditBoardModalOpen, setIsEditBoardModalOpen] = useState(false);
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
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

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
  const [userFilter, setUserFilter] = useState<string>('all');
  const [placeSearchQuery, setPlaceSearchQuery] = useState<string>('');

  // Login Details & User Portal States
  const [loginRoleFilter, setLoginRoleFilter] = useState<'all' | 'studio' | 'customer'>('all');
  const [loginSearchQuery, setLoginSearchQuery] = useState<string>('');
  const [selectedLoginUserIds, setSelectedLoginUserIds] = useState<string[]>([]);
  const [deletedLoginUserIds, setDeletedLoginUserIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('framlu_deleted_login_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [inspectingLoginUser, setInspectingLoginUser] = useState<RegisteredLoginUser | null>(null);
  const [isInspectLoginUserModalOpen, setIsInspectLoginUserModalOpen] = useState(false);
  const [deleteConfirmLoginUser, setDeleteConfirmLoginUser] = useState<RegisteredLoginUser | null>(null);

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

  // Close modals when Escape key is pressed
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedLead(null);
        setIsPlanModalOpen(false);
        setIsPdfModalOpen(false);
        setIsWhatsAppModalOpen(false);
      }
    };
    if (selectedLead || isPlanModalOpen || isPdfModalOpen || isWhatsAppModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedLead, isPlanModalOpen, isPdfModalOpen, isWhatsAppModalOpen]);

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

  const deleteLead = async (targetLead: CustomerLead | number) => {
    let leadToDelete: CustomerLead | undefined;
    if (typeof targetLead === 'number') {
      leadToDelete = leads[targetLead];
    } else {
      leadToDelete = targetLead;
    }
    if (!leadToDelete) return;

    const leadName = leadToDelete.name || leadToDelete.phone || 'Customer';
    if (confirm(isMl ? `"${leadName}" എന്ന കസ്റ്റമറുടെ കൊട്ടേഷൻ സ്ഥിരമായി ഒഴിവാക്കണോ?` : `Permanently delete quotation for "${leadName}"?`)) {
      const targetId = leadToDelete.id;

      // Optimistically update local state & localStorage immediately
      setLeads((prev) => {
        const updated = prev.filter((l) => {
          if (targetId && l.id) return l.id !== targetId;
          return l !== leadToDelete;
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        }
        return updated;
      });

      if (targetId) {
        setSelectedLeadIds((prev) => prev.filter((id) => id !== targetId));
      }
      if (selectedLead && (selectedLead.id === targetId || selectedLead === leadToDelete)) {
        setSelectedLead(null);
      }

      if (targetId) {
        await deleteLeadFromCloud(targetId);
      }
      showNotification(isMl ? 'കൊട്ടേഷൻ നീക്കം ചെയ്തു' : 'Quotation deleted successfully');
    }
  };

  const handleBulkDeleteLeads = async () => {
    if (selectedLeadIds.length === 0) return;
    const count = selectedLeadIds.length;
    if (
      confirm(
        isMl
          ? `തിരഞ്ഞെടുത്ത ${count} കൊട്ടേഷനുകൾ സ്ഥിരമായി ഒഴിവാക്കണോ?`
          : `Permanently delete ${count} selected quotations?`
      )
    ) {
      const idsToDelete = [...selectedLeadIds];
      setLeads((prev) => {
        const updated = prev.filter((l) => !l.id || !idsToDelete.includes(l.id));
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        }
        return updated;
      });
      setSelectedLeadIds([]);
      if (selectedLead && selectedLead.id && idsToDelete.includes(selectedLead.id)) {
        setSelectedLead(null);
      }
      await bulkDeleteLeadsFromCloud(idsToDelete);
      showNotification(
        isMl
          ? `${count} കൊട്ടേഷനുകൾ വിജയകരമായി നീക്കം ചെയ്തു!`
          : `${count} quotations deleted successfully!`
      );
    }
  };

  const handleDeleteAllLeads = async () => {
    if (displayedLeads.length === 0) return;
    const count = displayedLeads.length;
    if (
      confirm(
        isMl
          ? `ശ്രദ്ധിക്കുക: ഇവിടെ കാണുന്ന ${count} കൊട്ടേഷനുകളും ഒന്നിച്ച് പൂർണ്ണമായി ഒഴിവാക്കണോ?`
          : `Warning: Permanently delete ALL ${count} currently displayed quotations?`
      )
    ) {
      const idsToDelete = displayedLeads.map((l) => l.id).filter(Boolean) as string[];
      setLeads((prev) => {
        const updated = prev.filter((l) => !displayedLeads.includes(l) && (!l.id || !idsToDelete.includes(l.id)));
        if (typeof window !== 'undefined') {
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
        }
        return updated;
      });
      setSelectedLeadIds([]);
      setSelectedLead(null);
      if (idsToDelete.length > 0) {
        await bulkDeleteLeadsFromCloud(idsToDelete);
      }
      showNotification(
        isMl
          ? `എല്ലാ (${count}) കൊട്ടേഷനുകളും നീക്കം ചെയ്തു!`
          : `All (${count}) quotations deleted successfully!`
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

  const handleStartEditOffer = (offer: PromoOffer) => {
    setEditingOffer({ ...offer });
    setIsEditOfferModalOpen(true);
  };

  const handleSaveEditedOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    const updated = offers.map((o) => (o.id === editingOffer.id ? editingOffer : o));
    setOffers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_wedding_offers', JSON.stringify(updated));
      localStorage.setItem('framlu_wedding_offers', JSON.stringify(updated));
    }
    await savePromoOffersToCloud(updated);
    setIsEditOfferModalOpen(false);
    setEditingOffer(null);
    showNotification(isMl ? 'ഓഫർ വിവരങ്ങൾ വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു!' : 'Offer updated successfully!');
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

  const handleStartEditBoard = (board: HighlightBoard) => {
    setEditingBoard({ ...board });
    setIsEditBoardModalOpen(true);
  };

  const handleSaveEditedBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard) return;
    const updated = highlightBoards.map((b) => (b.id === editingBoard.id ? editingBoard : b));
    setHighlightBoards(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lumina_wedding_boards', JSON.stringify(updated));
      localStorage.setItem('framlu_wedding_boards', JSON.stringify(updated));
    }
    await saveHighlightBoardsToCloud(updated);
    setIsEditBoardModalOpen(false);
    setEditingBoard(null);
    showNotification(isMl ? 'ഹൈലൈറ്റ് ബോർഡ് വിവരങ്ങൾ വിജയകരമായി അപ്ഡേറ്റ് ചെയ്തു!' : 'Highlight board updated successfully!');
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
    const q = placeSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (lead.ownerName || '').toLowerCase().includes(q) ||
      (lead.ownerEmail || '').toLowerCase().includes(q) ||
      (lead.createdByName || '').toLowerCase().includes(q) ||
      (lead.createdByEmail || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.userEmail || '').toLowerCase().includes(q) ||
      (lead.id || '').toLowerCase().includes(q) ||
      lead.name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      loc.includes(q) ||
      (lead.studioBranding?.studioName || '').toLowerCase().includes(q) ||
      (lead.studioBranding?.ownerName || '').toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'all' || (lead.status || 'New') === statusFilter;
    const isStudio = lead.source === 'studio' || !!lead.studioBranding;
    const matchesSource =
      leadSourceFilter === 'all' ||
      (leadSourceFilter === 'studio' && isStudio) ||
      (leadSourceFilter === 'customer' && !isStudio);
    const cleanUserFilter = (userFilter || 'all').toLowerCase().trim();
    const cleanUserDigits = cleanUserFilter.replace(/\D/g, '');
    const matchesUser =
      cleanUserFilter === 'all' ||
      (lead.ownerEmail || '').toLowerCase().trim() === cleanUserFilter ||
      (lead.createdByEmail || '').toLowerCase().trim() === cleanUserFilter ||
      (lead.email || '').toLowerCase().trim() === cleanUserFilter ||
      (lead.userEmail || '').toLowerCase().trim() === cleanUserFilter ||
      (lead.userId || '').toLowerCase().trim() === cleanUserFilter ||
      (cleanUserDigits.length >= 10 && (lead.phone || lead.userPhone || '').replace(/\D/g, '').slice(-10) === cleanUserDigits.slice(-10));

    return matchesPlace && matchesSearch && matchesStatus && matchesSource && matchesUser;
  });

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (displayedLeads.length === 0) return;
    const allDisplayedKeys = displayedLeads.map((l, i) => l.id || `lead_key_${i}`);
    const isAllSelected =
      allDisplayedKeys.length > 0 && allDisplayedKeys.every((id) => selectedLeadIds.includes(id));
    if (isAllSelected) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(allDisplayedKeys);
    }
  };

  // Aggregate all registered login users (Studio + Customer + Local Cache + Leads)
  const allLoginUsers: RegisteredLoginUser[] = useMemo(() => {
    const list: RegisteredLoginUser[] = [];
    const seenIds = new Set<string>();
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();

    const registerUser = (u: RegisteredLoginUser) => {
      const emailClean = (u.email || '').toLowerCase().trim();
      const phoneClean = (u.phone || '').replace(/\D/g, '');
      const docId = u.id || '';
      const uId = (u.userId || '').toLowerCase().trim();

      // STRICT BLACKLIST: If user was deleted by admin, never show or resurrect them
      if (
        (docId && deletedLoginUserIds.includes(docId)) ||
        (emailClean && deletedLoginUserIds.includes(emailClean)) ||
        (phoneClean && (deletedLoginUserIds.includes(phoneClean) || (phoneClean.length >= 10 && deletedLoginUserIds.includes(phoneClean.slice(-10))))) ||
        (uId && deletedLoginUserIds.includes(uId))
      ) {
        return;
      }

      if (docId && seenIds.has(docId)) return;
      if (emailClean && seenEmails.has(emailClean)) return;
      if (phoneClean && phoneClean.length >= 10 && seenPhones.has(phoneClean.slice(-10))) return;

      if (docId) seenIds.add(docId);
      if (emailClean) seenEmails.add(emailClean);
      if (phoneClean && phoneClean.length >= 10) seenPhones.add(phoneClean.slice(-10));
      list.push(u);
    };

    // 1. Studio Partners from props
    (studioPartners || []).forEach((st, idx) => {
      const emailClean = (st.email || '').toLowerCase().trim();
      const phoneClean = (st.phone || '').replace(/\D/g, '');
      const docId = st.id || (emailClean ? `STUDIO-${emailClean.replace(/[^a-z0-9]/g, '_')}` : `STUDIO-${phoneClean}`);
      const userId = emailClean ? emailClean.split('@')[0] : `studio_${phoneClean.slice(-4)}`;

      registerUser({
        id: docId,
        userId: userId,
        role: 'studio',
        name: st.ownerName || st.studioName || `Studio Partner #${idx + 1}`,
        ownerName: st.ownerName,
        studioName: st.studioName || 'Studio Partner',
        phone: st.phone || phoneClean,
        email: st.email || '',
        address: st.address || st.place || 'Kerala',
        place: st.place || 'Kayamkulam',
        loginCount: typeof st.loginCount === 'number' && st.loginCount > 0 ? st.loginCount : 1,
        registeredAt: st.registeredAt || '2026-10-15T10:00:00.000Z',
        lastLoginAt: st.lastLoginAt || st.registeredAt || new Date().toISOString(),
        authMethod: st.authMethod || (st.email ? 'google' : 'phone'),
        verified: st.verified ?? true,
        status: st.status || 'active',
        rawDoc: st,
      });
    });

    // 2. Customer Users from props
    (customerUsers || []).forEach((cu, idx) => {
      const emailClean = (cu.email || '').toLowerCase().trim();
      const phoneClean = (cu.phone || '').replace(/\D/g, '');
      const docId = cu.id || (emailClean ? `CUST-${emailClean.replace(/[^a-z0-9]/g, '_')}` : `CUST-${cu.username || phoneClean}`);
      const userId = cu.username || cu.userId || (emailClean ? emailClean.split('@')[0] : `user_${phoneClean.slice(-4)}`);

      registerUser({
        id: docId,
        userId: userId,
        role: 'customer',
        name: cu.name || `Customer User #${idx + 1}`,
        phone: cu.phone || phoneClean,
        email: cu.email || '',
        address: cu.address || cu.place || 'Kerala',
        place: cu.place || 'കായംകുളം',
        loginCount: typeof cu.loginCount === 'number' && cu.loginCount > 0 ? cu.loginCount : 1,
        registeredAt: cu.registeredAt || '2026-10-15T10:00:00.000Z',
        lastLoginAt: cu.lastLoginAt || cu.registeredAt || new Date().toISOString(),
        authMethod: cu.authMethod || (cu.email ? 'google' : 'phone'),
        verified: cu.verified ?? true,
        status: cu.status || 'active',
        rawDoc: cu,
      });
    });

    // 3. LocalStorage Caches
    if (typeof window !== 'undefined') {
      try {
        const cachedCustRaw = localStorage.getItem('framlu_customer_users_cache');
        if (cachedCustRaw) {
          const parsed = JSON.parse(cachedCustRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((cu, idx) => {
              const emailClean = (cu.email || '').toLowerCase().trim();
              const phoneClean = (cu.phone || '').replace(/\D/g, '');
              const docId = cu.id || (emailClean ? `CUST-${emailClean.replace(/[^a-z0-9]/g, '_')}` : `CUST-${cu.username || phoneClean}`);
              const userId = cu.username || cu.userId || (emailClean ? emailClean.split('@')[0] : `user_${phoneClean.slice(-4)}`);
              registerUser({
                id: docId,
                userId: userId,
                role: 'customer',
                name: cu.name || `Customer User #${idx + 1}`,
                phone: cu.phone || phoneClean,
                email: cu.email || '',
                address: cu.address || cu.place || 'Kerala',
                place: cu.place || 'കായംകുളം',
                loginCount: cu.loginCount || 1,
                registeredAt: cu.registeredAt || new Date().toISOString(),
                lastLoginAt: cu.lastLoginAt || cu.registeredAt || new Date().toISOString(),
                authMethod: cu.authMethod || (cu.email ? 'google' : 'phone'),
                verified: cu.verified ?? true,
                status: cu.status || 'active',
                rawDoc: cu,
              });
            });
          }
        }

        const cachedStudRaw = localStorage.getItem('framlu_studio_partners_cache');
        if (cachedStudRaw) {
          const parsed = JSON.parse(cachedStudRaw);
          if (Array.isArray(parsed)) {
            parsed.forEach((st, idx) => {
              const emailClean = (st.email || '').toLowerCase().trim();
              const phoneClean = (st.phone || '').replace(/\D/g, '');
              const docId = st.id || (emailClean ? `STUDIO-${emailClean.replace(/[^a-z0-9]/g, '_')}` : `STUDIO-${phoneClean}`);
              const userId = emailClean ? emailClean.split('@')[0] : `studio_${phoneClean.slice(-4)}`;
              registerUser({
                id: docId,
                userId: userId,
                role: 'studio',
                name: st.ownerName || st.studioName || `Studio Partner #${idx + 1}`,
                ownerName: st.ownerName,
                studioName: st.studioName || 'Studio Partner',
                phone: st.phone || phoneClean,
                email: st.email || '',
                address: st.address || st.place || 'Kerala',
                place: st.place || 'Kayamkulam',
                loginCount: st.loginCount || 1,
                registeredAt: st.registeredAt || new Date().toISOString(),
                lastLoginAt: st.lastLoginAt || st.registeredAt || new Date().toISOString(),
                authMethod: st.authMethod || (st.email ? 'google' : 'phone'),
                verified: st.verified ?? true,
                status: st.status || 'active',
                rawDoc: st,
              });
            });
          }
        }
      } catch (e) {}
    }

    // 4. Any registered leads/clients who created quotations
    (leads || []).forEach((l) => {
      const emailClean = (l.ownerEmail || l.createdByEmail || l.userEmail || l.email || '').toLowerCase().trim();
      const phoneClean = (l.phone || l.userPhone || l.createdByPhone || '').replace(/\D/g, '');
      const name = l.ownerName || l.createdByName || l.name;
      if (!name || (!emailClean && phoneClean.length < 10)) return;
      if (l.id === 'FWC-QUOTE' || l.id === 'FWC-2026-DUMMY') return;

      const isStudio = l.createdByRole === 'studio' || l.source === 'studio';
      const docId = isStudio
        ? (emailClean ? `STUDIO-${emailClean.replace(/[^a-z0-9]/g, '_')}` : `STUDIO-${phoneClean}`)
        : (emailClean ? `CUST-${emailClean.replace(/[^a-z0-9]/g, '_')}` : `CUST-${phoneClean}`);
      const userId = l.userId || l.createdByUserId || (emailClean ? emailClean.split('@')[0] : `user_${phoneClean.slice(-4)}`);

      registerUser({
        id: docId,
        userId: userId,
        role: isStudio ? 'studio' : 'customer',
        name: name,
        ownerName: isStudio ? name : undefined,
        studioName: isStudio ? (l.studioBranding?.studioName || name) : undefined,
        phone: phoneClean,
        email: emailClean,
        address: l.address || l.venueLocation || 'Kerala',
        place: l.place || 'കായംകുളം',
        loginCount: 1,
        registeredAt: l.createdAt || new Date().toISOString(),
        lastLoginAt: l.lastEditedAt || l.createdAt || new Date().toISOString(),
        authMethod: emailClean ? 'google' : 'phone',
        verified: true,
        status: 'active',
        rawDoc: l,
      });
    });

    return list.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
  }, [customerUsers, studioPartners, leads, deletedLoginUserIds]);

  // Helper to retrieve all quotations created by a specific registered user ID
  const getUserQuotations = React.useCallback(
    (u: RegisteredLoginUser | null): CustomerLead[] => {
      if (!u) return [];
      const uEmail = (u.email || '').trim().toLowerCase();
      const uPhone = (u.phone || '').replace(/\D/g, '').slice(-10);
      const uUserId = (u.userId || '').trim().toLowerCase();
      const uName = (u.name || '').trim().toLowerCase();

      return (leads || []).filter((l) => {
        const lEmail = (l.ownerEmail || l.createdByEmail || l.userEmail || l.email || '').trim().toLowerCase();
        const lPhone = (l.phone || l.userPhone || '').replace(/\D/g, '').slice(-10);
        const lUserId = (l.userId || '').trim().toLowerCase();
        const lName = (l.ownerName || l.createdByName || l.name || '').trim().toLowerCase();

        if (uEmail && lEmail && uEmail === lEmail) return true;
        if (uPhone && lPhone && uPhone === lPhone) return true;
        if (uUserId && lUserId && uUserId === lUserId) return true;
        if (uName && lName && uName === lName) return true;
        return false;
      });
    },
    [leads]
  );

  // Filtered Login Users for Display
  const displayedLoginUsers = useMemo(() => {
    return allLoginUsers.filter((u) => {
      if (loginRoleFilter !== 'all' && u.role !== loginRoleFilter) {
        return false;
      }
      if (loginSearchQuery.trim()) {
        const q = loginSearchQuery.toLowerCase().trim();
        const match =
          u.name.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.address.toLowerCase().includes(q) ||
          u.place.toLowerCase().includes(q) ||
          u.userId.toLowerCase().includes(q) ||
          (u.studioName && u.studioName.toLowerCase().includes(q)) ||
          (u.ownerName && u.ownerName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [allLoginUsers, loginRoleFilter, loginSearchQuery]);

  const toggleSelectLoginUser = (id: string) => {
    setSelectedLoginUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllLoginUsers = () => {
    if (displayedLoginUsers.length === 0) return;
    const allDisplayedIds = displayedLoginUsers.map((u) => u.id);
    const isAllSelected =
      allDisplayedIds.length > 0 && allDisplayedIds.every((id) => selectedLoginUserIds.includes(id));
    if (isAllSelected) {
      setSelectedLoginUserIds([]);
    } else {
      setSelectedLoginUserIds(allDisplayedIds);
    }
  };

  // Delete Individual User ID
  const handleDeleteLoginUser = async (user: RegisteredLoginUser) => {
    const confirmMsg = isMl
      ? `"${user.name}" (${user.userId}) എന്ന ഐഡി ഡിലീറ്റ് ചെയ്യണോ?\n\nഡിലീറ്റ് ചെയ്താൽ, ഈ വ്യക്തി പിന്നീട് ലോഗിൻ ചെയ്യുമ്പോൾ ആദ്യത്തെ ഇനിഷ്യൽ ലോഗിൻ പോലെ പേര്, മൊബൈൽ നമ്പർ, വിലാസം എന്നിവ നൽകി വീണ്ടും രജിസ്റ്റർ ചെയ്യേണ്ടി വരും.`
      : `Delete user "${user.name}" (${user.userId})?\n\nOnce deleted, when this user attempts to log in again, they will be prompted with the initial registration form to re-register.`;

    if (window.confirm(confirmMsg)) {
      const identifiersToBlacklist = [
        user.id,
        user.email ? user.email.toLowerCase().trim() : '',
        user.phone ? user.phone.replace(/\D/g, '') : '',
        user.phone && user.phone.replace(/\D/g, '').length >= 10 ? user.phone.replace(/\D/g, '').slice(-10) : '',
        user.userId ? user.userId.toLowerCase().trim() : '',
      ].filter(Boolean);

      // 1. Instantly update blacklisted state so UI vanishes instantly
      setDeletedLoginUserIds((prev) => {
        const next = Array.from(new Set([...prev, ...identifiersToBlacklist]));
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_deleted_login_ids', JSON.stringify(next));
        }
        return next;
      });

      setSelectedLoginUserIds((prev) => prev.filter((id) => id !== user.id));
      if (inspectingLoginUser?.id === user.id) {
        setInspectingLoginUser(null);
        setIsInspectLoginUserModalOpen(false);
      }

      // 2. Remove from parent state
      if (user.role === 'studio' && setStudioPartners) {
        setStudioPartners((prev) => prev.filter((p) => p.id !== user.id && p.email !== user.email));
      } else if (setCustomerUsers) {
        setCustomerUsers((prev) => prev.filter((c) => c.id !== user.id && c.email !== user.email));
      }

      // 3. Delete from cloud (both collections and both docId/email)
      try {
        if (user.role === 'studio') {
          await deleteStudioPartnerFromCloud(user.id);
          if (user.email) await deleteStudioPartnerFromCloud(user.email);
        } else {
          await deleteCustomerUserFromCloud(user.id);
          if (user.email) await deleteCustomerUserFromCloud(user.email);
        }
      } catch (err) {
        console.warn('Error deleting user from cloud:', err);
      }

      if (onLogoutUser) {
        onLogoutUser(user.email || user.userId || user.phone);
      }

      setSavedSuccess(
        isMl
          ? `ഐഡി "${user.userId}" വിജയകരമായി ഡിലീറ്റ് ചെയ്തു.`
          : `ID "${user.userId}" deleted successfully.`
      );
      setTimeout(() => setSavedSuccess(''), 4500);
    }
  };

  // Bulk Delete Selected Users
  const handleBulkDeleteLoginUsers = async () => {
    if (selectedLoginUserIds.length === 0) return;
    const count = selectedLoginUserIds.length;
    const confirmMsg = isMl
      ? `തിരഞ്ഞെടുത്ത ${count} യൂസർ ഐഡികൾ ഡിലീറ്റ് ചെയ്യണോ?\n\nഡിലീറ്റ് ചെയ്ത എല്ലാ ഐഡികളും ലിസ്റ്റിൽ നിന്നും പൂർണ്ണമായി നീക്കം ചെയ്യപ്പെടും.`
      : `Delete ${count} selected user accounts?\n\nAll selected accounts will be permanently removed.`;

    if (window.confirm(confirmMsg)) {
      const usersToDelete = allLoginUsers.filter((u) => selectedLoginUserIds.includes(u.id));
      const identifiersToBlacklist: string[] = [];
      usersToDelete.forEach((u) => {
        if (u.id) identifiersToBlacklist.push(u.id);
        if (u.email) identifiersToBlacklist.push(u.email.toLowerCase().trim());
        const clPhone = (u.phone || '').replace(/\D/g, '');
        if (clPhone) {
          identifiersToBlacklist.push(clPhone);
          if (clPhone.length >= 10) identifiersToBlacklist.push(clPhone.slice(-10));
        }
        if (u.userId) identifiersToBlacklist.push(u.userId.toLowerCase().trim());
      });

      // 1. Immediately blacklist so UI reflects deletion
      setDeletedLoginUserIds((prev) => {
        const next = Array.from(new Set([...prev, ...identifiersToBlacklist]));
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_deleted_login_ids', JSON.stringify(next));
        }
        return next;
      });

      setSelectedLoginUserIds([]);

      // 2. Remove from parent states
      const deletedIdsSet = new Set(selectedLoginUserIds);
      if (setStudioPartners) {
        setStudioPartners((prev) => prev.filter((p) => !deletedIdsSet.has(p.id || '')));
      }
      if (setCustomerUsers) {
        setCustomerUsers((prev) => prev.filter((c) => !deletedIdsSet.has(c.id || '')));
      }

      // 3. Delete from cloud
      try {
        await bulkDeleteUsersFromCloud(usersToDelete);
      } catch (err) {
        console.warn('Bulk delete cloud error:', err);
      }

      if (onLogoutUser) {
        usersToDelete.forEach((u) => onLogoutUser(u.email || u.userId || u.phone));
      }

      setSavedSuccess(
        isMl
          ? `${count} യൂസർ ഐഡികൾ വിജയകരമായി നീക്കം ചെയ്തു!`
          : `${count} user accounts deleted successfully!`
      );
      setTimeout(() => setSavedSuccess(''), 4500);
    }
  };

  // Export jsPDF Report for Studio Logins (Separate JSP)
  const handleDownloadStudioLoginsPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const studioList = allLoginUsers.filter((u) => u.role === 'studio');

      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FRAMELU B2B STUDIO PARTNERS DIRECTORY', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL STUDIO LOGIN CREDENTIALS, OWNER CONTACTS & LOGIN ACTIVITY AUDIT (JSP REPORT)', 14, 17);
      doc.text(
        `Destination: ${studioContact.destination || 'Kerala, India'}  |  Admin WhatsApp: +${studioContact.whatsapp || '916238747722'}`,
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
      doc.text(`Generated: ${nowStr}  |  Total Studios: ${studioList.length}`, pageWidth - 14, 23, { align: 'right' });

      let startY = 35;
      doc.setFillColor(243, 244, 246);
      doc.rect(14, startY, pageWidth - 28, 9, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.line(14, startY + 9, pageWidth - 14, startY + 9);

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);

      const col = {
        sl: 16,
        id: 26,
        studioName: 64,
        owner: 114,
        phone: 154,
        email: 190,
        address: 238,
        logins: pageWidth - 16,
      };

      doc.text('SL', col.sl, startY + 6);
      doc.text('STUDIO ID', col.id, startY + 6);
      doc.text('STUDIO NAME', col.studioName, startY + 6);
      doc.text('OWNER / CONTACT', col.owner, startY + 6);
      doc.text('PHONE NUMBER', col.phone, startY + 6);
      doc.text('EMAIL ID', col.email, startY + 6);
      doc.text('ADDRESS & PLACE', col.address, startY + 6);
      doc.text('LOGINS', col.logins, startY + 6, { align: 'right' });

      let currentY = startY + 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      studioList.forEach((st, idx) => {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20;
        }

        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, currentY - 5, pageWidth - 28, 8, 'F');
        }

        doc.setTextColor(75, 85, 99);
        doc.text(String(idx + 1), col.sl, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202);
        doc.text(st.userId.substring(0, 18), col.id, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text((st.studioName || '-').substring(0, 24), col.studioName, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        doc.text((st.ownerName || st.name || '-').substring(0, 22), col.owner, currentY);
        doc.text(st.phone || '-', col.phone, currentY);
        doc.text((st.email || '-').substring(0, 26), col.email, currentY);

        const addr = `${st.address || ''}${st.place ? ', ' + st.place : ''}`;
        doc.text(addr.substring(0, 28) || 'Kerala', col.address, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`${st.loginCount || 1} logins`, col.logins, currentY, { align: 'right' });

        currentY += 8.5;
      });

      doc.save(`Framelu_Studio_Logins_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export studio logins PDF:', err);
      alert('PDF generation failed. Please try again.');
    }
  };

  // Export jsPDF Report for Customer Logins (Separate JSP)
  const handleDownloadCustomerLoginsPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const custList = allLoginUsers.filter((u) => u.role === 'customer');

      doc.setFillColor(6, 78, 59);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FRAMELU CUSTOMER LOGIN & USER DIRECTORY', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL CLIENT CONTACT DATA, MOBILE, ADDRESS & LOGIN COUNT AUDIT (JSP REPORT)', 14, 17);
      doc.text(
        `Destination: ${studioContact.destination || 'Kerala, India'}  |  Admin WhatsApp: +${studioContact.whatsapp || '916238747722'}`,
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
      doc.text(`Generated: ${nowStr}  |  Total Customers: ${custList.length}`, pageWidth - 14, 23, { align: 'right' });

      let startY = 35;
      doc.setFillColor(243, 244, 246);
      doc.rect(14, startY, pageWidth - 28, 9, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.line(14, startY + 9, pageWidth - 14, startY + 9);

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);

      const col = {
        sl: 16,
        id: 26,
        name: 64,
        phone: 114,
        email: 154,
        address: 202,
        logins: pageWidth - 16,
      };

      doc.text('SL', col.sl, startY + 6);
      doc.text('CUSTOMER ID', col.id, startY + 6);
      doc.text('CLIENT FULL NAME', col.name, startY + 6);
      doc.text('MOBILE NUMBER', col.phone, startY + 6);
      doc.text('EMAIL ADDRESS', col.email, startY + 6);
      doc.text('FULL ADDRESS & LOCATION', col.address, startY + 6);
      doc.text('LOGINS', col.logins, startY + 6, { align: 'right' });

      let currentY = startY + 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      custList.forEach((cu, idx) => {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20;
        }

        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, currentY - 5, pageWidth - 28, 8, 'F');
        }

        doc.setTextColor(75, 85, 99);
        doc.text(String(idx + 1), col.sl, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(cu.userId.substring(0, 18), col.id, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(cu.name.substring(0, 26), col.name, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);
        doc.text(cu.phone || '-', col.phone, currentY);
        doc.text((cu.email || '-').substring(0, 26), col.email, currentY);

        const addr = `${cu.address || ''}${cu.place ? ', ' + cu.place : ''}`;
        doc.text(addr.substring(0, 34) || 'Kerala', col.address, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text(`${cu.loginCount || 1} logins`, col.logins, currentY, { align: 'right' });

        currentY += 8.5;
      });

      doc.save(`Framelu_Customer_Logins_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export customer logins PDF:', err);
      alert('PDF generation failed. Please try again.');
    }
  };

  // Export jsPDF Report for All Logins
  const handleDownloadAllLoginsPdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFillColor(136, 19, 55);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FRAMELU COMPLETE USER LOGINS & ACCOUNTS AUDIT', 14, 11);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('COMPREHENSIVE AUDIT OF ALL REGISTERED LOGINS (STUDIO & CUSTOMER) WITH FORM DETAILS', 14, 17);
      doc.text(
        `Destination: ${studioContact.destination || 'Kerala, India'}  |  Admin WhatsApp: +${studioContact.whatsapp || '916238747722'}`,
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
      doc.text(`Generated: ${nowStr}  |  Total Users: ${displayedLoginUsers.length}`, pageWidth - 14, 23, { align: 'right' });

      let startY = 35;
      doc.setFillColor(243, 244, 246);
      doc.rect(14, startY, pageWidth - 28, 9, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.line(14, startY + 9, pageWidth - 14, startY + 9);

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);

      const col = {
        sl: 16,
        role: 25,
        id: 45,
        name: 82,
        phone: 128,
        email: 164,
        address: 212,
        logins: pageWidth - 16,
      };

      doc.text('SL', col.sl, startY + 6);
      doc.text('ROLE', col.role, startY + 6);
      doc.text('USER ID', col.id, startY + 6);
      doc.text('NAME / STUDIO', col.name, startY + 6);
      doc.text('PHONE', col.phone, startY + 6);
      doc.text('EMAIL ID', col.email, startY + 6);
      doc.text('ADDRESS', col.address, startY + 6);
      doc.text('LOGINS', col.logins, startY + 6, { align: 'right' });

      let currentY = startY + 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      displayedLoginUsers.forEach((u, idx) => {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20;
        }

        if (idx % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(14, currentY - 5, pageWidth - 28, 8, 'F');
        }

        doc.setTextColor(75, 85, 99);
        doc.text(String(idx + 1), col.sl, currentY);

        doc.setFont('helvetica', 'bold');
        if (u.role === 'studio') {
          doc.setTextColor(79, 70, 229);
          doc.text('STUDIO', col.role, currentY);
        } else {
          doc.setTextColor(16, 185, 129);
          doc.text('CLIENT', col.role, currentY);
        }

        doc.setTextColor(31, 41, 55);
        doc.text(u.userId.substring(0, 18), col.id, currentY);

        const displayName = u.role === 'studio' ? `${u.studioName || u.name}` : u.name;
        doc.text(displayName.substring(0, 24), col.name, currentY);
        doc.text(u.phone || '-', col.phone, currentY);
        doc.text((u.email || '-').substring(0, 24), col.email, currentY);

        const addr = `${u.address || ''}${u.place ? ', ' + u.place : ''}`;
        doc.text(addr.substring(0, 28) || 'Kerala', col.address, currentY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text(`${u.loginCount || 1}`, col.logins, currentY, { align: 'right' });

        currentY += 8.5;
      });

      doc.save(`Framelu_All_Logins_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Failed to export all logins PDF:', err);
      alert('PDF generation failed. Please try again.');
    }
  };

  // Export Logins as CSV
  const handleExportLoginsCsv = (filterType: 'all' | 'studio' | 'customer' = 'all') => {
    const targetUsers =
      filterType === 'all'
        ? displayedLoginUsers
        : displayedLoginUsers.filter((u) => u.role === filterType);

    if (targetUsers.length === 0) {
      alert(isMl ? 'ഡൗൺലോഡ് ചെയ്യാൻ യൂസർ ഡാറ്റ ലഭ്യമല്ല' : 'No user data available to export');
      return;
    }

    const headers = [
      'SL',
      'Role',
      'User ID',
      'Full Name',
      'Studio Name',
      'Mobile Number',
      'Email ID',
      'Address',
      'Place',
      'Login Count',
      'Registered Date',
      'Last Login Date & Time',
      'Status',
    ];

    const rows = targetUsers.map((u, i) => [
      i + 1,
      u.role.toUpperCase(),
      `"${u.userId}"`,
      `"${u.name}"`,
      `"${u.studioName || '-'}"`,
      `"${u.phone}"`,
      `"${u.email || '-'}"`,
      `"${(u.address || '').replace(/"/g, '""')}"`,
      `"${u.place || '-'}"`,
      u.loginCount || 1,
      `"${new Date(u.registeredAt).toLocaleDateString('en-IN')}"`,
      `"${new Date(u.lastLoginAt).toLocaleString('en-IN')}"`,
      `"${u.status || 'active'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Framelu_${filterType}_Logins_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          onClick={() => setActiveAdminTab('logins')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeAdminTab === 'logins'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'hover:text-stone-900 hover:bg-white/60'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{isMl ? `ലോഗിൻ വിവരങ്ങൾ (${allLoginUsers.length})` : `Login Details (${allLoginUsers.length})`}</span>
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
                  Full Length Video Editing Rate (Per Camera/Videographer) (₹) / പെർ ക്യാമറ വീഡിയോ എഡിറ്റിംഗ് ചാർജ്
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

                  <div className="p-3 border-t border-stone-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEditOffer(offer)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isMl ? 'എഡിറ്റ്' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isMl ? 'ഡിലീറ്റ്' : 'Delete'}</span>
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

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEditBoard(b)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>{isMl ? 'എഡിറ്റ്' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBoard(b.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isMl ? 'ഡിലീറ്റ്' : 'Delete'}</span>
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

            <div className="flex flex-wrap items-center gap-2">
              {/* Select All / Deselect All Button */}
              <button
                type="button"
                onClick={toggleSelectAll}
                disabled={displayedLeads.length === 0}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-2xs border cursor-pointer disabled:opacity-40 ${
                  displayedLeads.length > 0 &&
                  displayedLeads.every((l, i) => selectedLeadIds.includes(l.id || `lead_key_${i}`))
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-stone-700 hover:bg-stone-50 border-stone-250'
                }`}
                title={isMl ? 'എല്ലാ കൊട്ടേഷനുകളും തിരഞ്ഞെടുക്കുക' : 'Select all quotations'}
              >
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {displayedLeads.length > 0 &&
                  displayedLeads.every((l, i) => selectedLeadIds.includes(l.id || `lead_key_${i}`))
                    ? (isMl ? 'തിരഞ്ഞെടുക്കൽ മാറ്റുക' : 'Deselect All')
                    : (isMl ? `എല്ലാം സെലക്ട് ചെയ്യുക (${displayedLeads.length})` : `Select All (${displayedLeads.length})`)}
                </span>
              </button>

              {/* Bulk Delete Selected Action Button */}
              {selectedLeadIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDeleteLeads}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition animate-pulse cursor-pointer"
                  title={isMl ? 'തിരഞ്ഞെടുത്ത കൊട്ടേഷനുകൾ ഒഴിവാക്കുക' : 'Delete selected quotations'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {isMl
                      ? `തിരഞ്ഞെടുത്തവ ഡിലീറ്റ് ചെയ്യുക (${selectedLeadIds.length})`
                      : `Delete Selected (${selectedLeadIds.length})`}
                  </span>
                </button>
              )}

              {/* Delete All Quotes in Filter Button */}
              {displayedLeads.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteAllLeads}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 hover:text-rose-900 font-bold text-xs transition cursor-pointer"
                  title={isMl ? 'ലിസ്റ്റിലുള്ള എല്ലാ കൊട്ടേഷനുകളും ഒന്നിച്ച് ഡിലീറ്റ് ചെയ്യുക' : 'Permanently delete all quotes in current view'}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    {isMl ? `എല്ലാം ഡിലീറ്റ് ചെയ്യുക (${displayedLeads.length})` : `Delete All (${displayedLeads.length})`}
                  </span>
                </button>
              )}

              {/* Download Customer Data PDF Button */}
              <button
                type="button"
                onClick={handleDownloadCustomerDataPdf}
                disabled={displayedLeads.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                title={isMl ? 'കസ്റ്റമർ ഡേറ്റ PDF ആയി ഡൗൺലോഡ് ചെയ്യുക' : 'Download Customer Report as PDF'}
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>{isMl ? 'PDF എക്സ്പോർട്ട്' : 'Export PDF'}</span>
              </button>

              <span className="bg-amber-100 text-amber-950 font-black px-3 py-2 rounded-xl text-xs border border-amber-200">
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-stone-50 border border-stone-200">
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

            {/* User ID Dropdown Filter */}
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white focus:ring-2 focus:ring-amber-500 truncate"
                title={isMl ? 'യൂസർ ഐഡി പ്രകാരം ഫിൽറ്റർ ചെയ്യുക' : 'Filter by User ID'}
              >
                <option value="all">{isMl ? 'എല്ലാ യൂസർമാരും (All IDs)' : 'All Logged-in IDs'}</option>
                {allLoginUsers.map((u) => (
                  <option key={u.id} value={u.email || u.phone || u.userId}>
                    {u.name} ({u.userId})
                  </option>
                ))}
              </select>
            </div>

            {/* Place Dropdown Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={placeFilter}
                onChange={(e) => setPlaceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white focus:ring-2 focus:ring-amber-500 truncate"
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
                          displayedLeads.every((l, i) => selectedLeadIds.includes(l.id || `lead_key_${i}`))
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                        title={isMl ? 'എല്ലാം തിരഞ്ഞെടുക്കുക' : 'Select All'}
                      />
                    </th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'ഓണർ / ക്രിയേറ്റർ' : 'Owner & Creator'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'ക്ലയന്റ് & ബുക്കിംഗ്' : 'Client & Booking'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'മൊബൈൽ' : 'Phone'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'സ്ഥലം' : 'Place'}</th>
                    <th className="py-3 px-3 font-bold">{isMl ? 'വിവാഹ തീയതി' : 'Wedding Date'}</th>
                    <th className="py-3 px-2 font-bold text-right">{isMl ? 'പാക്കേജ് തുക' : 'Package Total'}</th>
                    <th className="py-3 px-2 font-bold text-right">{isMl ? 'ഓഫർ കിഴിവ്' : 'Offer Discount'}</th>
                    <th className="py-3 px-2 font-bold text-right">{isMl ? 'ഡിസ്കൗണ്ട്' : 'Discount'}</th>
                    <th className="py-3 px-2 font-bold text-right">{isMl ? 'ജിഎസ്ടി (18%)' : 'GST (18%)'}</th>
                    <th className="py-3 px-2 font-bold text-right text-amber-900 bg-amber-100/60">{isMl ? 'അന്തിമ ക്ലോസിംഗ് തുക' : 'Final Closed Amount'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isMl ? 'സ്റ്റാറ്റസ്' : 'Status'}</th>
                    <th className="py-3 px-3 font-bold text-center">{isMl ? 'പ്ലാൻ' : 'Plan'}</th>
                    <th className="py-3 px-3 font-bold text-right">{isMl ? 'ആക്ഷൻസ്' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {displayedLeads.map((lead, idx) => {
                    const leadKey = lead.id || `lead_key_${idx}`;
                    const isChecked = selectedLeadIds.includes(leadKey);
                    const statusCfg = getLeadStatusConfig(lead.status || 'New', isMl);
                    const ownerName = lead.ownerName || lead.createdByName || (lead.studioBranding ? lead.studioBranding.ownerName : lead.name);
                    const creatorEmail = lead.ownerEmail || lead.createdByEmail || lead.userEmail || (lead.studioBranding ? lead.studioBranding.email : lead.email);

                    return (
                      <tr
                        key={leadKey}
                        className={`transition ${
                          isChecked ? 'bg-amber-50/70' : 'hover:bg-stone-50'
                        } ${statusCfg.borderLeft}`}
                      >
                        {/* Row Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectLead(leadKey)}
                            className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
                          />
                        </td>

                        {/* Owner & Creator Column (ആരാണ്, ഏത് മെയിൽ) */}
                        <td
                          className="py-3 px-3 cursor-pointer"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsPlanModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-stone-900 text-xs sm:text-sm">
                              {ownerName}
                            </span>
                            {lead.studioBranding ? (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-200">
                                🏢 Studio
                              </span>
                            ) : (
                              <span className="text-[9px] font-black tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                                👤 Owner
                              </span>
                            )}
                          </div>
                          {creatorEmail ? (
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 mt-0.5">
                              <Mail className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[200px]" title={creatorEmail}>
                                {creatorEmail}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-stone-400 block mt-0.5 font-normal">
                              Email: N/A
                            </span>
                          )}
                          {lead.studioBranding && (
                            <span className="block text-[10px] text-indigo-800 font-bold mt-0.5">
                              Studio: {lead.studioBranding.studioName}
                            </span>
                          )}
                        </td>

                        {/* Client & Booking Column */}
                        <td
                          className="py-3 px-3 cursor-pointer"
                          onClick={() => {
                            setSelectedLead(lead);
                            setIsPlanModalOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-stone-800 text-xs">{lead.name}</span>
                            {lead.leadType === 'standalone_photoshoot' ? (
                              <span className="text-[9px] font-extrabold bg-rose-100 text-rose-900 px-1.5 py-0.5 rounded border border-rose-300">
                                📷 {lead.photoshootDetails?.title || 'Photoshoot'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200">
                                💍 Wedding
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                            #{lead.id}
                          </span>
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
                        {(() => {
                          const basePkg = lead.totalPrice || 0;
                          const offerDisc = (lead as any).offerDiscountAmount || (lead as any).packageDiscount || 0;
                          const couponDisc = lead.discountAmount || (lead.discountPercentage && lead.discountPercentage > 0 ? Math.round((basePkg * lead.discountPercentage) / 100) : 0);
                          const taxableTotal = lead.grandTotalAfterDiscount || Math.max(0, basePkg - couponDisc);
                          const gstAmt = lead.taxAmount || Math.round(taxableTotal * 0.18);
                          const finalClosedAmt = lead.grandTotal || (taxableTotal + gstAmt);

                          return (
                            <>
                              {/* 1. Full Package Total */}
                              <td className="py-3 px-2 text-right font-bold text-stone-900 whitespace-nowrap">
                                ₹{basePkg.toLocaleString('en-IN')}
                              </td>

                              {/* 2. Offer Discount */}
                              <td className="py-3 px-2 text-right font-bold whitespace-nowrap">
                                {offerDisc > 0 ? (
                                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px] font-black">
                                    -₹{offerDisc.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 font-normal">₹0</span>
                                )}
                              </td>

                              {/* 3. Discount */}
                              <td className="py-3 px-2 text-right font-bold whitespace-nowrap">
                                {couponDisc > 0 ? (
                                  <span className="bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded text-[11px] font-black" title={lead.couponCode ? `Coupon: ${lead.couponCode}` : undefined}>
                                    -₹{couponDisc.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-stone-400 font-normal">₹0</span>
                                )}
                              </td>

                              {/* 4. GST 18% */}
                              <td className="py-3 px-2 text-right font-semibold text-stone-600 whitespace-nowrap">
                                ₹{gstAmt.toLocaleString('en-IN')}
                              </td>

                              {/* 5. Final Closed Amount */}
                              <td className="py-3 px-2 text-right font-black bg-amber-50/60 whitespace-nowrap">
                                <span className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded-lg shadow-2xs text-[11px] font-black inline-block">
                                  ₹{finalClosedAmt.toLocaleString('en-IN')}
                                </span>
                              </td>
                            </>
                          );
                        })()}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(lead);
                              setIsPlanModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
                            title={isMl ? 'കസ്റ്റമർ തിരഞ്ഞെടുത്ത സമ്പൂർണ്ണ പ്ലാൻ കാണുക' : 'View complete package chosen by customer'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{isMl ? 'പ്ലാൻ കാണുക' : 'View Plan'}</span>
                          </button>
                        </td>

                        <td className="py-3 px-3 text-right space-x-1">
                          <a
                            href={`tel:${(lead.phone || '').replace(/[^\d+]/g, '')}`}
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
                              setIsPlanModalOpen(false);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                            title="Preview & Download PDF Quotation"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteLead(lead)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
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

      {/* 5.5 LOGIN DETAILS & REGISTERED IDS PORTAL (Requirement) */}
      {activeAdminTab === 'logins' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Title Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
                <KeyRound className="w-4 h-4" />
                <span>{isMl ? 'യൂസർ ലോഗിൻ പോർട്ടൽ & ഐഡി കൺട്രോൾ' : 'User Login Portal & ID Management'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                {isMl ? 'ലോഗിൻ വിവരങ്ങൾ & അക്കൗണ്ട് ഡയറക്ടറി' : 'Login Details & Accounts Directory'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
                {isMl
                  ? 'ഫ്രണ്ട് എൻഡിൽ ലോഗിൻ ചെയ്ത എല്ലാ സ്റ്റുഡിയോ പാർട്ണർമാരുടെയും കസ്റ്റമർമാരുടെയും വിവരങ്ങൾ (പേര്, ഫോൺ, വിലാസം, ഇമെയിൽ, ലോഗിൻ തവണകൾ). ഇവിടെ ഐഡികൾ ഡിലീറ്റ് ചെയ്യാനും നിയന്ത്രിക്കാനും സാധിക്കും.'
                  : 'Directory of all users who have logged in (Studio & Customer) with form details, phone, address, and login counts. Control and delete accounts from here.'}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[10px] text-stone-300 font-bold block uppercase tracking-wider">
                  {isMl ? 'ആകെ ഐഡികൾ' : 'Total IDs'}
                </span>
                <span className="text-xl font-black text-amber-400 mt-0.5 block">
                  {allLoginUsers.length}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[10px] text-stone-300 font-bold block uppercase tracking-wider">
                  {isMl ? 'സ്റ്റുഡിയോകൾ' : 'Studios'}
                </span>
                <span className="text-xl font-black text-indigo-400 mt-0.5 block">
                  {allLoginUsers.filter((u) => u.role === 'studio').length}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[10px] text-stone-300 font-bold block uppercase tracking-wider">
                  {isMl ? 'കസ്റ്റമർമാർ' : 'Clients'}
                </span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                  {allLoginUsers.filter((u) => u.role === 'customer').length}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
                <span className="text-[10px] text-stone-300 font-bold block uppercase tracking-wider">
                  {isMl ? 'ആകെ ലോഗിനുകൾ' : 'Total Visits'}
                </span>
                <span className="text-xl font-black text-rose-400 mt-0.5 block">
                  {allLoginUsers.reduce((sum, u) => sum + (u.loginCount || 1), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Sub-tab role switcher */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setLoginRoleFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  loginRoleFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{isMl ? 'എല്ലാ ഐഡികളും' : 'All Accounts'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                  {allLoginUsers.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoginRoleFilter('studio')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  loginRoleFilter === 'studio'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{isMl ? 'സ്റ്റുഡിയോ ലോഗിൻ (Studio)' : 'Studio Logins'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                  {allLoginUsers.filter((u) => u.role === 'studio').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLoginRoleFilter('customer')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  loginRoleFilter === 'customer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{isMl ? 'കസ്റ്റമർ ലോഗിൻ (Client)' : 'Customer Logins'}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">
                  {allLoginUsers.filter((u) => u.role === 'customer').length}
                </span>
              </button>
            </div>

            {/* Search and Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isMl ? 'പേര്, ഫോൺ, വിലാസം, ഐഡി തിരയുക...' : 'Search name, phone, address, ID...'}
                  value={loginSearchQuery}
                  onChange={(e) => setLoginSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-stone-250 text-xs bg-stone-50 focus:bg-white text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {loginSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setLoginSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bulk Delete Button */}
              {selectedLoginUserIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDeleteLoginUsers}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 transition shadow-sm cursor-pointer animate-fade-in"
                  title="Bulk Delete Selected Accounts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isMl ? `ഡിലീറ്റ് (${selectedLoginUserIds.length})` : `Delete (${selectedLoginUserIds.length})`}</span>
                </button>
              )}

              {/* Export Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownloadStudioLoginsPdf}
                  className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Download Studio Logins PDF Report (JSP)"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{isMl ? 'സ്റ്റുഡിയോ PDF (JSP)' : 'Studio PDF (JSP)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCustomerLoginsPdf}
                  className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Download Customer Logins PDF Report (JSP)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isMl ? 'കസ്റ്റമർ PDF (JSP)' : 'Customer PDF (JSP)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportLoginsCsv(loginRoleFilter)}
                  className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-250 text-stone-800 hover:bg-stone-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="Export CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          {displayedLoginUsers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-xs">
              <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-stone-800 mb-1">
                {isMl ? 'ലോഗിൻ വിവരങ്ങൾ ലഭ്യമല്ല' : 'No Login Users Found'}
              </h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {loginSearchQuery
                  ? isMl
                    ? `"${loginSearchQuery}" എന്നതിന് അനുയോജ്യമായ യൂസർ വിവരങ്ങൾ കണ്ടെത്താനായില്ല.`
                    : `No users matched "${loginSearchQuery}". Try clearing search filter.`
                  : isMl
                  ? 'സ്റ്റുഡിയോ അല്ലെങ്കിൽ കസ്റ്റമർ ലോഗിൻ ചെയ്യുമ്പോൾ അവരുടെ വിവരങ്ങൾ ഇവിടെ തത്സമയം ദൃശ്യമാകും.'
                  : 'When users log in, their full registration details and login count will appear here in real-time.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-700 font-black uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">
                        <button
                          type="button"
                          onClick={toggleSelectAllLoginUsers}
                          className="text-stone-500 hover:text-stone-900 transition cursor-pointer"
                        >
                          {displayedLoginUsers.length > 0 &&
                          displayedLoginUsers.every((u) => selectedLoginUserIds.includes(u.id)) ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3 px-3">{isMl ? 'യൂസർ ഐഡി & റോൾ' : 'User ID & Role'}</th>
                      <th className="py-3 px-3">{isMl ? 'പേര് / സ്ഥാപനം' : 'Name & Profile'}</th>
                      <th className="py-3 px-3">{isMl ? 'മൊബൈൽ നമ്പർ' : 'Mobile Number'}</th>
                      <th className="py-3 px-3">{isMl ? 'ഇമെയിൽ ഐഡി' : 'Email ID'}</th>
                      <th className="py-3 px-3">{isMl ? 'വിലാസം & സ്ഥലം' : 'Address & Location'}</th>
                      <th className="py-3 px-3 text-center">{isMl ? 'ലോഗിൻ തവണ' : 'Login Count'}</th>
                      <th className="py-3 px-3">{isMl ? 'അവസാന ലോഗിൻ' : 'Last Login'}</th>
                      <th className="py-3 px-3 text-center">{isMl ? 'കൊട്ടേഷനുകൾ' : 'Quotations'}</th>
                      <th className="py-3 px-3 text-right">{isMl ? 'കൺട്രോൾ' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {displayedLoginUsers.map((user, idx) => {
                      const isSelected = selectedLoginUserIds.includes(user.id);
                      const isStudio = user.role === 'studio';
                      const userQuotes = getUserQuotations(user);

                      return (
                        <tr
                          key={user.id || `login_user_${idx}`}
                          className={`hover:bg-amber-50/30 transition ${
                            isSelected ? 'bg-amber-50/50' : idx % 2 === 1 ? 'bg-stone-50/40' : 'bg-white'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSelectLoginUser(user.id)}
                              className="text-stone-400 hover:text-stone-700 transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* ID & Role */}
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="font-black text-stone-900 text-xs font-mono">
                                {user.userId}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isStudio
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                }`}
                              >
                                {isStudio ? (isMl ? '🏢 സ്റ്റുഡിയോ' : '🏢 Studio') : (isMl ? '👤 കസ്റ്റമർ' : '👤 Client')}
                              </span>
                            </div>
                          </td>

                          {/* Name & Details */}
                          <td className="py-3 px-3">
                            <div>
                              <p className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                                <span>{user.name}</span>
                              </p>
                              {isStudio && user.studioName && (
                                <p className="text-[10px] text-indigo-700 font-bold truncate max-w-[180px]">
                                  {user.studioName}
                                </p>
                              )}
                              {user.authMethod && (
                                <span className="text-[9px] text-stone-400 font-medium">
                                  via {user.authMethod}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${user.phone}`}
                                className="font-bold text-stone-800 hover:text-amber-700 transition"
                              >
                                {user.phone ? `+91 ${user.phone.replace(/(\d{5})(\d{5})/, '$1 $2')}` : '-'}
                              </a>
                              {user.phone && (
                                <a
                                  href={`https://wa.me/91${user.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition"
                                  title="Chat on WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-3">
                            {user.email ? (
                              <a
                                href={`mailto:${user.email}`}
                                className="text-stone-600 hover:text-amber-700 transition font-medium truncate max-w-[180px] block"
                                title={user.email}
                              >
                                {user.email}
                              </a>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>

                          {/* Address & Place */}
                          <td className="py-3 px-3 max-w-[200px]">
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                              <div className="truncate">
                                <span className="font-bold text-stone-800 text-[11px] block truncate">
                                  {user.place || 'Kerala'}
                                </span>
                                <span className="text-[10px] text-stone-500 truncate block" title={user.address}>
                                  {user.address || 'Address provided during login'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Login Count */}
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full font-black text-xs bg-amber-100 text-amber-900 border border-amber-250">
                              {user.loginCount || 1} {isMl ? 'തവണ' : 'logins'}
                            </span>
                          </td>

                          {/* Last Login */}
                          <td className="py-3 px-3">
                            <div>
                              <span className="text-stone-700 font-bold text-[11px] block">
                                {new Date(user.lastLoginAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-stone-400 text-[9px]">
                                {new Date(user.lastLoginAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Quotations Count & View Link */}
                          <td className="py-3 px-3 text-center">
                            {userQuotes.length > 0 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setUserFilter(user.email || user.phone || user.userId);
                                  setActiveAdminTab('leads');
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition cursor-pointer"
                                title={isMl ? 'ഈ ഐഡിയുടെ കൊട്ടേഷനുകൾ കാണുക' : 'View quotations created by this user'}
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-700" />
                                <span>{userQuotes.length} {isMl ? 'എണ്ണം' : 'quotes'}</span>
                              </button>
                            ) : (
                              <span className="text-stone-400 text-xs font-medium">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details / Quotations */}
                              <button
                                type="button"
                                onClick={() => {
                                  setInspectingLoginUser(user);
                                  setIsInspectLoginUserModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-900 transition cursor-pointer"
                                title={isMl ? 'വിശദാംശങ്ങളും കൊട്ടേഷനും കാണുക' : 'View Details & Quotations'}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Direct Jump to Quotes if any */}
                              {userQuotes.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUserFilter(user.email || user.phone || user.userId);
                                    setActiveAdminTab('leads');
                                  }}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition cursor-pointer"
                                  title={isMl ? 'കൊട്ടേഷനുകൾ ഫിൽറ്റർ ചെയ്യുക' : 'Filter User Quotations'}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Delete ID */}
                              <button
                                type="button"
                                onClick={() => handleDeleteLoginUser(user)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-900 transition cursor-pointer"
                                title={isMl ? 'ഐഡി ഡിലീറ്റ് ചെയ്യുക' : 'Delete User ID'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* INSPECT LOGIN USER DETAILS MODAL */}
      {isInspectLoginUserModalOpen && inspectingLoginUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 relative overflow-hidden max-h-[92vh] flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-indigo-600 to-emerald-600" />

            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block mb-1.5 ${
                    inspectingLoginUser.role === 'studio'
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {inspectingLoginUser.role === 'studio' ? '🏢 Studio Partner' : '👤 Customer User'}
                </span>
                <h3 className="text-lg font-black text-stone-900">
                  {inspectingLoginUser.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  ID: {inspectingLoginUser.userId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInspectLoginUserModalOpen(false)}
                className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto pr-1 flex-1 space-y-4">
              <div className="space-y-3.5 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                {inspectingLoginUser.studioName && (
                <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                  <span className="font-bold text-stone-500">{isMl ? 'സ്റ്റുഡിയോ പേര്' : 'Studio Name'}</span>
                  <span className="font-black text-indigo-900">{inspectingLoginUser.studioName}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span className="font-bold text-stone-500">{isMl ? 'മൊബൈൽ നമ്പർ' : 'Mobile Number'}</span>
                <span className="font-bold text-stone-900 font-mono">+91 {inspectingLoginUser.phone}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span className="font-bold text-stone-500">{isMl ? 'ഇമെയിൽ ഐഡി' : 'Email Address'}</span>
                <span className="font-bold text-stone-900">{inspectingLoginUser.email || '-'}</span>
              </div>

              <div className="py-1 border-b border-stone-200/60">
                <span className="font-bold text-stone-500 block mb-0.5">{isMl ? 'പൂർണ്ണ വിലാസം' : 'Full Address'}</span>
                <span className="font-medium text-stone-800 leading-relaxed block">
                  {inspectingLoginUser.address || '-'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span className="font-bold text-stone-500">{isMl ? 'സ്ഥലം / ജില്ല' : 'Location / District'}</span>
                <span className="font-bold text-stone-900">{inspectingLoginUser.place || '-'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span className="font-bold text-stone-500">{isMl ? 'ലോഗിൻ തവണകൾ' : 'Total Login Count'}</span>
                <span className="font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  {inspectingLoginUser.loginCount || 1} {isMl ? 'തവണ ലോഗിൻ ചെയ്തു' : 'visits'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-200/60">
                <span className="font-bold text-stone-500">{isMl ? 'ആദ്യ രജിസ്ട്രേഷൻ' : 'Registered Date'}</span>
                <span className="font-medium text-stone-700">
                  {new Date(inspectingLoginUser.registeredAt).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-stone-500">{isMl ? 'അവസാന ലോഗിൻ' : 'Last Login Time'}</span>
                <span className="font-medium text-stone-700">
                  {new Date(inspectingLoginUser.lastLoginAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* List of quotations created by this User */}
            {(() => {
              const quotes = getUserQuotations(inspectingLoginUser);
              return (
                <div className="mt-4 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isMl ? `ക്രിയേറ്റ് ചെയ്ത കൊട്ടേഷനുകൾ (${quotes.length})` : `Created Quotations (${quotes.length})`}</span>
                    </h4>
                    {quotes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsInspectLoginUserModalOpen(false);
                          setUserFilter(inspectingLoginUser.email || inspectingLoginUser.phone || inspectingLoginUser.userId);
                          setActiveAdminTab('leads');
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition cursor-pointer"
                      >
                        {isMl ? 'എല്ലാം കാണുക →' : 'View all in Leads →'}
                      </button>
                    )}
                  </div>

                  {quotes.length === 0 ? (
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-stone-500">
                      {isMl ? 'ഈ യൂസർ ഇതുവരെ കൊട്ടേഷൻ ഒന്നും ക്രിയേറ്റ് ചെയ്തിട്ടില്ല.' : 'No quotations created by this user yet.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {quotes.map((q, idx) => (
                        <div
                          key={q.id || `quote_${idx}`}
                          className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-3 text-xs transition"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-black text-stone-900 text-[11px]">{q.id}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white shadow-2xs">
                                ₹{Number(q.grandTotal || q.totalPrice || 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-stone-600 font-semibold">
                                (Pkg: ₹{Number(q.totalPrice || 0).toLocaleString('en-IN')}{q.discountAmount ? ` • Disc: -₹${Number(q.discountAmount).toLocaleString('en-IN')}` : ''} • GST: ₹{Number(q.taxAmount || 0).toLocaleString('en-IN')})
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-600 mt-1 truncate">
                              {q.venueLocation || q.place || 'Kerala'} • {q.weddingDate || 'Date TBD'} • {q.status || 'New'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLead(q);
                                setIsPdfModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition cursor-pointer"
                              title={isMl ? 'PDF കാണുക' : 'View PDF'}
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLead(q);
                                setIsPlanModalOpen(true);
                              }}
                              className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold transition cursor-pointer"
                              title={isMl ? 'വിശദാംശങ്ങൾ' : 'Details'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={() => handleDeleteLoginUser(inspectingLoginUser)}
                className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{isMl ? 'ഐഡി ഡിലീറ്റ് ചെയ്യുക' : 'Delete Account'}</span>
              </button>

              <div className="flex items-center gap-2">
                {inspectingLoginUser.phone && (
                  <a
                    href={`https://wa.me/91${inspectingLoginUser.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setIsInspectLoginUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition cursor-pointer"
                >
                  {isMl ? 'അടയ്ക്കുക' : 'Close'}
                </button>
              </div>
            </div>
          </div>
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

      {/* Edit Promo Offer Modal */}
      {isEditOfferModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Edit Offer Card
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {isMl ? 'ഓഫർ കാർഡും പോസ്റ്ററും എഡിറ്റ് ചെയ്യുക' : 'Edit Promotional Offer & Poster'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditOfferModalOpen(false);
                  setEditingOffer(null);
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedOffer} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഓഫർ ടൈറ്റിൽ (English) *' : 'Offer Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOffer.title || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഓഫർ ടൈറ്റിൽ (മലയാളം)' : 'Offer Title (Malayalam)'}
                  </label>
                  <input
                    type="text"
                    value={editingOffer.titleMl || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, titleMl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഓഫർ ബാഡ്ജ് / ടാഗ്' : 'Offer Badge / Tag'}
                  </label>
                  <input
                    type="text"
                    value={editingOffer.badge || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'വാലിഡിറ്റി തീയതി (Valid Till)' : 'Valid Till (Date)'}
                  </label>
                  <input
                    type="date"
                    value={editingOffer.validTill || ''}
                    onChange={(e) => setEditingOffer({ ...editingOffer, validTill: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label={isMl ? 'പോസ്റ്റർ ഫോട്ടോ (Poster Photo)' : 'Offer Poster Photo'}
                  imageUrl={editingOffer.posterUrl || ''}
                  onChange={(val) => setEditingOffer({ ...editingOffer, posterUrl: val })}
                  isMl={isMl}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'വിവരണം / ഓഫർ ആനുകൂല്യങ്ങൾ' : 'Description / Offer Inclusions'}
                </label>
                <textarea
                  rows={3}
                  value={editingOffer.description || ''}
                  onChange={(e) => setEditingOffer({ ...editingOffer, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditOfferModalOpen(false);
                    setEditingOffer(null);
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

      {/* Edit Highlight Board Modal */}
      {isEditBoardModalOpen && editingBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 my-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  Edit Highlight Board
                </span>
                <h3 className="text-xl font-black text-stone-900 mt-1">
                  {isMl ? 'ഹൈലൈറ്റ് പാക്കേജ് ബോർഡ് എഡിറ്റ് ചെയ്യുക' : 'Edit Highlight Package Board'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditBoardModalOpen(false);
                  setEditingBoard(null);
                }}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedBoard} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പാക്കേജ് പേര് (English) *' : 'Package Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingBoard.title || ''}
                    onChange={(e) => setEditingBoard({ ...editingBoard, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പാക്കേജ് പേര് (മലയാളം)' : 'Package Name (Malayalam)'}
                  </label>
                  <input
                    type="text"
                    value={editingBoard.titleMl || ''}
                    onChange={(e) => setEditingBoard({ ...editingBoard, titleMl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'പാക്കേജ് പ്രൈസ് (₹) *' : 'Package Price (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingBoard.price || ''}
                    onChange={(e) => setEditingBoard({ ...editingBoard, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-black text-amber-700 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ബാഡ്ജ് ടാഗ് (Tag)' : 'Badge Tag'}
                  </label>
                  <input
                    type="text"
                    value={editingBoard.tag || ''}
                    onChange={(e) => setEditingBoard({ ...editingBoard, tag: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <ImageUploadField
                  label={isMl ? 'പാക്കേജ് ഫോട്ടോ / ബാനർ (Package Banner Photo)' : 'Package Banner Photo'}
                  imageUrl={editingBoard.bannerUrl || ''}
                  onChange={(val) => setEditingBoard({ ...editingBoard, bannerUrl: val })}
                  isMl={isMl}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'ഹ്രസ്വ വിവരണം (Short Description)' : 'Short Description'}
                </label>
                <input
                  type="text"
                  value={editingBoard.description || ''}
                  onChange={(e) => setEditingBoard({ ...editingBoard, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'ഫീച്ചറുകൾ (കോമ ഉപയോഗിച്ച് വേർതിരിക്കുക)' : 'Features (Comma-separated)'}
                </label>
                <textarea
                  rows={2}
                  value={(editingBoard.features || []).join(', ')}
                  onChange={(e) =>
                    setEditingBoard({
                      ...editingBoard,
                      features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-900 bg-stone-50 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditBoardModalOpen(false);
                    setEditingBoard(null);
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
      {selectedLead && isPlanModalOpen && (() => {
        const plan = resolvePlanForLead(selectedLead);
        const groomEvts = plan.groomEvents || {};
        const brideEvts = plan.brideEvents || {};
        const deliv = plan.deliverables || {};
        const basePrice = Number(selectedLead.totalPrice) || 95000;
        const gstPrice = Math.round(basePrice * 0.18);
        const grandTotal = basePrice + gstPrice;

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedLead(null);
                setIsPlanModalOpen(false);
              }
            }}
          >
            <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-8 shadow-2xl relative border border-stone-200 my-4 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      Customer Plan Breakdown
                    </span>
                    <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-250">
                      {selectedLead.id || 'FWC-QUOTE'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 mt-1">
                    {selectedLead.name} - Selected Wedding Package
                  </h3>
                  <p className="text-xs text-stone-500 flex flex-wrap items-center gap-2 mt-0.5">
                    <span>📍 {selectedLead.place || selectedLead.address || 'Kerala'}</span>
                    <span>•</span>
                    <span>📞 {selectedLead.phone}</span>
                    {selectedLead.weddingDate && (
                      <>
                        <span>•</span>
                        <span>📅 {selectedLead.weddingDate}</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      deleteLead(selectedLead);
                      setIsPlanModalOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-800 text-xs font-bold transition cursor-pointer"
                    title={isMl ? 'ഈ കൊട്ടേഷൻ ഡിലീറ്റ് ചെയ്യുക' : 'Delete this quotation'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isMl ? 'ഡിലീറ്റ്' : 'Delete'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLead(null);
                      setIsPlanModalOpen(false);
                    }}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Package Banner */}
              <div className="mt-4 p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-amber-500/20 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                    {isMl ? 'തിരഞ്ഞെടുത്ത പാക്കേജ് പ്ലാൻ' : 'Selected Package Plan'}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-stone-900 mt-0.5">
                    {plan.packageName}
                  </h4>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-lg sm:text-xl font-black text-amber-900 block leading-tight">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-stone-500 font-bold block">
                    (Base: ₹{basePrice.toLocaleString('en-IN')} + 18% GST)
                  </span>
                </div>
              </div>

              {/* Comprehensive Package Price Breakdown Grid (User Requirement 4) */}
              {(() => {
                const planBasePkg = selectedLead.totalPrice || basePrice || 0;
                const planOfferDisc = (selectedLead as any).offerDiscountAmount || (selectedLead as any).packageDiscount || 0;
                const planCouponDisc = selectedLead.discountAmount || (selectedLead.discountPercentage && selectedLead.discountPercentage > 0 ? Math.round((planBasePkg * selectedLead.discountPercentage) / 100) : 0);
                const planTaxable = selectedLead.grandTotalAfterDiscount || Math.max(0, planBasePkg - planCouponDisc);
                const planGst = selectedLead.taxAmount || Math.round(planTaxable * 0.18);
                const planFinal = selectedLead.grandTotal || (planTaxable + planGst);

                return (
                  <div className="mt-3 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
                    <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-2">
                      {isMl ? 'പാക്കേജ് തുക & കിഴിവ് വിശദാംശങ്ങൾ (Detailed Financial Breakdown)' : 'Quotation Financial & Pricing Breakdown'}
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 font-bold block">{isMl ? 'പാക്കേജ് തുക' : 'Package Total'}</span>
                        <span className="text-xs sm:text-sm font-black text-stone-900">₹{planBasePkg.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-700 font-bold block">{isMl ? 'ഓഫർ കിഴിവ്' : 'Offer Discount'}</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-800">
                          {planOfferDisc > 0 ? `-₹${planOfferDisc.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                        <span className="text-[10px] text-rose-700 font-bold block">{isMl ? 'കൂപ്പൺ / ഡിസ്കൗണ്ട്' : 'Discount'}</span>
                        <span className="text-xs sm:text-sm font-black text-rose-800">
                          {planCouponDisc > 0 ? `-₹${planCouponDisc.toLocaleString('en-IN')}` : '₹0'}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                        <span className="text-[10px] text-stone-500 font-bold block">{isMl ? 'ജിഎസ്ടി (18%)' : 'GST (18%)'}</span>
                        <span className="text-xs sm:text-sm font-semibold text-stone-700">₹{planGst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-2.5 rounded-xl shadow-xs col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-amber-100 font-bold block">{isMl ? 'ക്ലോസിംഗ് തുക' : 'Final Closed'}</span>
                        <span className="text-xs sm:text-sm font-black">₹{planFinal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Prominent Owner & Creation Email Card */}
              <div className="mt-3 p-4 bg-gradient-to-r from-stone-50 via-amber-50/30 to-stone-50 border border-amber-200 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-200/80">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block leading-tight">
                        {isMl ? 'കൊട്ടേഷൻ ഓണർ വിവരങ്ങൾ (ആരാണ് & ഏത് മെയിൽ)' : 'Quotation Owner & Creation Login Details'}
                      </span>
                      <span className="text-sm font-black text-stone-900">
                        {selectedLead.ownerName || selectedLead.createdByName || (selectedLead.studioBranding ? selectedLead.studioBranding.ownerName : selectedLead.name)}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border ${
                    selectedLead.studioBranding
                      ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {selectedLead.studioBranding ? '🏢 Studio Partner' : '👤 Customer Account'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mt-2">
                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                      {isMl ? 'ഓണർ പേര് (ലോഗിൻ ചെയ്തത്)' : 'Owner / Creator Name'}
                    </span>
                    <span className="font-black text-stone-900 text-sm">
                      {selectedLead.ownerName || selectedLead.createdByName || (selectedLead.studioBranding ? selectedLead.studioBranding.ownerName : selectedLead.name)}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-600" />
                      <span>{isMl ? 'ക്രിയേറ്റ് ചെയ്ത ഇമെയിൽ' : 'Created From Email'}</span>
                    </span>
                    <span className="font-black text-amber-900 text-xs break-all">
                      {selectedLead.ownerEmail || selectedLead.createdByEmail || selectedLead.userEmail || (selectedLead.studioBranding ? selectedLead.studioBranding.email : selectedLead.email) || 'N/A'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 block uppercase tracking-wider">
                      {isMl ? 'ഫോൺ നമ്പർ' : 'Contact Phone'}
                    </span>
                    <span className="font-bold text-stone-800 text-xs">
                      {selectedLead.userPhone || selectedLead.phone || 'N/A'}
                    </span>
                  </div>
                </div>

                {selectedLead.studioBranding && (
                  <div className="mt-2 pt-2 border-t border-amber-200 text-[11px] text-indigo-900 font-bold flex flex-wrap items-center gap-3">
                    <span>Studio: {selectedLead.studioBranding.studioName}</span>
                    <span>• Studio Owner: {selectedLead.studioBranding.ownerName}</span>
                    <span>• Studio Email: {selectedLead.studioBranding.email}</span>
                  </div>
                )}
              </div>

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
              <div className="my-4 p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/10 rounded-2xl border border-amber-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-700">{isMl ? 'ഡയറക്റ്റ് ആക്ഷൻസ്:' : 'Quick Actions:'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* PDF Quote Button */}
                  <button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{isMl ? 'PDF കൊട്ടേഷൻ കാണുക / ഡൗൺലോഡ്' : 'Preview & Download PDF'}</span>
                  </button>

                  {/* WhatsApp Full Plan with PDF Button */}
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                    title="Send Quotation to Customer via WhatsApp with PDF"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{isMl ? 'WhatsApp വഴി അയക്കുക' : 'Send Quotation to WhatsApp'}</span>
                  </button>

                  {/* Direct Call */}
                  <a
                    href={`tel:${(selectedLead.phone || '').replace(/[^\d+]/g, '')}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{isMl ? 'വിളിക്കുക' : 'Call Customer'}</span>
                  </a>
                </div>
              </div>

              {/* Plan Details Content */}
              <div className="space-y-4 text-xs">
                {/* Event & Ceremony Summary */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-black text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>{isMl ? 'ചടങ്ങുകളും ഫോട്ടോ/വീഡിയോ ക്രൂ ടീമും' : 'Ceremonies & Allocated Crews'}</span>
                  </h4>

                  {/* Groom Side */}
                  <div className="mb-3">
                    <span className="font-extrabold text-amber-900 block mb-1">
                      🤵 Groom Side Events:
                    </span>
                    <div className="space-y-1.5">
                      {KERALA_EVENTS.filter((e) => groomEvts?.[e.id]?.enabled).map((evt) => {
                        const cfg = groomEvts?.[evt.id];
                        return (
                          <div key={evt.id} className="p-2.5 bg-white rounded-xl border border-stone-200">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900">{evt.nameEn} ({evt.nameMl})</span>
                              {cfg?.date && <span className="text-[10px] text-stone-400 font-mono">{cfg.date}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[10px] mt-1 text-stone-600">
                              {cfg?.traditionalPhotographers ? <span>📸 {cfg.traditionalPhotographers} Trad Photo</span> : null}
                              {cfg?.traditionalVideographers ? <span>📹 {cfg.traditionalVideographers} Trad Video</span> : null}
                              {cfg?.candidPhotographers ? <span>✨ {cfg.candidPhotographers} Candid Photo</span> : null}
                              {cfg?.candidVideographers ? <span>🎬 {cfg.candidVideographers} Cinematic Video</span> : null}
                              {cfg?.drone ? <span>🛸 4K Drone</span> : null}
                              {cfg?.youtubeLive ? <span>🔴 YouTube Live</span> : null}
                              {cfg?.auditoriumLive ? <span>📺 Hall Live Display</span> : null}
                              {cfg?.photoLivePrinting ? <span>🖨️ Live Printing</span> : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bride Side */}
                  {brideEvts && Object.values(brideEvts).some((e) => (e as any)?.enabled) && (
                    <div>
                      <span className="font-extrabold text-rose-900 block mb-1">
                        👰 Bride Side Events:
                      </span>
                      <div className="space-y-1.5">
                        {KERALA_EVENTS.filter((e) => brideEvts?.[e.id]?.enabled).map((evt) => {
                          const cfg = brideEvts?.[evt.id];
                          return (
                            <div key={evt.id} className="p-2.5 bg-white rounded-xl border border-stone-200">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-stone-900">{evt.nameEn} ({evt.nameMl})</span>
                                {cfg?.date && <span className="text-[10px] text-stone-400 font-mono">{cfg.date}</span>}
                              </div>
                              <div className="flex flex-wrap gap-1.5 text-[10px] mt-1 text-stone-600">
                                {cfg?.traditionalPhotographers ? <span>📸 {cfg.traditionalPhotographers} Trad Photo</span> : null}
                                {cfg?.traditionalVideographers ? <span>📹 {cfg.traditionalVideographers} Trad Video</span> : null}
                                {cfg?.candidPhotographers ? <span>✨ {cfg.candidPhotographers} Candid Photo</span> : null}
                                {cfg?.candidVideographers ? <span>🎬 {cfg.candidVideographers} Cinematic Video</span> : null}
                                {cfg?.drone ? <span>🛸 4K Drone</span> : null}
                                {cfg?.youtubeLive ? <span>🔴 YouTube Live</span> : null}
                                {cfg?.auditoriumLive ? <span>📺 Hall Live Display</span> : null}
                                {cfg?.photoLivePrinting ? <span>🖨️ Live Printing</span> : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Deliverables Summary */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-black text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-amber-600" />
                    <span>{isMl ? 'ഡെലിവറബിളുകളും ആൽബങ്ങളും' : 'Deliverables & Keepsakes'}</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Video Output</span>
                      <span className="font-bold text-stone-900">
                        {deliv.videoQuality === '4k' ? '4K Ultra HD Cinema' : 'Full HD (1080p)'}
                      </span>
                      <div className="text-[11px] text-stone-600 mt-1">
                        {deliv.fullLengthVideo ? 'Full Film • ' : ''}
                        {deliv.highlightVideo ? '3-5 min Highlight • ' : ''}
                        {deliv.teaserVideo ? 'Teaser Promo • ' : ''}
                        {deliv.reelsCount ? `${deliv.reelsCount} Viral Reels` : ''}
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Master Albums</span>
                      <span className="font-bold text-stone-900">
                        {deliv.mainAlbumsCount || 1} Albums ({deliv.mainAlbumSheets || 35} Sheets)
                      </span>
                      <p className="text-[11px] text-stone-600 mt-0.5 capitalize">
                        Cover: {(() => {
                          const t = deliv.albumPaperType;
                          if (typeof t !== 'string') return 'Glass Cover';
                          if (t === 'normal') return 'Normal Cover';
                          if (t === 'premium') return 'Premium Cover';
                          if (t === 'extra_premium') return 'Extra Premium Cover';
                          if (t === 'leather') return 'Leather Cover';
                          if (t === 'glass' || t === 'acrylic_cover') return 'Glass Cover';
                          if (t === 'full_glass' || t === 'velvet_box') return 'Full Glass Cover';
                          return t.replace(/_/g, ' ') + ' Cover';
                        })()}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Preset Photo Frames</span>
                      <p className="text-[11px] text-stone-700 font-bold">
                        {deliv.frames_18x12 ? `18x12 Master Frame (${deliv.frames_18x12})  ` : ''}
                        {deliv.frames_8x12 ? `8x12 Wall Frames (${deliv.frames_8x12})  ` : ''}
                        {deliv.frames_15x20 ? `15x20 Master Canvas (${deliv.frames_15x20})` : ''}
                        {!deliv.frames_18x12 && !deliv.frames_8x12 && !deliv.frames_15x20 ? '18x12 Master Frame (1)' : ''}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-stone-200">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Media & Add-ons</span>
                      <p className="text-[11px] text-stone-700 font-bold">
                        {deliv.penDriveCount ? `USB Pen Drives: ${deliv.penDriveCount}  ` : 'USB Pen Drive: 1  '}
                        {deliv.penDriveBoxCount ? `Wooden Boxes: ${deliv.penDriveBoxCount}  ` : ''}
                        {deliv.miniAlbumsCount ? `Mini Albums: ${deliv.miniAlbumsCount}  ` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Selected Services if any */}
                {selectedLead.selectedServices && selectedLead.selectedServices.length > 0 && (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                    <h4 className="font-black text-stone-900 text-sm mb-2 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <span>{isMl ? 'അഡീഷണൽ സർവീസുകൾ' : 'Additional Selected Services'}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedLead.selectedServices.map((srv, sIdx) => (
                        <div key={sIdx} className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <span className="font-bold text-stone-900">{srv.title}</span>
                          <span className="font-black text-amber-900">₹{(srv.price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
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
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        (Base: ₹{basePrice.toLocaleString('en-IN')} + GST 18%: ₹{gstPrice.toLocaleString('en-IN')})
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
                      <span className="text-[10px] text-stone-400 font-bold block">1. Advance Booking (25%)</span>
                      <span className="font-extrabold text-amber-300">
                        ₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700">
                      <span className="text-[10px] text-stone-400 font-bold block">2. On Wedding Shoot (50%)</span>
                      <span className="font-extrabold text-amber-300">
                        ₹{Math.round(grandTotal * 0.50).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="bg-stone-800/80 p-2.5 rounded-xl border border-stone-700">
                      <span className="text-[10px] text-stone-400 font-bold block">3. Final Delivery (25%)</span>
                      <span className="font-extrabold text-amber-300">
                        ₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* PDF Quotation Preview Modal from Admin (also mounts in background when WhatsApp modal is active for identical Master PDF capture) */}
      {selectedLead && (isPdfModalOpen || isWhatsAppModalOpen) && (
        <PdfQuotationView
          isOpen={isPdfModalOpen}
          isBackgroundRenderer={!isPdfModalOpen && isWhatsAppModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            if (!isPlanModalOpen) {
              setSelectedLead(null);
            }
          }}
          lead={selectedLead}
          side={selectedLead.side || 'both'}
          calculation={{
            totalPrice: Number(selectedLead.totalPrice) || 95000,
            items: [],
            eventTotals: {},
            deliverablesTotal: 0,
            groomCrewTotal: 0,
            brideCrewTotal: 0,
            photographyTotal: Number(selectedLead.totalPrice) || 95000,
            otherServicesTotal: 0,
          }}
          studioContact={studioContact}
          language={language}
          groomEvents={resolvePlanForLead(selectedLead).groomEvents}
          brideEvents={resolvePlanForLead(selectedLead).brideEvents}
          deliverables={resolvePlanForLead(selectedLead).deliverables}
          studioUser={selectedLead.studioBranding || undefined}
          selectedServices={selectedLead.selectedServices || []}
        />
      )}

      {/* WhatsApp Share Modal with PDF Attachment from Admin */}
      {selectedLead && isWhatsAppModalOpen && (
        <WhatsAppShareModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => {
            setIsWhatsAppModalOpen(false);
            if (!isPlanModalOpen) {
              setSelectedLead(null);
            }
          }}
          lead={selectedLead}
          calculation={{
            totalPrice: Number(selectedLead.totalPrice) || 95000,
            items: [],
            eventTotals: {},
            deliverablesTotal: 0,
            groomCrewTotal: 0,
            brideCrewTotal: 0,
            photographyTotal: Number(selectedLead.totalPrice) || 95000,
            otherServicesTotal: 0,
          }}
          userRole="studio"
          studioContact={studioContact}
          onDownloadPdf={() => setIsPdfModalOpen(true)}
          language={language}
        />
      )}
    </div>
  );
};
