'use client';

import React, { useState, useEffect } from 'react';
import { CustomerLead } from '@/types';
import { X, User, Phone, Mail, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: CustomerLead) => void;
  initialLead?: CustomerLead;
  totalPrice: number;
  language?: 'en' | 'ml';
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialLead,
  totalPrice,
  language = 'en',
}) => {
  const isMl = language === 'ml';
  const [formData, setFormData] = useState<CustomerLead>({
    name: initialLead?.name || '',
    phone: initialLead?.phone || '',
    email: initialLead?.email || '',
    address: initialLead?.address || '',
    place: initialLead?.place || 'കായംകുളം',
    weddingDate: initialLead?.weddingDate || '',
    venueLocation: initialLead?.venueLocation || '',
    notes: initialLead?.notes || '',
  });

  // Automatically pre-fill logged in user's profile details when modal opens
  useEffect(() => {
    if (isOpen && initialLead) {
      setFormData({
        name: initialLead.name || '',
        phone: initialLead.phone || '',
        email: initialLead.email || '',
        address: initialLead.address || '',
        place: initialLead.place || 'കായംകുളം',
        weddingDate: initialLead.weddingDate || '',
        venueLocation: initialLead.venueLocation || '',
        notes: initialLead.notes || '',
      });
    }
  }, [isOpen, initialLead]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    const newErrors: Record<string, string> = {};

    const cleanName = (formData.name || '').trim();
    if (!cleanName) {
      newErrors.name = isMl ? 'ദയവായി നിങ്ങളുടെ പേര് നൽകുക (Please enter your name)' : 'Please enter your name';
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      newErrors.phone = isMl ? 'ശരിയായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക (Valid 10-digit phone required)' : 'Valid 10-digit phone required';
    } else if (cleanPhone.length === 10 && !['6', '7', '8', '9'].includes(cleanPhone.charAt(0))) {
      newErrors.phone = isMl ? 'ഇന്ത്യൻ മൊബൈൽ നമ്പറുകൾ 6, 7, 8, 9 ലാണ് തുടങ്ങുന്നത്. ശരിയായ WhatsApp നമ്പർ നൽകുക' : 'Valid Indian mobile required (must start with 6, 7, 8, or 9)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      id: initialLead?.id,
      totalPrice,
      createdAt: initialLead?.createdAt || new Date().toISOString(),
      status: initialLead?.status || 'New',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-stone-200 animate-fade-in max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-stone-900">
            PDF കൊട്ടേഷൻ തയ്യാറാക്കാം
          </h3>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            നിങ്ങളുടെ കൊട്ടേഷനിൽ പ്രിന്റ് ചെയ്യാനായി പേരും കോൺടാക്റ്റ് വിവരങ്ങളും നൽകുക
          </p>
          <div className="mt-3 inline-block bg-amber-50 border border-amber-200 rounded-full px-4 py-1 text-xs font-bold text-amber-800">
            എസ്റ്റിമേറ്റ് തുക: ₹{totalPrice.toLocaleString('en-IN')}
          </div>
        </div>

        {formData.name && formData.phone && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {isMl ? 'ലോഗിൻ ചെയ്ത അക്കൗണ്ട് വിവരങ്ങൾ' : 'Saved Account Details'}
              </span>
              <p className="text-xs font-black text-stone-900 truncate mt-0.5">
                {formData.name} • {formData.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black py-2 px-3.5 rounded-xl text-xs transition shadow-sm shrink-0 cursor-pointer"
            >
              {isMl ? '⚡ ഇപ്പോൾ കാണുക' : '⚡ View PDF Now'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              കസ്റ്റമറുടെ പേര് (Your Name) *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="ഉദാ: രാഹുൽ / അഞ്ജലി"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.name ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              മൊബൈൽ നമ്പർ (Mobile Number) *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                placeholder="10 അക്ക മൊബൈൽ നമ്പർ (ഉദാ: 9876543210)"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${
                  errors.phone ? 'border-rose-500 ring-rose-200' : 'border-stone-200'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ഇമെയിൽ ഐഡി (Email Address)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="youremail@gmail.com (ഓപ്ഷണൽ)"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Wedding Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              വിവാഹ തീയതി (Wedding / Event Date)
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                value={formData.weddingDate}
                onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          {/* Address / Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              സ്ഥലം / ഓഡിറ്റോറിയം (Address / Venue / Location)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="ഉദാ: കായംകുളം ഓഡിറ്റോറിയം, ആലപ്പുഴ"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-amber-600 via-rosewood-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isMl ? 'കൊട്ടേഷൻ കാണുക & PDF ഡൗൺലോഡ് ചെയ്യുക' : 'View Quotation & Download PDF'}</span>
            </button>
            <p className="text-[11px] text-stone-400 text-center mt-2">
              നിങ്ങളുടെ വിവരങ്ങൾ സ്റ്റുഡിയോയുടെ അഡ്മിൻ പാനലിൽ സുരക്ഷിതമായി സൂക്ഷിക്കപ്പെടുന്നതാണ്
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
