// @ts-nocheck
'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Calculator,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  DollarSign,
  Heart,
  Sliders,
  Camera,
  Film,
  BookOpen,
  MapPin,
  Send,
} from 'lucide-react';
import { EventCrewConfig, DeliverablesConfig } from '@/types';

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ml';
  onApplyAiPackage: (config: {
    crew: Partial<EventCrewConfig>;
    deliverables: Partial<DeliverablesConfig>;
  }) => void;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  language,
  onApplyAiPackage,
}) => {
  const isMl = language === 'ml';
  const [activeTab, setActiveTab] = useState<'budget' | 'timeline'>('budget');

  // Budget Optimizer State
  const [targetBudget, setTargetBudget] = useState<number>(120000);
  const [budgetFocus, setBudgetFocus] = useState<
    'balanced' | 'cinematic_video' | 'luxury_albums' | 'candid_photo'
  >('balanced');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [budgetResult, setBudgetResult] = useState<{
    advice: string;
    recommendedConfig: any;
  } | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Timeline Scheduler State
  const [tradition, setTradition] = useState<
    'kerala_hindu' | 'christian' | 'muslim' | 'contemporary'
  >('kerala_hindu');
  const [eventDate, setEventDate] = useState<string>('Upcoming Wedding');
  const [muhurthamTime, setMuhurthamTime] = useState<string>('10:30 AM - 11:30 AM');
  const [receptionTime, setReceptionTime] = useState<string>('12:30 PM - 02:30 PM');
  const [venueName, setVenueName] = useState<string>('Auditorium, Kayamkulam');
  const [isGeneratingTimeline, setIsGeneratingTimeline] = useState(false);
  const [timelineSchedule, setTimelineSchedule] = useState<string | null>(null);
  const [copiedTimeline, setCopiedTimeline] = useState(false);

  if (!isOpen) return null;

  // Handle Budget Optimization
  const handleOptimizeBudget = async () => {
    setIsOptimizing(true);
    setBudgetResult(null);
    setAppliedSuccess(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_budget',
          language,
          targetBudget,
          preferences: { focus: budgetFocus },
        }),
      });

      const data = await res.json();
      if (data.advice) {
        setBudgetResult({
          advice: data.advice,
          recommendedConfig: data.recommendedConfig,
        });
      }
    } catch (e) {
      console.error('Failed to optimize budget:', e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle Timeline Generation
  const handleGenerateTimeline = async () => {
    setIsGeneratingTimeline(true);
    setTimelineSchedule(null);
    setCopiedTimeline(false);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'timeline',
          language,
          timelineData: {
            tradition,
            eventDate,
            muhurthamTime,
            receptionTime,
            venueName,
          },
        }),
      });

      const data = await res.json();
      if (data.schedule) {
        setTimelineSchedule(data.schedule);
      }
    } catch (e) {
      console.error('Failed to generate timeline:', e);
    } finally {
      setIsGeneratingTimeline(false);
    }
  };

  // Copy timeline to clipboard
  const handleCopyTimeline = () => {
    if (!timelineSchedule) return;
    navigator.clipboard.writeText(timelineSchedule);
    setCopiedTimeline(true);
    setTimeout(() => setCopiedTimeline(false), 2500);
  };

  // Apply AI package directly to main planner
  const handleApplyToPlanner = () => {
    if (!budgetResult?.recommendedConfig) return;
    const { weddingCrew, deliverables } = budgetResult.recommendedConfig;

    onApplyAiPackage({
      crew: {
        photographers: weddingCrew.photographers,
        videographers: weddingCrew.videographers,
        candidPhotographers: weddingCrew.candidPhotographers,
        cinematicVideographers: weddingCrew.cinematicVideographers,
        dronePilots: weddingCrew.dronePilots,
      },
      deliverables: {
        albumSheets: deliverables.albumSheets,
        albumType: deliverables.albumType,
        teaserVideo: deliverables.teaserVideo,
        highlightFilm: deliverables.highlightFilm,
        fullDocumentary: deliverables.fullDocumentary,
      },
    });

    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg sm:text-xl tracking-tight text-white">
                  Framlu AI Planner & Scheduler
                </h3>
                <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-purple-100 font-medium">
                {isMl
                  ? 'നിങ്ങളുടെ വിവാഹ ബജറ്റും മുഹൂർത്ത ഷെഡ്യൂളും AI സഹായത്തോടെ ചിട്ടപ്പെടുത്താം'
                  : 'Optimize your wedding package budget & generate a minute-by-minute ceremony timeline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-100 p-2 border-b border-stone-200 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('budget')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'budget'
                ? 'bg-white text-purple-700 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-purple-600" />
            <span>{isMl ? '⚡ എഐ ബജറ്റ് ഒപ്റ്റിമൈസർ' : '⚡ AI Smart Budget Optimizer'}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-700 shadow-sm border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>{isMl ? '📅 മുഹൂർത്തം & ടൈംലൈൻ ഷെഡ്യൂളർ' : '📅 Muhurtham Timeline Scheduler'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: BUDGET OPTIMIZER */}
          {/* ======================================================== */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  {isMl ? 'നിങ്ങളുടെ ടാർഗെറ്റ് ബജറ്റ് (രൂപയിൽ)' : 'Your Target Budget (in ₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="5000"
                    min="30000"
                    max="1000000"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl font-black text-stone-900 text-lg focus:border-purple-600 focus:bg-white outline-hidden transition"
                  />
                </div>

                {/* Quick Budget Badges */}
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {[50000, 75000, 100000, 150000, 200000, 250000].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setTargetBudget(b)}
                      className={`text-xs font-bold px-3 py-1 rounded-xl transition ${
                        targetBudget === b
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                      }`}
                    >
                      ₹{(b / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Focus */}
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  {isMl ? 'പ്രധാന മുൻഗണന (Priority Preference)' : 'Priority Focus'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      id: 'balanced',
                      label: isMl ? 'സന്തുലിതം' : 'Balanced',
                      desc: isMl ? 'എല്ലാം ഒത്തുചേർന്നത്' : 'All-round best value',
                      icon: Sliders,
                    },
                    {
                      id: 'candid_photo',
                      label: isMl ? 'കാൻഡിഡ് ഫോട്ടോ' : 'Candid Photos',
                      desc: isMl ? 'സ്വാഭാവിക ഭാവങ്ങൾ' : 'Emotive moments focus',
                      icon: Camera,
                    },
                    {
                      id: 'cinematic_video',
                      label: isMl ? 'സിനിമാറ്റിക് ഫിലിം' : 'Cinematic Film',
                      desc: isMl ? 'ടീസർ, റീൽസ് & ഡ്രോൺ' : 'Teaser, Reels & 4K',
                      icon: Film,
                    },
                    {
                      id: 'luxury_albums',
                      label: isMl ? 'ലക്ഷ്വറി ആൽബം' : 'Luxury Albums',
                      desc: isMl ? 'കാൻവേര & ഫെതർ ടച്ച്' : 'Canvera & Premium sheets',
                      icon: BookOpen,
                    },
                  ].map((f) => {
                    const Icon = f.icon;
                    const isSelected = budgetFocus === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setBudgetFocus(f.id as any)}
                        className={`p-3 rounded-2xl text-left border-2 transition ${
                          isSelected
                            ? 'border-purple-600 bg-purple-50/60 text-purple-950 shadow-xs'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-purple-600' : 'text-stone-400'}`} />
                        <div className="text-xs font-black">{f.label}</div>
                        <div className="text-[10px] text-stone-500 font-medium">{f.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleOptimizeBudget}
                disabled={isOptimizing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white font-black rounded-2xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isMl ? 'എഐ പാക്കേജ് കണക്കുകൂട്ടുന്നു...' : 'Calculating AI Smart Package...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>
                      {isMl ? '✨ എഐ സ്മാർട്ട് പാക്കേജ് തയ്യാറാക്കൂ' : '✨ Generate AI Optimized Package'}
                    </span>
                  </>
                )}
              </button>

              {/* Result Preview */}
              {budgetResult && (
                <div className="bg-gradient-to-br from-purple-50/80 via-white to-amber-50/50 border-2 border-purple-200 rounded-3xl p-5 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      {isMl ? 'എഐ പാക്കേജ് ശുപാർശ' : 'AI Recommendation Result'}
                    </span>
                    <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                      ₹{targetBudget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-purple-100">
                    {budgetResult.advice}
                  </div>

                  {/* Apply Button */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleApplyToPlanner}
                      disabled={appliedSuccess}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {appliedSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>{isMl ? 'പ്ലാനറിലേക്ക് വിജയകരമായി മാറ്റി!' : 'Applied to Live Planner!'}</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          <span>
                            {isMl
                              ? '🚀 ഈ പാക്കേജ് ലൈവ് പ്ലാനറിലേക്ക് പ്രയോഗിക്കുക'
                              : '🚀 Apply this Setup to Live Planner'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: WEDDING TIMELINE SCHEDULER */}
          {/* ======================================================== */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tradition */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    {isMl ? 'വിവാഹ പാരമ്പര്യം / ചടങ്ങ് ശൈലി' : 'Wedding Tradition & Style'}
                  </label>
                  <select
                    value={tradition}
                    onChange={(e) => setTradition(e.target.value as any)}
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-900 text-sm focus:border-indigo-600 focus:bg-white outline-hidden"
                  >
                    <option value="kerala_hindu">
                      {isMl ? 'കേരള ഹിന്ദു (താലികെട്ട് & സദ്യ)' : 'Kerala Hindu (Thalikettu & Sadya)'}
                    </option>
                    <option value="christian">
                      {isMl ? 'ക്രിസ്ത്യൻ (പള്ളി ചടങ്ങുകൾ & റിസപ്ഷൻ)' : 'Christian (Church Nuptials & Grand Reception)'}
                    </option>
                    <option value="muslim">
                      {isMl ? 'മുസ്ലിം (നിക്കാഹ് & വലീമ / സൽക്കാരം)' : 'Muslim (Nikah & Reception / Valima)'}
                    </option>
                    <option value="contemporary">
                      {isMl ? 'മോഡേൺ ഡെസ്റ്റിനേഷൻ വെഡ്ഡിംഗ്' : 'Modern Contemporary / Destination'}
                    </option>
                  </select>
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    {isMl ? 'വിവാഹ തീയതി' : 'Wedding Date'}
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="e.g. 25 November 2026"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-900 text-sm focus:border-indigo-600 focus:bg-white outline-hidden"
                  />
                </div>

                {/* Muhurtham Window */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    {isMl ? 'മുഹൂർത്ത സമയം / പ്രധാന ചടങ്ങ്' : 'Muhurtham / Ceremony Timing'}
                  </label>
                  <input
                    type="text"
                    value={muhurthamTime}
                    onChange={(e) => setMuhurthamTime(e.target.value)}
                    placeholder="e.g. 10:30 AM - 11:30 AM"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-900 text-sm focus:border-indigo-600 focus:bg-white outline-hidden"
                  />
                </div>

                {/* Reception Time */}
                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    {isMl ? 'സദ്യ / റിസപ്ഷൻ സമയം' : 'Sadya / Reception Timing'}
                  </label>
                  <input
                    type="text"
                    value={receptionTime}
                    onChange={(e) => setReceptionTime(e.target.value)}
                    placeholder="e.g. 12:30 PM - 02:30 PM"
                    className="w-full px-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-900 text-sm focus:border-indigo-600 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              {/* Venue Name */}
              <div>
                <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  {isMl ? 'ഓഡിറ്റോറിയം / വേദിയുടെ പേര് & സ്ഥലം' : 'Auditorium / Venue & Location'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Town Hall Auditorium, Kayamkulam"
                    className="w-full pl-11 pr-4 py-3 bg-stone-50 border-2 border-stone-200 rounded-2xl font-bold text-stone-900 text-sm focus:border-indigo-600 focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerateTimeline}
                disabled={isGeneratingTimeline}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-600 hover:from-indigo-700 hover:to-amber-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isGeneratingTimeline ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isMl ? 'മുഹൂർത്ത ഷെഡ്യൂൾ തയ്യാറാക്കുന്നു...' : 'Drafting Minute-by-Minute Schedule...'}</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-300" />
                    <span>
                      {isMl ? '✨ എഐ വെഡ്ഡിംഗ് ടൈംലൈൻ ജനറേറ്റ് ചെയ്യൂ' : '✨ Generate AI Wedding Day Timeline'}
                    </span>
                  </>
                )}
              </button>

              {/* Timeline Output */}
              {timelineSchedule && (
                <div className="bg-gradient-to-br from-indigo-50/80 via-white to-stone-50 border-2 border-indigo-200 rounded-3xl p-5 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      {isMl ? 'മുഹൂർത്തം ഫോട്ടോഗ്രാഫി ഷെഡ്യൂൾ' : 'Master Photography Timeline'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTimeline}
                      className="flex items-center gap-1.5 text-xs font-black bg-indigo-100 hover:bg-indigo-200 text-indigo-900 px-3 py-1 rounded-xl transition cursor-pointer"
                    >
                      {copiedTimeline ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isMl ? 'കോപ്പി ചെയ്തു!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isMl ? 'കോപ്പി ചെയ്യുക' : 'Copy Schedule'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-stone-800 whitespace-pre-line leading-relaxed font-medium bg-white/90 p-4 rounded-2xl border border-indigo-100 max-h-96 overflow-y-auto">
                    {timelineSchedule}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
