'use client';

import React from 'react';
import { DeliverablesConfig, PriceRates, CustomPrintItem } from '@/types';
import { DEFAULT_CUSTOM_PRINTS } from '@/constants/defaults';
import {
  Film,
  Video,
  Clapperboard,
  BookOpen,
  Image as ImageIcon,
  Gift,
  HardDrive,
  Coffee,
  Calendar,
  CalendarDays,
  Plus,
  Minus,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface DeliverablesCustomizerProps {
  deliverables: DeliverablesConfig;
  setDeliverables: React.Dispatch<React.SetStateAction<DeliverablesConfig>>;
  rates: PriceRates;
  customPrintItems?: CustomPrintItem[];
  language?: 'en' | 'ml';
  onNavigateToOtherServices?: () => void;
}

export const DeliverablesCustomizer: React.FC<DeliverablesCustomizerProps> = ({
  deliverables,
  setDeliverables,
  rates,
  customPrintItems = DEFAULT_CUSTOM_PRINTS,
  language = 'en',
  onNavigateToOtherServices,
}) => {
  const isMl = language === 'ml';

  const updateField = <K extends keyof DeliverablesConfig>(
    field: K,
    value: DeliverablesConfig[K]
  ) => {
    setDeliverables((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div id="deliverables-customizer-section" className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm mb-8 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-6 pb-6 border-b border-stone-200">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rosewood-100 text-rosewood-800 mb-2">
          {isMl ? 'ഘട്ടം 3 • Step 3' : 'Step 3'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {isMl ? 'ഔട്ട്പുട്ട് ഡെലിവറബിൾസ് & പ്രിന്റഡ് മെറ്റീരിയൽസ്' : 'Output Deliverables & Printed Materials'}
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-1">
          {isMl
            ? '4K/HD വീഡിയോ ക്വാളിറ്റി, ആൽബങ്ങൾ, പ്രീസെറ്റ് ഫ്രെയിം സൈസുകൾ, പെൻഡ്രൈവ്, കലണ്ടർ, മഗ്ഗ് മുതലായവ ആവശ്യമുള്ള അളവിൽ തിരഞ്ഞെടുക്കുക'
            : 'Select 4K / Full HD video resolution, cinematic teaser, albums, preset photo frames, and customized keepsakes'}
        </p>
      </div>

      <div className="space-y-8">
        {/* 1. Video Quality & Deliverables */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Film className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-stone-900">
              1. {isMl ? 'വീഡിയോ ക്വാളിറ്റിയും ഔട്ട്പുട്ടുകളും (Video Production)' : 'Video Production & Resolution'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* 4K vs Full HD */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-2">
                {isMl ? 'വീഡിയോ റെസല്യൂഷൻ (Video Resolution)' : 'Video Resolution Master Output'}
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => updateField('videoQuality', '4k')}
                  className={`p-3.5 rounded-xl border text-left font-bold text-sm transition flex items-center justify-between ${
                    deliverables.videoQuality === '4k'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-400'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <span className="block text-sm sm:text-base font-black">4K Ultra HD</span>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {isMl ? 'സിനിമാറ്റിക് ക്ലാരിറ്റി' : 'Cinematic 4K Master'}
                    </span>
                    <span className="text-xs font-black text-amber-700 block mt-1">
                      +₹{rates.resolution4kAddon.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {deliverables.videoQuality === '4k' && (
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => updateField('videoQuality', 'hd')}
                  className={`p-3.5 rounded-xl border text-left font-bold text-sm transition flex items-center justify-between ${
                    deliverables.videoQuality === 'hd'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-xs ring-1 ring-amber-400'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div>
                    <span className="block text-sm sm:text-base font-black">Full HD (1080p)</span>
                    <span className="text-[10px] text-stone-500 font-medium block">
                      {isMl ? 'സ്റ്റാൻഡേർഡ് ക്ലാരിറ്റി' : 'Standard 1080p Master'}
                    </span>
                    <span className="text-xs font-black text-emerald-700 block mt-1">
                      {isMl ? '✓ ബേസ് പാക്കേജ്' : '✓ Base Included'}
                    </span>
                  </div>
                  {deliverables.videoQuality === 'hd' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Video Output Formats */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1">
                {isMl ? 'വീഡിയോ തരങ്ങൾ (Video Formats)' : 'Video Formats & Edits'}
              </label>

              {/* Full Length Video */}
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={deliverables.fullLengthVideo}
                    onChange={(e) => updateField('fullLengthVideo', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Full Length Traditional Wedding Film
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Complete ritual footage with music & audio sync
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-700">
                  ₹{rates.fullLengthVideo.toLocaleString('en-IN')}
                </span>
              </label>

              {/* Highlight Video */}
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={deliverables.highlightVideo}
                    onChange={(e) => updateField('highlightVideo', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Cinematic Wedding Highlight (3-5 Mins)
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Signature music montage of best moments
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-700">
                  ₹{rates.highlightVideo.toLocaleString('en-IN')}
                </span>
              </label>

              {/* Teaser Video */}
              <label className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50 transition">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={deliverables.teaserVideo}
                    onChange={(e) => updateField('teaserVideo', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">
                      Cinematic Teaser Promo (1-2 Mins)
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Quick social media teaser announcement
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-700">
                  ₹{rates.teaserVideo.toLocaleString('en-IN')}
                </span>
              </label>
            </div>
          </div>

          {/* Reels, Media Delivery & Photo Grading - Upgraded Roomy Steppers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reels Counter */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <Clapperboard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-amber-700">
                    ₹{rates.reelRate.toLocaleString('en-IN')}/reel
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900">Instagram / Social Reels</h5>
                <p className="text-[10px] text-stone-500 mt-0.5">Vertical 9:16 viral short videos</p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('reelsCount', Math.max(0, deliverables.reelsCount - 1))
                  }
                  disabled={deliverables.reelsCount <= 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.reelsCount > 0
                      ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                      : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Decrease reels count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-stone-900 block leading-tight">
                    {deliverables.reelsCount}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Reels</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('reelsCount', deliverables.reelsCount + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                  aria-label="Increase reels count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Color Graded Photos (Requirement 2: Number of Photo Graded) */}
            <div className="p-4 bg-white rounded-2xl border-2 border-amber-300 flex flex-col justify-between shadow-2xs bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-xs font-black text-amber-700">
                    ₹{(rates.photoGradingRate || 30).toLocaleString('en-IN')}/{isMl ? 'ഫോട്ടോ' : 'photo'}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900">
                  {isMl ? 'നമ്പർ ഓഫ് ഫോട്ടോ ഗ്രേഡർ' : 'Color Graded Photos'}
                </h5>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {isMl ? 'മാഗസിൻ-ഗ്രേഡ് ടോണിംഗ് & കളർ തിയറി' : 'Aesthetic skin-tone & magazine grading'}
                </p>
              </div>

              <div>
                <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between bg-white rounded-xl p-1.5 border border-amber-200">
                  <button
                    type="button"
                    onClick={() =>
                      updateField('gradedPhotosCount', Math.max(0, (deliverables.gradedPhotosCount || 0) - 25))
                    }
                    disabled={(deliverables.gradedPhotosCount || 0) <= 0}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                      (deliverables.gradedPhotosCount || 0) > 0
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 shadow-xs'
                        : 'bg-stone-100/50 text-stone-300 cursor-not-allowed'
                    }`}
                    aria-label="Decrease graded photos count"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-center">
                    <span className="text-sm font-black text-amber-900 block leading-tight">
                      {deliverables.gradedPhotosCount || 0}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase">
                      {isMl ? 'ഫോട്ടോകൾ' : 'Photos'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateField('gradedPhotosCount', (deliverables.gradedPhotosCount || 0) + 25)
                    }
                    className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                    aria-label="Increase graded photos count"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1 mt-1.5">
                  {[50, 100, 150, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => updateField('gradedPhotosCount', preset)}
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition ${
                        deliverables.gradedPhotosCount === preset
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* USB Pen Drive */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-amber-700">
                    ₹{rates.penDriveRate.toLocaleString('en-IN')}/each
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900">Branded USB Pen Drive</h5>
                <p className="text-[10px] text-stone-500 mt-0.5">High-Speed USB 3.0 storage</p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('penDriveCount', Math.max(0, deliverables.penDriveCount - 1))
                  }
                  disabled={deliverables.penDriveCount <= 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.penDriveCount > 0
                      ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                      : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Decrease pen drive count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-stone-900 block leading-tight">
                    {deliverables.penDriveCount}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Drives</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('penDriveCount', deliverables.penDriveCount + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                  aria-label="Increase pen drive count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Pen Drive Box */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    <Gift className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-amber-700">
                    ₹{rates.penDriveBoxRate.toLocaleString('en-IN')}/each
                  </span>
                </div>
                <h5 className="text-xs font-bold text-stone-900">Custom Keepsake Box</h5>
                <p className="text-[10px] text-stone-500 mt-0.5">Handcrafted Wooden / Acrylic Box</p>
              </div>

              <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('penDriveBoxCount', Math.max(0, deliverables.penDriveBoxCount - 1))
                  }
                  disabled={deliverables.penDriveBoxCount <= 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.penDriveBoxCount > 0
                      ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                      : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Decrease pen drive box count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-stone-900 block leading-tight">
                    {deliverables.penDriveBoxCount}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Boxes</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('penDriveBoxCount', deliverables.penDriveBoxCount + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                  aria-label="Increase pen drive box count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Main Wedding Album */}
        <div className="pt-6 border-t border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-rosewood-600" />
            <h3 className="text-lg font-bold text-stone-900">
              2. {isMl ? 'പ്രധാന വെഡ്ഡിംഗ് ആൽബം (Main Wedding Album)' : 'Main Wedding Album Customization'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-stone-50/60 p-5 rounded-2xl border border-stone-200">
            {/* Albums Count */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">
                Main Albums Quantity
              </label>
              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('mainAlbumsCount', Math.max(0, deliverables.mainAlbumsCount - 1))
                  }
                  disabled={deliverables.mainAlbumsCount <= 0}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.mainAlbumsCount > 0
                      ? 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center px-2">
                  <span className="font-black text-stone-900 text-lg block leading-none">
                    {deliverables.mainAlbumsCount}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase font-bold">Albums</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('mainAlbumsCount', deliverables.mainAlbumsCount + 1)}
                  className="w-9 h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                Base Rate: ₹{rates.baseAlbumRate.toLocaleString('en-IN')} (Includes 30 sheets)
              </p>
            </div>

            {/* Page Count (Up to 200 Pages) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
                <span>{isMl ? 'പേജ് കൗണ്ട് (Page Count)' : 'Page Count'}</span>
                <span className="text-amber-700 font-extrabold text-sm">{deliverables.mainAlbumSheets} Pages</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={deliverables.mainAlbumSheets}
                  onChange={(e) => updateField('mainAlbumSheets', parseInt(e.target.value) || 20)}
                  className="flex-1 accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={deliverables.mainAlbumSheets}
                  onChange={(e) =>
                    updateField(
                      'mainAlbumSheets',
                      Math.min(200, Math.max(20, parseInt(e.target.value) || 20))
                    )
                  }
                  className="w-16 px-2 py-1 text-center font-bold text-xs rounded-lg border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 mt-1">
                <span>20 Pages</span>
                <span>100 Pages</span>
                <span>200 Pages (Max)</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                +₹{rates.extraSheetRate} per page above 30 sheets
              </p>
            </div>

            {/* Album Cover Selection */}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-2">
                {isMl ? 'ആൽബം കവർ (Album Cover)' : 'Album Cover Selection'}
              </label>
              {(() => {
                const currentType = (() => {
                  const val = deliverables.albumPaperType;
                  if (['normal', 'premium', 'extra_premium', 'leather', 'glass', 'full_glass'].includes(val)) {
                    return val;
                  }
                  if (val === 'matt') return 'normal';
                  if (val === 'glossy') return 'premium';
                  if (val === 'metallic') return 'extra_premium';
                  if (val === 'feather_touch') return 'leather';
                  if (val === 'acrylic_cover') return 'glass';
                  if (val === 'velvet_box') return 'full_glass';
                  return 'normal';
                })();

                const currentAddon = rates.albumFinishes?.[currentType] ?? rates.albumFinishes?.[deliverables.albumPaperType] ?? 0;

                return (
                  <>
                    <select
                      value={currentType}
                      onChange={(e) =>
                        updateField(
                          'albumPaperType',
                          e.target.value as DeliverablesConfig['albumPaperType']
                        )
                      }
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="normal">
                        {isMl ? 'നോർമൽ (Normal)' : 'Normal Cover'} {rates.albumFinishes?.normal ? `(+₹${rates.albumFinishes.normal.toLocaleString('en-IN')})` : (isMl ? '(ബേസ് ഉൾപ്പെടെ)' : '(Base Included)')}
                      </option>
                      <option value="premium">
                        {isMl ? 'പ്രീമിയം (Premium)' : 'Premium Cover'} (+₹{(rates.albumFinishes?.premium ?? 1500).toLocaleString('en-IN')})
                      </option>
                      <option value="extra_premium">
                        {isMl ? 'എക്സ്ട്രാ പ്രീമിയം (Extra Premium)' : 'Extra Premium Cover'} (+₹{(rates.albumFinishes?.extra_premium ?? 2500).toLocaleString('en-IN')})
                      </option>
                      <option value="leather">
                        {isMl ? 'ലെതർ (Leather)' : 'Leather Cover'} (+₹{(rates.albumFinishes?.leather ?? 3500).toLocaleString('en-IN')})
                      </option>
                      <option value="glass">
                        {isMl ? 'ഗ്ലാസ് (Glass)' : 'Glass Cover'} (+₹{(rates.albumFinishes?.glass ?? 4500).toLocaleString('en-IN')})
                      </option>
                      <option value="full_glass">
                        {isMl ? 'ഫുൾ ഗ്ലാസ് (Full Glass)' : 'Full Glass Cover'} (+₹{(rates.albumFinishes?.full_glass ?? 6000).toLocaleString('en-IN')})
                      </option>
                    </select>
                    <p className="text-[11px] text-amber-700 font-bold mt-1.5">
                      {isMl ? 'തിരഞ്ഞെടുത്ത കവർ അഡീഷണൽ:' : 'Selected Cover Add-on:'} +₹
                      {currentAddon.toLocaleString('en-IN')}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 3. Preset Photo Frames */}
        <div className="pt-6 border-t border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-stone-900">
              3. {isMl ? 'ഫോട്ടോ ഫ്രെയിമുകൾ - പ്രീസെറ്റ് സൈസുകൾ (Photo Frames)' : 'Preset Photo Frames'}
            </h3>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Select your preferred preset frame sizes for home & living room display:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 8x12 Frame */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full inline-block mb-2 uppercase">
                  Preset Size 1
                </span>
                <h4 className="text-base font-extrabold text-stone-900">8 x 12 Inch</h4>
                <p className="text-xs text-stone-500">Desk / Bedroom Portrait Frame</p>
                <p className="text-sm font-black text-amber-700 mt-2">
                  ₹{rates.frame_8x12.toLocaleString('en-IN')}/each
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('frames_8x12', Math.max(0, deliverables.frames_8x12 - 1))
                  }
                  disabled={deliverables.frames_8x12 <= 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.frames_8x12 > 0
                      ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                      : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Decrease 8x12 frame count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-stone-900 block leading-tight">
                    {deliverables.frames_8x12}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Frames</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('frames_8x12', deliverables.frames_8x12 + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                  aria-label="Increase 8x12 frame count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 18x12 Frame */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full inline-block mb-2 uppercase">
                  Preset Size 2
                </span>
                <h4 className="text-base font-extrabold text-stone-900">18 x 12 Inch</h4>
                <p className="text-xs text-stone-500">Living Room Landscape Wall Frame</p>
                <p className="text-sm font-black text-amber-700 mt-2">
                  ₹{rates.frame_18x12.toLocaleString('en-IN')}/each
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('frames_18x12', Math.max(0, deliverables.frames_18x12 - 1))
                  }
                  disabled={deliverables.frames_18x12 <= 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.frames_18x12 > 0
                      ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                      : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Decrease 18x12 frame count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-stone-900 block leading-tight">
                    {deliverables.frames_18x12}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Frames</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('frames_18x12', deliverables.frames_18x12 + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                  aria-label="Increase 18x12 frame count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 15x20 Frame */}
            <div className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-indigo-300 transition shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full inline-block mb-2 uppercase">
                  Preset Size 3
                </span>
                <h4 className="text-base font-extrabold text-stone-900">15 x 20 Inch</h4>
                <p className="text-xs text-stone-500">Royal Canvas Texture Masterpiece</p>
                <p className="text-sm font-black text-amber-700 mt-2">
                  ₹{rates.frame_15x20.toLocaleString('en-IN')}/each
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() =>
                    updateField('frames_15x20', Math.max(0, deliverables.frames_15x20 - 1))
                  }
                  disabled={deliverables.frames_15x20 <= 0}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                    deliverables.frames_15x20 > 0
                      ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                      : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                  }`}
                  aria-label="Decrease 15x20 frame count"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-center">
                  <span className="text-sm font-black text-stone-900 block leading-tight">
                    {deliverables.frames_15x20}
                  </span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase">Frames</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('frames_15x20', deliverables.frames_15x20 + 1)}
                  className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                  aria-label="Increase 15x20 frame count"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Additional Printed Items (Merchandise / Add-ons) */}
        <div className="pt-6 border-t border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-stone-900">
              4. {isMl ? 'അഡീഷണൽ പ്രിന്റഡ് പ്രൊഡക്റ്റുകൾ (Print & Merch Add-ons)' : 'Additional Print Keepsakes & Merchandise'}
            </h3>
          </div>
          <p className="text-xs text-stone-500 mb-4">
            Select additional keepsakes for gifts and family keepsakes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {customPrintItems.map((item) => {
              const count =
                deliverables.customPrintCounts?.[item.id] !== undefined
                  ? deliverables.customPrintCounts[item.id]
                  : item.id === 'wall_calendar_12m'
                  ? deliverables.wallCalendarsCount || 0
                  : item.id === 'table_top_calendar'
                  ? deliverables.tableTopCalendarsCount || 0
                  : item.id === 'photo_mug'
                  ? deliverables.photoMugsCount || 0
                  : item.id === 'mini_album'
                  ? deliverables.miniAlbumsCount || 0
                  : 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-2xs ${
                    count > 0 ? 'bg-amber-50/20 border-amber-300 ring-1 ring-amber-300/40' : 'bg-white border-stone-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        {item.icon === 'CalendarDays' ? (
                          <CalendarDays className="w-4 h-4" />
                        ) : item.icon === 'Calendar' ? (
                          <Calendar className="w-4 h-4" />
                        ) : item.icon === 'Coffee' ? (
                          <Coffee className="w-4 h-4" />
                        ) : item.icon === 'BookOpen' ? (
                          <BookOpen className="w-4 h-4" />
                        ) : item.icon === 'Sparkles' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Gift className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-xs font-black text-amber-700">
                        ₹{item.price.toLocaleString('en-IN')}/{item.unitName || 'each'}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-stone-900 leading-snug">
                      {isMl ? item.nameMl : item.nameEn}
                    </h5>
                    <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2">
                      {isMl ? item.descriptionMl : item.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1.5 border border-stone-200">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = Math.max(0, count - 1);
                        setDeliverables((prev) => ({
                          ...prev,
                          customPrintCounts: {
                            ...(prev.customPrintCounts || {}),
                            [item.id]: newCount,
                          },
                          ...(item.id === 'wall_calendar_12m' ? { wallCalendarsCount: newCount } : {}),
                          ...(item.id === 'table_top_calendar' ? { tableTopCalendarsCount: newCount } : {}),
                          ...(item.id === 'photo_mug' ? { photoMugsCount: newCount } : {}),
                          ...(item.id === 'mini_album' ? { miniAlbumsCount: newCount } : {}),
                        }));
                      }}
                      disabled={count <= 0}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition ${
                        count > 0
                          ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs'
                          : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                      }`}
                      aria-label={`Decrease ${item.nameEn}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-center">
                      <span className="text-sm font-black text-stone-900 block leading-tight">
                        {count}
                      </span>
                      <span className="text-[9px] font-bold text-stone-400 uppercase">Qty</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = count + 1;
                        setDeliverables((prev) => ({
                          ...prev,
                          customPrintCounts: {
                            ...(prev.customPrintCounts || {}),
                            [item.id]: newCount,
                          },
                          ...(item.id === 'wall_calendar_12m' ? { wallCalendarsCount: newCount } : {}),
                          ...(item.id === 'table_top_calendar' ? { tableTopCalendarsCount: newCount } : {}),
                          ...(item.id === 'photo_mug' ? { photoMugsCount: newCount } : {}),
                          ...(item.id === 'mini_album' ? { miniAlbumsCount: newCount } : {}),
                        }));
                      }}
                      className="w-8 h-8 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold shadow-xs transition"
                      aria-label={`Increase ${item.nameEn}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Guided Sequential Navigation at Bottom (Requirement 4) */}
      <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('wedding-customizer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs sm:text-sm shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isMl ? '← ചടങ്ങുകൾ & ക്രൂ പരിശോധിക്കുക' : '← Back to Ceremonies & Crew'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (onNavigateToOtherServices) {
              onNavigateToOtherServices();
            } else {
              const el = document.getElementById('other-services-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-lg transition active:scale-98"
        >
          <span>{isMl ? 'മറ്റ് സർവീസുകൾ തിരഞ്ഞെടുക്കാം (ഫുഡ്, ഡെക്കോർ, കാർഡുകൾ) ✨' : 'Next: Other Wedding Services (Food, Decor, Cards) ✨'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
