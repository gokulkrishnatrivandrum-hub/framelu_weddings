'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CustomerUser } from '@/types';
import { auth } from '@/lib/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
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
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  saveCustomerUserToCloud,
  getCustomerUserByIdentifier,
  updateCustomerUserPassword,
} from '@/lib/firestoreSync';

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

  const [authMode, setAuthMode] = useState<'quick_email' | 'register'>('quick_email');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPassword, setQuickPassword] = useState('');
  const [showQuickPassword, setShowQuickPassword] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(true);
  const [userHasAccount, setUserHasAccount] = useState<boolean | null>(null);

  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [matchedUser, setMatchedUser] = useState<CustomerUser | null>(null);
  const [matchedBillsCount, setMatchedBillsCount] = useState<number>(0);

  const [step, setStep] = useState<
    'details' | 'verify_phone' | 'verify_email' | 'google_profile_completion' | 'forgot_password' | 'forgot_password_otp'
  >('details');

  // Forgot Password specific states
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [forgotToken, setForgotToken] = useState('');
  const [forgotDevOtp, setForgotDevOtp] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');

  const [googleAccount, setGoogleAccount] = useState<{
    email: string;
    name: string;
    photoURL?: string;
  } | null>(null);
  const [verificationMethod, setVerificationMethod] = useState<'phone' | 'email'>('email');
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

  // Proactively check if quickEmail matches any previous lead/user or Firestore customer_user
  useEffect(() => {
    if (typeof window === 'undefined' || !quickEmail.trim()) {
      setMatchedUser(null);
      setMatchedBillsCount(0);
      setUserHasAccount(null);
      return;
    }
    const cleanIdentifier = quickEmail.trim().toLowerCase();
    let isCancelled = false;

    // Check Firestore / localStorage asynchronously
    getCustomerUserByIdentifier(cleanIdentifier).then((u) => {
      if (!isCancelled && u) {
        setMatchedUser(u);
        setUserHasAccount(true);
        setFormData((prev) => ({
          ...prev,
          name: u.name,
          phone: u.phone,
          email: u.email,
          address: u.address,
          place: u.place,
        }));
      }
    });

    let foundUser: CustomerUser | null = null;
    let billsCount = 0;

    // Check saved leads
    const savedLeadsRaw = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
    if (savedLeadsRaw) {
      try {
        const leadsList = JSON.parse(savedLeadsRaw);
        const matches = leadsList.filter((l: any) =>
          l.email?.trim().toLowerCase() === cleanIdentifier ||
          (l.phone && l.phone.replace(/\D/g, '') === cleanIdentifier.replace(/\D/g, ''))
        );
        billsCount = matches.length;
        if (matches.length > 0) {
          const latest = matches[0];
          foundUser = {
            name: latest.name,
            phone: latest.phone,
            email: latest.email,
            address: latest.address || 'Kerala',
            place: latest.place || 'Kerala',
            verified: true,
            verificationMethod: 'email',
          };
        }
      } catch (e) {}
    }

    // Check saved user
    if (!foundUser) {
      const savedUserRaw = localStorage.getItem('framlu_wedding_user') || localStorage.getItem('lumina_wedding_user');
      if (savedUserRaw) {
        try {
          const u = JSON.parse(savedUserRaw);
          if (
            u.email?.trim().toLowerCase() === cleanIdentifier ||
            u.username?.trim().toLowerCase() === cleanIdentifier
          ) {
            foundUser = u;
          }
        } catch (e) {}
      }
    }

    if (foundUser) {
      setMatchedUser(foundUser);
      setUserHasAccount(true);
      setFormData((prev) => ({
        ...prev,
        name: foundUser!.name,
        phone: foundUser!.phone,
        email: foundUser!.email,
        address: foundUser!.address,
        place: foundUser!.place,
      }));
    }
    setMatchedBillsCount(billsCount);

    return () => {
      isCancelled = true;
    };
  }, [quickEmail]);

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

  // Quick Email / Password Submit handler (direct login if account exists, or creates user)
  const handleQuickEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanIdentifier = quickEmail.trim().toLowerCase();

    if (!cleanIdentifier) {
      setAuthError(isMl ? 'ഇമെയിൽ ഐഡിയോ യൂസർ ഐഡിയോ നൽകുക' : 'Please enter email address or user ID');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if account exists in Firestore
      const existingInCloud = await getCustomerUserByIdentifier(cleanIdentifier);
      const existing = existingInCloud || matchedUser;

      if (existing) {
        // If the account has a password
        if (existing.password) {
          if (!quickPassword) {
            setAuthError(isMl ? 'ദയവായി നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക' : 'Please enter your password');
            setShowPasswordInput(true);
            setIsLoading(false);
            return;
          }

          if (existing.password !== quickPassword) {
            setAuthError(
              isMl
                ? 'തെറ്റായ പാസ്‌വേഡ്! ശരിയായ പാസ്‌വേഡ് നൽകുക അല്ലെങ്കിൽ "Forgot Password" ക്ലിക്ക് ചെയ്ത് OTP വഴി റീസെറ്റ് ചെയ്യുക.'
                : 'Incorrect password! Please enter the correct password or use "Forgot Password".'
            );
            setIsLoading(false);
            return;
          }
        }

        // Password is correct or account has no password yet (legacy lead): login!
        onSuccess(existing);
        onClose();
        return;
      }

      // If user does NOT exist, they must provide name and phone to register
      if (!quickName.trim()) {
        setAuthError(isMl ? 'പുതിയ അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യാൻ പേര് നൽകുക' : 'Please enter your name to register a new account');
        setIsLoading(false);
        return;
      }

      const cleanPhone = quickPhone.replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        setAuthError(isMl ? 'ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക' : 'Please enter a valid 10-digit mobile number');
        setIsLoading(false);
        return;
      }

      const cleanEmail = cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@framelu.com`;
      const newUser: CustomerUser = {
        name: quickName.trim(),
        phone: quickPhone.trim(),
        email: cleanEmail,
        username: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : cleanIdentifier,
        password: quickPassword || undefined,
        address: 'Kerala',
        place: 'Kerala',
        verified: true,
        verificationMethod: 'email',
        registeredAt: new Date().toISOString(),
      };

      await saveCustomerUserToCloud(newUser);
      onSuccess(newUser);
      onClose();
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Email Send OTP handler
  const handleQuickEmailSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = quickEmail.trim();

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setAuthError(isMl ? 'ശരിയായ ഇമെയിൽ ഐഡി നൽകുക' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: matchedUser ? matchedUser.name : (quickName.trim() || 'Customer'),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isMl ? 'ഇമെയിൽ OTP അയക്കുന്നതിൽ തടസ്സം നേരിട്ടു' : 'Failed to send Email OTP'));
      }

      setFormData((prev) => ({
        ...prev,
        email: cleanEmail,
        name: matchedUser ? matchedUser.name : (quickName.trim() || 'Customer'),
        phone: matchedUser ? matchedUser.phone : quickPhone.trim(),
      }));
      setEmailOtpToken(data.token || '');
      setDevOtpCode(data.devOtp || '');
      setEmailWarning(data.warning || '');
      setOtpInput('');
      setResendTimer(60);
      setStep('verify_email');
    } catch (err: any) {
      console.error('Send email OTP error:', err);
      setAuthError(err.message || 'Failed to send Email OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Real Google Sign-in with select_account
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError('');
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

      // 1. Check if user already exists in Firestore or local cache
      const existingUser = await getCustomerUserByIdentifier(gEmail);
      if (existingUser) {
        // Direct login without asking anything!
        onSuccess(existingUser);
        onClose();
        return;
      }

      // 2. Check if user has an existing lead
      const savedLeadsRaw = typeof window !== 'undefined'
        ? localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads')
        : null;
      let matchedLead: any = null;
      if (savedLeadsRaw) {
        try {
          const list = JSON.parse(savedLeadsRaw);
          matchedLead = list.find((l: any) => l.email?.trim().toLowerCase() === gEmail);
        } catch (e) {}
      }

      if (matchedLead) {
        const leadUser: CustomerUser = {
          name: matchedLead.name || gName,
          phone: matchedLead.phone || '',
          email: gEmail,
          address: matchedLead.address || 'Kerala',
          place: matchedLead.place || 'Kerala',
          verified: true,
          verificationMethod: 'email',
          registeredAt: matchedLead.createdAt || new Date().toISOString(),
        };
        await saveCustomerUserToCloud(leadUser);
        onSuccess(leadUser);
        onClose();
        return;
      }

      setGoogleAccount({
        email: gEmail,
        name: gName,
        photoURL: gPhoto,
      });

      setFormData((prev) => ({
        ...prev,
        email: gEmail,
        name: gName || prev.name,
      }));

      // Only for first-time new user, prompt profile completion
      setStep('google_profile_completion');
    } catch (err: any) {
      console.error('Customer Google sign in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(getFriendlyErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Complete Google login after entering name, phone, and optional password
  const handleCompleteGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!formData.name.trim()) {
      setAuthError(isMl ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക.' : 'Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setAuthError(isMl ? 'ദയവായി ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanEmail = (googleAccount?.email || formData.email).trim().toLowerCase();
    const finalUsername = (formData.username || cleanEmail.split('@')[0]).trim().toLowerCase();

    const verifiedUser: CustomerUser = {
      name: formData.name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      username: finalUsername,
      password: formData.password || undefined,
      address: formData.address.trim() || 'Kerala',
      place: formData.place.trim() || 'കായംകുളം',
      verified: true,
      verificationMethod: 'email',
      registeredAt: new Date().toISOString(),
    };

    setIsLoading(true);
    try {
      await saveCustomerUserToCloud(verifiedUser);
    } catch (e) {
      console.warn('saveCustomerUserToCloud err:', e);
    } finally {
      setIsLoading(false);
    }

    onSuccess(verifiedUser);
    onClose();
  };

  // Forgot Password: Send OTP handler (uses verified framelu.com domain via Resend)
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const targetEmail = (forgotEmail || quickEmail).trim().toLowerCase();

    if (!targetEmail || !emailRegex.test(targetEmail)) {
      setAuthError(isMl ? 'ശരിയായ ഇമെയിൽ നൽകുക' : 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: 'Customer',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isMl ? 'OTP അയക്കുന്നതിൽ തടസ്സം നേരിട്ടു' : 'Failed to send OTP'));
      }

      setForgotToken(data.token || '');
      setForgotDevOtp(data.devOtp || '');
      setForgotOtp('');
      setResendTimer(60);
      setStep('forgot_password_otp');
    } catch (err: any) {
      console.error('Send forgot password OTP error:', err);
      setAuthError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password: Verify OTP and save new password
  const handleVerifyAndResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!forgotOtp.trim() || forgotOtp.trim().length !== 6) {
      setAuthError(isMl ? '6 അക്ക OTP കോഡ് നൽകുക' : 'Please enter the 6-digit OTP code');
      return;
    }

    if (!forgotNewPassword.trim() || forgotNewPassword.trim().length < 4) {
      setAuthError(isMl ? 'കുറഞ്ഞത് 4 അക്ഷരങ്ങളുള്ള പുതിയ പാസ്‌വേഡ് നൽകുക' : 'Password must be at least 4 characters');
      return;
    }

    if (forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword) {
      setAuthError(isMl ? 'പാസ്‌വേഡുകൾ പൊരുത്തപ്പെടുന്നില്ല' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const targetEmail = (forgotEmail || quickEmail).trim().toLowerCase();

      // Verify OTP token
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: forgotOtp.trim(),
          token: forgotToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isMl ? 'തെറ്റായ OTP കോഡ്' : 'Invalid OTP code'));
      }

      // Update password in Firestore
      await updateCustomerUserPassword(targetEmail, forgotNewPassword.trim());

      // Retrieve or create user session
      let existingUser = await getCustomerUserByIdentifier(targetEmail);
      if (!existingUser) {
        existingUser = {
          name: targetEmail.split('@')[0],
          phone: '9847123456',
          email: targetEmail,
          username: targetEmail.split('@')[0],
          password: forgotNewPassword.trim(),
          address: 'Kerala',
          place: 'കായംകുളം',
          verified: true,
          verificationMethod: 'email',
          registeredAt: new Date().toISOString(),
        };
        await saveCustomerUserToCloud(existingUser);
      } else {
        existingUser.password = forgotNewPassword.trim();
      }

      onSuccess(existingUser);
      onClose();
    } catch (err: any) {
      console.error('Reset password error:', err);
      setAuthError(err.message || 'Password reset failed');
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

        {/* STEP 1: Registration / Email Login Form */}
        {step === 'details' && (
          <>
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold tracking-wide mb-2 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isMl ? 'കസ്റ്റമർ പോർട്ടൽ' : 'Customer Portal'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                {isMl ? 'ഇമെയിൽ വഴി ലോഗിൻ ചെയ്യുക' : 'Sign In With Email'}
              </h2>
              <p className="text-stone-500 text-xs sm:text-sm mt-1">
                {isMl
                  ? 'നിങ്ങളുടെ ഇമെയിൽ ഐഡി നൽകി സേവ് ചെയ്ത ബില്ലുകളും ഡാഷ്ബോർഡും തുറക്കുക'
                  : 'Enter your email ID to access your saved bills, bookings, and personal dashboard'}
              </p>
            </div>

            {/* Google Sign-In Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-amber-500 hover:bg-amber-50/20 disabled:opacity-60 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-stone-800 transition shadow-xs hover:shadow-md active:scale-98 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
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

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-2.5 text-stone-400 font-bold">
                    {isMl ? 'അല്ലെങ്കിൽ ഇമെയിൽ നൽകുക' : 'Or with Email ID'}
                  </span>
                </div>
              </div>
            </div>

            {/* TAB SELECTOR: Quick Email Sign In vs Full Registration */}
            <div className="flex items-center p-1 bg-stone-100 rounded-2xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('quick_email');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'quick_email'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{isMl ? 'ഇമെയിൽ ലോഗിൻ' : 'Email Sign In'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>{isMl ? 'പുതിയ രജിസ്ട്രേഷൻ' : 'New Registration'}</span>
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* MODE 1: QUICK EMAIL SIGN-IN */}
            {authMode === 'quick_email' && (
              <form onSubmit={handleQuickEmailSubmit} className="space-y-4 text-left animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isMl ? 'ഇമെയിൽ ഐഡി (Email Address) *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="youremail@gmail.com / username"
                      value={quickEmail}
                      onChange={(e) => {
                        setQuickEmail(e.target.value);
                        setAuthError('');
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                      required
                    />
                  </div>
                </div>

                {/* Password field for Email / Username */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-stone-700">
                      {isMl ? 'പാസ്‌വേഡ് (Password)' : 'Password'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(quickEmail);
                        setStep('forgot_password');
                        setAuthError('');
                      }}
                      className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                    >
                      {isMl ? 'പാസ്‌വേഡ് മറന്നുപോയോ? (Forgot Password?)' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type={showQuickPassword ? 'text' : 'password'}
                      placeholder={isMl ? 'നിങ്ങളുടെ പാസ്‌വേഡ് നൽകുക' : 'Enter your password'}
                      value={quickPassword}
                      onChange={(e) => {
                        setQuickPassword(e.target.value);
                        setAuthError('');
                      }}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowQuickPassword(!showQuickPassword)}
                      className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showQuickPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* If existing account matched */}
                {matchedUser && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {matchedUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-emerald-950">
                        {isMl ? `സ്വാഗതം, ${matchedUser.name}!` : `Welcome back, ${matchedUser.name}!`}
                      </p>
                      <p className="text-emerald-700 mt-0.5">
                        {matchedUser.place} • {matchedUser.phone}
                      </p>
                      <p className="text-emerald-600 font-bold mt-1 text-[11px]">
                        ✨ {matchedBillsCount} {isMl ? 'സേവ് ചെയ്ത ബില്ലുകൾ നിങ്ങളുടെ ഡാഷ്ബോർഡിൽ റെഡിയാണ്' : 'saved bills ready in your dashboard'}
                      </p>
                    </div>
                  </div>
                )}

                {/* If new email, ask for Name and Phone to register */}
                {!matchedUser && quickEmail.trim().length > 4 && (
                  <div className="space-y-3 pt-1 border-t border-stone-100">
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 font-semibold">
                      {isMl
                        ? 'ഈ ഇമെയിലിൽ പുതിയ ഡാഷ്ബോർഡ് നിർമ്മിക്കാൻ നിങ്ങളുടെ പേരും ഫോണും നൽകുക:'
                        : 'First time using this email? Enter your name and phone to set up your personal dashboard:'}
                    </p>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'പേര് (Full Name) *' : 'Your Name *'}
                      </label>
                      <input
                        type="text"
                        placeholder={isMl ? 'നിങ്ങളുടെ പേര്' : 'Full Name'}
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'മൊബൈൽ നമ്പർ (Mobile Number) *' : 'Mobile Number *'}
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="9876543210"
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'ഒരു പാസ്‌വേഡ് നൽകുക (Password) *' : 'Create a Password *'}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={quickPassword}
                        onChange={(e) => setQuickPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <span>
                      {matchedUser
                        ? (isMl ? 'ഡാഷ്ബോർഡ് തുറക്കുക' : 'Open My Dashboard Directly')
                        : (isMl ? 'ഡാഷ്ബോർഡ് നിർമ്മിച്ച് ലോഗിൻ ചെയ്യുക' : 'Create & Open Dashboard')}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickEmailSendOtp}
                    disabled={isLoading}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isMl ? 'ഇമെയിൽ OTP വഴി വെരിഫൈ ചെയ്യുക' : 'Verify with Email OTP'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* MODE 2: FULL REGISTRATION FORM */}
            {authMode === 'register' && (
            <form onSubmit={handleSendCode} className="space-y-3.5 text-left animate-fade-in">
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
            )}
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

        {/* STEP: Google Profile Completion */}
        {step === 'google_profile_completion' && googleAccount && (
          <form onSubmit={handleCompleteGoogleLogin} className="space-y-4 animate-fade-in text-left">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                {isMl ? 'ലോഗിൻ വിവരങ്ങൾ പൂർത്തിയാക്കുക' : 'Complete Profile'}
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                {isMl
                  ? 'ഡാഷ്ബോർഡ് ഓപ്പൺ ചെയ്യാൻ നിങ്ങളുടെ പേരും മൊബൈൽ നമ്പറും നൽകുക'
                  : 'Enter your name and phone number to complete sign-in and open your dashboard'}
              </p>
            </div>

            {/* Google account badge card */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
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
                    {isMl ? 'ഗൂഗിൾ അക്കൗണ്ട് വെരിഫൈ ചെയ്തു' : 'Google Account Connected'}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 font-bold truncate mt-0.5">
                  {googleAccount.email}
                </p>
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* 1. Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'പേര് (Full Name) *' : 'Full Name *'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={isMl ? 'നിങ്ങളുടെ പേര്' : 'Full Name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* 2. Mobile Number (Mandatory) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'മൊബൈൽ നമ്പർ (Mobile Number) *' : 'Mobile Number *'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="9847123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            {/* 3. Place */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'സ്ഥലം / സിറ്റി (Place / Location)' : 'Place / Location'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder={isMl ? 'കായംകുളം / ആലപ്പുഴ' : 'Kayamkulam / Kerala'}
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'പാസ്‌വേഡ് (Password - പിന്നീട് ലോഗിൻ ചെയ്യാൻ)' : 'Password (For direct sign in later)'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                {isMl ? 'തിരികെ' : 'Back'}
              </button>

              <button
                type="submit"
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-black text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isMl ? 'നെക്സ്റ്റ്: ലോഗിൻ പൂർത്തിയാക്കുക' : 'Next: Complete Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP: Forgot Password - Request OTP */}
        {step === 'forgot_password' && (
          <form onSubmit={handleSendForgotOtp} className="space-y-4 animate-fade-in text-left">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                <KeyRound className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                {isMl ? 'പാസ്‌വേഡ് മാറ്റുക (Forgot Password)' : 'Forgot Password'}
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                {isMl
                  ? 'നിങ്ങളുടെ രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ ഐഡി നൽകുക. framelu.com വഴി 6 അക്ക OTP അയക്കുന്നതാണ്.'
                  : 'Enter your registered email ID. We will send a 6-digit OTP code via framelu.com.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'രജിസ്റ്റർ ചെയ്ത ഇമെയിൽ (Email Address) *' : 'Registered Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="youremail@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isMl ? 'Verified via framelu.com (Resend 3000 free OTP system)' : 'Verified sender: framelu.com'}</span>
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('details');
                  setAuthError('');
                }}
                className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                {isMl ? 'തിരികെ' : 'Back'}
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-60 text-white font-black text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isMl ? 'അയക്കുന്നു...' : 'Sending OTP...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isMl ? 'OTP കോഡ് അയക്കുക' : 'Send OTP Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-stone-400 font-bold">
                  {isMl ? 'അല്ലെങ്കിൽ' : 'Or'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-white border border-stone-200 hover:border-amber-400 rounded-xl text-xs font-bold text-stone-700 flex items-center justify-center gap-2 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isMl ? 'ഗൂഗിൾ വഴി പാസ്‌വേഡ് ഇല്ലാതെ ലോഗിൻ ചെയ്യുക' : 'Sign in with Google without password'}</span>
            </button>
          </form>
        )}

        {/* STEP: Forgot Password - Verify OTP & Set New Password */}
        {step === 'forgot_password_otp' && (
          <form onSubmit={handleVerifyAndResetPassword} className="space-y-4 animate-fade-in text-left">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-stone-900">
                {isMl ? 'പുതിയ പാസ്‌വേഡ് സെറ്റ് ചെയ്യുക' : 'Create New Password'}
              </h3>
              <p className="text-stone-500 text-xs mt-1">
                {isMl
                  ? `${forgotEmail || quickEmail}-ലേക്ക് 6 അക്ക OTP അയച്ചിട്ടുണ്ട്.`
                  : `Enter the 6-digit OTP code sent to ${forgotEmail || quickEmail}.`}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            {/* OTP Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? '6 അക്ക OTP കോഡ് *' : '6-Digit OTP Code *'}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={forgotOtp}
                  onChange={(e) => {
                    setForgotOtp(e.target.value.replace(/\D/g, ''));
                    setAuthError('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-base font-black tracking-widest text-center text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'പുതിയ പാസ്‌വേഡ് (New Password) *' : 'New Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showForgotNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={forgotNewPassword}
                  onChange={(e) => {
                    setForgotNewPassword(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                  className="absolute right-3.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isMl ? 'പാസ്‌വേഡ് വീണ്ടും നൽകുക (Confirm Password) *' : 'Confirm New Password *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showForgotNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={forgotConfirmPassword}
                  onChange={(e) => {
                    setForgotConfirmPassword(e.target.value);
                    setAuthError('');
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-250 text-xs sm:text-sm font-bold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Resend OTP button */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleSendForgotOtp}
                disabled={isLoading || resendTimer > 0}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 disabled:opacity-50 cursor-pointer"
              >
                {resendTimer > 0
                  ? (isMl ? `വീണ്ടും OTP അയക്കുക (${resendTimer}s)` : `Resend OTP (${resendTimer}s)`)
                  : (isMl ? 'OTP വീണ്ടും അയക്കുക' : 'Resend OTP')}
              </button>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('forgot_password')}
                className="w-1/3 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
              >
                {isMl ? 'തിരികെ' : 'Back'}
              </button>

              <button
                type="submit"
                disabled={isLoading || forgotOtp.length !== 6 || !forgotNewPassword}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-60 text-white font-black text-xs sm:text-sm transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isMl ? 'സേവ് ചെയ്യുന്നു...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isMl ? 'പാസ്‌വേഡ് മാറ്റി ലോഗിൻ ചെയ്യുക' : 'Save & Log In'}</span>
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
