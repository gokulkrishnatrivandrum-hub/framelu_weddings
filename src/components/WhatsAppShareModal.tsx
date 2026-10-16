'use client';

import React, { useState, useEffect } from 'react';
import { CustomerLead, StudioContactConfig } from '@/types';
import { CalculationResult } from '@/utils/calculator';
import {
  generateQuotationPdfBlob,
  downloadPdfBlob,
  canShareFiles,
  shareQuotationPdfWithNativeSheet,
  GeneratedPdfResult,
} from '@/utils/pdfGenerator';
import {
  X,
  Share2,
  Phone,
  Download,
  CheckCircle2,
  FileText,
  User,
  Building2,
  ExternalLink,
  MessageCircle,
  Loader2,
  Send,
  AlertTriangle,
  Users,
  Paperclip,
  Check,
  Eye,
} from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CustomerLead;
  calculation?: CalculationResult;
  userRole?: 'customer' | 'studio';
  studioContact: StudioContactConfig;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  language?: 'en' | 'ml';
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  lead,
  calculation,
  userRole = 'customer',
  studioContact,
  onDownloadPdf,
  isDownloadingPdf = false,
  language = 'en',
}) => {
  const isMl = language === 'ml';

  // Recipient Target Types:
  // 'customer': send to customer phone (default, pre-filled from customer details)
  // 'other': send to any custom 10-digit number
  // 'studio': send to studio official whatsapp
  const [recipientType, setRecipientType] = useState<'customer' | 'other' | 'studio'>('customer');

  // Phone state with pre-fill from lead
  const getCleanCustomerDigits = (rawPhone?: string) => {
    if (!rawPhone) return '';
    const clean = rawPhone.replace(/\D/g, '');
    if (clean.length === 12 && clean.startsWith('91')) return clean.slice(2);
    return clean.slice(-10);
  };

  const [customerPhone, setCustomerPhone] = useState(getCleanCustomerDigits(lead.phone));
  const [customPhone, setCustomPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Generated PDF State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfResult, setPdfResult] = useState<GeneratedPdfResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [desktopAttachTip, setDesktopAttachTip] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Sync phone & recipient type on open or lead change
  useEffect(() => {
    if (isOpen) {
      const cleanDigits = getCleanCustomerDigits(lead.phone);
      setCustomerPhone(cleanDigits);
      // ALWAYS default to Customer as requested
      setRecipientType('customer');
      setCustomPhone('');
      setPhoneError('');
      setDesktopAttachTip(false);
      setCopiedText(false);

      // Pre-generate PDF for instant sharing & attachment
      setIsGeneratingPdf(true);
      generateQuotationPdfBlob(lead, studioContact, calculation)
        .then((res) => {
          setPdfResult(res);
          if (res && canShareFiles(res.file)) {
            setCanNativeShare(true);
          } else {
            setCanNativeShare(false);
          }
        })
        .catch((err) => {
          console.warn('PDF pre-generation error:', err);
        })
        .finally(() => {
          setIsGeneratingPdf(false);
        });
    }
  }, [isOpen, lead, studioContact, calculation]);

  if (!isOpen) return null;

  const quoteNo = lead.id || `LFB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const totalAmount = lead.grandTotal || lead.totalPrice || calculation?.totalPrice || 0;
  const brandName = lead.studioBranding?.studioName || 'FRAMELU WEDDINGS & EVENTS';

  const studioPhoneClean = (studioContact.whatsapp || studioContact.phone || '916238747722').replace(/\D/g, '');

  // Validate active target phone number
  const getActivePhoneRaw = (): string => {
    if (recipientType === 'studio') return studioPhoneClean;
    if (recipientType === 'customer') return customerPhone;
    return customPhone;
  };

  const activeRaw = getActivePhoneRaw();

  // Smart Validation Check for Indian Numbers
  const getPhoneValidation = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (!clean) {
      return { isValid: false, warning: '', error: isMl ? 'മൊബൈൽ നമ്പർ നൽകുക' : 'Please enter a mobile number' };
    }
    const tenDigit = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean.slice(-10);
    if (tenDigit.length < 10) {
      return {
        isValid: false,
        warning: '',
        error: isMl ? '10 അക്ക മൊബൈൽ നമ്പർ നൽകുക' : 'Enter a complete 10-digit number',
      };
    }
    if (tenDigit.length === 10) {
      const firstDigit = tenDigit.charAt(0);
      if (!['6', '7', '8', '9'].includes(firstDigit)) {
        return {
          isValid: true,
          warning: isMl
            ? '⚠️ ശ്രദ്ധിക്കുക: സാധാരണ ഇന്ത്യൻ മൊബൈൽ നമ്പറുകൾ 6, 7, 8, അല്ലെങ്കിൽ 9 ലാണ് ആരംഭിക്കുന്നത്. ഈ നമ്പർ WhatsApp-ൽ ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക.'
            : '⚠️ Warning: Standard Indian mobile numbers start with 6, 7, 8, or 9. Ensure this number is active on WhatsApp.',
          error: '',
        };
      }
      return { isValid: true, warning: '', error: '' };
    }
    return { isValid: true, warning: '', error: '' };
  };

  const validation = getPhoneValidation(activeRaw);

  const getTargetPhoneNumber = () => {
    if (recipientType === 'studio') {
      return studioPhoneClean.startsWith('91') && studioPhoneClean.length === 12
        ? studioPhoneClean
        : `91${studioPhoneClean}`;
    }

    const raw = recipientType === 'customer' ? customerPhone : customPhone;
    const clean = raw.replace(/\D/g, '');
    const tenDigit = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean.slice(-10);
    if (tenDigit.length === 10) return `91${tenDigit}`;
    return clean;
  };

  const generateWhatsAppMessage = () => {
    const clientName = lead.name || 'Valued Client';
    const targetBrand = brandName;

    let text = `*${targetBrand.toUpperCase()} - OFFICIAL WEDDING QUOTATION*\n\n`;

    if (recipientType === 'studio') {
      text += `Hello ${targetBrand},\nHere is a copy of the wedding quotation (#${quoteNo}):\n\n`;
    } else {
      text += `Dear ${clientName},\nThank you for choosing ${targetBrand}! Here is your customized wedding quotation summary (#${quoteNo}):\n\n`;
    }

    text += `• *Quote Reference:* #${quoteNo}\n`;
    text += `• *Client Name:* ${clientName}\n`;
    text += `• *Client Phone:* ${customerPhone ? `+91 ${customerPhone}` : (lead.phone || 'N/A')}\n`;
    if (lead.weddingDate) text += `• *Event Date:* ${lead.weddingDate}\n`;
    if (lead.venueLocation || lead.place) text += `• *Venue/Location:* ${lead.venueLocation || lead.place}\n`;
    if (lead.side) {
      text += `• *Coverage Scope:* ${
        lead.side === 'groom' ? 'Groom Side' : lead.side === 'bride' ? 'Bride Side' : 'Both Sides (Groom & Bride)'
      }\n`;
    }
    text += `\n*Total Estimated Amount:* ₹${totalAmount.toLocaleString('en-IN')} (incl. 18% GST)\n`;
    text += `• Advance Booking (25%): ₹${Math.round(totalAmount * 0.25).toLocaleString('en-IN')}\n`;
    text += `• On Shoot Completion (50%): ₹${Math.round(totalAmount * 0.50).toLocaleString('en-IN')}\n`;
    text += `• Final Delivery (25%): ₹${(totalAmount - Math.round(totalAmount * 0.25) - Math.round(totalAmount * 0.50)).toLocaleString('en-IN')}\n\n`;
    text += `📎 *ATTACHED PDF QUOTATION DOCUMENT:*\n`;
    text += `The official itemized proposal document (${pdfResult?.fileName || `${quoteNo}.pdf`}) has been generated and attached for your review.\n\n`;
    text += `${targetBrand}\nPhone: ${studioContact.phone || '+91 6238747722'}  |  WhatsApp: +${studioPhoneClean}`;

    return text;
  };

  const handleDownloadOnly = async () => {
    if (pdfResult) {
      downloadPdfBlob(pdfResult.blob, pdfResult.fileName);
    } else if (onDownloadPdf) {
      onDownloadPdf();
    } else {
      setIsGeneratingPdf(true);
      try {
        const res = await generateQuotationPdfBlob(lead, studioContact, calculation);
        setPdfResult(res);
        downloadPdfBlob(res.blob, res.fileName);
      } catch (e) {
        console.error('PDF error:', e);
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

  // Direct WhatsApp Chat with number (wa.me opens chat even if not in contacts!)
  const handleOpenDirectWhatsApp = async () => {
    const targetPhone = getTargetPhoneNumber();
    if (!targetPhone || targetPhone.length < 10) {
      setPhoneError(
        isMl
          ? 'ദയവായി സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }
    setPhoneError('');
    setIsSending(true);

    try {
      // 1. Ensure PDF is generated
      let currentPdf = pdfResult;
      if (!currentPdf) {
        currentPdf = await generateQuotationPdfBlob(lead, studioContact, calculation);
        setPdfResult(currentPdf);
      }

      // 2. Download PDF file to device so user has it instantly ready to attach
      if (currentPdf) {
        downloadPdfBlob(currentPdf.blob, currentPdf.fileName);
      }

      const textMsg = generateWhatsAppMessage();

      // Copy text to clipboard for quick paste
      try {
        if (navigator?.clipboard) {
          await navigator.clipboard.writeText(textMsg);
          setCopiedText(true);
        }
      } catch {
        // clipboard write optional
      }

      // Open WhatsApp web or app with direct chat to this exact phone number
      // https://api.whatsapp.com/send/?phone=... opens chat directly even if not in contacts!
      const waUrl = `https://api.whatsapp.com/send/?phone=${targetPhone}&text=${encodeURIComponent(textMsg)}`;
      setDesktopAttachTip(true);
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error('WhatsApp send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Mobile Native Share: Attaches the physical PDF file into WhatsApp composer
  const handleNativeShareWithPdfAttached = async () => {
    setIsSending(true);
    try {
      let currentPdf = pdfResult;
      if (!currentPdf) {
        currentPdf = await generateQuotationPdfBlob(lead, studioContact, calculation);
        setPdfResult(currentPdf);
      }

      const textMsg = generateWhatsAppMessage();

      if (currentPdf && canShareFiles(currentPdf.file)) {
        await shareQuotationPdfWithNativeSheet(
          currentPdf.file,
          textMsg,
          `${brandName} Quotation #${quoteNo}`
        );
      } else {
        // Fallback to direct chat if native share not supported
        await handleOpenDirectWhatsApp();
      }
    } catch (err) {
      console.error('Native share error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-stone-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <MessageCircle className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              {isMl ? 'WhatsApp വഴി കൊട്ടേഷൻ അയക്കുക' : 'Send Quotation via WhatsApp'}
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              {isMl
                ? `കൊട്ടേഷൻ #${quoteNo} • ആകെ തുക: ₹${totalAmount.toLocaleString('en-IN')}`
                : `Quotation #${quoteNo} • Total: ₹${totalAmount.toLocaleString('en-IN')}`}
            </p>
          </div>
        </div>

        {/* PDF ATTACHMENT CARD */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200 mb-4 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-stone-900 truncate block">
                    {pdfResult?.fileName || `${brandName}_Quotation_${quoteNo}.pdf`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isGeneratingPdf ? (
                    <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {isMl ? 'PDF തയ്യാറാക്കുന്നു...' : 'Preparing PDF...'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {isMl ? 'PDF അറ്റാച്ച് ചെയ്യാൻ തയ്യാറാണ്' : 'PDF Ready to Attach & Send'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadOnly}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-[11px] font-bold border border-stone-300 shadow-xs flex items-center gap-1 transition shrink-0 cursor-pointer"
              title="Download PDF to device"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>{isMl ? 'ഡൗൺലോഡ്' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* RECIPIENT SELECTION: Customer (Default) vs Other Number */}
        <div className="mb-4">
          <label className="block text-xs font-black uppercase tracking-wider text-stone-700 mb-2">
            {isMl ? 'കൊട്ടേഷൻ ആർക്കാണ് അയക്കേണ്ടത്?' : 'Select WhatsApp Recipient:'}
          </label>

          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {/* Primary Option 1: Customer (DEFAULT) */}
            <button
              type="button"
              onClick={() => {
                setRecipientType('customer');
                setPhoneError('');
              }}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                recipientType === 'customer'
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/25 text-emerald-950 font-bold shadow-xs'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  recipientType === 'customer' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="truncate min-w-0">
                <span className="text-xs font-black block truncate flex items-center gap-1">
                  <span>{isMl ? 'കസ്റ്റമർ' : 'Customer'}</span>
                  {recipientType === 'customer' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </span>
                <span className="text-[11px] text-stone-600 truncate block font-bold">
                  {lead.name || (isMl ? 'ക്ലയന്റ്' : 'Client')}
                </span>
                <span className="text-[10px] text-stone-500 truncate block font-mono">
                  {customerPhone ? `+91 ${customerPhone}` : (isMl ? 'നമ്പർ നൽകുക' : 'Enter number')}
                </span>
              </div>
            </button>

            {/* Primary Option 2: Other Number */}
            <button
              type="button"
              onClick={() => {
                setRecipientType('other');
                setPhoneError('');
              }}
              className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                recipientType === 'other'
                  ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/25 text-emerald-950 font-bold shadow-xs'
                  : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  recipientType === 'other' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                <Phone className="w-4 h-4" />
              </div>
              <div className="truncate min-w-0">
                <span className="text-xs font-black block truncate flex items-center gap-1">
                  <span>{isMl ? 'മറ്റൊരു നമ്പർ' : 'Other Number'}</span>
                  {recipientType === 'other' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </span>
                <span className="text-[11px] text-stone-600 truncate block">
                  {isMl ? 'പുതിയ WhatsApp' : 'Any WhatsApp'}
                </span>
                <span className="text-[10px] text-stone-500 truncate block">
                  {customPhone ? `+91 ${customPhone}` : (isMl ? 'നമ്പർ ടൈപ്പ് ചെയ്യാം' : 'Type 10 digits')}
                </span>
              </div>
            </button>
          </div>

          {/* DYNAMIC PHONE INPUT SECTION */}
          {recipientType === 'customer' && (
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 animate-fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-stone-800">
                  {isMl ? 'കസ്റ്റമറുടെ WhatsApp മൊബൈൽ നമ്പർ:' : "Customer's WhatsApp Mobile Number:"}
                </label>
                <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {lead.name || 'Customer'}
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-black text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCustomerPhone(val.slice(-10));
                    if (phoneError) setPhoneError('');
                  }}
                  className={`w-full pl-20 pr-4 py-2.5 rounded-xl border text-sm font-black text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    validation.warning
                      ? 'border-amber-400 bg-amber-50/30'
                      : validation.isValid
                      ? 'border-emerald-500'
                      : 'border-stone-300'
                  }`}
                />
              </div>

              <p className="text-[11px] text-emerald-800 font-medium mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  {isMl
                    ? 'ഈ നമ്പർ WhatsApp കോൺടാക്റ്റിൽ ഇല്ലെങ്കിലും നേരിട്ട് പുതിയ മെസ്സേജായി WhatsApp തുറന്നുവരും.'
                    : 'Opens a new chat directly in WhatsApp even if this number is not saved in contacts.'}
                </span>
              </p>

              {validation.warning && (
                <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{validation.warning}</span>
                </div>
              )}

              {phoneError && (
                <p className="text-xs text-rose-600 mt-1.5 font-bold flex items-center gap-1">
                  <span>•</span>
                  <span>{phoneError}</span>
                </p>
              )}
            </div>
          )}

          {recipientType === 'other' && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 animate-fade-in">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-amber-950">
                  {isMl ? 'മെസ്സേജ് അയക്കേണ്ട പുതിയ WhatsApp നമ്പർ:' : 'Enter WhatsApp Number to Send:'}
                </label>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-200/60 px-2 py-0.5 rounded-md">
                  {isMl ? '10 അക്കം' : '10 Digits'}
                </span>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-black text-stone-700 bg-stone-200 px-2 py-0.5 rounded-md">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  autoFocus
                  placeholder="9876543210"
                  value={customPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCustomPhone(val.slice(-10));
                    if (phoneError) setPhoneError('');
                  }}
                  className={`w-full pl-20 pr-4 py-2.5 rounded-xl border text-sm font-black text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                    validation.warning
                      ? 'border-amber-400 bg-amber-50/30'
                      : validation.isValid
                      ? 'border-emerald-500'
                      : 'border-stone-300'
                  }`}
                />
              </div>

              <p className="text-[11px] text-amber-900 font-medium mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  {isMl
                    ? 'നൽകുന്ന ഈ നമ്പറിലേക്ക് പുതിയ ചാറ്റായി WhatsApp തുറന്നുവരികയും PDF അറ്റാച്ച് ചെയ്ത് അയക്കാൻ നിൽക്കുകയും ചെയ്യും.'
                    : 'WhatsApp will open directly to this number with the quotation PDF ready to send.'}
                </span>
              </p>

              {validation.warning && (
                <div className="mt-2 p-2 rounded-xl bg-amber-100 border border-amber-300 text-[11px] text-amber-950 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>{validation.warning}</span>
                </div>
              )}

              {phoneError && (
                <p className="text-xs text-rose-600 mt-1.5 font-bold flex items-center gap-1">
                  <span>•</span>
                  <span>{phoneError}</span>
                </p>
              )}
            </div>
          )}

          {/* Subtle Studio Secondary Option (Doesn't hijack customer selection) */}
          <div className="mt-2.5 flex items-center justify-between text-[11px]">
            {recipientType !== 'studio' ? (
              <button
                type="button"
                onClick={() => setRecipientType('studio')}
                className="text-stone-500 hover:text-stone-800 flex items-center gap-1 underline transition cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                <span>
                  {isMl
                    ? `സ്റ്റുഡിയോ WhatsApp-ലേക്ക് ഒരു കോപ്പി അയക്കണോ? (+${studioPhoneClean})`
                    : `Send copy to Studio WhatsApp (+${studioPhoneClean})`}
                </span>
              </button>
            ) : (
              <div className="w-full p-2.5 rounded-xl bg-stone-100 border text-xs text-stone-700 flex justify-between items-center animate-fade-in">
                <span className="font-bold flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>സ്റ്റുഡിയോ WhatsApp: +{studioPhoneClean}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setRecipientType('customer')}
                  className="text-emerald-700 font-bold underline cursor-pointer"
                >
                  {isMl ? 'കസ്റ്റമറിലേക്ക് മാറ്റുക' : 'Back to Customer'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Post-Send Guidance Notice */}
        {desktopAttachTip && (
          <div className="p-3.5 rounded-2xl bg-emerald-100/90 border border-emerald-300 mb-4 animate-fade-in text-xs text-emerald-950 space-y-1.5">
            <p className="font-black flex items-center gap-1.5 text-emerald-950">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-700" />
              <span>{isMl ? 'PDF ഡൗൺലോഡ് ആയിട്ടുണ്ട് & WhatsApp തുറന്നു!' : 'PDF Downloaded & WhatsApp Opened!'}</span>
            </p>
            <p className="text-[11px] text-emerald-900 leading-relaxed font-medium">
              {isMl
                ? 'തുറന്നുവന്ന WhatsApp ചാറ്റിൽ താഴെയുള്ള 📎 (പേപ്പർക്ലിപ്പ് / Attach Document) ഐക്കൺ ക്ലിക്ക് ചെയ്ത് ഇപ്പോൾ ഡൗൺലോഡ് ചെയ്ത ഈ PDF തിരഞ്ഞെടുത്ത് Send അമർത്തുക.'
                : 'In the opened WhatsApp chat, click the 📎 paperclip (Document) icon, select the downloaded quotation PDF, and hit Send!'}
            </p>
            {copiedText && (
              <span className="inline-block text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-md">
                {isMl ? '✓ മെസ്സേജ് ക്ലിപ്പ്ബോർഡിൽ കോപ്പി ചെയ്തിട്ടുണ്ട്' : '✓ Message copied to clipboard'}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Button 1: Download Only */}
            <button
              type="button"
              onClick={handleDownloadOnly}
              disabled={isGeneratingPdf}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
                  <span>{isMl ? 'PDF നിർമ്മിക്കുന്നു...' : 'Preparing PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-stone-700" />
                  <span>{isMl ? '1. PDF ഡൗൺലോഡ്' : '1. Download PDF'}</span>
                </>
              )}
            </button>

            {/* Button 2: Send to WhatsApp (+91...) */}
            <button
              type="button"
              onClick={handleOpenDirectWhatsApp}
              disabled={isSending || isGeneratingPdf}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{isMl ? 'WhatsApp തുറക്കുന്നു...' : 'Opening WhatsApp...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-white" />
                  <span>
                    {isMl
                      ? `2. WhatsApp-ൽ അയക്കുക (${recipientType === 'customer' ? (customerPhone ? `+91 ${customerPhone}` : 'കസ്റ്റമർ') : 'നമ്പർ'})`
                      : `2. Send via WhatsApp (${recipientType === 'customer' ? (customerPhone ? `+91 ${customerPhone}` : 'Customer') : 'Number'})`}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Button 3: Mobile Native Share with PDF Attached (Shows when supported or on mobile) */}
          {canNativeShare && (
            <button
              type="button"
              onClick={handleNativeShareWithPdfAttached}
              disabled={isSending || isGeneratingPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Paperclip className="w-4 h-4 text-emerald-700" />
              <span>
                {isMl
                  ? '📎 PDF നേരിട്ട് WhatsApp-ൽ അറ്റാച്ച് ചെയ്ത് അയക്കുക (Mobile Share)'
                  : '📎 Attach PDF directly into WhatsApp (Mobile Share)'}
              </span>
            </button>
          )}
        </div>

        {/* Footer Guidance */}
        <p className="text-[11px] text-stone-500 text-center mt-3 leading-relaxed">
          {isMl
            ? '💡 WhatsApp തുറന്നുവരുമ്പോൾ ആ നമ്പറിലേക്ക് പുതിയ മെസ്സേജായി കൊട്ടേഷൻ വിശദാംശങ്ങൾ ഉണ്ടാകും. കൂടെ ഡൗൺലോഡ് ആയ PDF ഫയൽ അറ്റാച്ച് ചെയ്ത് Send നൽകാം.'
            : '💡 WhatsApp opens directly with the pre-filled quotation summary. Attach the downloaded PDF and confirm send.'}
        </p>
      </div>
    </div>
  );
};
