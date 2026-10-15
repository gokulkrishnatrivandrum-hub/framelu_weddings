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
  customPrintCounts?: Record<string, number>;
}

export interface CustomerUser {
  name: string;
  phone: string;
  email: string;
  address: string;
  place: string;
  registeredAt?: string;
  verified?: boolean;
  verificationMethod?: 'phone' | 'email';
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
  status?: 'New' | 'Contacted' | 'Quoted' | 'Booked' | 'Completed';
  totalPrice?: number;
  taxAmount?: number;
  grandTotal?: number;
  side?: SideSelection;
  groomEvents?: Record<EventId, EventCrewConfig>;
  brideEvents?: Record<EventId, EventCrewConfig>;
  deliverables?: DeliverablesConfig;
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
  glassCalendarRate?: number;
  monthlyCalendarRate?: number;
}

export interface StudioContactConfig {
  phone: string;
  whatsapp: string;
  destination: string;
  email: string;
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
}

export interface OtherServicePackage {
  id: string;
  category: 'event_planning' | 'makeup' | 'dress' | 'invitations' | 'luxury_cars' | 'honeymoon';
  title: string;
  titleMl: string;
  description: string;
  price: number;
  features: string[];
  imageUrl: string;
  badge?: string;
}
