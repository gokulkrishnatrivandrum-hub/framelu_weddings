export type SideSelection = 'groom' | 'bride' | 'both';

export type EventId = 
  | 'wedding_day'
  | 'reception'
  | 'mailanchi'
  | 'haldi'
  | 'madhuram_kodukkal'
  | 'save_the_date'
  | 'pre_wedding'
  | 'post_wedding';

export interface EventMetadata {
  id: EventId;
  nameEn: string;
  nameMl: string;
  descriptionEn: string;
  descriptionMl: string;
  icon: string;
}

export interface EventCrewConfig {
  enabled: boolean;
  venue?: string;
  date?: string;
  traditionalPhotographers: number;
  traditionalVideographers: number;
  candidPhotographers: number;
  candidVideographers: number;
  drone: boolean;
  youtubeLive: boolean;
  auditoriumLive: boolean;
  photoLivePrinting: boolean;
}

export interface CustomPrintItem {
  id: string;
  nameEn: string;
  nameMl: string;
  descriptionEn: string;
  descriptionMl: string;
  price: number;
  icon?: string;
  unitName?: string;
}

export interface DeliverablesConfig {
  videoQuality: '4k' | 'hd';
  fullLengthVideo: boolean;
  highlightVideo: boolean;
  teaserVideo: boolean;
  reelsCount: number;
  penDriveCount: number;
  penDriveBoxCount: number;
  mainAlbumsCount: number;
  mainAlbumSheets: number;
  albumPaperType: 'normal' | 'premium' | 'extra_premium' | 'leather' | 'glass' | 'full_glass' | string;
  frames_8x12: number;
  frames_18x12: number;
  frames_15x20: number;
  miniAlbumsCount: number;
  photoMugsCount: number;
  wallCalendarsCount: number;
  tableTopCalendarsCount: number;
  gradedPhotosCount: number;
  customPrintCounts?: Record<string, number>;
}

export interface AirlineReservation {
  id: string;
  airlineName: string; // e.g. "Air India Express", "IndiGo", "Emirates", "Air Arabia"
  flightNumber: string; // e.g. "IX 474", "6E 1402"
  tripType: 'one_way' | 'round_trip';
  departureCity: string; // e.g. "Dubai (DXB)", "Bangalore (BLR)", "Doha (DOH)"
  arrivalCity: string; // e.g. "Kochi (COK)", "Trivandrum (TRV)", "Calicut (CCJ)"
  departureDate: string; // e.g. "2026-12-15"
  departureTime?: string; // e.g. "14:30"
  returnFlightNumber?: string;
  returnDepartureDate?: string;
  returnDepartureTime?: string;
  pnrNumber: string; // Booking reference e.g. "PNR-78219"
  passengerCount: number;
  passengerNames: string[];
  cabinClass: 'economy' | 'business' | 'first';
  airportTransferRequired: boolean;
  cabPickupLocation?: string;
  status: 'Confirmed' | 'Ticket Issued' | 'Pending' | 'Cancelled';
  notes?: string;
  createdAt?: string;
}

export interface CustomerAccessRequest {
  id: string;
  title: string;
  titleMl: string;
  type: 'quotation_access' | 'extra_package_request' | 'airline_booking_assistance' | 'date_change' | 'general';
  requestedAt: string;
  status: 'Sent' | 'Under Review' | 'Approved' | 'Action Needed';
  notes?: string;
}

export interface CustomerUser {
  id?: string;
  userId?: string;
  username?: string;
  password?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  place: string;
  registeredAt?: string;
  verified?: boolean;
  verificationMethod?: 'phone' | 'email';
  airlineReservations?: AirlineReservation[];
  accessRequests?: CustomerAccessRequest[];
}

export interface SelectedOtherService {
  packageId: string;
  category: string;
  title: string;
  titleMl: string;
  price: number;
  customSelections?: string[];
  notes?: string;
  guestCount?: number;
  cardCount?: number;
  unitPrice?: number;
  date?: string;
  venue?: string;
  photoshootType?: PhotoshootType;
  sessionHours?: number;
  locationType?: string;
  photographers?: number;
  videographers?: number;
  reelsCount?: number;
  drone?: boolean;
}

export interface CustomerLead {
  id?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  place?: string;
  weddingDate: string;
  venueLocation?: string;
  notes?: string;
  createdAt?: string;
  lastEditedAt?: string;
  revisionsCount?: number;
  status?: 'New' | 'Contacted' | 'Quoted' | 'Booked' | 'Completed' | 'Access Sent' | 'Re-submitted' | 'Draft' | 'Confirmed' | 'Under Review' | 'Sent';
  totalPrice?: number;
  taxAmount?: number;
  grandTotal?: number;
  side?: SideSelection;
  groomEvents?: Record<EventId, EventCrewConfig>;
  brideEvents?: Record<EventId, EventCrewConfig>;
  deliverables?: DeliverablesConfig;
  selectedServices?: SelectedOtherService[];
  airlineReservations?: AirlineReservation[];
  accessRequests?: CustomerAccessRequest[];
  couponCode?: string;
  discountPercentage?: number;
  discountAmount?: number;
  grandTotalAfterDiscount?: number;
  studioBranding?: StudioUser;
  userEmail?: string;
  createdByEmail?: string;
  studioEmail?: string;
  userId?: string;
  userPhone?: string;
  createdByUserId?: string;
  createdByPhone?: string;
  createdByRole?: 'studio' | 'customer';
  source?: 'studio' | 'customer';
  createdBy?: 'studio' | 'customer';
  leadType?: 'wedding' | 'standalone_photoshoot' | 'other_services';
  photoshootType?: string;
  photoshootDetails?: {
    type?: string;
    titleEn?: string;
    titleMl?: string;
    title?: string;
    imageUrl?: string;
    badge?: string;
    tag?: string;
    sessionHours?: number;
    hours?: number;
    locationType?: string;
    venue?: string;
    venueLocation?: string;
    date?: string;
    crew?: any;
    deliverables?: any;
    featuresMl?: string[];
    featuresEn?: string[];
    features?: string[];
    priceBreakdown?: Array<{
      title: string;
      titleMl?: string;
      amount: number;
    }>;
    basePrice?: number;
    totalPrice?: number;
    [key: string]: any;
  };
}

export interface PriceRates {
  // Crew rates per event (Daily)
  traditionalPhotographer: number;
  traditionalVideographer: number;
  candidPhotographer: number;
  candidVideographer: number;
  dronePerEvent: number;
  youtubeLivePerEvent: number;
  auditoriumLivePerEvent: number;
  photoLivePrintingPerEvent: number;

  // Video resolution multiplier/addition
  resolution4kAddon: number;
  fullLengthVideo: number;
  highlightVideo: number;
  teaserVideo: number;
  reelRate: number;

  // Media & Packaging
  penDriveRate: number;
  penDriveBoxRate: number;

  // Main Album
  baseAlbumRate: number; // Includes base 30 sheets
  extraSheetRate: number; // Per sheet above 30
  albumFinishes: {
    normal: number;
    premium: number;
    extra_premium: number;
    leather: number;
    glass: number;
    full_glass: number;
    // Optional backwards compatibility keys
    matt?: number;
    glossy?: number;
    metallic?: number;
    feather_touch?: number;
    acrylic_cover?: number;
    velvet_box?: number;
    canvas_matte?: number;
    [key: string]: number | undefined;
  };

  // Preset Photo Frames
  frame_8x12: number;
  frame_18x12: number;
  frame_15x20: number;

  // Print Add-ons (paid)
  miniAlbumRate: number;
  photoMugRate: number;
  wallCalendarRate: number;
  tableTopCalendarRate: number;
  photoGradingRate: number;
  glassCalendarRate?: number;
  monthlyCalendarRate?: number;
}

export interface SocialMediaHandle {
  platform: 'instagram' | 'facebook' | 'youtube' | 'whatsapp' | 'pinterest' | 'website' | string;
  url: string;
  label?: string;
}

export interface StudioContactConfig {
  phone: string;
  whatsapp: string;
  destination: string;
  email: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  socialLinks?: SocialMediaHandle[];
}

export interface GalleryProject {
  id: string;
  title: string;
  titleMl: string;
  category: string; // 'photography' | 'food_catering' | 'event_planning' | 'makeup' | 'luxury_cars' | 'invitations' | string
  clientName: string; // e.g. "Rahul & Anjali"
  venueLocation: string; // e.g. "Lulu Bolgatty Grand Ballroom, Kochi"
  eventDate?: string;
  coverImage: string;
  galleryImages?: string[];
  description?: string;
  descriptionMl?: string;
  clientReview?: {
    reviewerName: string;
    rating: number; // 1 to 5 stars
    comment: string;
    commentMl?: string;
    date?: string;
  };
  featured?: boolean;
}

export interface PromoOffer {
  id: string;
  title: string;
  titleMl: string;
  badge: string;
  description: string;
  descriptionMl?: string;
  validTill: string;
  posterUrl: string;
  discountNote?: string;
  active: boolean;
}

export interface HighlightBoard {
  id: string;
  title: string;
  titleMl: string;
  tag: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  bannerUrl?: string;
  presetConfig?: {
    side?: SideSelection;
    events?: {
      weddingDayCrew?: { tradPhoto?: number; tradVideo?: number; candidPhoto?: number; candidVideo?: number; drone?: boolean };
      receptionCrew?: { tradPhoto?: number; tradVideo?: number; candidPhoto?: number; candidVideo?: number; drone?: boolean };
    };
    deliverables?: {
      videoQuality?: 'hd' | '4k';
      mainAlbums?: number;
      mainSheets?: number;
      albumCover?: string;
      highlightVideo?: boolean;
      teaserVideo?: boolean;
      reels?: number;
    };
  };
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameMl: string;
  description?: string;
  descriptionMl?: string;
  imageUrl: string;
  badge?: string;
}

export interface OtherServicePackage {
  id: string;
  category: 'food_catering' | 'event_planning' | 'makeup' | 'dress' | 'invitations' | 'luxury_cars' | 'honeymoon' | string;
  title: string;
  titleMl: string;
  description: string;
  descriptionMl?: string;
  price: number;
  features: string[];
  imageUrl: string;
  badge?: string;
  pricingType?: 'fixed' | 'per_guest' | 'per_card';
  baseGuestCount?: number;
  baseCardCount?: number;
  pricePerUnit?: number;
  customOptions?: Array<{
    id: string;
    label: string;
    labelMl?: string;
    price?: number;
  }>;
}

export type PhotoshootType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'baby_shower'
  | 'baby_photoshoot'
  | 'newborn_baby'
  | 'model_photoshoot'
  | string;

export interface PhotoshootConfig {
  id?: string;
  type: PhotoshootType;
  titleEn: string;
  titleMl: string;
  title?: string;
  tagMl?: string;
  tagEn?: string;
  tag?: string;
  descriptionEn?: string;
  descriptionMl?: string;
  description?: string;
  basePrice: number;
  price?: number;
  imageUrl?: string;
  badge?: string;
  sessionHours?: number;
  hours?: number;
  locationType?: 'studio' | 'home' | 'outdoor' | 'event_hall' | string;
  crew?: {
    photographers?: number;
    videographers?: number;
    reelCreator?: boolean;
    reelsCount?: number;
    drone?: boolean;
  };
  deliverables?: {
    editedPhotosCount?: number;
    gradedPhotosCount?: number;
    teaserVideo?: boolean;
    fullLengthVideo?: boolean;
    videoQuality?: '4k' | 'hd';
    albumIncluded?: boolean;
    albumSheets?: number;
    framesCount?: number;
    frameSize?: string;
    penDrive?: boolean;
    mainAlbumsCount?: number;
    mainAlbumSheets?: number;
    albumPaperType?: string;
    frames_8x12?: number;
    frames_18x12?: number;
    frames_15x20?: number;
    penDriveCount?: number;
    penDriveBoxCount?: number;
    miniAlbumsCount?: number;
    reelsCount?: number;
  };
  featuresMl?: string[];
  featuresEn?: string[];
  features?: string[];
  active?: boolean;
}

export interface CouponCode {
  id: string;
  code: string;
  discountPercentage: number;
  description: string;
  descriptionMl?: string;
  minAmount?: number;
  active: boolean;
  validTill?: string;
  createdAt?: string;
  isPublic?: boolean;
}

export interface StudioUser {
  id?: string;
  studioName: string;
  ownerName?: string;
  phone: string;
  email: string;
  address: string;
  place: string;
  registeredAt?: string;
  verified?: boolean;
  verificationMethod?: 'phone' | 'email';
}

export interface AppUserSession {
  role: 'customer' | 'studio';
  name: string;
  userId: string;
  phone: string;
  email?: string;
  studioName?: string;
  address?: string;
  place?: string;
  photoURL?: string;
  loggedInAt?: string;
}

