'use client';

import React, { useState, useEffect } from 'react';
import { AppUserSession, CustomerUser, StudioUser } from '@/types';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  X,
  User,
  Building2,
  Lock,
  Phone,
  Mail,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Heart,
  ShieldCheck,
  Smartphone,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  MapPin,
  Home,
} from 'lucide-react';
import {
  saveStudioPartnerToCloud,
  getStudioPartnerByEmail,
  saveCustomerUserToCloud,
  getCustomerUserByIdentifier,
} from '@/lib/firestoreSync';

interface RoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AppUserSession) => void;
  language?: 'en' | 'ml';
  initialRole?: 'customer' | 'studio';
}

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language = 'en',
  initialRole = 'customer',
}) => {
  const isMl = language === 'ml';

  const [step, setStep] = useState<'select_role' | 'auth_method' | 'google_profile_completion'>('select_role');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'studio'>(initialRole);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone' | 'credentials'>('google');

  // Google account details retrieved from Google Auth Provider
  const [googleAccount, setGoogleAccount] = useState<{
    email: string;
    name: string;
    photoURL?: string;
    uid?: string;
  } | null>(null);

  // Credentials / profile fields
  const [studioName, setStudioName] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [place, setPlace] = useState('കായംകുളം');

  // Status & OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('select_role');
      setSelectedRole(initialRole);
      setAuthMethod('google');
      setErrorMessage('');
      setOtpSent(false);
      setOtpInput('');
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleSelectRole = (role: 'customer' | 'studio') => {
    setSelectedRole(role);
    setStep('auth_method');
    setErrorMessage('');
  };

  // REAL GOOGLE SIGN-IN with prompt='select_account'
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      // Forces Google to show the account picker listing all Chrome/system Google accounts
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;

      const gEmail = gUser.email || '';
      const gName = gUser.displayName || '';
      const gPhoto = gUser.photoURL || undefined;

      setGoogleAccount({
        email: gEmail,
        name: gName,
        photoURL: gPhoto,
        uid: gUser.uid,
      });

      if (gName) setName(gName);
      if (gEmail) setEmail(gEmail);

      // Check if this studio partner or customer already exists in Cloud Firestore or localStorage by email
      if (gEmail) {
        const cleanEmail = gEmail.trim().toLowerCase();
        if (selectedRole === 'studio') {
          const existingStudio = await getStudioPartnerByEmail(cleanEmail);
          if (existingStudio) {
            const session: AppUserSession = {
              role: 'studio',
              name: existingStudio.ownerName || existingStudio.studioName,
              userId: cleanEmail.split('@')[0],
              phone: existingStudio.phone,
              email: cleanEmail,
              studioName: existingStudio.studioName,
              address: existingStudio.address,
              place: existingStudio.place || 'Kayamkulam',
              loggedInAt: new Date().toISOString(),
            };
            onSuccess(session);
            onClose();
            return;
          }
        } else {
          // Check if customer already exists in Firestore customer_users
          const existingCust = await getCustomerUserByIdentifier(cleanEmail);
          if (existingCust) {
            const session: AppUserSession = {
              role: 'customer',
              name: existingCust.name,
              userId: existingCust.username || existingCust.userId || cleanEmail.split('@')[0],
              phone: existingCust.phone,
              email: cleanEmail,
              photoURL: gPhoto,
              address: existingCust.address,
              place: existingCust.place || 'കായംകുളം',
              loggedInAt: new Date().toISOString(),
            };
            onSuccess(session);
            onClose();
            return;
          }

          // Check saved leads
          const savedLeadsRaw = typeof window !== 'undefined'
            ? localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads')
            : null;
          if (savedLeadsRaw) {
            try {
              const leadsList = JSON.parse(savedLeadsRaw);
              const found = leadsList.find((l: any) => l.email?.trim().toLowerCase() === cleanEmail);
              if (found) {
                const session: AppUserSession = {
                  role: 'customer',
                  name: found.name || gName,
                  userId: cleanEmail.split('@')[0],
                  phone: found.phone || '',
                  email: cleanEmail,
                  photoURL: gPhoto,
                  address: found.address,
                  place: found.place || 'കായംകുളം',
                  loggedInAt: new Date().toISOString(),
                };
                onSuccess(session);
                onClose();
                return;
              }
            } catch (e) {}
          }
        }
      }

      // Transition to profile completion step only for first-time brand new users
      setStep('google_profile_completion');
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, cancel gracefully
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignored
      } else {
        setErrorMessage(
          isMl
            ? 'ഗൂഗിൾ സൈൻ ഇൻ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
            : (err.message || 'Google sign-in failed. Please try again.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Google Profile after asking required Studio or Customer details
  const handleCompleteGoogleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedRole === 'studio') {
      if (!studioName.trim()) {
        setErrorMessage(isMl ? 'ദയവായി സ്റ്റുഡിയോയുടെ പേര് നൽകുക.' : 'Please enter Studio Name.');
        return;
      }
      if (!address.trim()) {
        setErrorMessage(isMl ? 'ദയവായി സ്റ്റുഡിയോയുടെ പൂർണ്ണ വിലാസം നൽകുക.' : 'Please enter Studio Address.');
        return;
      }
    }

    if (!name.trim()) {
      setErrorMessage(
        selectedRole === 'studio'
          ? (isMl ? 'ദയവായി ഉടമസ്ഥന്റെ / ബന്ധപ്പെടേണ്ട വ്യക്തിയുടെ പേര് നൽകുക.' : 'Please enter Contact Person / Owner Name.')
          : (isMl ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your full name.')
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(isMl ? 'ദയവായി ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const finalEmail = googleAccount?.email || email.trim() || undefined;

    if (selectedRole === 'studio' && !finalEmail) {
      setErrorMessage(isMl ? 'ദയവായി സാധുവായ മെയിൽ ഐഡി നൽകുക.' : 'Please enter a valid Email ID.');
      return;
    }

    const finalStudioName = selectedRole === 'studio' ? (studioName.trim() || name.trim()) : undefined;

    if (selectedRole === 'studio') {
      const stUser: StudioUser = {
        studioName: finalStudioName || 'Studio Partner',
        ownerName: name.trim(),
        phone: cleanPhone,
        email: finalEmail || '',
        address: address.trim(),
        place: place.trim() || 'Kayamkulam',
        registeredAt: new Date().toISOString(),
      };
      // Save in background non-blockingly so login is instant
      saveStudioPartnerToCloud(stUser).catch((err) => console.warn('Background save studio partner error:', err));
    } else {
      const custUser: CustomerUser = {
        name: name.trim(),
        phone: cleanPhone,
        email: finalEmail || '',
        username: finalEmail ? finalEmail.split('@')[0] : `user_${cleanPhone.slice(-4)}`,
        password: password.trim() || undefined,
        address: address.trim() || place || 'Kerala',
        place: place.trim() || 'കായംകുളം',
        verified: true,
        verificationMethod: 'email',
        registeredAt: new Date().toISOString(),
      };
      saveCustomerUserToCloud(custUser).catch((err) => console.warn('Background save customer user error:', err));
    }

    const session: AppUserSession = {
      role: selectedRole,
      name: name.trim(),
      userId: finalEmail ? finalEmail.split('@')[0] : `user_${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      email: finalEmail,
      photoURL: googleAccount?.photoURL,
      studioName: finalStudioName,
      place: place.trim() || 'കായംകുളം',
      loggedInAt: new Date().toISOString(),
    };

    onSuccess(session);
    onClose();
  };

  const handleSendMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage(isMl ? 'ദയവായി 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage('');
    setOtpSent(true);
  };

  const handleVerifyMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setErrorMessage(isMl ? 'ദയവായി ഒടിപി നൽകുക.' : 'Please enter the verification OTP.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const session: AppUserSession = {
      role: selectedRole,
      name: name.trim() || (selectedRole === 'studio' ? `Studio User ${cleanPhone.slice(-4)}` : `User ${cleanPhone.slice(-4)}`),
      userId: userId.trim() || `user_${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      studioName: selectedRole === 'studio' ? (name.trim() || 'Framelu Studio Partner') : undefined,
      place: place || 'കായംകുളം',
      loggedInAt: new Date().toISOString(),
    };

    onSuccess(session);
    onClose();
  };

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setErrorMessage(isMl ? 'യൂസർ ഐഡിയും പാസ്‌വേഡും നൽകുക.' : 'Please enter User ID and Password.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage(isMl ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '') || '9847123456';
    const finalStudioName = selectedRole === 'studio' ? (studioName.trim() || name.trim()) : undefined;

    if (selectedRole === 'studio') {
      const stUser: StudioUser = {
        studioName: finalStudioName || 'Studio Partner',
        ownerName: name.trim(),
        phone: cleanPhone,
        email: email.trim() || `${userId.trim().toLowerCase()}@studio.com`,
        address: address.trim() || place || 'Kayamkulam',
        place: place || 'കായംകുളം',
        registeredAt: new Date().toISOString(),
      };
      // Save in background non-blockingly so login is instant
      saveStudioPartnerToCloud(stUser).catch((err) => console.warn('Background save studio partner error:', err));
    } else {
      const cleanIdent = userId.trim().toLowerCase();
      const existingCust = await getCustomerUserByIdentifier(cleanIdent);
      if (existingCust && existingCust.password) {
        if (existingCust.password !== password.trim()) {
          setErrorMessage(
            isMl
              ? 'തെറ്റായ പാസ്‌വേഡ്! ശരിയായ പാസ്‌വേഡ് നൽകുക അല്ലെങ്കിൽ ഗൂഗിൾ വഴി ലോഗിൻ ചെയ്യുക.'
              : 'Incorrect password! Please enter the correct password or continue with Google.'
          );
          return;
        }
      } else if (!existingCust) {
        // Register new customer user in Firestore
        const newCust: CustomerUser = {
          name: name.trim(),
          phone: cleanPhone,
          email: email.trim() || `${cleanIdent}@framelu.com`,
          username: cleanIdent,
          password: password.trim(),
          address: address.trim() || place || 'Kerala',
          place: place || 'കായംകുളം',
          verified: true,
          verificationMethod: 'email',
          registeredAt: new Date().toISOString(),
        };
        saveCustomerUserToCloud(newCust).catch((err) => console.warn('Save customer user err:', err));
      }
    }

    const session: AppUserSession = {
      role: selectedRole,
      name: name.trim(),
      userId: userId.trim().toLowerCase(),
      phone: cleanPhone,
      email: email.trim() || undefined,
      studioName: finalStudioName,
      place: place || 'കായംകുളം',
      loggedInAt: new Date().toISOString(),
    };

    onSuccess(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Top brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2.5 border border-amber-300">
            <Camera className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full inline-block mb-1">
            Framelu Event Planner
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {step === 'select_role'
              ? isMl
                ? 'നിങ്ങൾ കസ്റ്റമർ ആണോ സ്റ്റുഡിയോ ആണോ?'
                : 'Are you a Customer or a Studio?'
              : step === 'google_profile_completion'
              ? isMl
                ? 'ലോഗിൻ വിവരങ്ങൾ പൂർത്തിയാക്കുക'
                : 'Complete Your Profile'
              : selectedRole === 'customer'
              ? isMl
                ? 'കസ്റ്റമർ ലോഗിൻ / സൈൻ ഇൻ'
                : 'Customer Portal Login'
              : isMl
              ? 'സ്റ്റുഡിയോ പാർട്ണർ ലോഗിൻ'
              : 'Studio Partner Login'}
          </h2>
          <p className="text-stone-500 text-xs mt-1">
            {step === 'select_role'
              ? isMl
                ? 'പോർട്ടലിൽ പ്രവേശിക്കാൻ അനുയോജ്യമായ പ്രൊഫൈൽ തിരഞ്ഞെടുക്കുക'
                : 'Select your account role to continue to the portal'
              : step === 'google_profile_completion'
              ? isMl
                ? 'ഡാഷ്ബോർഡ് തുറക്കുന്നതിനായി പേരും മൊബൈൽ നമ്പറും നൽകുക'
                : 'Enter your name and phone number to complete login'
              : isMl
              ? 'ഗൂഗിൾ അല്ലെങ്കിൽ മൊബൈൽ ഒടിപി ഉപയോഗിച്ച് സുരക്ഷിതമായി ലോഗിൻ ചെയ്യുക'
              : 'Sign in quickly using Google or Mobile OTP'}
          </p>
        </div>

        {/* STEP 1: ROLE SELECTION */}
        {step === 'select_role' && (
          <div className="space-y-4">
            {/* Customer Option */}
            <div
              onClick={() => handleSelectRole('customer')}
              className="group p-5 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-stone-50/50 hover:bg-amber-50/30 cursor-pointer transition shadow-xs hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-stone-900">
                      {isMl ? 'ഞാൻ കസ്റ്റമർ ആണ് (Customer)' : 'I am a Customer'}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {isMl ? 'ജനപ്രിയം' : 'Client'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {isMl
                      ? 'വിവാഹ ഫോട്ടോഗ്രാഫി, ആൽബങ്ങൾ, മറ്റ് സർവീസുകൾ എന്നിവ തിരഞ്ഞെടുത്ത് ലൈവ് കൊട്ടേഷൻ തയ്യാറാക്കാം.'
                      : 'Plan your wedding photography, configure crew & albums, and get instant custom quotations.'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0" />
            </div>

            {/* Studio Option */}
            <div
              onClick={() => handleSelectRole('studio')}
              className="group p-5 rounded-2xl border-2 border-stone-200 hover:border-indigo-500 bg-stone-50/50 hover:bg-indigo-50/30 cursor-pointer transition shadow-xs hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-stone-900">
                      {isMl ? 'ഞാൻ സ്റ്റുഡിയോ പാർട്ണർ ആണ് (Studio)' : 'I am a Studio / Event Partner'}
                    </h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      B2B Partner
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {isMl
                      ? 'ക്ലയന്റുകൾക്കായി കൊട്ടേഷൻ നിർമ്മിക്കുക, ബ്രാൻഡഡ് PDF ഡൗൺലോഡ് ചെയ്യുക, വാട്സാപ്പിൽ അയക്കുക.'
                      : 'Generate client quotations with custom rates, download PDFs, and share via WhatsApp.'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </div>
        )}

        {/* STEP 2: AUTH METHOD & LOGIN */}
        {step === 'auth_method' && (
          <div>
            {/* Back button to switch role */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
              <button
                type="button"
                onClick={() => setStep('select_role')}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isMl ? 'റോൾ മാറ്റുക' : 'Change Role'}</span>
              </button>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                {selectedRole === 'customer'
                  ? isMl
                    ? '👤 കസ്റ്റമർ'
                    : '👤 Customer'
                  : isMl
                  ? '🏢 സ്റ്റുഡിയോ'
                  : '🏢 Studio'}
              </span>
            </div>

            {/* Auth Method Navigation Tabs (User ID temporarily disabled as per request) */}
            <div className="grid grid-cols-2 gap-1.5 bg-stone-100 p-1.5 rounded-2xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  authMethod === 'google'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Google
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  authMethod === 'phone'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Mobile OTP
              </button>

              {/* User ID Tab temporarily disabled as per request
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('credentials');
                  setErrorMessage('');
                }}
                className={`py-2 px-1 rounded-xl transition text-center ${
                  authMethod === 'credentials'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                User ID
              </button>
              */}
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. REAL Google Sign-In with Account Chooser */}
            {authMethod === 'google' && (
              <div className="space-y-4 text-center py-2 animate-fade-in">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-amber-500 hover:bg-amber-50/20 disabled:opacity-60 py-3.5 px-4 rounded-2xl font-bold text-sm text-stone-800 transition shadow-xs hover:shadow-md active:scale-98 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                      <span>{isMl ? 'ഗൂഗിൾ അക്കൗണ്ട് തുറക്കുന്നു...' : 'Opening Google Sign-In...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>{isMl ? 'ഗൂഗിൾ വഴി തുടരുക (Google Sign-In)' : 'Continue with Google'}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  {isMl
                    ? 'സിസ്റ്റത്തിൽ ലോഗിൻ ചെയ്തിട്ടുള്ള നിങ്ങളുടെ ജിമെയിൽ അക്കൗണ്ടുകൾ ലിസ്റ്റ് ചെയ്യപ്പെടും'
                    : 'Select from your logged-in Google / Gmail accounts to sign in securely'}
                </p>
              </div>
            )}

            {/* 2. Mobile Sign-In */}
            {authMethod === 'phone' && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendMobileOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'നിങ്ങളുടെ പേര്' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        placeholder={selectedRole === 'studio' ? 'Framelu Studio Partner' : 'Arun Krishna'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'മൊബൈൽ നമ്പർ' : 'Mobile Number'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="9847123456"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-md cursor-pointer"
                    >
                      {isMl ? 'ഒടിപി അയക്കുക' : 'Send Verification OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                      {isMl ? `${phone} എന്ന നമ്പറിലേക്ക് OTP അയച്ചിട്ടുണ്ട്.` : `OTP has been sent to +91 ${phone}`}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'ലഭിച്ച OTP നൽകുക' : 'Enter OTP'}
                      </label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-center text-sm font-black tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-1/3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
                      >
                        {isMl ? 'തിരികെ' : 'Back'}
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-md cursor-pointer"
                      >
                        {isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Verify & Enter'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 3. User ID & Password Sign-In (Temporarily disabled as requested) */}
            {/*
            {authMethod === 'credentials' && (
              <form onSubmit={handleCredentialsAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'നിങ്ങളുടെ പേര്' : 'Full Name / Studio Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={selectedRole === 'studio' ? 'Framelu Studio Partner' : 'Arun Krishna'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'യൂസർ ഐഡി (User ID)' : 'User ID / Username'}
                    </label>
                    <input
                      type="text"
                      placeholder="arun_krishna"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'പാസ്‌വേഡ് (Password)' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-3.5 pr-8 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'മൊബൈൽ നമ്പർ' : 'Mobile Number'}
                    </label>
                    <input
                      type="tel"
                      placeholder="9847123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isMl ? 'സ്ഥലം' : 'Location / Place'}
                    </label>
                    <input
                      type="text"
                      placeholder="കായംകുളം"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-md hover:shadow-lg active:scale-98 cursor-pointer mt-2"
                >
                  {isMl ? 'ലോഗിൻ ചെയ്യുക / പോർട്ടലിൽ കയറുക' : 'Login / Create Account & Enter'}
                </button>
              </form>
            )}
            */}
          </div>
        )}

        {/* STEP 3: GOOGLE PROFILE COMPLETION (Asks Full details before completing login) */}
        {step === 'google_profile_completion' && googleAccount && (
          <form onSubmit={handleCompleteGoogleProfile} className="space-y-3.5 animate-fade-in text-left max-h-[75vh] overflow-y-auto pr-1">
            {/* Google account verified badge card */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              {googleAccount.photoURL ? (
                <img
                  src={googleAccount.photoURL}
                  alt={googleAccount.name}
                  className="w-10 h-10 rounded-full border border-emerald-300 object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0">
                  {(googleAccount.name || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden flex-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-black text-emerald-950">
                    {selectedRole === 'studio'
                      ? (isMl ? 'സ്റ്റുഡിയോ ഗൂഗിൾ അക്കൗണ്ട് കണക്റ്റ് ചെയ്തു' : 'Studio Google Account Connected')
                      : (isMl ? 'ഗൂഗിൾ അക്കൗണ്ട് വെരിഫൈ ചെയ്തു' : 'Google Account Connected')}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-bold truncate mt-0.5">
                  {googleAccount.email}
                </p>
              </div>
            </div>

            {/* If Studio: Studio Name */}
            {selectedRole === 'studio' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'സ്റ്റുഡിയോയുടെ പേര് (Studio Name) *' : 'Studio Name *'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={isMl ? 'ഉദാ: ലൂമിന വെഡ്ഡിംഗ് ഫിലിംസ്' : 'e.g. Lumina Wedding Films'}
                    value={studioName}
                    onChange={(e) => {
                      setStudioName(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Contact Person / Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {selectedRole === 'studio'
                  ? (isMl ? 'ഉടമസ്ഥന്റെ / കോൺടാക്റ്റ് പേര് (Owner / Contact Name) *' : 'Owner / Contact Person Name *')
                  : (isMl ? 'നിങ്ങളുടെ പേര് (Full Name) *' : 'Full Name *')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={isMl ? 'നിങ്ങളുടെ പേര്' : 'Full Name'}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Mobile Number (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {selectedRole === 'studio'
                  ? (isMl ? 'സ്റ്റുഡിയോ ഫോൺ നമ്പർ (Studio Phone) *' : 'Studio Phone Number *')
                  : (isMl ? 'മൊബൈൽ നമ്പർ (Mobile Number) *' : 'Mobile Number *')}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9847123456"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Email field if studio */}
            {selectedRole === 'studio' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'സ്റ്റുഡിയോ മെയിൽ ഐഡി (Email ID) *' : 'Studio Email ID *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email || googleAccount.email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Studio Full Address if Studio */}
            {selectedRole === 'studio' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'സ്റ്റുഡിയോ വിലാസം (Studio Address) *' : 'Studio Address *'}
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={2}
                    placeholder={isMl ? 'കെട്ടിട നമ്പർ, റോഡ്, ലൊക്കേഷൻ...' : 'Building No, Street, Location...'}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* Place / City */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'സ്ഥലം / ജില്ല (Place / Location)' : 'Place / Location'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={isMl ? 'കായംകുളം / ആലപ്പുഴ' : 'Kayamkulam / Kerala'}
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('auth_method')}
                className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                {isMl ? 'തിരികെ' : 'Back'}
              </button>

              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isMl ? 'നെക്സ്റ്റ്: ലോഗിൻ പൂർത്തിയാക്കുക' : 'Complete Login & Enter'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
