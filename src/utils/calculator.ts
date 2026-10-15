import { EventCrewConfig, DeliverablesConfig, PriceRates, SideSelection, EventId, CustomPrintItem, SelectedOtherService } from '@/types';
import { KERALA_EVENTS } from '@/constants/defaults';

export interface BreakdownItem {
  id: string;
  category: 'groom_crew' | 'bride_crew' | 'video' | 'album' | 'frames' | 'merch' | 'other_service' | string;
  title: string;
  titleMl: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  deletable?: boolean;
}

export interface CalculationResult {
  totalPrice: number;
  items: BreakdownItem[];
  eventTotals: Record<string, number>;
  deliverablesTotal: number;
  groomCrewTotal: number;
  brideCrewTotal: number;
  photographyTotal: number;
  otherServicesTotal: number;
  packageDiscount?: number;
  activePackageTitle?: string;
  activePackageTitleMl?: string;
}


export function calculateCustomQuote(
  side: SideSelection,
  groomEvents: Record<EventId, EventCrewConfig>,
  brideEvents: Record<EventId, EventCrewConfig>,
  deliverables: DeliverablesConfig,
  rates: PriceRates,
  customPrintItems?: CustomPrintItem[],
  selectedOtherServices?: SelectedOtherService[],
  packageDiscount?: number,
  activePackageTitle?: string,
  activePackageTitleMl?: string
): CalculationResult {
  const items: BreakdownItem[] = [];
  const eventTotals: Record<string, number> = {};
  let groomCrewTotal = 0;
  let brideCrewTotal = 0;
  let otherServicesTotal = 0;


  // 1. Groom Side Events
  if (side === 'groom' || side === 'both') {
    for (const evt of KERALA_EVENTS) {
      const cfg = groomEvents[evt.id];
      if (!cfg || !cfg.enabled) continue;

      let evtSum = 0;

      if (cfg.traditionalPhotographers > 0) {
        const cost = cfg.traditionalPhotographers * rates.traditionalPhotographer;
        evtSum += cost;
        items.push({
          id: `groom_${evt.id}_trad_photo`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Traditional Photographer`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - ട്രഡീഷണൽ ഫോട്ടോഗ്രാഫർ`,
          qty: cfg.traditionalPhotographers,
          unitPrice: rates.traditionalPhotographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.traditionalVideographers > 0) {
        const cost = cfg.traditionalVideographers * rates.traditionalVideographer;
        evtSum += cost;
        items.push({
          id: `groom_${evt.id}_trad_video`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Traditional Videographer`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - ട്രഡീഷണൽ വീഡിയോഗ്രാഫർ`,
          qty: cfg.traditionalVideographers,
          unitPrice: rates.traditionalVideographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.candidPhotographers > 0) {
        const cost = cfg.candidPhotographers * rates.candidPhotographer;
        evtSum += cost;
        items.push({
          id: `groom_${evt.id}_candid_photo`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Candid Photographer`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - കാൻഡിഡ് ഫോട്ടോഗ്രാഫർ`,
          qty: cfg.candidPhotographers,
          unitPrice: rates.candidPhotographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.candidVideographers > 0) {
        const cost = cfg.candidVideographers * rates.candidVideographer;
        evtSum += cost;
        items.push({
          id: `groom_${evt.id}_candid_video`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Candid Videographer (Cinematographer)`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - കാൻഡിഡ് വീഡിയോഗ്രാഫർ`,
          qty: cfg.candidVideographers,
          unitPrice: rates.candidVideographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.drone) {
        evtSum += rates.dronePerEvent;
        items.push({
          id: `groom_${evt.id}_drone`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Aerial Drone / Helicam`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - ഡ്രോൺ കവറേജ്`,
          qty: 1,
          unitPrice: rates.dronePerEvent,
          totalPrice: rates.dronePerEvent,
          deletable: true,
        });
      }

      if (cfg.youtubeLive) {
        evtSum += rates.youtubeLivePerEvent;
        items.push({
          id: `groom_${evt.id}_yt_live`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - YouTube Live Broadcast`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - യൂട്യൂബ് ലൈവ് സ്ട്രീമിംഗ്`,
          qty: 1,
          unitPrice: rates.youtubeLivePerEvent,
          totalPrice: rates.youtubeLivePerEvent,
          deletable: true,
        });
      }

      if (cfg.auditoriumLive) {
        evtSum += rates.auditoriumLivePerEvent;
        items.push({
          id: `groom_${evt.id}_hall_live`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Auditorium In-Hall Live Display`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - ഓഡിറ്റോറിയത്തിനകത്തെ ലൈവ് സ്ക്രീൻ ഡിസ്പ്ലേ`,
          qty: 1,
          unitPrice: rates.auditoriumLivePerEvent,
          totalPrice: rates.auditoriumLivePerEvent,
          deletable: true,
        });
      }

      if (cfg.photoLivePrinting) {
        evtSum += rates.photoLivePrintingPerEvent;
        items.push({
          id: `groom_${evt.id}_live_print`,
          category: 'groom_crew',
          title: `Groom Side: ${evt.nameEn} - Photo Live Instant Printing for Guests`,
          titleMl: `വരന്റെ ഭാഗം: ${evt.nameMl} - അതിഥികൾക്കുള്ള ലൈവ് ഫോട്ടോ പ്രിന്റിംഗ്`,
          qty: 1,
          unitPrice: rates.photoLivePrintingPerEvent,
          totalPrice: rates.photoLivePrintingPerEvent,
          deletable: true,
        });
      }

      eventTotals[`groom_${evt.id}`] = evtSum;
      groomCrewTotal += evtSum;
    }
  }

  // 2. Bride Side Events
  if (side === 'bride' || side === 'both') {
    for (const evt of KERALA_EVENTS) {
      const cfg = brideEvents[evt.id];
      if (!cfg || !cfg.enabled) continue;

      let evtSum = 0;

      if (cfg.traditionalPhotographers > 0) {
        const cost = cfg.traditionalPhotographers * rates.traditionalPhotographer;
        evtSum += cost;
        items.push({
          id: `bride_${evt.id}_trad_photo`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Traditional Photographer`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - ട്രഡീഷണൽ ഫോട്ടോഗ്രാഫർ`,
          qty: cfg.traditionalPhotographers,
          unitPrice: rates.traditionalPhotographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.traditionalVideographers > 0) {
        const cost = cfg.traditionalVideographers * rates.traditionalVideographer;
        evtSum += cost;
        items.push({
          id: `bride_${evt.id}_trad_video`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Traditional Videographer`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - ട്രഡീഷണൽ വീഡിയോഗ്രാഫർ`,
          qty: cfg.traditionalVideographers,
          unitPrice: rates.traditionalVideographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.candidPhotographers > 0) {
        const cost = cfg.candidPhotographers * rates.candidPhotographer;
        evtSum += cost;
        items.push({
          id: `bride_${evt.id}_candid_photo`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Candid Photographer`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - കാൻഡിഡ് ഫോട്ടോഗ്രാഫർ`,
          qty: cfg.candidPhotographers,
          unitPrice: rates.candidPhotographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.candidVideographers > 0) {
        const cost = cfg.candidVideographers * rates.candidVideographer;
        evtSum += cost;
        items.push({
          id: `bride_${evt.id}_candid_video`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Candid Videographer (Cinematographer)`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - കാൻഡിഡ് വീഡിയോഗ്രാഫർ`,
          qty: cfg.candidVideographers,
          unitPrice: rates.candidVideographer,
          totalPrice: cost,
          deletable: true,
        });
      }

      if (cfg.drone) {
        evtSum += rates.dronePerEvent;
        items.push({
          id: `bride_${evt.id}_drone`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Aerial Drone / Helicam`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - ഡ്രോൺ കവറേജ്`,
          qty: 1,
          unitPrice: rates.dronePerEvent,
          totalPrice: rates.dronePerEvent,
          deletable: true,
        });
      }

      if (cfg.youtubeLive) {
        evtSum += rates.youtubeLivePerEvent;
        items.push({
          id: `bride_${evt.id}_yt_live`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - YouTube Live Broadcast`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - യൂട്യൂബ് ലൈവ് സ്ട്രീമിംഗ്`,
          qty: 1,
          unitPrice: rates.youtubeLivePerEvent,
          totalPrice: rates.youtubeLivePerEvent,
          deletable: true,
        });
      }

      if (cfg.auditoriumLive) {
        evtSum += rates.auditoriumLivePerEvent;
        items.push({
          id: `bride_${evt.id}_hall_live`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Auditorium In-Hall Live Display`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - ഓഡിറ്റോറിയത്തിനകത്തെ ലൈവ് സ്ക്രീൻ ഡിസ്പ്ലേ`,
          qty: 1,
          unitPrice: rates.auditoriumLivePerEvent,
          totalPrice: rates.auditoriumLivePerEvent,
          deletable: true,
        });
      }

      if (cfg.photoLivePrinting) {
        evtSum += rates.photoLivePrintingPerEvent;
        items.push({
          id: `bride_${evt.id}_live_print`,
          category: 'bride_crew',
          title: `Bride Side: ${evt.nameEn} - Photo Live Instant Printing for Guests`,
          titleMl: `വധുവിന്റെ ഭാഗം: ${evt.nameMl} - അതിഥികൾക്കുള്ള ലൈവ് ഫോട്ടോ പ്രിന്റിംഗ്`,
          qty: 1,
          unitPrice: rates.photoLivePrintingPerEvent,
          totalPrice: rates.photoLivePrintingPerEvent,
          deletable: true,
        });
      }

      eventTotals[`bride_${evt.id}`] = evtSum;
      brideCrewTotal += evtSum;
    }
  }

  // 3. Deliverables & Outputs
  let deliverablesTotal = 0;

  // Video resolution
  if (deliverables.videoQuality === '4k') {
    deliverablesTotal += rates.resolution4kAddon;
    items.push({
      id: 'res_4k_upgrade',
      category: 'video',
      title: '4K Ultra HD Master Resolution Video Package',
      titleMl: '4K അൾട്രാ എച്ച്ഡി മാസ്റ്റർ വീഡിയോ ഔട്ട്പുട്ട്',
      qty: 1,
      unitPrice: rates.resolution4kAddon,
      totalPrice: rates.resolution4kAddon,
      deletable: true,
    });
  }

  if (deliverables.fullLengthVideo) {
    deliverablesTotal += rates.fullLengthVideo;
    items.push({
      id: 'full_video',
      category: 'video',
      title: 'Full Length Traditional Edited Wedding Film',
      titleMl: 'ഫുൾ ലെങ്ത് ട്രഡീഷണൽ എഡിറ്റഡ് വീഡിയോ',
      qty: 1,
      unitPrice: rates.fullLengthVideo,
      totalPrice: rates.fullLengthVideo,
      deletable: true,
    });
  }

  if (deliverables.highlightVideo) {
    deliverablesTotal += rates.highlightVideo;
    items.push({
      id: 'highlight_video',
      category: 'video',
      title: 'Cinematic 3-5 Min Wedding Highlight Reel',
      titleMl: 'സിനിമാറ്റിക് വെഡ്ഡിംഗ് ഹൈലൈറ്റ് വീഡിയോ (3-5 മിനിറ്റ്)',
      qty: 1,
      unitPrice: rates.highlightVideo,
      totalPrice: rates.highlightVideo,
      deletable: true,
    });
  }

  if (deliverables.teaserVideo) {
    deliverablesTotal += rates.teaserVideo;
    items.push({
      id: 'teaser_video',
      category: 'video',
      title: 'Cinematic 1-2 Min Wedding Teaser Promo',
      titleMl: 'സിനിമാറ്റിക് വെഡ്ഡിംഗ് ടീസർ വീഡിയോ (1-2 മിനിറ്റ്)',
      qty: 1,
      unitPrice: rates.teaserVideo,
      totalPrice: rates.teaserVideo,
      deletable: true,
    });
  }

  if (deliverables.reelsCount > 0) {
    const cost = deliverables.reelsCount * rates.reelRate;
    deliverablesTotal += cost;
    items.push({
      id: 'reels',
      category: 'video',
      title: `Social Media & Instagram Viral Reels (${deliverables.reelsCount})`,
      titleMl: `ഇൻസ്റ്റാഗ്രാം / സോഷ്യൽ മീഡിയ റീൽസ് (${deliverables.reelsCount} എണ്ണം)`,
      qty: deliverables.reelsCount,
      unitPrice: rates.reelRate,
      totalPrice: cost,
      deletable: true,
    });
  }

  // Color Graded Photos (Requirement 2)
  if (deliverables.gradedPhotosCount > 0) {
    const gradingRate = rates.photoGradingRate || 30;
    const cost = deliverables.gradedPhotosCount * gradingRate;
    deliverablesTotal += cost;
    items.push({
      id: 'graded_photos',
      category: 'merch',
      title: `Color Graded Professional Photos (${deliverables.gradedPhotosCount} Photos)`,
      titleMl: `കളർ ഗ്രേഡഡ് ഫോട്ടോകൾ (${deliverables.gradedPhotosCount} എണ്ണം)`,
      qty: deliverables.gradedPhotosCount,
      unitPrice: gradingRate,
      totalPrice: cost,
      deletable: true,
    });
  }

  // Media
  if (deliverables.penDriveCount > 0) {
    const cost = deliverables.penDriveCount * rates.penDriveRate;
    deliverablesTotal += cost;
    items.push({
      id: 'pendrive',
      category: 'merch',
      title: `Branded High-Speed USB 3.0 Pen Drive (${deliverables.penDriveCount})`,
      titleMl: `ഹൈ-സ്പീഡ് ബ്രാൻഡഡ് പെൻഡ്രൈവ് (${deliverables.penDriveCount} എണ്ണം)`,
      qty: deliverables.penDriveCount,
      unitPrice: rates.penDriveRate,
      totalPrice: cost,
      deletable: true,
    });
  }

  if (deliverables.penDriveBoxCount > 0) {
    const cost = deliverables.penDriveBoxCount * rates.penDriveBoxRate;
    deliverablesTotal += cost;
    items.push({
      id: 'pendrive_box',
      category: 'merch',
      title: `Handcrafted Wooden / Acrylic Pen Drive Box (${deliverables.penDriveBoxCount})`,
      titleMl: `പ്രീമിയം പെൻഡ്രൈവ് ബോക്സ് (${deliverables.penDriveBoxCount} എണ്ണം)`,
      qty: deliverables.penDriveBoxCount,
      unitPrice: rates.penDriveBoxRate,
      totalPrice: cost,
      deletable: true,
    });
  }

  // Albums
  if (deliverables.mainAlbumsCount > 0) {
    const extraSheets = Math.max(0, deliverables.mainAlbumSheets - 30);
    const finishPrice = rates.albumFinishes[deliverables.albumPaperType] || 0;
    const singleAlbumCost = rates.baseAlbumRate + (extraSheets * rates.extraSheetRate) + finishPrice;
    const totalAlbumCost = singleAlbumCost * deliverables.mainAlbumsCount;
    deliverablesTotal += totalAlbumCost;

    const finishNames: Record<string, { en: string; ml: string }> = {
      normal: { en: 'Normal Cover', ml: 'നോർമൽ കവർ' },
      premium: { en: 'Premium Cover', ml: 'പ്രീമിയം കവർ' },
      extra_premium: { en: 'Extra Premium Cover', ml: 'എക്സ്ട്രാ പ്രീമിയം കവർ' },
      leather: { en: 'Leather Cover', ml: 'ലെതർ കവർ' },
      glass: { en: 'Glass Cover', ml: 'ഗ്ലാസ് കവർ' },
      full_glass: { en: 'Full Glass Cover', ml: 'ഫുൾ ഗ്ലാസ് കവർ' },
      // legacy support
      matt: { en: 'Normal Cover', ml: 'നോർമൽ കവർ' },
      glossy: { en: 'Premium Cover', ml: 'പ്രീമിയം കവർ' },
      metallic: { en: 'Extra Premium Cover', ml: 'എക്സ്ട്രാ പ്രീമിയം കവർ' },
      feather_touch: { en: 'Leather Cover', ml: 'ലെതർ കവർ' },
      acrylic_cover: { en: 'Glass Cover', ml: 'ഗ്ലാസ് കവർ' },
      velvet_box: { en: 'Full Glass Cover', ml: 'ഫുൾ ഗ്ലാസ് കവർ' },
      canvas_matte: { en: 'Premium Cover', ml: 'പ്രീമിയം കവർ' },
    };

    const chosenFinish = finishNames[deliverables.albumPaperType] || {
      en: 'Normal Cover',
      ml: 'നോർമൽ കവർ',
    };

    items.push({
      id: 'main_albums',
      category: 'album',
      title: `Main Wedding Album (${deliverables.mainAlbumSheets} Sheets, ${chosenFinish.en})`,
      titleMl: `മെയിൻ വെഡ്ഡിംഗ് ആൽബം (${deliverables.mainAlbumSheets} പേജുകൾ, ${chosenFinish.ml})`,
      qty: deliverables.mainAlbumsCount,
      unitPrice: singleAlbumCost,
      totalPrice: totalAlbumCost,
      deletable: true,
    });
  }

  // Photo Frames
  if (deliverables.frames_8x12 > 0) {
    const cost = deliverables.frames_8x12 * rates.frame_8x12;
    deliverablesTotal += cost;
    items.push({
      id: 'frame_8x12',
      category: 'frames',
      title: '8x12 Inch Premium Synthetic Photo Frame',
      titleMl: '8x12 ഇഞ്ച് പ്രീമിയം ഫോട്ടോ ഫ്രെയിം',
      qty: deliverables.frames_8x12,
      unitPrice: rates.frame_8x12,
      totalPrice: cost,
      deletable: true,
    });
  }

  if (deliverables.frames_18x12 > 0) {
    const cost = deliverables.frames_18x12 * rates.frame_18x12;
    deliverablesTotal += cost;
    items.push({
      id: 'frame_18x12',
      category: 'frames',
      title: '18x12 Inch Living Room Portrait Photo Frame',
      titleMl: '18x12 ഇഞ്ച് ലിവിംഗ് റൂം ഫോട്ടോ ഫ്രെയിം',
      qty: deliverables.frames_18x12,
      unitPrice: rates.frame_18x12,
      totalPrice: cost,
      deletable: true,
    });
  }

  if (deliverables.frames_15x20 > 0) {
    const cost = deliverables.frames_15x20 * rates.frame_15x20;
    deliverablesTotal += cost;
    items.push({
      id: 'frame_15x20',
      category: 'frames',
      title: '15x20 Inch Royal Canvas Texture Wall Frame',
      titleMl: '15x20 ഇഞ്ച് റോയൽ ക്യാൻവാസ് വാൾ ഫ്രെയിം',
      qty: deliverables.frames_15x20,
      unitPrice: rates.frame_15x20,
      totalPrice: cost,
      deletable: true,
    });
  }

  // Dynamic Custom Print Items
  if (customPrintItems && customPrintItems.length > 0) {
    for (const cp of customPrintItems) {
      // Check count from customPrintCounts or legacy fields
      let count = deliverables.customPrintCounts?.[cp.id] || 0;
      if (count === 0) {
        if (cp.id === 'wall_calendar_12m' && deliverables.wallCalendarsCount) count = deliverables.wallCalendarsCount;
        if (cp.id === 'table_top_calendar' && deliverables.tableTopCalendarsCount) count = deliverables.tableTopCalendarsCount;
        if (cp.id === 'photo_mug' && deliverables.photoMugsCount) count = deliverables.photoMugsCount;
        if (cp.id === 'mini_album' && deliverables.miniAlbumsCount) count = deliverables.miniAlbumsCount;
      }

      if (count > 0) {
        const itemPrice = cp.price;
        const cost = count * itemPrice;
        deliverablesTotal += cost;
        items.push({
          id: `custom_print_${cp.id}`,
          category: 'merch',
          title: `${cp.nameEn} (${count} Nos)`,
          titleMl: `${cp.nameMl} (${count} എണ്ണം)`,
          qty: count,
          unitPrice: itemPrice,
          totalPrice: cost,
          deletable: true,
        });
      }
    }
  } else {
    // Legacy fallback print add-ons
    if (deliverables.miniAlbumsCount > 0) {
      const cost = deliverables.miniAlbumsCount * rates.miniAlbumRate;
      deliverablesTotal += cost;
      items.push({
        id: 'mini_album',
        category: 'merch',
        title: 'Mini / Pocket Family Keepsake Album',
        titleMl: 'ഫാമിലി മിനി ആൽബം / പോക്കറ്റ് ആൽബം',
        qty: deliverables.miniAlbumsCount,
        unitPrice: rates.miniAlbumRate,
        totalPrice: cost,
        deletable: true,
      });
    }

    if (deliverables.photoMugsCount > 0) {
      const cost = deliverables.photoMugsCount * rates.photoMugRate;
      deliverablesTotal += cost;
      items.push({
        id: 'photo_mug',
        category: 'merch',
        title: 'Personalized Couple Photo Ceramic Coffee Mug',
        titleMl: 'കപ്പിൾ ഫോട്ടോ പ്രിന്റഡ് സെറാമിക് മഗ്ഗ്',
        qty: deliverables.photoMugsCount,
        unitPrice: rates.photoMugRate,
        totalPrice: cost,
        deletable: true,
      });
    }

    if (deliverables.wallCalendarsCount > 0) {
      const cost = deliverables.wallCalendarsCount * rates.wallCalendarRate;
      deliverablesTotal += cost;
      items.push({
        id: 'wall_calendar',
        category: 'merch',
        title: '12-Month Custom Couple Wall Calendar',
        titleMl: 'കപ്പിൾ ഫോട്ടോ 12 മാസ വാൾ കലണ്ടർ',
        qty: deliverables.wallCalendarsCount,
        unitPrice: rates.wallCalendarRate,
        totalPrice: cost,
        deletable: true,
      });
    }

    if (deliverables.tableTopCalendarsCount > 0) {
      const cost = deliverables.tableTopCalendarsCount * rates.tableTopCalendarRate;
      deliverablesTotal += cost;
      items.push({
        id: 'table_calendar',
        category: 'merch',
        title: 'Table Top Acrylic / Wooden Desk Calendar',
        titleMl: 'ടേബിൾ ടോപ്പ് ഡെസ്ക് കലണ്ടർ',
        qty: deliverables.tableTopCalendarsCount,
        unitPrice: rates.tableTopCalendarRate,
        totalPrice: cost,
        deletable: true,
      });
    }
  }

  // 4. Other Selected Services (Food/Catering, Decor, Makeup, Cards, etc.)
  if (selectedOtherServices && selectedOtherServices.length > 0) {
    for (const svc of selectedOtherServices) {
      const cost = svc.price || 0;
      otherServicesTotal += cost;
      
      const countLabel = svc.guestCount
        ? ` (${svc.guestCount} Guests / അതിഥികൾ)`
        : svc.cardCount
        ? ` (${svc.cardCount} Cards / കാർഡുകൾ)`
        : '';

      const customSub = svc.customSelections && svc.customSelections.length > 0
        ? ` [${svc.customSelections.join(', ')}]`
        : '';

      const qty = svc.guestCount || svc.cardCount || 1;
      const unitPrice = svc.unitPrice || Math.round(cost / qty);

      items.push({
        id: `other_service_${svc.packageId}`,
        category: 'other_service',
        title: `${svc.title}${countLabel}${customSub}`,
        titleMl: `${svc.titleMl}${countLabel}${customSub}`,
        qty,
        unitPrice,
        totalPrice: cost,
        deletable: true,
      });
    }
  }

  // 5. Apply Package Combo Discount if a popular package is active
  const rawPhotographyTotal = groomCrewTotal + brideCrewTotal + deliverablesTotal;
  const validDiscount = packageDiscount && packageDiscount > 0 ? Math.min(packageDiscount, rawPhotographyTotal) : 0;
  
  if (validDiscount > 0) {
    items.push({
      id: 'package_combo_savings',
      category: 'discount',
      title: `Special Package Combo Discount (${activePackageTitle || 'Selected Plan'})`,
      titleMl: `പാക്കേജ് കോംബോ പ്രത്യേക സേവിംഗ്സ് (${activePackageTitleMl || activePackageTitle || 'തിരഞ്ഞെടുത്ത പ്ലാൻ'})`,
      qty: 1,
      unitPrice: -validDiscount,
      totalPrice: -validDiscount,
      deletable: false,
    });
  }

  const photographyTotal = Math.max(0, rawPhotographyTotal - validDiscount);
  const grandTotal = photographyTotal + otherServicesTotal;

  return {
    totalPrice: grandTotal,
    items,
    eventTotals,
    deliverablesTotal,
    groomCrewTotal,
    brideCrewTotal,
    photographyTotal,
    otherServicesTotal,
    packageDiscount: validDiscount,
    activePackageTitle,
    activePackageTitleMl,
  };
}

