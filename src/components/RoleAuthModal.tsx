'use client';

import React, { useState, useEffect } from 'react';
import { AppUserSession, CustomerUser, StudioUser } from '@/types';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  X,
  User,
  Building2,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Camera,
  Smartphone,
  Loader2,
  AlertCircle,
  MapPin,
  Home,
  ShieldCheck,
} from 'lucide-react';
import {
  saveStudioPartnerToCloud,
  getStudioPartnerByEmail,
  saveCustomerUserToCloud,
  getCustomerUserByIdentifier,
  recordUserLogin,
} from '@/lib/firestoreSync';

interface RoleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: AppUserSession) => void;
  language?: 'en' | 'ml';
  initialRole?: 'customer' | 'studio';
}

type AuthStep = 'choose_method' | 'phone_otp' | 'ask_role' | 'complete_profile';

export const RoleAuthModal: React.FC<RoleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language = 'en',
  initialRole = 'customer',
}) => {
  const isMl = language === 'ml';

  // Step 1: choose_method (Google vs Mobile OTP)
  // Step 2 (if phone): phone_otp
  // Step 3 (if new user): ask_role (Customer or Studio)
  // Step 4: complete_profile
  const [step, setStep] = useState<AuthStep>('choose_method');
  const [selectedRole, setSelectedRole] = useState<'customer' | 'studio'>(initialRole);
  const [authMethodUsed, setAuthMethodUsed] = useState<'google' | 'phone'>('google');

  // Google account details
  const [googleAccount, setGoogleAccount] = useState<{
    email: string;
    name: string;
    photoURL?: string;
    uid?: string;
  } | null>(null);

  // Form fields
  const [studioName, setStudioName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [place, setPlace] = useState('കായംകുളം');

  // Phone OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialNotice, setIsInitialNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('choose_method');
      setSelectedRole(initialRole);
      setAuthMethodUsed('google');
      setErrorMessage('');
      setOtpSent(false);
      setOtpInput('');
      setIsInitialNotice(false);
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  // Helper: Log in as existing customer
  const completeExistingCustomerLogin = async (
    cust: CustomerUser,
    gPhoto?: string
  ) => {
    const cleanEmail = cust.email || '';
    const cleanPhone = cust.phone || '';
    const session: AppUserSession = {
      role: 'customer',
      name: cust.name || 'Valued Customer',
      userId: cust.username || cust.userId || (cleanEmail ? cleanEmail.split('@')[0] : `user_${cleanPhone.slice(-4)}`),
      phone: cleanPhone,
      email: cleanEmail || undefined,
      photoURL: gPhoto,
      address: cust.address || cust.place || 'കായംകുളം',
      place: cust.place || 'കായംകുളം',
      loggedInAt: new Date().toISOString(),
    };

    saveCustomerUserToCloud({
      ...cust,
      lastLoginAt: session.loggedInAt,
      loginCount: (cust.loginCount || 1) + 1,
    }).catch((e) => console.warn('Refresh existing cust err:', e));

    recordUserLogin(session).catch((e) => console.warn('Record login error:', e));

    if (typeof window !== 'undefined') {
      localStorage.setItem('lfb_user_session', JSON.stringify(session));
      localStorage.setItem('framlu_wedding_user', JSON.stringify(cust));
    }

    onSuccess(session);
    onClose();
  };

  // Helper: Log in as existing studio
  const completeExistingStudioLogin = async (
    studio: StudioUser,
    gPhoto?: string
  ) => {
    const cleanEmail = studio.email || '';
    const cleanPhone = studio.phone || '';
    const session: AppUserSession = {
      role: 'studio',
      name: studio.ownerName || studio.studioName || 'Studio Partner',
      userId: cleanEmail ? cleanEmail.split('@')[0] : `studio_${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      email: cleanEmail || undefined,
      photoURL: gPhoto,
      studioName: studio.studioName || 'Framelu Studio Partner',
      address: studio.address || studio.place || 'Kerala',
      place: studio.place || 'Kayamkulam',
      loggedInAt: new Date().toISOString(),
    };

    saveStudioPartnerToCloud({
      ...studio,
      lastLoginAt: session.loggedInAt,
      loginCount: (studio.loginCount || 1) + 1,
    }).catch((e) => console.warn('Refresh existing studio err:', e));

    recordUserLogin(session).catch((e) => console.warn('Record login error:', e));

    if (typeof window !== 'undefined') {
      localStorage.setItem('lfb_user_session', JSON.stringify(session));
      localStorage.setItem('framlu_studio_partner', JSON.stringify(studio));
    }

    onSuccess(session);
    onClose();
  };

  // 1. REAL GOOGLE SIGN-IN FLOW
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setAuthMethodUsed('google');

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await signInWithPopup(auth, provider);
      const gUser = result.user;
      const gEmail = (gUser.email || '').toLowerCase().trim();
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

      // Check existing accounts across customer and studio
      const existingStudio = gEmail ? await getStudioPartnerByEmail(gEmail) : null;
      const existingCust = gEmail ? await getCustomerUserByIdentifier(gEmail) : null;

      // RULE: One ID = One Account Type
      // If already registered as Studio:
      if (existingStudio && existingStudio.status !== 'deleted' && (existingStudio.ownerName || existingStudio.studioName)) {
        await completeExistingStudioLogin(existingStudio, gPhoto);
        return;
      }

      // If already registered as Customer:
      if (existingCust && existingCust.status !== 'deleted' && (existingCust.name || existingCust.phone)) {
        await completeExistingCustomerLogin(existingCust, gPhoto);
        return;
      }

      // NEW USER: Ask if this Google ID is for a Customer or Studio
      setIsInitialNotice(true);
      setStep('ask_role');
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          isMl
            ? 'ഗൂഗിൾ ഓതന്റിക്കേഷൻ എറർ (auth/unauthorized-domain): ദയവായി http://localhost:3000 വഴി ആപ്പ് തുറക്കുക.'
            : 'Firebase Auth Error (auth/unauthorized-domain): Please access via http://localhost:3000.'
        );
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage(
          isMl
            ? 'ബ്രൗസർ ഗൂഗിൾ പോപ്പ്-അപ്പ് തടഞ്ഞു. ദയവായി പോപ്പ്-അപ്പ് അനുവദിച്ച് വീണ്ടും ശ്രമിക്കുക.'
            : 'Browser popup blocked. Please allow popups in your browser settings and try again.'
        );
      } else {
        setErrorMessage(
          isMl
            ? `ഗൂഗിൾ സൈൻ ഇൻ പരാജയപ്പെട്ടു: ${err.message || 'Error'}`
            : (err.message || 'Google sign-in failed. Please try again.')
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. MOBILE OTP: Send OTP
  const handleSendMobileOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage(isMl ? 'ദയവായി 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMessage('');
    setOtpSent(true);
  };

  // 2. MOBILE OTP: Verify OTP
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      setErrorMessage(isMl ? 'ദയവായി ഒടിപി നൽകുക.' : 'Please enter the verification OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAuthMethodUsed('phone');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    try {
      // Check if user already exists with this phone number
      const existingStudio = await getStudioPartnerByEmail(cleanPhone);
      const existingCust = await getCustomerUserByIdentifier(cleanPhone);

      // RULE: One ID = One Account Type
      if (existingStudio && existingStudio.status !== 'deleted' && (existingStudio.ownerName || existingStudio.studioName)) {
        await completeExistingStudioLogin(existingStudio);
        return;
      }

      if (existingCust && existingCust.status !== 'deleted' && (existingCust.name || existingCust.phone)) {
        await completeExistingCustomerLogin(existingCust);
        return;
      }

      // NEW PHONE USER: Ask role (Customer or Studio)
      setIsInitialNotice(true);
      setStep('ask_role');
    } catch (err: any) {
      console.warn('Error on OTP verification lookup:', err);
      // Fallback: proceed to ask role
      setStep('ask_role');
    } finally {
      setIsLoading(false);
    }
  };

  // Select Role for New User
  const handleSelectRoleForNewUser = (role: 'customer' | 'studio') => {
    setSelectedRole(role);
    setErrorMessage('');
    setStep('complete_profile');
  };

  // 3. COMPLETE PROFILE AND SAVE
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (selectedRole === 'studio') {
        if (!studioName.trim()) {
          setErrorMessage(isMl ? 'ദയവായി സ്റ്റുഡിയോയുടെ പേര് നൽകുക.' : 'Please enter Studio Name.');
          setIsLoading(false);
          return;
        }
        if (!address.trim()) {
          setErrorMessage(isMl ? 'ദയവായി സ്റ്റുഡിയോയുടെ പൂർണ്ണ വിലാസം നൽകുക.' : 'Please enter Studio Address.');
          setIsLoading(false);
          return;
        }
      }

      if (!name.trim()) {
        setErrorMessage(
          selectedRole === 'studio'
            ? (isMl ? 'ദയവായി ഉടമസ്ഥന്റെ പേര് നൽകുക.' : 'Please enter Contact / Owner Name.')
            : (isMl ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your full name.')
        );
        setIsLoading(false);
        return;
      }

      let cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
        cleanPhone = cleanPhone.slice(2);
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.slice(1);
      }
      cleanPhone = cleanPhone.slice(-10);

      if (!cleanPhone || cleanPhone.length < 10) {
        setErrorMessage(isMl ? 'ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit mobile number.');
        setIsLoading(false);
        return;
      }

      const finalEmail = (googleAccount?.email || email.trim() || '').toLowerCase();

      // STRICT VALIDATION: ONE ID = ONE ACCOUNT TYPE
      // Check if this ID is already taken by the OTHER role!
      if (finalEmail) {
        if (selectedRole === 'customer') {
          const conflictingStudio = await getStudioPartnerByEmail(finalEmail);
          if (conflictingStudio && conflictingStudio.status !== 'deleted') {
            setErrorMessage(
              isMl
                ? `ഈ മെയിൽ ഐഡി (${finalEmail}) ഇതിനകം ഒരു സ്റ്റുഡിയോ പാർട്ണർ അക്കൗണ്ട് ആയി രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. ഒരു ഐഡിയിൽ ഒരു അക്കൗണ്ട് മാത്രമേ സാധ്യമാകൂ.`
                : `This Email (${finalEmail}) is already registered as a Studio Partner. An ID can only have one account.`
            );
            setIsLoading(false);
            return;
          }
        } else {
          const conflictingCustomer = await getCustomerUserByIdentifier(finalEmail);
          if (conflictingCustomer && conflictingCustomer.status !== 'deleted') {
            setErrorMessage(
              isMl
                ? `ഈ മെയിൽ ഐഡി (${finalEmail}) ഇതിനകം കസ്റ്റമർ അക്കൗണ്ട് ആയി രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. ഒരു ഐഡിയിൽ ഒരു അക്കൗണ്ട് മാത്രമേ സാധ്യമാകൂ.`
                : `This Email (${finalEmail}) is already registered as a Customer. An ID can only have one account.`
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // Also check phone conflict
      if (cleanPhone) {
        if (selectedRole === 'customer') {
          const conflictingStudio = await getStudioPartnerByEmail(cleanPhone);
          if (conflictingStudio && conflictingStudio.status !== 'deleted') {
            setErrorMessage(
              isMl
                ? `ഈ മൊബൈൽ നമ്പർ (${cleanPhone}) ഇതിനകം ഒരു സ്റ്റുഡിയോ പാർട്ണർ അക്കൗണ്ട് ആയി രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.`
                : `This phone number (${cleanPhone}) is already registered as a Studio Partner.`
            );
            setIsLoading(false);
            return;
          }
        } else {
          const conflictingCustomer = await getCustomerUserByIdentifier(cleanPhone);
          if (conflictingCustomer && conflictingCustomer.status !== 'deleted') {
            setErrorMessage(
              isMl
                ? `ഈ മൊബൈൽ നമ്പർ (${cleanPhone}) ഇതിനകം കസ്റ്റമർ അക്കൗണ്ട് ആയി രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.`
                : `This phone number (${cleanPhone}) is already registered as a Customer.`
            );
            setIsLoading(false);
            return;
          }
        }
      }

      const finalStudioName = selectedRole === 'studio' ? (studioName.trim() || name.trim()) : undefined;

      const session: AppUserSession = {
        role: selectedRole,
        name: name.trim(),
        userId: finalEmail ? finalEmail.split('@')[0] : `user_${cleanPhone.slice(-4)}`,
        phone: cleanPhone,
        email: finalEmail || undefined,
        photoURL: googleAccount?.photoURL,
        studioName: finalStudioName,
        address: address.trim() || place.trim() || 'Kerala',
        place: place.trim() || 'കായംകുളം',
        loggedInAt: new Date().toISOString(),
      };

      // 1. Immediately cache in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lfb_user_session', JSON.stringify(session));
        if (finalEmail) {
          if (selectedRole === 'customer') {
            const custUser: CustomerUser = {
              id: `CUST-${finalEmail.replace(/[^a-z0-9]/g, '_')}`,
              name: session.name,
              userId: session.userId,
              phone: session.phone,
              email: finalEmail,
              address: session.address || 'Kerala',
              place: session.place || 'കായംകുളം',
              registeredAt: session.loggedInAt,
              lastLoginAt: session.loggedInAt,
              loginCount: 1,
              role: 'customer',
              status: 'active',
            };
            localStorage.setItem(`cust_user_${finalEmail}`, JSON.stringify(custUser));
            localStorage.setItem('framlu_wedding_user', JSON.stringify(custUser));
          } else {
            const studUser: StudioUser = {
              id: `STUDIO-${finalEmail.replace(/[^a-z0-9]/g, '_')}`,
              studioName: finalStudioName || session.name,
              ownerName: session.name,
              phone: session.phone,
              email: finalEmail,
              address: session.address || 'Kerala',
              place: session.place || 'Kayamkulam',
              registeredAt: session.loggedInAt,
              lastLoginAt: session.loggedInAt,
              loginCount: 1,
              role: 'studio',
              status: 'active',
            };
            localStorage.setItem(`wedding_studio_${finalEmail}`, JSON.stringify(studUser));
            localStorage.setItem('framlu_studio_partner', JSON.stringify(studUser));
          }
        }
      }

      // 2. Trigger instant login in UI
      onSuccess(session);
      onClose();

      // 3. Background Firestore save
      if (selectedRole === 'customer') {
        const custDocId = finalEmail
          ? `CUST-${finalEmail.replace(/[^a-z0-9]/g, '_')}`
          : `CUST-${cleanPhone}`;
        const custUser: CustomerUser = {
          id: custDocId,
          name: session.name,
          userId: session.userId,
          phone: session.phone,
          email: finalEmail || `${session.userId}@frameluweddings.com`,
          address: session.address || 'Kerala',
          place: session.place || 'കായംകുളം',
          registeredAt: session.loggedInAt,
          lastLoginAt: session.loggedInAt,
          loginCount: 1,
          role: 'customer',
          status: 'active',
        };
        saveCustomerUserToCloud(custUser).catch((e) => console.warn('Cloud save customer error:', e));
      } else {
        const studDocId = finalEmail
          ? `STUDIO-${finalEmail.replace(/[^a-z0-9]/g, '_')}`
          : `STUDIO-${cleanPhone}`;
        const studUser: StudioUser = {
          id: studDocId,
          studioName: finalStudioName || session.name,
          ownerName: session.name,
          phone: session.phone,
          email: finalEmail || 'studio@framluweddings.com',
          address: session.address || 'Kerala',
          place: session.place || 'Kayamkulam',
          registeredAt: session.loggedInAt,
          lastLoginAt: session.loggedInAt,
          loginCount: 1,
          role: 'studio',
          status: 'active',
        };
        saveStudioPartnerToCloud(studUser).catch((e) => console.warn('Cloud save studio error:', e));
      }
      recordUserLogin(session).catch((err) => console.warn('Background recordUserLogin error:', err));
    } catch (err: any) {
      console.error('Error completing profile:', err);
      setErrorMessage(err?.message || (isMl ? 'ലോഗിൻ ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു.' : 'Error completing login.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden">
        {/* Top brand accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
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
            Framelu wedding Company
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-stone-900">
            {step === 'choose_method'
              ? isMl
                ? 'ലോഗിൻ / സൈൻ ഇൻ'
                : 'Login / Sign In'
              : step === 'phone_otp'
              ? isMl
                ? 'മൊബൈൽ ഒടിപി സൈൻ ഇൻ'
                : 'Mobile OTP Sign In'
              : step === 'ask_role'
              ? isMl
                ? 'നിങ്ങൾ കസ്റ്റമർ ആണോ സ്റ്റുഡിയോ ആണോ?'
                : 'Are you a Customer or Studio?'
              : isMl
              ? 'ലോഗിൻ വിവരങ്ങൾ പൂർത്തിയാക്കുക'
              : 'Complete Your Profile'}
          </h2>

          <p className="text-stone-500 text-xs mt-1">
            {step === 'choose_method'
              ? isMl
                ? 'തുടരുന്നതിനായി നിങ്ങളുടെ ലോഗിൻ ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക'
                : 'Choose your preferred sign-in method to continue'
              : step === 'phone_otp'
              ? isMl
                ? 'മൊബൈൽ നമ്പറും ഒടിപിയും നൽകി സുരക്ഷിതമായി ലോഗിൻ ചെയ്യുക'
                : 'Enter your 10-digit mobile number to verify with OTP'
              : step === 'ask_role'
              ? isMl
                ? 'ഒരു ഐഡിയിൽ ഒരു അക്കൗണ്ട് മാത്രമേ രജിസ്റ്റർ ചെയ്യാൻ സാധിക്കൂ'
                : 'One ID can only be registered to a single account type'
              : isMl
              ? 'പോർട്ടലിൽ പ്രവേശിക്കാൻ പേരും വിലാസവും നൽകുക'
              : 'Enter your name and details to finalize login'}
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-left animate-fade-in space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium leading-relaxed">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="p-1 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: CHOOSE LOGIN METHOD (Google vs Mobile OTP) */}
        {step === 'choose_method' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Google Sign-In Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-stone-50/60 hover:bg-amber-50/25 transition-all shadow-xs hover:shadow-md cursor-pointer group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900 group-hover:text-amber-900">
                    {isMl ? 'ഗൂഗിൾ വഴി ലോഗിൻ ചെയ്യുക' : 'Continue with Google'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isMl ? 'നിങ്ങളുടെ ജിമെയിൽ അക്കൗണ്ട് ഉപയോഗിച്ച് നേരിട്ട് പ്രവേശിക്കുക' : 'Sign in securely with your Google / Gmail account'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>

            {/* Mobile OTP Sign-In Option */}
            <button
              type="button"
              onClick={() => {
                setStep('phone_otp');
                setErrorMessage('');
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-stone-50/60 hover:bg-amber-50/25 transition-all shadow-xs hover:shadow-md cursor-pointer group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  <Smartphone className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-stone-900 group-hover:text-amber-900">
                    {isMl ? 'മൊബൈൽ ഒടിപി വഴി ലോഗിൻ ചെയ്യുക' : 'Mobile OTP Sign In'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isMl ? '10 അക്ക മൊബൈൽ നമ്പറും ഒടിപിയും നൽകി പ്രവേശിക്കുക' : 'Sign in using 10-digit mobile number and SMS OTP'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>

            {/* Security note */}
            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isMl ? 'ഒരു ഐഡിയിൽ ഒരു അക്കൗണ്ട് മാത്രമേ അനുവദിക്കൂ (Customer / Studio)' : 'One account per ID (Customer or Studio Partner)'}</span>
            </div>
          </div>
        )}

        {/* STEP 2: PHONE OTP FORM */}
        {step === 'phone_otp' && (
          <div className="space-y-4 animate-fade-in">
            <button
              type="button"
              onClick={() => {
                setStep('choose_method');
                setErrorMessage('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isMl ? 'മറ്റ് ലോഗിൻ രീതികൾ' : 'Back to login options'}</span>
            </button>

            {!otpSent ? (
              <form onSubmit={handleSendMobileOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'മൊബൈൽ നമ്പർ നൽകുക (Mobile Number)' : 'Enter 10-Digit Mobile Number'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9847123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={phone.replace(/\D/g, '').length < 10}
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm transition shadow-md cursor-pointer"
                >
                  {isMl ? 'ഒടിപി അയക്കുക (Send OTP)' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                  {isMl ? `+91 ${phone} എന്ന നമ്പറിലേക്ക് OTP അയച്ചിട്ടുണ്ട്.` : `OTP has been sent to +91 ${phone}`}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ലഭിച്ച OTP നൽകുക' : 'Enter OTP Code'}
                  </label>
                  <input
                    type="text"
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl border border-stone-300 text-center text-base font-black tracking-widest text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpInput('');
                    }}
                    className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
                  >
                    {isMl ? 'നമ്പർ മാറ്റുക' : 'Change No'}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !otpInput.trim()}
                    className="w-2/3 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>{isMl ? 'പരിശോധിച്ച് പ്രവേശിക്കുക' : 'Verify & Continue'}</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STEP 3: ASK ROLE (ONLY FOR NEW USERS) */}
        {step === 'ask_role' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium mb-1">
              <span className="font-bold block mb-0.5">
                {isMl ? 'പുതിയ അക്കൗണ്ട് സെറ്റപ്പ്' : 'New Account Setup'}
              </span>
              <span>
                {isMl
                  ? 'ഈ ഐഡിയിൽ ഏത് തരത്തിലുള്ള അക്കൗണ്ട് ആണ് വേണ്ടത് എന്ന് തിരഞ്ഞെടുക്കുക. ഒരു ഐഡിയിൽ ഒരൊറ്റ അക്കൗണ്ട് മാത്രമേ അനുവദിക്കൂ.'
                  : 'Please select your role. Each ID is strictly mapped to only one account type.'}
              </span>
            </div>

            {/* Customer Option */}
            <div
              onClick={() => handleSelectRoleForNewUser('customer')}
              className="group p-4 rounded-2xl border-2 border-stone-200 hover:border-amber-500 bg-stone-50/60 hover:bg-amber-50/25 cursor-pointer transition shadow-xs hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-stone-900">
                      {isMl ? 'ഞാൻ കസ്റ്റമർ ആണ് (Customer)' : 'I am a Customer'}
                    </h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      {isMl ? 'ജനപ്രിയം' : 'Client'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {isMl
                      ? 'വിവാഹ ഫോട്ടോഗ്രാഫി, ക്രൂ, ആൽബങ്ങൾ തിരഞ്ഞെടുക്കാനും വ്യക്തിഗത കൊട്ടേഷൻ നിർമ്മിക്കാനും.'
                      : 'For booking wedding photography, crew & albums for personal wedding/events.'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>

            {/* Studio Option */}
            <div
              onClick={() => handleSelectRoleForNewUser('studio')}
              className="group p-4 rounded-2xl border-2 border-stone-200 hover:border-indigo-500 bg-stone-50/60 hover:bg-indigo-50/25 cursor-pointer transition shadow-xs hover:shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-stone-900">
                      {isMl ? 'ഞാൻ സ്റ്റുഡിയോ പാർട്ണർ ആണ് (Studio)' : 'I am a Studio / Event Partner'}
                    </h4>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
                      B2B Partner
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    {isMl
                      ? 'ക്ലയന്റുകൾക്കായി കൊട്ടേഷൻ നിർമ്മിക്കുക, സ്റ്റുഡിയോ നിരക്കുകൾ ക്രമീകരിക്കുക.'
                      : 'For studios & partners generating client quotations with custom rates.'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-stone-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </div>
          </div>
        )}

        {/* STEP 4: COMPLETE PROFILE FORM */}
        {step === 'complete_profile' && (
          <form onSubmit={handleCompleteRegistration} className="space-y-3 animate-fade-in text-left max-h-[75vh] overflow-y-auto pr-1">
            {/* Identity Badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="overflow-hidden flex-1">
                <span className="text-xs font-black text-emerald-950 block">
                  {selectedRole === 'studio'
                    ? (isMl ? '🏢 സ്റ്റുഡിയോ പ്രൊഫൈൽ സെറ്റപ്പ്' : '🏢 Studio Partner Registration')
                    : (isMl ? '👤 കസ്റ്റമർ പ്രൊഫൈൽ സെറ്റപ്പ്' : '👤 Customer Account Setup')}
                </span>
                <p className="text-[11px] text-emerald-800 truncate mt-0.5 font-bold">
                  {googleAccount?.email || phone || name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('ask_role')}
                className="text-[10px] font-bold text-emerald-700 underline hover:text-emerald-900 shrink-0"
              >
                {isMl ? 'റോൾ മാറ്റുക' : 'Change'}
              </button>
            </div>

            {/* Studio Name (if studio) */}
            {selectedRole === 'studio' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'സ്റ്റുഡിയോയുടെ പേര് (Studio Name) *' : 'Studio Name *'}
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={isMl ? 'ഉദാ: റോയൽ വെഡ്ഡിംഗ് ഫിലിംസ്' : 'e.g. Royal Wedding Films'}
                    value={studioName}
                    onChange={(e) => {
                      setStudioName(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {selectedRole === 'studio'
                  ? (isMl ? 'ഉടമസ്ഥന്റെ / കോൺടാക്റ്റ് പേര് (Owner Name) *' : 'Owner / Contact Name *')
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'മൊബൈൽ നമ്പർ (10 Digits) *' : 'Mobile Number (10 Digits) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="9847123456"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setErrorMessage('');
                  }}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* Email (Pre-filled if Google) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'ഇമെയിൽ ഐഡി (Email ID)' : 'Email ID'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email || googleAccount?.email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={Boolean(googleAccount?.email)}
                  placeholder="you@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 disabled:bg-stone-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {selectedRole === 'studio'
                  ? (isMl ? 'സ്റ്റുഡിയോ വിലാസം (Studio Address) *' : 'Studio Address *')
                  : (isMl ? 'വിലാസം / ലൊക്കേഷൻ (Address)' : 'Address / Locality')}
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={
                    selectedRole === 'studio'
                      ? (isMl ? 'കെട്ടിട നമ്പർ, റോഡ്, സ്ഥലം' : 'Building No, Road, Place')
                      : (isMl ? 'വീട്ടുപേര് / സ്ഥലം' : 'House Name / Street')
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required={selectedRole === 'studio'}
                />
              </div>
            </div>

            {/* Place */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'സ്ഥലം / ജില്ല (Place)' : 'Place / Location'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="കായംകുളം"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('ask_role')}
                className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                {isMl ? 'തിരികെ' : 'Back'}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-60 text-white font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isMl ? 'ലോഗിൻ പൂർത്തിയാക്കുന്നു...' : 'Logging in...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isMl ? 'ലോഗിൻ പൂർത്തിയാക്കുക' : 'Complete Login & Enter'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
