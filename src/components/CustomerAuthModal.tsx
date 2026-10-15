'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CustomerUser } from '@/types';
import { auth } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Loader2,
  AlertCircle,
  Smartphone,
  Info,
} from 'lucide-react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: CustomerUser) => void;
  language?: 'en' | 'ml';
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language = 'en',
}) => {
  const isMl = language === 'ml';

  const [step, setStep] = useState<'details' | 'verify_phone' | 'verify_email'>('details');
  const [verificationMethod, setVerificationMethod] = useState<'phone' | 'email'>('phone');
  const [formData, setFormData] = useState<CustomerUser>({
    name: '',
    phone: '',
    email: '',
    address: '',
    place: 'കായംകുളം',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpInput, setOtpInput] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // Email OTP specific states
  const [emailOtpToken, setEmailOtpToken] = useState<string>('');
  const [devOtpCode, setDevOtpCode] = useState<string>('');
  const [emailWarning, setEmailWarning] = useState<string>('');

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Initialize reCAPTCHA verifier for Phone Auth
  const initRecaptcha = () => {
    if (typeof window === 'undefined') return null;

    try {
      if (recaptchaVerifierRef.current) {
        return recaptchaVerifierRef.current;
      }

      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setAuthError(
            isMl
              ? 'reCAPTCHA കാലാവധി കഴിഞ്ഞു. വീണ്ടും ശ്രമിക്കുക.'
              : 'reCAPTCHA expired. Please try again.'
          );
        },
      });

      recaptchaVerifierRef.current = verifier;
      window.recaptchaVerifier = verifier;
      return verifier;
    } catch (e: any) {
      console.warn('reCAPTCHA init notice:', e);
      return recaptchaVerifierRef.current || window.recaptchaVerifier || null;
    }
  };

  // Countdown timer for OTP resend (works for both phone & email)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((step === 'verify_phone' || step === 'verify_email') && resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  // Format Firebase Error Messages into user-friendly Malayalam & English
  const getFriendlyErrorMessage = (error: any) => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-phone-number':
        return isMl
          ? 'നൽകിയ മൊബൈൽ നമ്പർ ശരിയല്ല. 10 അക്ക നമ്പർ പരിശോധിക്കുക.'
          : 'Invalid phone number format. Please provide a valid 10-digit number.';
      case 'auth/missing-phone-number':
        return isMl ? 'മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter your phone number.';
      case 'auth/quota-exceeded':
        return isMl
          ? 'ഇന്നത്തെ SMS പരിധി കഴിഞ്ഞു. അല്പസമയത്തിന് ശേഷം ശ്രമിക്കുക അല്ലെങ്കിൽ ഇമെയിൽ വഴി വെരിഫൈ ചെയ്യുക.'
          : 'SMS quota exceeded for today. Please try again later or use Email verification.';
      case 'auth/too-many-requests':
        return isMl
          ? 'കൂടുതൽ തവണ ശ്രമിച്ചു. സുരക്ഷാ കാരണങ്ങളാൽ അല്പം കഴിഞ്ഞ് ശ്രമിക്കുക.'
          : 'Too many requests. Please wait a few moments before trying again.';
      case 'auth/invalid-verification-code':
        return isMl
          ? 'തെറ്റായ OTP കോഡ്! നിങ്ങളുടെ ഫോണിൽ വന്ന SMS പരിശോധിച്ച് നൽകുക.'
          : 'Incorrect OTP code. Please enter the valid 6-digit code received via SMS.';
      case 'auth/code-expired':
        return isMl
          ? 'OTP യുടെ കാലാവധി കഴിഞ്ഞു. പുതിയ കോഡിനായി Resend ക്ലിക്ക് ചെയ്യുക.'
          : 'OTP code has expired. Please click resend to get a new code.';
      case 'auth/captcha-check-failed':
        return isMl
          ? 'സുരക്ഷാ പരിശോധന പരാജയപ്പെട്ടു. പേജ് റീഫ്രഷ് ചെയ്ത് വീണ്ടും ശ്രമിക്കുക.'
          : 'reCAPTCHA verification failed. Please refresh and try again.';
      case 'auth/network-request-failed':
        return isMl
          ? 'ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക.'
          : 'Network error. Please check your internet connection.';
      default:
        return (
          error?.message ||
          (isMl
            ? 'വെരിഫിക്കേഷൻ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
            : 'Authentication failed. Please try again.')
        );
    }
  };

  // Send Firebase Phone OTP or Email OTP
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = isMl ? 'പേര് നൽകുക' : 'Please enter your name';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = isMl ? 'ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക' : 'Please enter a valid 10-digit phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = isMl ? 'ശരിയായ ഇമെയിൽ നൽകുക' : 'Please enter a valid email address';
    }

    if (!formData.address.trim()) {
      newErrors.address = isMl ? 'മേൽവിലാസം നൽകുക' : 'Please enter your address';
    }
    if (!formData.place.trim()) {
      newErrors.place = isMl ? 'സ്ഥലം നൽകുക' : 'Please enter your place/city';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (verificationMethod === 'phone') {
        const verifier = initRecaptcha();
        if (!verifier) {
          throw new Error('reCAPTCHA verifier could not be initialized.');
        }

        // Standardize phone to E.164 (+91XXXXXXXXXX)
        const e164Phone = cleanPhone.startsWith('91') && cleanPhone.length === 12
          ? `+${cleanPhone}`
          : `+91${cleanPhone.slice(-10)}`;

        const confirmation = await signInWithPhoneNumber(auth, e164Phone, verifier);
        setConfirmationResult(confirmation);
        window.confirmationResult = confirmation;
        setOtpInput('');
        setResendTimer(60);
        setStep('verify_phone');
      } else {
        // Send 6-Digit Email OTP via internal API
        const res = await fetch('/api/auth/send-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            name: formData.name.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || (isMl ? 'ഇമെയിൽ OTP അയക്കുന്നതിൽ തടസ്സം നേരിട്ടു' : 'Failed to send Email OTP'));
        }

        setEmailOtpToken(data.token || '');
        setDevOtpCode(data.devOtp || '');
        setEmailWarning(data.warning || '');
        setOtpInput('');
        setResendTimer(60);
        setStep('verify_email');
      }
    } catch (err: any) {
      console.error('Send code error:', err);
      setAuthError(getFriendlyErrorMessage(err));

      // Reset reCAPTCHA on failure so user can retry
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {
          console.warn('reCAPTCHA clear:', e);
        }
        recaptchaVerifierRef.current = null;
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Phone or Email OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    setAuthError('');
    setIsLoading(true);

    try {
      if (step === 'verify_phone') {
        const cleanPhone = formData.phone.replace(/\D/g, '');
        const e164Phone = cleanPhone.startsWith('91') && cleanPhone.length === 12
          ? `+${cleanPhone}`
          : `+91${cleanPhone.slice(-10)}`;

        const verifier = initRecaptcha();
        if (!verifier) throw new Error('reCAPTCHA verifier unavailable');

        const confirmation = await signInWithPhoneNumber(auth, e164Phone, verifier);
        setConfirmationResult(confirmation);
        window.confirmationResult = confirmation;
        setResendTimer(60);
        setOtpInput('');
      } else if (step === 'verify_email') {
        const res = await fetch('/api/auth/send-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim(),
            name: formData.name.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || (isMl ? 'OTP വീണ്ടും അയക്കുന്നതിൽ തടസ്സം നേരിട്ടു' : 'Failed to resend Email OTP'));
        }

        setEmailOtpToken(data.token || '');
        setDevOtpCode(data.devOtp || '');
        setEmailWarning(data.warning || '');
        setResendTimer(60);
        setOtpInput('');
      }
    } catch (err: any) {
      console.error('Resend OTP error:', err);
      setAuthError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Real Firebase Phone OTP
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError(
        isMl
          ? '6 അക്ക OTP കോഡ് നൽകുക.'
          : 'Please enter the 6-digit OTP code.'
      );
      return;
    }

    const currentConfirmation = confirmationResult || window.confirmationResult;
    if (!currentConfirmation) {
      setAuthError(
        isMl
          ? 'OTP സെഷൻ ലഭ്യമല്ല. വീണ്ടും മൊബൈൽ നമ്പർ നൽകുക.'
          : 'OTP session expired. Please re-enter your mobile number.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await currentConfirmation.confirm(otpInput.trim());

      const verifiedUser: CustomerUser = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        place: formData.place.trim(),
        verified: true,
        verificationMethod: 'phone',
        registeredAt: new Date().toISOString(),
      };

      onSuccess(verifiedUser);
      onClose();
    } catch (err: any) {
      console.error('Firebase phone verify error:', err);
      setAuthError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm Email 6-Digit OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!otpInput.trim() || otpInput.trim().length !== 6) {
      setAuthError(
        isMl
          ? '6 അക്ക OTP കോഡ് നൽകുക.'
          : 'Please enter the 6-digit OTP code.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          otp: otpInput.trim(),
          token: emailOtpToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isMl ? 'തെറ്റായ OTP കോഡ്' : 'Invalid OTP code'));
      }

      const verifiedUser: CustomerUser = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        place: formData.place.trim(),
        verified: true,
        verificationMethod: 'email',
        registeredAt: new Date().toISOString(),
      };

      onSuccess(verifiedUser);
      onClose();
    } catch (err: any) {
      console.error('Email OTP verify error:', err);
      setAuthError(err.message || (isMl ? 'വെരിഫിക്കേഷൻ പരാജയപ്പെട്ടു' : 'Verification failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container" />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: Registration Form */}
        {step === 'details' && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold tracking-wide mb-2 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isMl ? 'കസ്റ്റമർ രജിസ്ട്രേഷൻ' : 'Customer Registration'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {isMl ? 'വിവരങ്ങൾ നൽകി ലോഗിൻ ചെയ്യുക' : 'Complete Details to Log In'}
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                {isMl
                  ? 'നിങ്ങളുടെ യഥാർത്ഥ വിവരങ്ങൾ നൽകി OTP വഴി പരിശോധിക്കുക'
                  : 'Enter your valid details and verify via OTP'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-3.5 text-left">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'മുഴുവൻ പേര് (Full Name) *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={isMl ? 'നിങ്ങളുടെ പേര്' : 'Your full name'}
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      errors.name ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-[11px] text-rose-500 mt-0.5">{errors.name}</p>}
              </div>

              {/* 2. Phone Number */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'മൊബൈൽ നമ്പർ (Mobile Number) *' : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 text-xs font-bold text-stone-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    className={`w-full pl-12 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      errors.phone ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone}</p>}
              </div>

              {/* 3. Email ID */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'ഇമെയിൽ ഐഡി (Email Address) *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="youremail@gmail.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      errors.email ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-500 mt-0.5">{errors.email}</p>}
              </div>

              {/* 4. Address */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'മേൽവിലാസം (Address) *' : 'Address *'}
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={isMl ? 'വീട്ടുപേര്, റോഡ്, പിൻകോഡ്' : 'House Name, Street, PIN'}
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      errors.address ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
                {errors.address && <p className="text-[11px] text-rose-500 mt-0.5">{errors.address}</p>}
              </div>

              {/* 5. Place */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isMl ? 'സ്ഥലം / സിറ്റി (Place / City) *' : 'Place / City *'}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder={isMl ? 'ഉദാ: കായംകുളം / ആലപ്പുഴ / ഹരിപ്പാട്' : 'e.g. Kayamkulam / Alappuzha'}
                    value={formData.place}
                    onChange={(e) => {
                      setFormData({ ...formData, place: e.target.value });
                      if (errors.place) setErrors({ ...errors, place: '' });
                    }}
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      errors.place ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
                {errors.place && <p className="text-[11px] text-rose-500 mt-0.5">{errors.place}</p>}
              </div>

              {/* Verification Channel Choice */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {isMl ? 'ഓൺലൈൻ OTP വെരിഫിക്കേഷൻ രീതി തിരഞ്ഞെടുക്കുക *' : 'Choose OTP Verification Method *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationMethod('phone')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      verificationMethod === 'phone'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500 shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isMl ? 'മൊബൈൽ SMS OTP' : 'Phone SMS OTP'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVerificationMethod('email')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      verificationMethod === 'email'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500 shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isMl ? 'ഇമെയിൽ OTP' : 'Email OTP'}</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isMl ? 'OTP കോഡ് അയക്കുന്നു...' : 'Sending OTP Code...'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {verificationMethod === 'phone'
                          ? (isMl ? 'മൊബൈൽ SMS OTP അയക്കുക' : 'Send Phone SMS OTP')
                          : (isMl ? 'ഇമെയിൽ OTP അയക്കുക' : 'Send Email OTP')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>
                    {isMl
                      ? 'യഥാർത്ഥ വിവരങ്ങൾ നൽകിയ ശേഷം മാത്രമേ ലോഗിൻ സാധ്യമാകൂ'
                      : 'Real-time verified authentication required to protect privacy'}
                  </span>
                </p>
              </div>
            </form>
          </>
        )}

        {/* STEP 2A: Phone OTP Screen (Preserved Firebase Phone Auth) */}
        {step === 'verify_phone' && (
          <div className="animate-fade-in text-left">
            <button
              type="button"
              onClick={() => {
                setStep('details');
                setAuthError('');
              }}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-bold mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isMl ? 'വിവരങ്ങൾ മാറ്റുക' : 'Change Details'}</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {isMl ? 'മൊബൈൽ OTP വെരിഫിക്കേഷൻ' : 'Verify Mobile OTP'}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {isMl
                  ? `+91 ${formData.phone} എന്ന നമ്പറിലേക്ക് അയച്ച 6 അക്ക SMS OTP നൽകുക`
                  : `Enter the 6-digit SMS OTP sent to +91 ${formData.phone}`}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {isMl ? '6 അക്ക OTP നൽകുക (Enter 6-Digit SMS OTP) *' : 'Enter 6-Digit SMS OTP *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                      setAuthError('');
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-center text-lg font-black tracking-widest text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      authError ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500">
                {resendTimer > 0 ? (
                  <span>
                    {isMl ? `കോഡ് വീണ്ടും അയക്കാം: ${resendTimer}s` : `Resend code in: ${resendTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-amber-600 font-bold hover:underline disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isMl ? 'കോഡ് വീണ്ടും അയക്കുക' : 'Resend Code'}</span>
                  </button>
                )}
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isMl ? 'Firebase Verified' : 'Firebase Verified'}</span>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || otpInput.length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isMl ? 'പരിശോധിക്കുന്നു...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isMl ? 'വെരിഫൈ ചെയ്ത് ലോഗിൻ ചെയ്യുക' : 'Verify & Log In'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2B: Email 6-Digit OTP Screen */}
        {step === 'verify_email' && (
          <div className="animate-fade-in text-left">
            <button
              type="button"
              onClick={() => {
                setStep('details');
                setAuthError('');
              }}
              className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 font-bold mb-4 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isMl ? 'വിവരങ്ങൾ മാറ്റുക' : 'Change Details'}</span>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-stone-900">
                {isMl ? 'ഇമെയിൽ OTP വെരിഫിക്കേഷൻ' : 'Verify Email OTP'}
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                {isMl
                  ? `${formData.email} എന്ന ഇമെയിലിലേക്ക് അയച്ച 6 അക്ക OTP നൽകുക`
                  : `Enter the 6-digit OTP sent to ${formData.email}`}
              </p>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {emailWarning && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{emailWarning}</span>
              </div>
            )}

            {/* Dev Mode OTP Banner (shown if SMTP key is not yet configured on localhost) */}
            {devOtpCode && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {isMl ? 'ഡെവലപ്‌മെന്റ് ടെസ്റ്റ് കോഡ്:' : 'Dev Test Code:'}{' '}
                    <strong className="tracking-widest font-mono text-sm">{devOtpCode}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpInput(devOtpCode)}
                  className="px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded font-bold text-[11px] transition"
                >
                  {isMl ? 'ഓട്ടോ ഫിൽ' : 'Auto Fill'}
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {isMl ? '6 അക്ക ഇമെയിൽ OTP നൽകുക (Enter 6-Digit Email OTP) *' : 'Enter 6-Digit Email OTP *'}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                      setAuthError('');
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-center text-lg font-black tracking-widest text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                      authError ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500">
                {resendTimer > 0 ? (
                  <span>
                    {isMl ? `കോഡ് വീണ്ടും അയക്കാം: ${resendTimer}s` : `Resend code in: ${resendTimer}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-amber-600 font-bold hover:underline disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isMl ? 'കോഡ് വീണ്ടും അയക്കുക' : 'Resend Code'}</span>
                  </button>
                )}
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isMl ? 'Secure Verification' : 'Secure Verification'}</span>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || otpInput.length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isMl ? 'പരിശോധിക്കുന്നു...' : 'Verifying...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isMl ? 'വെരിഫൈ ചെയ്ത് ലോഗിൻ ചെയ്യുക' : 'Verify & Log In'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
