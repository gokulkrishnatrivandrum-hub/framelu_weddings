'use client';

import React, { useState, useEffect } from 'react';
import { AppUserSession, CustomerUser, StudioUser } from '@/types';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CheckCircle2,
  Save,
  FileText,
  ShieldCheck,
  Calendar,
  AlertCircle,
  LogIn,
  KeyRound,
  Sparkles,
  Lock,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  userSession: AppUserSession | null;
  customerUser: CustomerUser | null;
  studioUser: StudioUser | null;
  language: 'en' | 'ml';
  onUpdateSession: (updatedSession: AppUserSession) => Promise<void>;
  onOpenAuthModal: () => void;
  userQuotesCount: number;
  onViewQuotes: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  userSession,
  customerUser,
  studioUser,
  language = 'en',
  onUpdateSession,
  onOpenAuthModal,
  userQuotesCount,
  onViewQuotes,
}) => {
  const isMl = language === 'ml';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    place: 'കായംകുളം',
    studioName: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize form when userSession or users change
  useEffect(() => {
    if (userSession) {
      setFormData({
        name: userSession.name || customerUser?.name || studioUser?.ownerName || '',
        phone: userSession.phone || customerUser?.phone || studioUser?.phone || '',
        email: userSession.email || customerUser?.email || studioUser?.email || '',
        address: userSession.address || customerUser?.address || studioUser?.address || '',
        place: userSession.place || customerUser?.place || studioUser?.place || 'കായംകുളം',
        studioName: userSession.studioName || studioUser?.studioName || '',
      });
    }
  }, [userSession, customerUser, studioUser]);

  if (!userSession) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in text-center">
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            {isMl ? 'പ്രൊഫൈൽ കാണാൻ ലോഗിൻ ചെയ്യുക' : 'Sign in to access Profile Settings'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto leading-relaxed">
            {isMl
              ? 'നിങ്ങളുടെ പ്രൊഫൈൽ വിവരങ്ങൾ കാണാനും എഡിറ്റ് ചെയ്യാനും സേവ് ചെയ്യാനും ദയവായി ലോഗിൻ ചെയ്യുക.'
              : 'Please sign in to view, edit, and update your account and personal profile details.'}
          </p>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm shadow-md transition cursor-pointer flex items-center gap-2 mx-auto"
          >
            <LogIn className="w-4 h-4" />
            <span>{isMl ? 'ഇപ്പോൾ ലോഗിൻ ചെയ്യുക' : 'Sign In Now'}</span>
          </button>
        </div>
      </div>
    );
  }

  const isStudio = userSession.role === 'studio';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    const cleanName = formData.name.trim();
    if (!cleanName) {
      setErrorMessage(isMl ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(isMl ? 'ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (isStudio && !formData.studioName.trim()) {
      setErrorMessage(isMl ? 'ദയവായി സ്റ്റുഡിയോയുടെ പേര് നൽകുക.' : 'Please enter Studio Name.');
      return;
    }

    setIsSaving(true);

    try {
      const updatedSession: AppUserSession = {
        ...userSession,
        name: cleanName,
        phone: cleanPhone,
        email: userSession.email || formData.email.trim() || undefined,
        address: formData.address.trim() || formData.place.trim() || 'Kerala',
        place: formData.place.trim() || 'കായംകുളം',
        studioName: isStudio ? (formData.studioName.trim() || cleanName) : undefined,
      };

      await Promise.race([
        onUpdateSession(updatedSession),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setErrorMessage(err?.message || (isMl ? 'പ്രൊഫൈൽ സേവ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു.' : 'Failed to save profile.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 animate-fade-in space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg ${
              isStudio
                ? 'bg-gradient-to-tr from-indigo-600 to-blue-600'
                : 'bg-gradient-to-tr from-amber-600 to-rose-600'
            }`}
          >
            {isStudio ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                  isStudio
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isStudio ? (isMl ? 'സ്റ്റുഡിയോ പാർട്ണർ' : 'Studio Partner') : (isMl ? 'കസ്റ്റമർ അക്കൗണ്ട്' : 'Customer Account')}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                {isMl ? 'ആക്ടീവ് പ്രൊഫൈൽ' : 'Active'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              {formData.name || userSession.name}
            </h1>
            <p className="text-xs text-stone-400 font-mono mt-0.5">
              ID: @{userSession.userId || userSession.phone} • {formData.place || 'കായംകുളം'}
            </p>
          </div>
        </div>

        {/* Quick Quotations Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onViewQuotes}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-stone-100 text-xs font-bold transition flex items-center gap-2 border border-white/10 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>
              {isMl ? `തയ്യാറാക്കിയ കൊട്ടേഷനുകൾ (${userQuotesCount})` : `My Quotations (${userQuotesCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            {isMl
              ? 'പ്രൊഫൈൽ വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു! ഇനി മുതൽ ഈ വിവരങ്ങൾ നിങ്ങളുടെ അക്കൗണ്ടിൽ ലഭ്യമായിരിക്കും.'
              : 'Profile updated successfully! Your updated details are now active across your account.'}
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3 text-rose-900 text-xs font-bold animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Edit Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              {isMl ? 'പ്രൊഫൈൽ വിവരങ്ങൾ എഡിറ്റ് ചെയ്യുക' : 'Edit Profile Details'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              {isMl
                ? 'നിങ്ങളുടെ പേര്, ഫോൺ നമ്പർ, വിലാസം എന്നിവ ഇവിടെ മാറ്റം വരുത്തി സേവ് ചെയ്യാവുന്നതാണ്'
                : 'Modify your personal or studio details below and click save'}
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            {isMl ? 'ഐഡി: ' : 'User ID: '} {userSession.userId}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Studio Name (if studio role) */}
          {isStudio && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {isMl ? 'സ്റ്റുഡിയോയുടെ പേര് (Studio Name) *' : 'Studio Name *'}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ഉദാ: ഫ്രെയിംലു വെഡ്ഡിംഗ് ഫിലിംസ്"
                  value={formData.studioName}
                  onChange={(e) => setFormData({ ...formData, studioName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>
          )}

          {/* Full Name / Owner Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {isStudio
                ? (isMl ? 'ഉടമസ്ഥന്റെ പേര് (Owner / Contact Name) *' : 'Owner / Contact Name *')
                : (isMl ? 'കസ്റ്റമറുടെ പേര് (Your Full Name) *' : 'Your Full Name *')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="ഉദാ: രാഹുൽ കൃഷ്ണൻ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Phone and Email in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {isMl ? 'മൊബൈൽ നമ്പർ (Mobile Number) *' : 'Mobile Number *'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  placeholder="10 അക്ക മൊബൈൽ നമ്പർ"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700">
                  {isMl ? 'ഇമെയിൽ ഐഡി (Email Address)' : 'Email Address'}
                </label>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span>{isMl ? 'മാറ്റാൻ കഴിയില്ല (പ്രധാന ലോഗിൻ ഐഡി)' : 'Non-editable (Primary Login ID)'}</span>
                </span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  title={isMl ? 'ഇമെയിൽ ഐഡി മാറ്റാൻ സാധിക്കില്ല. ഇത് നിങ്ങളുടെ അക്കൗണ്ട് ലോഗിൻ ഐഡിയാണ്.' : 'Email address cannot be changed. It is your permanent account ID.'}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-250 text-sm font-semibold text-stone-600 bg-stone-100 cursor-not-allowed select-none opacity-90 transition"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {isMl
                  ? 'നിങ്ങളുടെ ലോഗിൻ ഐഡിയായ ഇമെയിൽ മാറ്റാൻ കഴിയില്ല. പേര്, ഫോൺ നമ്പർ, വിലാസം എന്നിവ മാറ്റാവുന്നതാണ്.'
                  : 'Your email address is your fixed account login ID and cannot be modified. You can update your name, phone, and address below.'}
              </p>
            </div>
          </div>

          {/* Location / District & Full Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {isMl ? 'സ്ഥലം / ജില്ല (Place / Location)' : 'Place / Location'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ഉദാ: കായംകുളം, ആലപ്പുഴ"
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {isMl ? 'പൂർണ്ണ വിലാസം (Full Address)' : 'Full Address'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="ഉദാ: കൃഷ്ണ നിവാസ്, കായംകുളം പി.ഒ"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Save Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-100">
            <span className="text-xs text-stone-400">
              {isMl ? 'മാറ്റങ്ങൾ വരുത്തിയ ശേഷം സേവ് ചെയ്യുക' : 'Click save after making changes'}
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isMl ? 'സേവ് ചെയ്യുന്നു...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isMl ? 'പ്രൊഫൈൽ സേവ് ചെയ്യുക' : 'Save Profile Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Info Details Box */}
      <div className="bg-stone-100 rounded-3xl p-5 border border-stone-200/80 text-xs text-stone-600 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-stone-700">
            {isMl ? 'അക്കൗണ്ട് രജിസ്ട്രേഷൻ തീയതി:' : 'Registered On:'}
          </span>
          <span className="font-mono text-stone-900 font-bold">
            {userSession.loggedInAt ? new Date(userSession.loggedInAt).toLocaleString('en-IN') : 'Active'}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-stone-700">
            {isMl ? 'ലോഗിൻ യൂസർ ഐഡി:' : 'Login User ID:'}
          </span>
          <span className="font-mono text-stone-900 font-bold">
            {userSession.userId}
          </span>
        </div>
      </div>
    </div>
  );
};
