'use client';

import React, { useState, useEffect } from 'react';
import {
  PhotoshootType,
  PhotoshootConfig,
  StudioContactConfig,
  SelectedOtherService,
  PriceRates,
} from '@/types';
import { DEFAULT_PHOTOSHOOTS } from '@/constants/defaults';
import {
  Camera,
  Video,
  Film,
  Sparkles,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  BookOpen,
  Frame,
  HardDrive,
  Share2,
  FileText,
  ArrowRight,
  Sliders,
  Heart,
  Baby,
  Cake,
  GlassWater,
  Shirt,
  UserCheck,
  Gift,
  Minus,
  Check,
  Clapperboard,
  RotateCcw,
} from 'lucide-react';

interface PhotoshootSectionProps {
  language?: 'en' | 'ml';
  selectedPhotoshoot: PhotoshootType;
  onSelectPhotoshoot: (type: PhotoshootType) => void;
  onAddAsAddon?: (service: SelectedOtherService) => void;
  onRemoveAddon?: (packageId: string) => void;
  isAddonSelected?: (packageId: string) => boolean;
  onBackToWedding?: () => void;
  onInstantStandaloneQuote?: (shootSummary: {
    title: string;
    price: number;
    notes: string;
    leadType?: 'standalone_photoshoot';
    photoshootType?: string;
    photoshootDetails?: any;
  }) => void;
  studioContact?: StudioContactConfig;
  photoshoots?: PhotoshootConfig[];
  rates?: PriceRates;
  initialDate?: string;
}

export const PhotoshootSection: React.FC<PhotoshootSectionProps> = ({
  language = 'ml',
  selectedPhotoshoot,
  onSelectPhotoshoot,
  onAddAsAddon,
  onRemoveAddon,
  isAddonSelected,
  onBackToWedding,
  onInstantStandaloneQuote,
  studioContact = { phone: '+91 6238747722', whatsapp: '916238747722' } as StudioContactConfig,
  photoshoots,
  rates,
  initialDate,
}) => {
  const isMl = language === 'ml';

  // Build merged photoshoot list: combines defaults with custom ones added by admin
  const photoshootMap: Record<string, PhotoshootConfig> = { ...DEFAULT_PHOTOSHOOTS };
  if (photoshoots && Array.isArray(photoshoots)) {
    photoshoots.forEach((ps) => {
      if (ps && ps.type) {
        photoshootMap[ps.type] = ps;
      }
    });
  }

  // Active configuration for selected shoot
  const activeConfig: PhotoshootConfig =
    photoshootMap[selectedPhotoshoot] || DEFAULT_PHOTOSHOOTS.wedding;
  const packageId = `photoshoot_${selectedPhotoshoot}`;
  const isAlreadyAddon = isAddonSelected ? isAddonSelected(packageId) : false;

  // State for customizing photoshoot
  const [customSessionHours, setCustomSessionHours] = useState<number>(activeConfig.sessionHours || 4);
  const [customLocationType, setCustomLocationType] = useState<string>(activeConfig.locationType || 'studio');
  const [customVenue, setCustomVenue] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>(initialDate || '');

  useEffect(() => {
    if (initialDate) {
      setCustomDate(initialDate);
    }
  }, [initialDate]);

  // Crew state
  const [customPhotographers, setCustomPhotographers] = useState<number>(activeConfig.crew?.photographers || 1);
  const [customVideographers, setCustomVideographers] = useState<number>(activeConfig.crew?.videographers || 0);
  const [customReelsCount, setCustomReelsCount] = useState<number>(
    activeConfig.crew?.reelsCount ?? (activeConfig.crew?.reelCreator ? 1 : 0)
  );
  const [customDrone, setCustomDrone] = useState<boolean>(activeConfig.crew?.drone ?? false);

  // Deliverables state (incorporating wedding section deliverables)
  const [customVideoQuality, setCustomVideoQuality] = useState<'4k' | 'hd'>(
    activeConfig.deliverables?.videoQuality || 'hd'
  );
  const [customTeaserVideo, setCustomTeaserVideo] = useState<boolean>(
    activeConfig.deliverables?.teaserVideo ?? true
  );
  const [customFullLengthVideo, setCustomFullLengthVideo] = useState<boolean>(
    activeConfig.deliverables?.fullLengthVideo ?? false
  );
  // Requirement 2: Number of Photo Graded (ഗ്രേഡ് ചെയ്യുന്ന ഫോട്ടോകളുടെ എണ്ണം)
  const [customGradedPhotosCount, setCustomGradedPhotosCount] = useState<number>(
    activeConfig.deliverables?.gradedPhotosCount ?? activeConfig.deliverables?.editedPhotosCount ?? 40
  );
  const [customAlbum, setCustomAlbum] = useState<boolean>(
    activeConfig.deliverables?.albumIncluded ?? false
  );
  const [customAlbumSheets, setCustomAlbumSheets] = useState<number>(
    activeConfig.deliverables?.albumSheets || 15
  );
  const [customAlbumCover, setCustomAlbumCover] = useState<string>('normal');
  const [customFrames8x12, setCustomFrames8x12] = useState<number>(
    activeConfig.deliverables?.framesCount || 1
  );
  const [customFrames12x18, setCustomFrames12x18] = useState<number>(0);
  const [customFrames15x20, setCustomFrames15x20] = useState<number>(0);
  const [customPenDrive, setCustomPenDrive] = useState<boolean>(
    activeConfig.deliverables?.penDrive ?? true
  );
  const [customPenDriveBox, setCustomPenDriveBox] = useState<boolean>(false);

  // When changing active photoshoot, sync local state to that photoshoot's defaults
  const handleSelectShootType = (type: PhotoshootType) => {
    if (type === 'wedding') {
      if (onBackToWedding) {
        onBackToWedding();
      }
      onSelectPhotoshoot('wedding');
      if (typeof document !== 'undefined') {
        const el = document.getElementById('wedding-customizer-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    onSelectPhotoshoot(type);
    const cfg = photoshootMap[type] || DEFAULT_PHOTOSHOOTS[type] || DEFAULT_PHOTOSHOOTS.birthday;
    setCustomSessionHours(cfg.sessionHours || 3);
      setCustomLocationType(cfg.locationType || 'studio');
      setCustomPhotographers(cfg.crew?.photographers || 1);
      setCustomVideographers(cfg.crew?.videographers || 0);
      setCustomReelsCount(cfg.crew?.reelsCount ?? (cfg.crew?.reelCreator ? 1 : 0));
      setCustomDrone(cfg.crew?.drone ?? false);
      setCustomVideoQuality(cfg.deliverables?.videoQuality || 'hd');
      setCustomTeaserVideo(cfg.deliverables?.teaserVideo ?? false);
      setCustomFullLengthVideo(cfg.deliverables?.fullLengthVideo ?? false);
      setCustomGradedPhotosCount(
        cfg.deliverables?.gradedPhotosCount ?? cfg.deliverables?.editedPhotosCount ?? 40
      );
      setCustomAlbum(cfg.deliverables?.albumIncluded ?? false);
      setCustomAlbumSheets(cfg.deliverables?.albumSheets || 15);
      setCustomAlbumCover('normal');
      setCustomFrames8x12(cfg.deliverables?.framesCount || 1);
      setCustomFrames12x18(0);
      setCustomFrames15x20(0);
      setCustomPenDrive(cfg.deliverables?.penDrive ?? true);
      setCustomPenDriveBox(false);
  };

  // Calculate live price for photoshoot customizer
  const calculateShootLivePrice = (): number => {
    if (selectedPhotoshoot === 'wedding') return activeConfig.basePrice;

    let total = activeConfig.basePrice;

    // 1. Session hours adjustment
    const baseHours = activeConfig.sessionHours || 3;
    if (customSessionHours > baseHours) {
      total += (customSessionHours - baseHours) * 1500;
    } else if (customSessionHours < baseHours) {
      total -= Math.min(2000, (baseHours - customSessionHours) * 1000);
    }

    // 2. Photographers adjustment
    const basePhoto = activeConfig.crew?.photographers || 1;
    if (customPhotographers > basePhoto) {
      total += (customPhotographers - basePhoto) * 4500;
    } else if (customPhotographers < basePhoto) {
      total -= (basePhoto - customPhotographers) * 3500;
    }

    // 3. Videographers adjustment (Ensures videography adding/removing updates price accurately)
    const baseVideo = activeConfig.crew?.videographers || 0;
    if (customVideographers > baseVideo) {
      total += (customVideographers - baseVideo) * 5500;
    } else if (customVideographers < baseVideo) {
      total -= (baseVideo - customVideographers) * 4500;
    }

    // 4. Reels count adjustment (Reels count feature)
    const baseReels = activeConfig.crew?.reelsCount ?? (activeConfig.crew?.reelCreator ? 1 : 0);
    if (customReelsCount > baseReels) {
      total += (customReelsCount - baseReels) * 2000;
    } else if (customReelsCount < baseReels) {
      total -= (baseReels - customReelsCount) * 1500;
    }

    // 5. Drone Aerial
    const baseDrone = !!activeConfig.crew?.drone;
    if (customDrone && !baseDrone) {
      total += 4500;
    } else if (!customDrone && baseDrone) {
      total -= 3500;
    }

    // 6. Video Quality 4K Ultra HD
    if (customVideoQuality === '4k') {
      total += 3500;
    }

    // 7. Video Deliverables (Teaser / Full Length)
    const baseTeaser = !!activeConfig.deliverables?.teaserVideo;
    if (customTeaserVideo && !baseTeaser) {
      total += 2500;
    } else if (!customTeaserVideo && baseTeaser) {
      total -= 1800;
    }

    if (customFullLengthVideo) {
      total += 4500;
    }

    // 8. Number of Photo Graded (Requirement 2)
    const gradingRate = rates?.photoGradingRate || 30;
    const baseGraded =
      activeConfig.deliverables?.gradedPhotosCount ?? activeConfig.deliverables?.editedPhotosCount ?? 40;
    if (customGradedPhotosCount > baseGraded) {
      total += (customGradedPhotosCount - baseGraded) * gradingRate;
    } else if (customGradedPhotosCount < baseGraded) {
      total -= (baseGraded - customGradedPhotosCount) * (gradingRate * 0.7);
    }

    // 9. Album & Sheets
    const baseAlbum = !!activeConfig.deliverables?.albumIncluded;
    if (customAlbum) {
      if (!baseAlbum) {
        total += 4500 + Math.max(0, customAlbumSheets - 15) * 150;
      } else {
        const baseSheets = activeConfig.deliverables?.albumSheets || 15;
        total += Math.max(0, customAlbumSheets - baseSheets) * 150;
      }
      if (customAlbumCover === 'premium') total += 1000;
      if (customAlbumCover === 'leather') total += 2000;
      if (customAlbumCover === 'glass') total += 3000;
    } else if (baseAlbum) {
      total -= 3500;
    }

    // 10. Frames
    total += customFrames8x12 * 750;
    total += customFrames12x18 * 1400;
    total += customFrames15x20 * 2200;

    // 11. Pen Drive & Box
    if (customPenDrive && !activeConfig.deliverables?.penDrive) {
      total += 950;
    }
    if (customPenDriveBox) {
      total += 1200;
    }

    return Math.max(4500, Math.round(total));
  };

  const currentShootPrice = calculateShootLivePrice();

  // Handle Add to Main Package
  const handleToggleAddon = () => {
    if (isAlreadyAddon) {
      if (onRemoveAddon) onRemoveAddon(packageId);
    } else {
      if (onAddAsAddon) {
        const selections = [
          `${customSessionHours} ${isMl ? 'മണിക്കൂർ ഷൂട്ട്' : 'Hours Shoot'} (${customLocationType})`,
          `${customPhotographers} ${isMl ? 'ഫോട്ടോഗ്രാഫർ' : 'Photographer'}`,
          customVideographers > 0 ? `${customVideographers} ${isMl ? 'വീഡിയോഗ്രാഫർ' : 'Videographer'}` : '',
          customReelsCount > 0 ? `${customReelsCount} ${isMl ? 'ഇൻസ്റ്റാഗ്രാം റീൽസ്' : 'Instagram Reels'}` : '',
          customDrone ? (isMl ? '4K ഡ്രോൺ ഷൂട്ട്' : '4K Drone Aerial') : '',
          customGradedPhotosCount > 0
            ? `${customGradedPhotosCount} ${isMl ? 'കളർ ഗ്രേഡഡ് ഫോട്ടോകൾ' : 'Color Graded Photos'}`
            : '',
          customAlbum ? `${customAlbumSheets} ${isMl ? 'ഷീറ്റ് ആൽബം' : 'Sheet Album'}` : '',
          customFrames8x12 > 0 ? `${customFrames8x12}x 8x12 ${isMl ? 'ഫ്രെയിം' : 'Frame'}` : '',
          customFrames12x18 > 0 ? `${customFrames12x18}x 12x18 ${isMl ? 'ഫ്രെയിം' : 'Frame'}` : '',
          customFrames15x20 > 0 ? `${customFrames15x20}x 15x20 ${isMl ? 'ഫ്രെയിം' : 'Frame'}` : '',
        ].filter(Boolean);

        onAddAsAddon({
          packageId,
          category: 'photoshoot',
          title: activeConfig.titleEn,
          titleMl: activeConfig.titleMl,
          price: currentShootPrice,
          customSelections: selections,
          unitPrice: currentShootPrice,
          date: customDate || initialDate || '',
          venue: customVenue || '',
          photoshootType: activeConfig.type,
          sessionHours: customSessionHours,
          locationType: customLocationType,
          photographers: customPhotographers,
          videographers: customVideographers,
          reelsCount: customReelsCount,
          drone: customDrone,
        });
      }
    }
  };

  // Standalone Quote Request (Requirement 2: Standalone Mode PDF generation support)
  const handleRequestStandaloneQuote = () => {
    if (onInstantStandaloneQuote) {
      const summaryText = `${activeConfig.titleMl || activeConfig.titleEn} - ${customSessionHours} Hours, Location: ${customLocationType}, Crew: ${customPhotographers} Photo + ${customVideographers} Video, Reels: ${customReelsCount}, Graded Photos: ${customGradedPhotosCount}, Album: ${customAlbum ? `${customAlbumSheets} sheets` : 'No'}, Frames: 8x12 (${customFrames8x12}), 12x18 (${customFrames12x18})`;

      const breakdown = [
        {
          title: `${activeConfig.titleEn} Base Package (${customSessionHours} Hours)`,
          titleMl: `${activeConfig.titleMl} അടിസ്ഥാന പാക്കേജ് (${customSessionHours} മണിക്കൂർ)`,
          amount: activeConfig.basePrice,
        },
        customVideographers > 0
          ? {
              title: `Videography Coverage (${customVideographers} Videographer)`,
              titleMl: `വീഡിയോഗ്രാഫി കവറേജ് (${customVideographers} വീഡിയോഗ്രാഫർ)`,
              amount: customVideographers * 5500,
            }
          : null,
        customReelsCount > 0
          ? {
              title: `Instagram Viral Reels (${customReelsCount} Reels)`,
              titleMl: `ഇൻസ്റ്റാഗ്രാം റീൽസ് (${customReelsCount} എണ്ണം)`,
              amount: customReelsCount * 2000,
            }
          : null,
        customDrone
          ? {
              title: '4K Drone Aerial Cinematography',
              titleMl: '4K ഏരിയൽ ഡ്രോൺ ഷൂട്ട്',
              amount: 4500,
            }
          : null,
        customGradedPhotosCount > 0
          ? {
              title: `Color Graded Photos (${customGradedPhotosCount} Photos)`,
              titleMl: `കളർ ഗ്രേഡഡ് ഫോട്ടോകൾ (${customGradedPhotosCount} എണ്ണം)`,
              amount: customGradedPhotosCount * (rates?.photoGradingRate || 30),
            }
          : null,
        customAlbum
          ? {
              title: `Photo Album (${customAlbumSheets} Sheets, ${customAlbumCover} Cover)`,
              titleMl: `ഫോട്ടോ ആൽബം (${customAlbumSheets} ഷീറ്റ്, ${customAlbumCover})`,
              amount: 4500 + Math.max(0, customAlbumSheets - 15) * 150,
            }
          : null,
        customFrames8x12 > 0
          ? {
              title: `8x12 Photo Frames (${customFrames8x12} Nos)`,
              titleMl: `8x12 ഫോട്ടോ ഫ്രെയിം (${customFrames8x12} എണ്ണം)`,
              amount: customFrames8x12 * 750,
            }
          : null,
        customFrames12x18 > 0
          ? {
              title: `12x18 Photo Frames (${customFrames12x18} Nos)`,
              titleMl: `12x18 ഫോട്ടോ ഫ്രെയിം (${customFrames12x18} എണ്ണം)`,
              amount: customFrames12x18 * 1400,
            }
          : null,
        customPenDrive
          ? {
              title: 'Master USB 3.0 High-Speed Drive',
              titleMl: 'മാസ്റ്റർ USB പെൻഡ്രൈവ്',
              amount: 950,
            }
          : null,
      ].filter(Boolean) as Array<{ title: string; titleMl?: string; amount: number }>;

      onInstantStandaloneQuote({
        title: isMl ? activeConfig.titleMl : activeConfig.titleEn,
        price: currentShootPrice,
        notes: summaryText,
        leadType: 'standalone_photoshoot',
        photoshootType: activeConfig.type,
        photoshootDetails: {
          type: activeConfig.type,
          titleEn: activeConfig.titleEn,
          titleMl: activeConfig.titleMl,
          imageUrl: activeConfig.imageUrl,
          badge: activeConfig.badge,
          sessionHours: customSessionHours,
          locationType: customLocationType,
          venue: customVenue,
          date: customDate,
          crew: {
            photographers: customPhotographers,
            videographers: customVideographers,
            reelsCount: customReelsCount,
            drone: customDrone,
          },
          deliverables: {
            videoQuality: customVideoQuality,
            teaserVideo: customTeaserVideo,
            fullLengthVideo: customFullLengthVideo,
            reelsCount: customReelsCount,
            gradedPhotosCount: customGradedPhotosCount,
            albumIncluded: customAlbum,
            albumSheets: customAlbumSheets,
            albumCover: customAlbumCover,
            frames8x12: customFrames8x12,
            frames12x18: customFrames12x18,
            frames15x20: customFrames15x20,
            penDrive: customPenDrive,
            penDriveBox: customPenDriveBox,
          },
          featuresMl: activeConfig.featuresMl || [],
          featuresEn: activeConfig.featuresEn || [],
          priceBreakdown: breakdown,
          basePrice: activeConfig.basePrice,
          totalPrice: currentShootPrice,
        },
      });
    }
  };

  // Helper for icons
  const getShootIcon = (type: string) => {
    switch (type) {
      case 'wedding':
        return Sparkles;
      case 'birthday':
        return Cake;
      case 'anniversary':
        return Heart;
      case 'baby_shower':
        return GlassWater;
      case 'baby_photoshoot':
        return Baby;
      case 'newborn_baby':
        return UserCheck;
      case 'model_photoshoot':
        return Shirt;
      default:
        return Camera;
    }
  };

  // List of all available photoshoot options for top category selector
  const shootList = Object.values(photoshootMap).filter((item) => item.active !== false);

  return (
    <section id="photoshoot-catalog-section" className="mb-10 animate-fade-in">
      {/* Top Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-800 border border-amber-300 mb-2">
            <Camera className="w-3.5 h-3.5 text-amber-600" />
            <span>{isMl ? 'ഫോട്ടോഷൂട്ട് വിഭാഗങ്ങൾ' : 'Photoshoot Categories'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            {isMl ? 'നിങ്ങൾക്ക് ആവശ്യമുള്ള ഫോട്ടോഷൂട്ട് തിരഞ്ഞെടുക്കാം' : 'Choose Your Desired Photoshoot'}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
            {isMl
              ? 'വിവാഹ ഫോട്ടോഗ്രാഫിക്ക് പുറമെ ബർത്ത്ഡേ, ന്യൂബോൺ, ബേബി ഷവർ, ആനിവേഴ്സറി, മോഡൽ ഷൂട്ടുകൾ എന്നിവ ആഡ്-ഓൺ ആയോ ഒറ്റയ്ക്കോ തിരഞ്ഞെടുത്ത് ഇൻസ്റ്റന്റ് കൊട്ടേഷൻ അറിയാം.'
              : 'Select Wedding Photography for comprehensive full-event customizer, or configure Birthday, Newborn, Baby Shower, Anniversary and Model shoots as standalone or add-ons.'}
          </p>
        </div>

        {selectedPhotoshoot !== 'wedding' && (
          <button
            type="button"
            onClick={() => handleSelectShootType('wedding')}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫിയിലേക്ക് മാറുക' : 'Switch to Wedding Customizer'}</span>
          </button>
        )}
      </div>

      {/* Photoshoot Cards Scrollable Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
        {shootList.map((item) => {
          const isSelected = selectedPhotoshoot === item.type;
          const Icon = getShootIcon(item.type);
          const isItemAddon = isAddonSelected ? isAddonSelected(`photoshoot_${item.type}`) : false;

          return (
            <div
              key={item.type}
              onClick={() => handleSelectShootType(item.type)}
              className={`group relative rounded-2xl p-2.5 sm:p-3 transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-50 to-white border-amber-500 ring-2 ring-amber-400 shadow-md scale-[1.02]'
                  : 'bg-white hover:bg-stone-50 border-stone-200'
              }`}
            >
              <div>
                {/* Photo Thumbnail */}
                <div className="relative h-24 sm:h-28 w-full rounded-xl overflow-hidden bg-stone-100 mb-2.5">
                  <img
                    src={item.imageUrl}
                    alt={item.titleEn}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                  {/* Top Badge */}
                  <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900/80 text-amber-300 backdrop-blur-xs">
                    {item.badge}
                  </span>

                  {/* Add-on Status Badge */}
                  {isItemAddon && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-emerald-600 text-white flex items-center gap-0.5 shadow-sm">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{isMl ? 'ആഡ്-ഓൺ' : 'Added'}</span>
                    </span>
                  )}
                </div>

                {/* Title & Tag */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 text-amber-700">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-wider line-clamp-1">
                      {isMl ? item.tagMl || item.tagEn : item.tagEn || item.type}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-stone-900 leading-tight line-clamp-1">
                    {isMl ? item.titleMl : item.titleEn}
                  </h4>
                </div>
              </div>

              {/* Price & Selection Indicator */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-stone-400 block font-medium">
                    {isMl ? 'ആരംഭം' : 'From'}
                  </span>
                  <span className="text-xs font-black text-amber-700">
                    ₹{item.basePrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-400 group-hover:bg-amber-100 group-hover:text-amber-800'
                  }`}
                >
                  {isSelected ? '✓' : '›'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE VIEW 1: WEDDING PHOTOGRAPHY (Links into the complete wedding customizer below) */}
      {selectedPhotoshoot === 'wedding' ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-stone-50 border border-amber-300 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-black text-stone-900">
                {isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫി മോഡ് സജീവം' : 'Wedding Photography Mode Active'}
              </h4>
              <p className="text-xs text-stone-600">
                {isMl
                  ? 'താഴെ കാണുന്ന സെക്ഷനുകളിൽ വരന്റെയും വധുവിന്റെയും വിവാഹ ചടങ്ങുകൾ, ആൽബങ്ങൾ, ഫ്രെയിമുകൾ എന്നിവ തത്സമയം മാറ്റങ്ങൾ വരുത്താം.'
                  : 'Customize Bride & Groom ceremonies, team crew, 4K video, albums and portrait frames in the full planner below.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold bg-white text-amber-900 border border-amber-200 px-3 py-1.5 rounded-full shadow-2xs shrink-0">
            {isMl ? 'സമ്പൂർണ്ണ വെഡ്ഡിംഗ് പ്ലാനർ' : 'Complete Wedding Planner'}
          </span>
        </div>
      ) : (
        /* ACTIVE VIEW 2: NON-WEDDING SPECIALIZED PHOTOSHOOT CUSTOMIZER */
        <div className="bg-white rounded-3xl border-2 border-amber-400 p-5 sm:p-8 shadow-lg animate-fade-in relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-400 to-amber-600" />

          {/* Photoshoot Banner Card */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-stone-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200 shadow-sm">
                <img
                  src={activeConfig.imageUrl}
                  alt={activeConfig.titleEn}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {activeConfig.badge}
                  </span>
                  <span className="text-xs font-bold text-stone-500">
                    {isMl ? activeConfig.tagMl || activeConfig.tagEn : activeConfig.tagEn}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                  {isMl ? activeConfig.titleMl : activeConfig.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl font-normal leading-relaxed">
                  {isMl ? activeConfig.descriptionMl : activeConfig.descriptionEn}
                </p>
              </div>
            </div>

            {/* Live Price Pill */}
            <div className="bg-stone-900 text-white p-4 rounded-2xl text-left sm:text-right shrink-0 shadow-md min-w-[200px]">
              <div className="flex flex-col sm:items-end">
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                  {isMl ? 'ഈ ഷൂട്ടിന്റെ എസ്റ്റിമേറ്റ്' : 'Estimated Shoot Price'}
                </span>
                <span className="text-2xl font-black text-white">
                  ₹{currentShootPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  {isMl ? 'ജി.എസ്.ടി ഉൾപ്പെടെ • ഫ്ലെക്സിബിൾ' : 'Includes GST • Transparent'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectShootType(selectedPhotoshoot)}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-bold transition cursor-pointer"
                  title={isMl ? 'പാക്കേജ് ഡിഫോൾട്ടിലേക്ക് റീസെറ്റ് ചെയ്യുക' : 'Reset to package defaults'}
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>{isMl ? 'പാക്കേജ് റീസെറ്റ് ചെയ്യുക' : 'Reset to Default'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Focused Customization Sections (Session, Crew, Deliverables) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
            {/* 1. Session Duration & Location */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200">
                <Clock className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {isMl ? '1. ഷൂട്ട് സമയം & ലൊക്കേഷൻ' : '1. Session & Location'}
                </h4>
              </div>

              <div className="space-y-3">
                {/* Duration */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isMl ? 'ഷൂട്ട് ദൈർഘ്യം' : 'Shoot Duration'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { hours: 2, label: isMl ? '2 മണിക്കൂർ' : '2 Hours' },
                      { hours: 4, label: isMl ? '4 മണിക്കൂർ' : '4 Hours (Half Day)' },
                      { hours: 8, label: isMl ? '8 മണിക്കൂർ' : '8 Hours (Full Day)' },
                    ].map((h) => (
                      <button
                        key={h.hours}
                        type="button"
                        onClick={() => setCustomSessionHours(h.hours)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border text-center ${
                          customSessionHours === h.hours
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location Type */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isMl ? 'ലൊക്കേഷൻ തരം' : 'Location Type'}
                  </label>
                  <select
                    value={customLocationType}
                    onChange={(e) => setCustomLocationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 bg-white"
                  >
                    <option value="studio">{isMl ? 'പ്രൊഫഷണൽ ഇൻഡോർ സ്റ്റുഡിയോ' : 'Professional Indoor Studio'}</option>
                    <option value="home">{isMl ? 'ഹോം വിസിറ്റ് (വീട്ടിൽ വെച്ച്)' : 'Home Visit (At Residence)'}</option>
                    <option value="outdoor">{isMl ? 'ഔട്ട്‌ഡോർ ലൊക്കേഷൻ / റിസോർട്ട്' : 'Outdoor Scenic / Resort'}</option>
                    <option value="event_hall">{isMl ? 'ഇവന്റ് ഹാൾ / ഓഡിറ്റോറിയം' : 'Banquet / Event Hall'}</option>
                  </select>
                </div>

                {/* Venue / Place */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isMl ? 'സ്ഥലം / ലൊക്കേഷൻ' : 'Venue / Place'}
                  </label>
                  <input
                    type="text"
                    placeholder={isMl ? 'ഉദാ: കായംകുളം, ആലപ്പുഴ' : 'e.g. Kayamkulam, Alappuzha'}
                    value={customVenue}
                    onChange={(e) => setCustomVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-white"
                  />
                </div>

                {/* Shoot Date */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    {isMl ? 'ഷൂട്ട് തീയതി' : 'Shoot Date'}
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-medium text-stone-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Photography Crew & Video Gear */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200">
                <Camera className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {isMl ? '2. ഫോട്ടോഗ്രാഫി ക്രൂ & ഗിയർ' : '2. Photography Crew & Gear'}
                </h4>
              </div>

              <div className="space-y-3">
                {/* Photographers count */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? 'ഫോട്ടോഗ്രാഫർ' : 'Photographers'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isMl ? 'പോർട്രെയിറ്റ് & കാൻഡിഡ്' : 'Portrait & Candid'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomPhotographers(Math.max(1, customPhotographers - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black w-4 text-center">{customPhotographers}</span>
                    <button
                      type="button"
                      onClick={() => setCustomPhotographers(Math.min(3, customPhotographers + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Videographers count */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? 'വീഡിയോഗ്രാഫർ' : 'Videographers'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isMl ? 'സിനിമാറ്റിക് 4K വീഡിയോ (+₹5,500)' : 'Cinematic 4K Video (+₹5,500)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomVideographers(Math.max(0, customVideographers - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black w-4 text-center">{customVideographers}</span>
                    <button
                      type="button"
                      onClick={() => setCustomVideographers(Math.min(3, customVideographers + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Reels Count (Requirement: Count selector instead of boolean) */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? 'ഇൻസ്റ്റാഗ്രാം റീൽസ്' : 'Instagram Reels'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isMl ? 'വെർട്ടിക്കൽ 9:16 ട്രെൻഡിംഗ് റീൽ' : 'Vertical 9:16 viral reel'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomReelsCount(Math.max(0, customReelsCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 font-bold text-xs"
                    >
                      -
                    </button>
                    <span className="text-xs font-black w-4 text-center">{customReelsCount}</span>
                    <button
                      type="button"
                      onClick={() => setCustomReelsCount(Math.min(5, customReelsCount + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-200 font-bold text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Drone shoot */}
                <label className="flex items-center justify-between cursor-pointer pt-1">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? '4K ഏരിയൽ ഡ്രോൺ' : '4K Drone Aerial'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isMl ? 'ഔട്ട്‌ഡോർ ഏരിയൽ ഷോട്ടുകൾ (+₹4,500)' : 'Outdoor aerial shots (+₹4,500)'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={customDrone}
                    onChange={(e) => setCustomDrone(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                  />
                </label>
              </div>
            </div>

            {/* 3. Deliverables & Keepsakes (Incorporating Wedding Deliverables + Graded Photos) */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200">
                <BookOpen className="w-4 h-4 text-amber-600" />
                <h4 className="text-xs font-black text-stone-900 uppercase tracking-wider">
                  {isMl ? '3. ഡെലിവറബിൾസ് & ഫ്രെയിംസ്' : '3. Deliverables & Keepsakes'}
                </h4>
              </div>

              <div className="space-y-3">
                {/* Number of Photo Graded (Requirement 2) */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-xs font-black text-stone-900 block">
                        {isMl ? 'നമ്പർ ഓഫ് ഫോട്ടോ ഗ്രേഡർ' : 'Color Graded Photos'}
                      </span>
                      <span className="text-[10px] text-amber-800 font-semibold">
                        ₹{(rates?.photoGradingRate || 30).toLocaleString('en-IN')}/{isMl ? 'ഫോട്ടോ' : 'photo'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCustomGradedPhotosCount(Math.max(10, customGradedPhotosCount - 10))
                        }
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-6 text-center">{customGradedPhotosCount}</span>
                      <button
                        type="button"
                        onClick={() => setCustomGradedPhotosCount(customGradedPhotosCount + 10)}
                        className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCustomGradedPhotosCount(preset)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition ${
                          customGradedPhotosCount === preset
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-stone-700 border-stone-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Video Quality (4K vs HD) */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? 'വീഡിയോ റെസല്യൂഷൻ' : 'Video Resolution'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {customVideoQuality === '4k' ? '4K Ultra HD (+₹3,500)' : 'Full HD 1080p'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setCustomVideoQuality('hd')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        customVideoQuality === 'hd' ? 'bg-amber-600 text-white' : 'text-stone-600'
                      }`}
                    >
                      HD
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomVideoQuality('4k')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        customVideoQuality === '4k' ? 'bg-amber-600 text-white' : 'text-stone-600'
                      }`}
                    >
                      4K
                    </button>
                  </div>
                </div>

                {/* Teaser Video */}
                <label className="flex items-center justify-between cursor-pointer pt-0.5">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? 'സിനിമാറ്റിക് ടീസർ (1-2 Min)' : 'Cinematic Teaser'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isMl ? 'മ്യൂസിക് ഹൈലൈറ്റ് ടീസർ' : '1-2 Mins Music Promo'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={customTeaserVideo}
                    onChange={(e) => setCustomTeaserVideo(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                  />
                </label>

                {/* Full Length Video */}
                <label className="flex items-center justify-between cursor-pointer pt-0.5">
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">
                      {isMl ? 'ഫുൾ ലെങ്ത് വീഡിയോ (+₹4,500)' : 'Full Length Film (+₹4,500)'}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {isMl ? 'സമ്പൂർണ്ണ എഡിറ്റഡ് ഫൂട്ടേജ്' : 'Complete edited footage'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={customFullLengthVideo}
                    onChange={(e) => setCustomFullLengthVideo(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                  />
                </label>

                {/* Album Toggle & Sheets */}
                <div className="pt-1 border-t border-stone-200/60">
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">
                        {isMl ? 'ഫോട്ടോ ആൽബം / ബുക്ക്' : 'Photo Album'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {customAlbum
                          ? `${customAlbumSheets} ${isMl ? 'ഷീറ്റുകൾ' : 'sheets'}`
                          : isMl
                          ? 'ആൽബം വേണ്ട'
                          : 'No album'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={customAlbum}
                      onChange={(e) => setCustomAlbum(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                  </div>

                  {customAlbum && (
                    <div className="space-y-1.5 mt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-stone-600">{isMl ? 'ഷീറ്റുകൾ:' : 'Sheets:'}</span>
                        {[15, 20, 30].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setCustomAlbumSheets(s)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              customAlbumSheets === s
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-stone-700 border-stone-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-stone-600">{isMl ? 'കവർ:' : 'Cover:'}</span>
                        <select
                          value={customAlbumCover}
                          onChange={(e) => setCustomAlbumCover(e.target.value)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-stone-200 bg-white"
                        >
                          <option value="normal">{isMl ? 'നോർമൽ കവർ' : 'Normal Cover'}</option>
                          <option value="premium">{isMl ? 'പ്രീമിയം കവർ (+₹1,000)' : 'Premium (+₹1,000)'}</option>
                          <option value="leather">{isMl ? 'ലെതർ കവർ (+₹2,000)' : 'Leather (+₹2,000)'}</option>
                          <option value="glass">{isMl ? 'അക്രിലിക് ഗ്ലാസ് (+₹3,000)' : 'Glass (+₹3,000)'}</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Frames (8x12, 12x18) */}
                <div className="space-y-2 pt-1 border-t border-stone-200/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">8x12 {isMl ? 'ഫ്രെയിം' : 'Frame'}</span>
                      <span className="text-[10px] text-stone-400">₹750 / {isMl ? 'എണ്ണം' : 'unit'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomFrames8x12(Math.max(0, customFrames8x12 - 1))}
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-4 text-center">{customFrames8x12}</span>
                      <button
                        type="button"
                        onClick={() => setCustomFrames8x12(customFrames8x12 + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">12x18 {isMl ? 'ഫ്രെയിം' : 'Frame'}</span>
                      <span className="text-[10px] text-stone-400">₹1,400 / {isMl ? 'എണ്ണം' : 'unit'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomFrames12x18(Math.max(0, customFrames12x18 - 1))}
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="text-xs font-black w-4 text-center">{customFrames12x18}</span>
                      <button
                        type="button"
                        onClick={() => setCustomFrames12x18(customFrames12x18 + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-stone-200 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Pen drive & Keepsake Box */}
                <div className="space-y-1.5 pt-1 border-t border-stone-200/60">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">
                        {isMl ? 'USB പെൻ ഡ്രൈവ്' : 'Master USB Drive'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {isMl ? 'ഒറിജിനൽ ഹൈ-റെസ് ഫോട്ടോകൾ' : 'High-speed 64GB USB drive'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={customPenDrive}
                      onChange={(e) => setCustomPenDrive(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-stone-800 block">
                        {isMl ? 'വുഡൻ പെൻഡ്രൈവ് ബോക്സ് (+₹1,200)' : 'Keepsake Box (+₹1,200)'}
                      </span>
                      <span className="text-[10px] text-stone-400">
                        {isMl ? 'പ്രീമിയം ഹാൻഡ്ക്രാഫ്റ്റഡ് ബോക്സ്' : 'Handcrafted wooden box'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={customPenDriveBox}
                      onChange={(e) => setCustomPenDriveBox(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features Bullet List */}
          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 mb-6">
            <h5 className="text-xs font-black text-amber-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{isMl ? 'ഈ ഫോട്ടോഷൂട്ടിൽ ലഭിക്കുന്ന പ്രത്യേകതകൾ:' : 'Included Package Highlights:'}</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-stone-700">
              {(isMl ? activeConfig.featuresMl || [] : activeConfig.featuresEn || []).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons: Add-on vs Standalone Quote vs Back to Wedding */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={() => handleSelectShootType('wedding')}
              className="px-4 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition active:scale-95 text-center"
            >
              ← {isMl ? 'വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫിയിലേക്ക് മടങ്ങുക' : 'Return to Wedding Customizer'}
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Standalone Quotation Button */}
              <button
                type="button"
                onClick={handleRequestStandaloneQuote}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{isMl ? 'ഇതിന്റെ മാത്രം കൊട്ടേഷൻ ചോദിക്കുക' : 'Get Standalone Quote'}</span>
              </button>

              {/* Add as Add-on to Wedding Package Button */}
              <button
                type="button"
                onClick={handleToggleAddon}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs shadow-md transition active:scale-95 cursor-pointer ${
                  isAlreadyAddon
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
                }`}
              >
                {isAlreadyAddon ? (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{isMl ? 'പാക്കേജിൽ നിന്ന് ഒഴിവാക്കുക' : 'Remove from Package'}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      {isMl
                        ? `വെഡ്ഡിംഗ് പാക്കേജിൽ ആഡ് ചെയ്യുക (+₹${currentShootPrice.toLocaleString('en-IN')})`
                        : `Add to Wedding Package (+₹${currentShootPrice.toLocaleString('en-IN')})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
