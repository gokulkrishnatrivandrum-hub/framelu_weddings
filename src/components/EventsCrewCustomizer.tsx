'use client';

import React, { useState } from 'react';
import { EventCrewConfig, EventId, PriceRates, SideSelection } from '@/types';
import { KERALA_EVENTS } from '@/constants/defaults';
import {
  Camera,
  Video,
  Sparkles,
  Plane,
  Tv,
  Printer,
  Radio,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  Plus,
  Minus,
} from 'lucide-react';

interface EventsCrewCustomizerProps {
  side: SideSelection;
  groomEvents: Record<EventId, EventCrewConfig>;
  brideEvents: Record<EventId, EventCrewConfig>;
  setGroomEvents: React.Dispatch<React.SetStateAction<Record<EventId, EventCrewConfig>>>;
  setBrideEvents: React.Dispatch<React.SetStateAction<Record<EventId, EventCrewConfig>>>;
  rates: PriceRates;
  language?: 'en' | 'ml';
  defaultEventDate?: string;
}

export const EventsCrewCustomizer: React.FC<EventsCrewCustomizerProps> = ({
  side,
  groomEvents,
  brideEvents,
  setGroomEvents,
  setBrideEvents,
  rates,
  language = 'en',
  defaultEventDate,
}) => {
  const isMl = language === 'ml';

  // If both sides are selected, provide a tab switcher to work on groom or bride side
  const [activeSideTab, setActiveSideTab] = useState<'groom' | 'bride'>(
    side === 'bride' ? 'bride' : 'groom'
  );

  // Sync tab if single side selected
  React.useEffect(() => {
    if (side === 'groom') setActiveSideTab('groom');
    if (side === 'bride') setActiveSideTab('bride');
  }, [side]);

  const currentEvents = activeSideTab === 'groom' ? groomEvents : brideEvents;
  const setCurrentEvents = activeSideTab === 'groom' ? setGroomEvents : setBrideEvents;

  const updateCrew = (
    eventId: EventId,
    field: keyof EventCrewConfig,
    value: number | boolean | string
  ) => {
    setCurrentEvents((prev) => {
      const existing = prev[eventId] || {
        enabled: false,
        venue: '',
        date: defaultEventDate || '',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: 0,
        candidVideographers: 0,
        drone: false,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      };

      const updated = {
        ...existing,
        [field]: value,
      };

      if (!updated.date && defaultEventDate) {
        updated.date = defaultEventDate;
      }

      // If user increases any counter or enables drone/live, auto-enable the event
      if (
        field !== 'enabled' &&
        field !== 'venue' &&
        field !== 'date' &&
        (Number(updated.traditionalPhotographers) > 0 ||
          Number(updated.traditionalVideographers) > 0 ||
          Number(updated.candidPhotographers) > 0 ||
          Number(updated.candidVideographers) > 0 ||
          updated.drone ||
          updated.youtubeLive ||
          updated.auditoriumLive ||
          updated.photoLivePrinting)
      ) {
        updated.enabled = true;
      }

      return {
        ...prev,
        [eventId]: updated,
      };
    });
  };

  const toggleEvent = (eventId: EventId) => {
    setCurrentEvents((prev) => {
      const existing = prev[eventId] || {
        enabled: false,
        venue: '',
        date: defaultEventDate || '',
        traditionalPhotographers: 1,
        traditionalVideographers: 1,
        candidPhotographers: 0,
        candidVideographers: 0,
        drone: false,
        youtubeLive: false,
        auditoriumLive: false,
        photoLivePrinting: false,
      };

      const willBeEnabled = !existing.enabled;
      return {
        ...prev,
        [eventId]: {
          ...existing,
          enabled: willBeEnabled,
          date: existing.date || (willBeEnabled ? defaultEventDate || '' : ''),
        },
      };
    });
  };

  // Calculate event subtotal
  const getEventSubtotal = (cfg?: EventCrewConfig) => {
    if (!cfg || !cfg.enabled) return 0;
    let sum = 0;
    sum += (cfg.traditionalPhotographers || 0) * rates.traditionalPhotographer;
    sum += (cfg.traditionalVideographers || 0) * rates.traditionalVideographer;
    sum += (cfg.candidPhotographers || 0) * rates.candidPhotographer;
    sum += (cfg.candidVideographers || 0) * rates.candidVideographer;
    if (cfg.drone) sum += rates.dronePerEvent;
    if (cfg.youtubeLive) sum += rates.youtubeLivePerEvent;
    if (cfg.auditoriumLive) sum += rates.auditoriumLivePerEvent;
    if (cfg.photoLivePrinting) sum += rates.photoLivePrintingPerEvent;
    return sum;
  };

  const activeGroomCount = Object.values(groomEvents).filter((e) => e.enabled).length;
  const activeBrideCount = Object.values(brideEvents).filter((e) => e.enabled).length;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-200">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-2">
            {isMl ? 'ഘട്ടം 2' : 'Step 2 • Ceremonies & Crew'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {isMl ? 'ചടങ്ങുകൾ, സ്ഥലം & ഫോട്ടോഗ്രാഫി ക്രൂ' : 'Ceremonies, Venue & Photo Crew'}
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            {isMl
              ? 'ആവശ്യമുള്ള ചടങ്ങുകൾ തിരഞ്ഞെടുക്കുക, സ്ഥലം & തീയതി നൽകുക, ക്രൂ എണ്ണം നിശ്ചയിക്കുക'
              : 'Select your events, add event venue location & date, and allocate the photography crew'}
          </p>
        </div>

        {/* Tab switch if both sides selected */}
        {side === 'both' && (
          <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveSideTab('groom')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSideTab === 'groom'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>{isMl ? 'വരന്റെ ചടങ്ങുകൾ' : 'Groom Side'}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSideTab === 'groom' ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                {activeGroomCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSideTab('bride')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeSideTab === 'bride'
                  ? 'bg-rosewood-600 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              <span>{isMl ? 'വധുവിന്റെ ചടങ്ങുകൾ' : 'Bride Side'}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeSideTab === 'bride' ? 'bg-rosewood-700 text-white' : 'bg-stone-200 text-stone-700'}`}>
                {activeBrideCount}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Side Indicator Banner */}
      <div
        className={`mb-6 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm ${
          activeSideTab === 'groom'
            ? 'bg-amber-50/80 border border-amber-200 text-amber-950'
            : 'bg-rosewood-50/80 border border-rosewood-200 text-rosewood-950'
        }`}
      >
        <div className="flex items-center gap-2.5 font-bold">
          <Layers className="w-5 h-5 text-current shrink-0" />
          <span>
            {activeSideTab === 'groom'
              ? isMl
                ? '🤵 വരന്റെ ഭാഗത്തെ ചടങ്ങുകൾ ക്രമീകരിക്കുന്നു'
                : '🤵 Configuring Groom Side Ceremonies & Photo Crew'
              : isMl
                ? '👰 വധുവിന്റെ ഭാഗത്തെ ചടങ്ങുകൾ ക്രമീകരിക്കുന്നു'
                : '👰 Configuring Bride Side Ceremonies & Photo Crew'}
          </span>
        </div>
        <span className="text-xs bg-white/90 px-3 py-1 rounded-full font-bold shadow-xs text-stone-800 self-start sm:self-auto">
          {Object.values(currentEvents).filter((e) => e.enabled).length} {isMl ? 'ചടങ്ങുകൾ' : 'Events Active'}
        </span>
      </div>

      {/* Events Grid */}
      <div className="space-y-5">
        {KERALA_EVENTS.map((evt) => {
          const cfg = currentEvents[evt.id] || {
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

          const subtotal = getEventSubtotal(cfg);

          return (
            <div
              key={evt.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                cfg.enabled
                  ? 'border-amber-400 bg-amber-50/10 shadow-sm ring-1 ring-amber-400/20'
                  : 'border-stone-200 bg-stone-50/40 opacity-90'
              }`}
            >
              {/* Event Header Bar */}
              <div className="p-4 sm:p-5 bg-white border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    id={`evt-${activeSideTab}-${evt.id}`}
                    checked={cfg.enabled}
                    onChange={() => toggleEvent(evt.id)}
                    className="w-5 h-5 mt-1 rounded text-amber-600 focus:ring-amber-500 border-stone-300 cursor-pointer shrink-0"
                  />
                  <div className="min-w-0">
                    <label
                      htmlFor={`evt-${activeSideTab}-${evt.id}`}
                      className="text-base sm:text-lg font-bold text-stone-900 cursor-pointer flex flex-wrap items-center gap-2"
                    >
                      <span>{isMl ? evt.nameMl : evt.nameEn}</span>
                    </label>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {isMl ? evt.descriptionMl : evt.descriptionEn}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                  {cfg.enabled ? (
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">
                        {isMl ? 'ചടങ്ങിന്റെ തുക' : 'Event Total'}
                      </span>
                      <span className="text-lg font-black text-amber-700">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleEvent(evt.id)}
                      className="text-xs font-bold text-stone-700 bg-stone-100 hover:bg-amber-100 hover:text-amber-800 px-3.5 py-2 rounded-xl border border-stone-200 transition"
                    >
                      {isMl ? '+ ചേർക്കുക' : '+ Add Event'}
                    </button>
                  )}
                </div>
              </div>

              {/* Event Configuration (Shown when enabled) */}
              {cfg.enabled && (
                <div className="p-4 sm:p-5 space-y-5 animate-fade-in bg-stone-50/20">
                  {/* Venue / Location & Event Date Row */}
                  <div className="p-3.5 bg-white rounded-xl border border-amber-200/80 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {/* Venue Text Field */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isMl ? 'ഇവന്റ് നടക്കുന്ന സ്ഥലം / ഓഡിറ്റോറിയം:' : 'Event Venue / Location:'}</span>
                        </label>
                        <input
                          type="text"
                          placeholder={isMl ? 'ഉദാ: കായംകുളം റോയൽ ഓഡിറ്റോറിയം' : 'e.g. Royal Auditorium, Kayamkulam'}
                          value={cfg.venue || ''}
                          onChange={(e) => updateCrew(evt.id, 'venue', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                        />
                      </div>

                      {/* Event Date Field */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isMl ? 'ചടങ്ങ് നടക്കുന്ന തീയതി:' : 'Event Date:'}</span>
                        </label>
                        <input
                          type="date"
                          value={cfg.date || ''}
                          onChange={(e) => updateCrew(evt.id, 'date', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 bg-stone-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clean, Spacious Crew Allocations with Foolproof Steppers */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isMl ? 'ഫോട്ടോഗ്രാഫർ & വീഡിയോഗ്രാഫർ ക്രൂ തിരഞ്ഞെടുക്കൽ' : 'Photo & Video Crew Selection'}</span>
                      </h4>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {isMl ? 'ആവശ്യമുള്ള ക്രൂ എണ്ണം കൂട്ടുക / കുറയ്ക്കുക' : 'Adjust crew counts per event'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      {/* Traditional Photo */}
                      {(() => {
                        const count = cfg.traditionalPhotographers || 0;
                        const isSelected = count > 0;
                        const singlePrice = rates.traditionalPhotographer;
                        const effectiveTotal = (count > 0 ? count : 1) * singlePrice;
                        return (
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden min-w-0 relative ${
                              isSelected
                                ? 'bg-amber-50/30 border-amber-400 shadow-sm ring-1 ring-amber-300/60'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                  <Camera className="w-5 h-5" />
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                                    {count} Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                                    Optional
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-sm text-stone-900 leading-snug">
                                Traditional Photo
                              </h5>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {isMl ? 'വേദിയിലെ പ്രധാന ചടങ്ങുകൾ & ഫാമിലി പോർട്രെയ്റ്റ്' : 'Stage rituals & family group portraits'}
                              </p>
                            </div>

                            {/* Stepper */}
                            <div className="mt-3.5 pt-2 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1 sm:p-1.5 border border-stone-200 w-full min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'traditionalPhotographers',
                                    Math.max(0, count - 1)
                                  )
                                }
                                disabled={count <= 0}
                                className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold transition-all ${
                                  count > 0
                                    ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs active:scale-95'
                                    : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                                }`}
                                aria-label="Decrease traditional photographers"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <div className="flex-1 min-w-0 text-center px-1">
                                <span className="text-sm sm:text-base font-black text-stone-900 block leading-tight">
                                  {count}
                                </span>
                                <span className="text-[8.5px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-tight block truncate">
                                  {count === 1 ? 'Photographer' : 'Photographers'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'traditionalPhotographers',
                                    count + 1
                                  )
                                }
                                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold transition-all shadow-xs active:scale-95"
                                aria-label="Increase traditional photographers"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Traditional Video (Standard Videography) */}
                      {(() => {
                        const count = cfg.traditionalVideographers || 0;
                        const isSelected = count > 0;
                        const singlePrice = rates.traditionalVideographer;
                        return (
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden min-w-0 relative ${
                              isSelected
                                ? 'bg-amber-50/30 border-amber-400 shadow-sm ring-1 ring-amber-300/60'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                  <Video className="w-5 h-5" />
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-600 text-white uppercase tracking-wider">
                                    {count} Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                                    Optional
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-sm text-stone-900 leading-snug">
                                Traditional Video
                              </h5>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {isMl ? 'സ്റ്റാൻഡേർഡ് / സ്റ്റേജ് സമഗ്രമായ വീഡിയോ റെക്കോർഡിംഗ്' : 'Standard / stage ritual continuous video recording'}
                              </p>
                            </div>

                            {/* Stepper */}
                            <div className="mt-3.5 pt-2 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1 sm:p-1.5 border border-stone-200 w-full min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'traditionalVideographers',
                                    Math.max(0, count - 1)
                                  )
                                }
                                disabled={count <= 0}
                                className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold transition-all ${
                                  count > 0
                                    ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs active:scale-95'
                                    : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                                }`}
                                aria-label="Decrease traditional videographers"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <div className="flex-1 min-w-0 text-center px-1">
                                <span className="text-sm sm:text-base font-black text-stone-900 block leading-tight">
                                  {count}
                                </span>
                                <span className="text-[8.5px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-tight block truncate">
                                  {count === 1 ? 'Videographer' : 'Videographers'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'traditionalVideographers',
                                    count + 1
                                  )
                                }
                                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center font-bold transition-all shadow-xs active:scale-95"
                                aria-label="Increase traditional videographers"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Candid Photo */}
                      {(() => {
                        const count = cfg.candidPhotographers || 0;
                        const isSelected = count > 0;
                        const singlePrice = rates.candidPhotographer;
                        return (
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden min-w-0 relative ${
                              isSelected
                                ? 'bg-rose-50/40 border-rose-400 shadow-sm ring-1 ring-rose-300/60'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                                    {count} Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                                    Optional
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-sm text-stone-900 leading-snug">
                                Candid Photo
                              </h5>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {isMl ? 'സ്വാഭാവിക ഭാവങ്ങളും ക്രിയേറ്റീവ് മൊമെന്റുകളും' : 'Spontaneous natural expressions & moments'}
                              </p>
                            </div>

                            {/* Stepper */}
                            <div className="mt-3.5 pt-2 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1 sm:p-1.5 border border-stone-200 w-full min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'candidPhotographers',
                                    Math.max(0, count - 1)
                                  )
                                }
                                disabled={count <= 0}
                                className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold transition-all ${
                                  count > 0
                                    ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs active:scale-95'
                                    : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                                }`}
                                aria-label="Decrease candid photographers"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <div className="flex-1 min-w-0 text-center px-1">
                                <span className="text-sm sm:text-base font-black text-stone-900 block leading-tight">
                                  {count}
                                </span>
                                <span className="text-[8.5px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-tight block truncate">
                                  {count === 1 ? 'Candid Photo' : 'Candid Photos'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'candidPhotographers',
                                    count + 1
                                  )
                                }
                                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center font-bold transition-all shadow-xs active:scale-95"
                                aria-label="Increase candid photographers"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Candid Video / Cinematography (Stage & Cinematic) */}
                      {(() => {
                        const count = cfg.candidVideographers || 0;
                        const isSelected = count > 0;
                        const singlePrice = rates.candidVideographer;
                        return (
                          <div
                            className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden min-w-0 relative ${
                              isSelected
                                ? 'bg-purple-50/40 border-purple-400 shadow-sm ring-1 ring-purple-300/60'
                                : 'bg-white border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-600 text-white uppercase tracking-wider">
                                    {count} Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                                    Optional
                                  </span>
                                )}
                              </div>
                              <h5 className="font-extrabold text-sm text-stone-900 leading-snug">
                                Cinematic Video
                              </h5>
                              <p className="text-xs text-stone-500 mt-0.5">
                                {isMl ? 'സിനിമാറ്റോഗ്രാഫി & സ്റ്റേജ് ടീസർ ഷോട്ടുകൾ' : 'Gimbal movement & cinematic teaser cuts'}
                              </p>
                            </div>

                            {/* Stepper */}
                            <div className="mt-3.5 pt-2 border-t border-stone-100 flex items-center justify-between bg-stone-50 rounded-xl p-1 sm:p-1.5 border border-stone-200 w-full min-w-0">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'candidVideographers',
                                    Math.max(0, count - 1)
                                  )
                                }
                                disabled={count <= 0}
                                className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-bold transition-all ${
                                  count > 0
                                    ? 'bg-white hover:bg-stone-200 text-stone-800 shadow-xs active:scale-95'
                                    : 'bg-stone-200/50 text-stone-300 cursor-not-allowed'
                                }`}
                                aria-label="Decrease candid videographers"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              <div className="flex-1 min-w-0 text-center px-1">
                                <span className="text-sm sm:text-base font-black text-stone-900 block leading-tight">
                                  {count}
                                </span>
                                <span className="text-[8.5px] sm:text-[9px] font-bold text-stone-400 uppercase tracking-tight block truncate">
                                  {count === 1 ? 'Cinematographer' : 'Cinematography'}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  updateCrew(
                                    evt.id,
                                    'candidVideographers',
                                    count + 1
                                  )
                                }
                                className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center font-bold transition-all shadow-xs active:scale-95"
                                aria-label="Increase candid videographers"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Clean Broadcast & Aerial Section (No cluttered individual amounts) */}
                  <div className="pt-2 border-t border-stone-200/60">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                      {isMl ? 'പ്രത്യേക കവറേജ് & ലൈവ് സ്ട്രീമിംഗ്' : 'Special Aerial & Live Broadcast Features'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Drone */}
                      <label
                        className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                          cfg.drone
                            ? 'bg-amber-500/10 border-amber-400 text-amber-950 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Plane className="w-4 h-4 text-amber-600" />
                          <span className="text-xs">Drone 4K Aerial</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfg.drone}
                          onChange={(e) => updateCrew(evt.id, 'drone', e.target.checked)}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                      </label>

                      {/* YouTube Live */}
                      <label
                        className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                          cfg.youtubeLive
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Radio className="w-4 h-4 text-rose-600" />
                          <span className="text-xs">YouTube Live Stream</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfg.youtubeLive}
                          onChange={(e) => updateCrew(evt.id, 'youtubeLive', e.target.checked)}
                          className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                        />
                      </label>

                      {/* Auditorium Live Display */}
                      <label
                        className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                          cfg.auditoriumLive
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Tv className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs">Hall LED / Live Display</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfg.auditoriumLive}
                          onChange={(e) => updateCrew(evt.id, 'auditoriumLive', e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                      </label>

                      {/* Photo Live Printing */}
                      <label
                        className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between transition ${
                          cfg.photoLivePrinting
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Printer className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs">Guest Instant Prints</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={cfg.photoLivePrinting}
                          onChange={(e) => updateCrew(evt.id, 'photoLivePrinting', e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guided Sequential Navigation at Bottom (Requirement 4) */}
      <div className="mt-8 pt-6 border-t border-stone-200">
        {side === 'both' ? (
          activeSideTab === 'bride' ? (
            <div className="bg-gradient-to-r from-amber-50 via-rosewood-50 to-amber-50 p-4 sm:p-5 rounded-3xl border border-rosewood-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isMl
                      ? `👰 വധുവിന്റെ ഭാഗം ക്രമീകരിച്ചു (${activeBrideCount} ചടങ്ങുകൾ സജീവം)`
                      : `👰 Bride Side Configured (${activeBrideCount} events active)`}
                  </span>
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isMl
                    ? 'ഇനി ആൽബങ്ങളും വീഡിയോ ഔട്ട്പുട്ടുകളും തിരഞ്ഞെടുക്കാൻ താഴെ ക്ലിക്ക് ചെയ്യുക'
                    : 'Now proceed to customize 4K/HD videos, photo albums, and frames'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setActiveSideTab('groom');
                    const el = document.getElementById('wedding-customizer-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs shadow-2xs transition"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  <span>{isMl ? '🤵 വരന്റെ ഭാഗം' : 'Groom Side'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('deliverables-customizer-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-98"
                >
                  <span>{isMl ? 'ഡെലിവറബിൾസിലേക്ക് (Deliverables) 📦' : 'Next: Deliverables 📦'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-amber-50 via-rosewood-50 to-amber-50 p-4 sm:p-5 rounded-3xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <p className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    {isMl
                      ? `🤵 വരന്റെ ഭാഗം ക്രമീകരിച്ചു (${activeGroomCount} ചടങ്ങുകൾ സജീവം)`
                      : `🤵 Groom Side Configured (${activeGroomCount} events active)`}
                  </span>
                </p>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isMl
                    ? 'അടുത്തതായി വധുവിന്റെ ഭാഗത്തെ ചടങ്ങുകളും ക്രൂവും ക്രമീകരിക്കാം'
                    : 'Next step: configure Bride side ceremonies, crew, and drone'}
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('deliverables-customizer-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 font-bold text-xs shadow-2xs transition"
                >
                  <span>{isMl ? 'സ്കിപ്പ് & ഡെലിവറബിൾസ്' : 'Skip to Deliverables'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveSideTab('bride');
                    const el = document.getElementById('wedding-customizer-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rosewood-600 to-rosewood-700 hover:from-rosewood-700 hover:to-rosewood-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-98"
                >
                  <span>{isMl ? 'വധുവിന്റെ ഭാഗം ക്രമീകരിക്കാം 👰' : 'Next: Bride Side 👰'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50 p-4 sm:p-5 rounded-3xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {isMl
                    ? 'ചടങ്ങുകൾ വിജയകരമായി ക്രമീകരിച്ചു'
                    : 'Ceremonies & Crew Configured'}
                </span>
              </p>
              <p className="text-xs text-stone-600 mt-0.5">
                {isMl
                  ? 'ഇനി ആൽബങ്ങളും വീഡിയോ ക്വാളിറ്റിയും തിരഞ്ഞെടുക്കാനായി താഴെ ക്ലിക്ക് ചെയ്യുക'
                  : 'Proceed to select video quality, photo albums, frames, and keepsakes'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('deliverables-customizer-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-98"
            >
              <span>{isMl ? 'ഡെലിവറബിൾസിലേക്ക് (Deliverables) 📦' : 'Next: Deliverables 📦'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
