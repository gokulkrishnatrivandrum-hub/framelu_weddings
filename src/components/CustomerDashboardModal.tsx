'use client';

import React, { useState } from 'react';
import {
  CustomerUser,
  CustomerLead,
  AirlineReservation,
  CustomerAccessRequest,
  SelectedOtherService,
  StudioContactConfig,
} from '@/types';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Plane,
  Package,
  Send,
  Edit3,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  Luggage,
  ShieldCheck,
  Building,
  DollarSign,
  Download,
  Share2,
  MessageCircle,
  Car,
  Utensils,
  Camera,
  RefreshCw,
  Info,
} from 'lucide-react';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';

interface CustomerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerUser: CustomerUser;
  leads: CustomerLead[];
  language?: 'en' | 'ml';
  onEditBill: (lead: CustomerLead) => void;
  onResubmitBill: (lead: CustomerLead) => Promise<void>;
  onViewPdf: (lead: CustomerLead) => void;
  onUpdateCustomerReservations: (reservations: AirlineReservation[]) => Promise<void>;
  onSendAccessRequest: (request: CustomerAccessRequest) => Promise<void>;
  studioContact: StudioContactConfig;
  onBrowseServices: () => void;
  onCustomerLogout: () => void;
}

export const CustomerDashboardModal: React.FC<CustomerDashboardModalProps> = ({
  isOpen,
  onClose,
  customerUser,
  leads,
  language = 'en',
  onEditBill,
  onResubmitBill,
  onViewPdf,
  onUpdateCustomerReservations,
  onSendAccessRequest,
  studioContact,
  onBrowseServices,
  onCustomerLogout,
}) => {
  const isMl = language === 'ml';

  // Navigation tab inside dashboard: 'bills' | 'packages' | 'airline' | 'access'
  const [activeTab, setActiveTab] = useState<'bills' | 'packages' | 'airline' | 'access'>('bills');
  const [shareWhatsAppLead, setShareWhatsAppLead] = useState<CustomerLead | null>(null);

  // Filter bills/leads belonging to this customer by email (case-insensitive) or phone
  const userEmail = customerUser.email?.toLowerCase().trim();
  const userPhone = customerUser.phone?.replace(/\D/g, '');

  const customerLeads = leads.filter((l) => {
    const lEmail = l.email?.toLowerCase().trim();
    const lPhone = l.phone?.replace(/\D/g, '');
    return (userEmail && lEmail === userEmail) || (userPhone && lPhone && lPhone === userPhone);
  });

  // Collect all extra services across customer's leads
  const allExtraServices: { leadId: string; service: SelectedOtherService; weddingDate: string }[] = [];
  customerLeads.forEach((lead) => {
    if (lead.selectedServices && lead.selectedServices.length > 0) {
      lead.selectedServices.forEach((srv) => {
        allExtraServices.push({
          leadId: lead.id || 'N/A',
          service: srv,
          weddingDate: lead.weddingDate,
        });
      });
    }
  });

  // Collect all airline reservations (from customerUser or across their leads)
  const [reservations, setReservations] = useState<AirlineReservation[]>(() => {
    if (customerUser.airlineReservations && customerUser.airlineReservations.length > 0) {
      return customerUser.airlineReservations;
    }
    // Also look inside customer leads
    const aggregated: AirlineReservation[] = [];
    customerLeads.forEach((l) => {
      if (l.airlineReservations) {
        l.airlineReservations.forEach((r) => {
          if (!aggregated.some((existing) => existing.id === r.id)) {
            aggregated.push(r);
          }
        });
      }
    });
    return aggregated;
  });

  // Modal / Form state for Adding a new Airline Reservation
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [flightForm, setFlightForm] = useState<Partial<AirlineReservation>>({
    airlineName: 'Air India Express',
    flightNumber: '',
    tripType: 'round_trip',
    departureCity: 'Dubai (DXB)',
    arrivalCity: 'Kochi (COK)',
    departureDate: '',
    departureTime: '',
    returnFlightNumber: '',
    returnDepartureDate: '',
    returnDepartureTime: '',
    pnrNumber: '',
    passengerCount: 2,
    passengerNames: [customerUser.name || 'Groom & Bride'],
    cabinClass: 'economy',
    airportTransferRequired: true,
    cabPickupLocation: 'Cochin International Airport (COK)',
    status: 'Confirmed',
    notes: 'Destination wedding flight booking for couple/family',
  });
  const [flightFormError, setFlightFormError] = useState('');

  // Access Requests State
  const [accessRequests, setAccessRequests] = useState<CustomerAccessRequest[]>(() => {
    if (customerUser.accessRequests && customerUser.accessRequests.length > 0) {
      return customerUser.accessRequests;
    }
    // Default initial access logs if any lead exists
    const list: CustomerAccessRequest[] = [];
    if (customerLeads.length > 0) {
      customerLeads.forEach((l) => {
        list.push({
          id: `ACC-${l.id || Math.floor(Math.random() * 10000)}`,
          title: `Quotation Access Sent (Bill #${l.id})`,
          titleMl: `കൊട്ടേഷൻ ആക്സസ് അയച്ചു (ബിൽ #${l.id})`,
          type: 'quotation_access',
          requestedAt: l.createdAt || new Date().toISOString(),
          status: l.status === 'Booked' ? 'Approved' : 'Sent',
          notes: `Grand Total: ₹${(l.grandTotal || 0).toLocaleString('en-IN')}`,
        });
      });
    }
    return list;
  });

  const [newRequestNote, setNewRequestNote] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [resubmitSuccessMsg, setResubmitSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Handle Save New Airline Reservation
  const handleSaveFlightReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlightFormError('');

    if (!flightForm.flightNumber?.trim() || !flightForm.departureDate) {
      setFlightFormError(
        isMl
          ? 'ഫ്ലൈറ്റ് നമ്പറും പുറപ്പെടുന്ന തീയതിയും നൽകുക'
          : 'Please enter flight number and departure date'
      );
      return;
    }

    const newRes: AirlineReservation = {
      id: `AIR-${Date.now().toString().slice(-6)}`,
      airlineName: flightForm.airlineName || 'Air India Express',
      flightNumber: flightForm.flightNumber.trim().toUpperCase(),
      tripType: flightForm.tripType || 'round_trip',
      departureCity: flightForm.departureCity || 'Dubai (DXB)',
      arrivalCity: flightForm.arrivalCity || 'Kochi (COK)',
      departureDate: flightForm.departureDate,
      departureTime: flightForm.departureTime || '10:00 AM',
      returnFlightNumber: flightForm.returnFlightNumber?.trim().toUpperCase(),
      returnDepartureDate: flightForm.returnDepartureDate,
      returnDepartureTime: flightForm.returnDepartureTime,
      pnrNumber: flightForm.pnrNumber?.trim().toUpperCase() || `PNR${Math.floor(10000 + Math.random() * 90000)}`,
      passengerCount: Number(flightForm.passengerCount) || 1,
      passengerNames: Array.isArray(flightForm.passengerNames) ? flightForm.passengerNames : [customerUser.name],
      cabinClass: flightForm.cabinClass || 'economy',
      airportTransferRequired: !!flightForm.airportTransferRequired,
      cabPickupLocation: flightForm.cabPickupLocation || 'Airport Arrival Terminal',
      status: flightForm.status || 'Confirmed',
      notes: flightForm.notes || '',
      createdAt: new Date().toISOString(),
    };

    const updated = [newRes, ...reservations];
    setReservations(updated);
    await onUpdateCustomerReservations(updated);

    // Also auto-log an access/notification request for travel assistance
    const travelAccess: CustomerAccessRequest = {
      id: `ACC-AIR-${Date.now().toString().slice(-5)}`,
      title: `Airline Reservation Added: ${newRes.airlineName} (${newRes.flightNumber})`,
      titleMl: `എയർലൈൻ റിസർവേഷൻ ചേർത്തു: ${newRes.airlineName} (${newRes.flightNumber})`,
      type: 'airline_booking_assistance',
      requestedAt: new Date().toISOString(),
      status: 'Sent',
      notes: `${newRes.departureCity} ✈️ ${newRes.arrivalCity} on ${newRes.departureDate} (PNR: ${newRes.pnrNumber})`,
    };
    const updatedAccess = [travelAccess, ...accessRequests];
    setAccessRequests(updatedAccess);
    await onSendAccessRequest(travelAccess);

    setIsAddingFlight(false);
    setFlightForm({
      airlineName: 'Air India Express',
      flightNumber: '',
      tripType: 'round_trip',
      departureCity: 'Dubai (DXB)',
      arrivalCity: 'Kochi (COK)',
      departureDate: '',
      departureTime: '',
      returnFlightNumber: '',
      returnDepartureDate: '',
      returnDepartureTime: '',
      pnrNumber: '',
      passengerCount: 2,
      passengerNames: [customerUser.name],
      cabinClass: 'economy',
      airportTransferRequired: true,
      cabPickupLocation: 'Cochin International Airport (COK)',
      status: 'Confirmed',
      notes: '',
    });
  };

  // Delete Airline Reservation
  const handleDeleteFlightReservation = async (id: string) => {
    const updated = reservations.filter((r) => r.id !== id);
    setReservations(updated);
    await onUpdateCustomerReservations(updated);
  };

  // Re-submit Bill Handler with prompt feedback
  const handleTriggerResubmit = async (lead: CustomerLead) => {
    try {
      await onResubmitBill(lead);
      setResubmitSuccessMsg(
        isMl
          ? `ബിൽ #${lead.id} വിജയകരമായി വീണ്ടും സെൻഡ് ചെയ്തു! സ്റ്റുഡിയോ ടീമിനെ അറിയിച്ചു.`
          : `Bill #${lead.id} re-submitted successfully to the studio team!`
      );
      // Auto log access request
      const resubmitAccess: CustomerAccessRequest = {
        id: `ACC-RESUB-${Date.now().toString().slice(-5)}`,
        title: `Bill #${lead.id} Re-submitted with Updated Details`,
        titleMl: `ബിൽ #${lead.id} മാറ്റങ്ങളോടെ വീണ്ടും സമർപ്പിച്ചു`,
        type: 'quotation_access',
        requestedAt: new Date().toISOString(),
        status: 'Sent',
        notes: `Grand Total: ₹${(lead.grandTotal || 0).toLocaleString('en-IN')}`,
      };
      setAccessRequests((prev) => [resubmitAccess, ...prev]);
      await onSendAccessRequest(resubmitAccess);

      setTimeout(() => setResubmitSuccessMsg(''), 4500);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Send Custom Access Request to Studio
  const handleSendCustomAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestNote.trim()) return;

    setIsSubmittingRequest(true);
    const newReq: CustomerAccessRequest = {
      id: `ACC-${Date.now().toString().slice(-6)}`,
      title: `Customer Inquiry / Special Request`,
      titleMl: `കസ്റ്റമർ എൻക്വയറി & പ്രത്യേക റിക്വസ്റ്റ്`,
      type: 'general',
      requestedAt: new Date().toISOString(),
      status: 'Sent',
      notes: newRequestNote.trim(),
    };

    const updated = [newReq, ...accessRequests];
    setAccessRequests(updated);
    await onSendAccessRequest(newReq);
    setNewRequestNote('');
    setIsSubmittingRequest(false);
  };

  // WhatsApp formatted lead share with attached PDF
  const handleWhatsAppBill = (lead: CustomerLead) => {
    setShareWhatsAppLead(lead);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh]">
        {/* TOP HEADER: Customer Identity Banner */}
        <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-5 sm:p-6 shrink-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 font-black text-xl flex items-center justify-center shadow-lg ring-2 ring-white/20">
                {customerUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {isMl ? 'കസ്റ്റമർ പേഴ്സണൽ ഡാഷ്ബോർഡ്' : 'Customer Personal Portal'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {customerUser.verified ? (isMl ? 'വെരിഫൈഡ് അക്കൗണ്ട്' : 'Verified') : 'Active'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {customerUser.name}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <strong>{customerUser.email}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    {customerUser.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {customerUser.place}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={onCustomerLogout}
                className="text-xs font-bold text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                {isMl ? 'ലോഗ് ഔട്ട്' : 'Sign Out'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close Dashboard"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <span className="text-[10px] text-stone-400 block font-semibold">
                {isMl ? 'സേവ് ചെയ്ത ബില്ലുകൾ' : 'Saved Bills'}
              </span>
              <p className="text-lg font-black text-amber-400">{customerLeads.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <span className="text-[10px] text-stone-400 block font-semibold">
                {isMl ? 'എക്സ്ട്രാ പാക്കേജുകൾ' : 'Extra Packages'}
              </span>
              <p className="text-lg font-black text-amber-300">{allExtraServices.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <span className="text-[10px] text-stone-400 block font-semibold">
                {isMl ? 'എയർലൈൻ റിസർവേഷനുകൾ' : 'Flight Bookings'}
              </span>
              <p className="text-lg font-black text-sky-400">{reservations.length}</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5">
              <span className="text-[10px] text-stone-400 block font-semibold">
                {isMl ? 'ആക്സസ് & റിക്വസ്റ്റുകൾ' : 'Access Requests'}
              </span>
              <p className="text-lg font-black text-emerald-400">{accessRequests.length}</p>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNER (If bill re-submitted) */}
        {resubmitSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{resubmitSuccessMsg}</span>
            </div>
            <button onClick={() => setResubmitSuccessMsg('')} className="text-emerald-100 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* DASHBOARD TAB NAVIGATION BAR */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 sm:px-6 pt-3 flex items-center gap-1 sm:gap-3 overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('bills')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'bills'
                ? 'bg-white text-amber-900 border-amber-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>{isMl ? 'സേവ് ചെയ്ത ബില്ലുകൾ & കൊട്ടേഷൻ' : 'Saved Bills & Quotations'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
              {customerLeads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-white text-amber-900 border-amber-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600" />
            <span>{isMl ? 'എക്സ്ട്രാ പാക്കേജുകൾ' : 'Extra Packages Booked'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-stone-200 text-stone-700">
              {allExtraServices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('airline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'airline'
                ? 'bg-white text-sky-900 border-sky-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
            }`}
          >
            <Plane className="w-4 h-4 text-sky-600" />
            <span>{isMl ? 'എയർലൈൻ റിസർവേഷൻ' : 'Airline & Travel Reservations'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-sky-100 text-sky-800">
              {reservations.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'access'
                ? 'bg-white text-emerald-900 border-emerald-600 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 border-transparent hover:bg-stone-200/60'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span>{isMl ? 'ആക്സസ് & റിക്വസ്റ്റുകൾ' : 'Access & Requests Sent'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
              {accessRequests.length}
            </span>
          </button>
        </div>

        {/* TAB CONTENTS (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          {/* ========================================================================= */}
          {/* TAB 1: SAVED BILLS & QUOTATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'bills' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {isMl ? 'നിങ്ങൾ സേവ് ചെയ്ത ബില്ലുകൾ & കൊട്ടേഷനുകൾ' : 'Your Saved Quotations & Bills'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isMl
                      ? 'ഇവിടെ നിങ്ങളുടെ ബിൽ എഡിറ്റ് ചെയ്യാനും, തുക റീകാൽക്കുലേറ്റ് ചെയ്യാനും, വീണ്ടും അയക്കാനും സാധിക്കും'
                      : 'Edit any quote anytime, modify crew/deliverables, recalculate pricing, and re-send to studio'}
                  </p>
                </div>
                <div className="text-xs text-stone-500 font-semibold flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    {isMl ? 'എപ്പോൾ ലോഗിൻ ചെയ്താലും ലഭ്യമാണ്' : 'Permanently synced to your Email'}
                  </span>
                </div>
              </div>

              {customerLeads.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900">
                    {isMl ? 'ബില്ലുകൾ ഒന്നും സേവ് ചെയ്തിട്ടില്ല' : 'No Quotations Saved Yet'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                    {isMl
                      ? 'വെഡ്ഡിംഗ് ഇവന്റുകൾ, ക്രൂ, ഡെലിവറബിളുകൾ എന്നിവ തിരഞ്ഞെടുത്ത് "Download PDF Quotation" അല്ലെങ്കിൽ സബ്മിറ്റ് ചെയ്യുമ്പോൾ ബിൽ ഇവിടെ സേവ് ആകുന്നതാണ്.'
                      : 'Customize your wedding events, photography crew, and deliverables on the main screen to generate and save your bill here.'}
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isMl ? 'പുതിയ ബിൽ നിർമ്മിക്കുക' : 'Create Your First Wedding Bill'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {customerLeads.map((lead, idx) => {
                    const isStandalone = lead.leadType === 'standalone_photoshoot';
                    const hasDiscount = (lead.discountAmount || 0) > 0;
                    return (
                      <div
                        key={lead.id || idx}
                        className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                      >
                        {/* Status bar top indicator */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1.5 ${
                            lead.status === 'Booked'
                              ? 'bg-emerald-500'
                              : lead.status === 'Re-submitted'
                              ? 'bg-sky-500'
                              : 'bg-amber-500'
                          }`}
                        />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: Lead Identity & Event details */}
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-black px-2.5 py-0.5 rounded-md bg-stone-900 text-amber-300 tracking-wide font-mono">
                                #{lead.id}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  lead.status === 'Booked'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : lead.status === 'Re-submitted'
                                    ? 'bg-sky-100 text-sky-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {lead.status || 'Active'}
                              </span>
                              {lead.revisionsCount && lead.revisionsCount > 0 && (
                                <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                                  {isMl ? `${lead.revisionsCount} എഡിറ്റുകൾ` : `Rev #${lead.revisionsCount}`}
                                </span>
                              )}
                              <span className="text-xs text-stone-400">
                                {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-stone-900">
                              {isStandalone
                                ? lead.photoshootDetails?.titleEn || lead.photoshootType || 'Photoshoot Package'
                                : `${lead.name}'s Wedding Ceremony`}
                            </h4>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600">
                              <span className="flex items-center gap-1 font-semibold text-stone-700">
                                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                                {lead.weddingDate || 'Date to be confirmed'}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                {lead.venueLocation || lead.place || 'Kerala'}
                              </span>
                              {!isStandalone && (
                                <span className="flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded text-[11px] font-bold uppercase text-stone-600">
                                  {lead.side === 'both' ? 'Groom & Bride Side' : `${lead.side} Side`}
                                </span>
                              )}
                              {lead.selectedServices && lead.selectedServices.length > 0 && (
                                <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                                  +{lead.selectedServices.length} {isMl ? 'എക്സ്ട്രാ സർവീസുകൾ' : 'Extra Services'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: Pricing Card */}
                          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 md:text-right shrink-0">
                            <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider">
                              {isMl ? 'ആകെ തുക (Grand Total)' : 'Grand Total (Inc. 18% GST)'}
                            </span>
                            <div className="text-xl sm:text-2xl font-black text-stone-900">
                              ₹{(lead.grandTotal || 0).toLocaleString('en-IN')}
                            </div>
                            {hasDiscount && (
                              <span className="text-[10px] font-bold text-emerald-600 block">
                                {isMl ? 'കൂപ്പൺ കിഴിവ് ലഭിച്ചു' : `Coupon: ${lead.couponCode} (-₹${(lead.discountAmount || 0).toLocaleString('en-IN')})`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* BOTTOM ACTION BUTTONS: Edit, Re-submit, View PDF, WhatsApp */}
                        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-stone-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {lead.lastEditedAt
                                ? `${isMl ? 'അവസാനം എഡിറ്റ് ചെയ്തത്:' : 'Last updated:'} ${new Date(
                                    lead.lastEditedAt
                                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : isMl
                                ? 'ബിൽ സേവ് ചെയ്തിരിക്കുന്നു'
                                : 'Bill saved in your personal dashboard'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* 1. EDIT BILL BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                onEditBill(lead);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer"
                              title={isMl ? 'ഈ ബിൽ എഡിറ്റ് ചെയ്ത് മാറ്റങ്ങൾ വരുത്തുക' : 'Edit and recalculate this bill'}
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                              <span>{isMl ? 'എഡിറ്റ് ചെയ്യുക' : 'Edit & Recalculate'}</span>
                            </button>

                            {/* 2. RE-SUBMIT / RE-SEND BUTTON */}
                            <button
                              type="button"
                              onClick={() => handleTriggerResubmit(lead)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title={isMl ? 'സ്റ്റുഡിയോയിലേക്ക് വീണ്ടും സെൻഡ് ചെയ്യുക' : 'Re-send updated bill to studio'}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{isMl ? 'വീണ്ടും സെൻഡ് ചെയ്യുക' : 'Re-Submit to Studio'}</span>
                            </button>

                            {/* 3. VIEW / DOWNLOAD PDF */}
                            <button
                              type="button"
                              onClick={() => {
                                onViewPdf(lead);
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title={isMl ? 'PDF കൊട്ടേഷൻ കാണുക' : 'View PDF Quotation'}
                            >
                              <Download className="w-3.5 h-3.5 text-amber-300" />
                              <span>{isMl ? 'PDF കാണുക' : 'View PDF'}</span>
                            </button>

                            {/* 4. WHATSAPP */}
                            <button
                              type="button"
                              onClick={() => handleWhatsAppBill(lead)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                              title="Share with Studio on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: EXTRA PACKAGES BOOKED */}
          {/* ========================================================================= */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {isMl ? 'നിങ്ങൾ തിരഞ്ഞെടുത്ത എക്സ്ട്രാ പാക്കേജുകൾ' : 'Your Customized Extra Packages'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isMl
                      ? 'നിങ്ങൾ ഇതുവരെ തിരഞ്ഞെടുത്ത കാറ്ററിംഗ്, മേക്കപ്പ്, സ്റ്റേജ് ഡെക്കറേഷൻ, ആഡംബര കാറുകൾ തുടങ്ങിയവ'
                      : 'Food catering, bridal makeup, stage decor, luxury cars, invitation cards added to your wedding'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBrowseServices();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isMl ? 'കൂടുതൽ പാക്കേജുകൾ ചേർക്കുക' : '+ Browse More Packages'}</span>
                </button>
              </div>

              {allExtraServices.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-3">
                    <Package className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900">
                    {isMl ? 'എക്സ്ട്രാ പാക്കേജുകൾ ഒന്നും ചേർത്തിട്ടില്ല' : 'No Extra Packages Selected Yet'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                    {isMl
                      ? 'കല്യാണ സദ്യ/ബിരിയാണി കാറ്ററിംഗ്, ബ്രൈഡൽ മേക്കപ്പ്, വെഡ്ഡിംഗ് ഡ്രസ്സ്, ലക്ഷ്വറി കാറുകൾ എന്നിവ "Services" ടാബിൽ നിന്നും തിരഞ്ഞെടുക്കാം.'
                      : 'Add premium catering, bridal makeup, event decor, invitation printing, luxury wedding cars, and honeymoon packages.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBrowseServices();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isMl ? 'സർവീസുകൾ കാണുക' : 'Explore Extra Wedding Services'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allExtraServices.map((item, idx) => {
                    const s = item.service;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                              {s.category.replace('_', ' ')}
                            </span>
                            <span className="text-xs font-black text-amber-800">
                              ₹{(s.price || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-900">
                            {isMl ? s.titleMl || s.title : s.title}
                          </h4>
                          {s.guestCount && (
                            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                              <Utensils className="w-3.5 h-3.5 text-stone-400" />
                              <span>{s.guestCount} {isMl ? 'അതിഥികൾ' : 'Guests'}</span>
                            </p>
                          )}
                          {s.cardCount && (
                            <p className="text-xs text-stone-500 mt-1">
                              {s.cardCount} {isMl ? 'ക്ഷണക്കത്തുകൾ' : 'Invitation Cards'}
                            </p>
                          )}
                          {s.notes && (
                            <p className="text-xs text-stone-400 italic mt-1.5 bg-stone-50 p-2 rounded-lg">
                              &ldquo;{s.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                          <span>{isMl ? `ബിൽ റഫറൻസ്: #${item.leadId}` : `Linked to Quote #${item.leadId}`}</span>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {isMl ? 'പാക്കേജ് ഉൾപ്പെടുത്തി' : 'Included in Bill'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: AIRLINE & TRAVEL RESERVATIONS */}
          {/* ========================================================================= */}
          {activeTab === 'airline' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-sky-600" />
                    <span>{isMl ? 'എയർലൈൻ റിസർവേഷൻ & യാത്രാ വിവരങ്ങൾ' : 'Airline & Destination Travel Bookings'}</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isMl
                      ? 'വിവാഹത്തിനായുള്ള വിമാന ടിക്കറ്റ്, PNR നമ്പർ, യാത്രക്കാരുടെ വിവരങ്ങൾ, എയർപോർട്ട് പിക്ക് അപ്പ് എന്നിവ ഇവിടെ കാണാം'
                      : 'Flight tickets, PNR numbers, arrival schedules, crew flight bookings, and airport cab transfers'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingFlight(!isAddingFlight)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAddingFlight ? (isMl ? 'ഫോം ക്ലോസ് ചെയ്യുക' : 'Cancel Form') : (isMl ? '+ പുതിയ ഫ്ലൈറ്റ് ചേർക്കുക' : '+ Add Flight Reservation')}</span>
                </button>
              </div>

              {/* ADD AIRLINE RESERVATION FORM */}
              {isAddingFlight && (
                <form
                  onSubmit={handleSaveFlightReservation}
                  className="bg-sky-50/70 border border-sky-200 rounded-3xl p-5 sm:p-6 space-y-4 animate-fade-in text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-900 font-black text-sm">
                      <Plane className="w-4 h-4 text-sky-600" />
                      <span>{isMl ? 'എയർലൈൻ റിസർവേഷൻ വിവരങ്ങൾ നൽകുക' : 'Enter Flight Reservation Details'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                      Destination Wedding Travel
                    </span>
                  </div>

                  {flightFormError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{flightFormError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Airline Name */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'എയർലൈൻ പേര് *' : 'Airline Name *'}
                      </label>
                      <select
                        value={flightForm.airlineName}
                        onChange={(e) => setFlightForm({ ...flightForm, airlineName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Air India Express">Air India Express</option>
                        <option value="IndiGo">IndiGo</option>
                        <option value="Emirates">Emirates</option>
                        <option value="Air Arabia">Air Arabia</option>
                        <option value="Qatar Airways">Qatar Airways</option>
                        <option value="Etihad Airways">Etihad Airways</option>
                        <option value="Gulf Air">Gulf Air</option>
                        <option value="Flydubai">Flydubai</option>
                        <option value="Akasa Air">Akasa Air</option>
                        <option value="Vistara">Vistara</option>
                        <option value="SpiceJet">SpiceJet</option>
                      </select>
                    </div>

                    {/* Flight Number */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'ഫ്ലൈറ്റ് നമ്പർ (Flight No) *' : 'Flight Number *'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. IX 474 / 6E 1402"
                        value={flightForm.flightNumber}
                        onChange={(e) => setFlightForm({ ...flightForm, flightNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                        required
                      />
                    </div>

                    {/* PNR / Booking Ref */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'PNR / ടിക്കറ്റ് റഫറൻസ്' : 'PNR / Booking Reference'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PNR-78921"
                        value={flightForm.pnrNumber}
                        onChange={(e) => setFlightForm({ ...flightForm, pnrNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Departure Airport / City */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'പുറപ്പെടുന്ന സ്ഥലം / എയർപോർട്ട് *' : 'Departure City / Airport *'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Dubai International (DXB) / Bangalore (BLR)"
                        value={flightForm.departureCity}
                        onChange={(e) => setFlightForm({ ...flightForm, departureCity: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>

                    {/* Arrival Airport / City */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'എത്തിച്ചേരുന്ന സ്ഥലം (കേരളം) *' : 'Arrival City / Airport *'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cochin International Airport (COK)"
                        value={flightForm.arrivalCity}
                        onChange={(e) => setFlightForm({ ...flightForm, arrivalCity: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Departure Date */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'പുറപ്പെടുന്ന തീയതി *' : 'Departure Date *'}
                      </label>
                      <input
                        type="date"
                        value={flightForm.departureDate}
                        onChange={(e) => setFlightForm({ ...flightForm, departureDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>

                    {/* Departure Time */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'പുറപ്പെടുന്ന സമയം' : 'Departure Time'}
                      </label>
                      <input
                        type="time"
                        value={flightForm.departureTime}
                        onChange={(e) => setFlightForm({ ...flightForm, departureTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {/* Passenger Count */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'യാത്രക്കാരുടെ എണ്ണം' : 'Passenger Count'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={flightForm.passengerCount}
                        onChange={(e) => setFlightForm({ ...flightForm, passengerCount: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Passenger Names */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {isMl ? 'യാത്രക്കാരുടെ പേരുകൾ' : 'Passenger Names'}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Arun Krishna, Anjali Nair"
                        value={Array.isArray(flightForm.passengerNames) ? flightForm.passengerNames.join(', ') : ''}
                        onChange={(e) =>
                          setFlightForm({
                            ...flightForm,
                            passengerNames: e.target.value.split(',').map((n) => n.trim()),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    {/* Airport Cab Pick Up */}
                    <div className="flex flex-col justify-center">
                      <label className="flex items-center gap-2 cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={flightForm.airportTransferRequired}
                          onChange={(e) =>
                            setFlightForm({ ...flightForm, airportTransferRequired: e.target.checked })
                          }
                          className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-stone-300"
                        />
                        <span className="text-xs font-bold text-stone-800">
                          {isMl ? 'എയർപോർട്ട് ക്യാബ് / പിക്കപ്പ് ആവശ്യമുണ്ട്' : 'Airport Cab / Luxury Pickup Required'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingFlight(false)}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition cursor-pointer"
                    >
                      {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Plane className="w-3.5 h-3.5" />
                      <span>{isMl ? 'റിസർവേഷൻ സേവ് ചെയ്യുക' : 'Save Flight Booking'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* FLIGHT RESERVATIONS LIST */}
              {reservations.length === 0 && !isAddingFlight ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-dashed border-stone-300">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-3">
                    <Plane className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-stone-900">
                    {isMl ? 'എയർലൈൻ റിസർവേഷനുകൾ ഒന്നും ചേർത്തിട്ടില്ല' : 'No Airline Reservations Added Yet'}
                  </h4>
                  <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                    {isMl
                      ? 'വിദേശത്ത് നിന്നോ മറ്റ് സംസ്ഥാനങ്ങളിൽ നിന്നോ എത്തുന്ന വധൂവരന്മാർ, കുടുംബാംഗങ്ങൾ, അല്ലെങ്കിൽ ഫോട്ടോഗ്രാഫി ക്രൂ എന്നിവർക്കായി ഫ്ലൈറ്റ് ടിക്കറ്റ് വിവരങ്ങൾ ഇവിടെ ചേർക്കുക.'
                      : 'Record your flights for destination weddings, family travel, and photography crew airport coordination.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsAddingFlight(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isMl ? '+ ഫ്ലൈറ്റ് ടിക്കറ്റ് വിവരങ്ങൾ നൽകുക' : '+ Add Flight Ticket Details'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {reservations.map((res) => (
                    <div
                      key={res.id}
                      className="bg-white rounded-2xl p-5 border border-sky-100 shadow-xs hover:shadow-md transition relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-b from-sky-400 to-blue-600" />
                      <div className="pl-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                              <Plane className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-sky-950 uppercase">
                                  {res.airlineName}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-900 text-amber-300 font-mono">
                                  {res.flightNumber}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                  {res.status || 'Confirmed'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 font-mono mt-0.5">
                                PNR: <strong>{res.pnrNumber}</strong> • {res.cabinClass.toUpperCase()}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteFlightReservation(res.id)}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition self-end sm:self-center"
                            title="Delete Reservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Route banner */}
                        <div className="mt-4 bg-sky-50/60 rounded-xl p-3 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <div>
                              <span className="text-[10px] text-stone-400 block font-semibold">FROM</span>
                              <strong className="text-stone-900 text-sm">{res.departureCity}</strong>
                            </div>
                            <div className="text-sky-600 font-bold px-2">✈️</div>
                            <div>
                              <span className="text-[10px] text-stone-400 block font-semibold">TO</span>
                              <strong className="text-stone-900 text-sm">{res.arrivalCity}</strong>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-[10px] text-stone-400 block font-semibold">DATE & TIME</span>
                            <span className="font-bold text-stone-800">
                              {res.departureDate} {res.departureTime ? `(${res.departureTime})` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Passenger and transfer badge */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              {res.passengerCount} {isMl ? 'യാത്രക്കാർ' : 'Passengers'}:{' '}
                              <strong>{res.passengerNames.join(', ')}</strong>
                            </span>
                          </div>

                          {res.airportTransferRequired && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                              <Car className="w-3 h-3 text-emerald-600" />
                              {isMl ? 'എയർപോർട്ട് ക്യാബ് ബുക്ക് ചെയ്തു' : 'Airport Pickup Arranged'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ACCESS & REQUEST STATUS */}
          {/* ========================================================================= */}
          {activeTab === 'access' && (
            <div className="space-y-4">
              <div className="pb-2 border-b border-stone-200">
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  {isMl ? 'ആക്സസ് & സ്റ്റുഡിയോ റിക്വസ്റ്റുകൾ' : 'Access Permissions & Studio Inquiries'}
                </h3>
                <p className="text-xs text-stone-500">
                  {isMl
                    ? 'നിങ്ങൾ സ്റ്റുഡിയോയിലേക്ക് അയച്ച എല്ലാ കൊട്ടേഷൻ ആക്സസുകളും റിക്വസ്റ്റുകളും ഇവിടെ കാണാം'
                    : 'Quotation access, package requests, and verified status updates shared with the photography studio'}
                </p>
              </div>

              {/* SEND NEW ACCESS REQUEST BOX */}
              <form
                onSubmit={handleSendCustomAccess}
                className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isMl ? 'സ്റ്റുഡിയോയിലേക്ക് പുതിയ റിക്വസ്റ്റ് / കുറിപ്പ് അയക്കുക' : 'Send New Special Request / Query to Studio'}</span>
                </div>
                <textarea
                  rows={2}
                  placeholder={
                    isMl
                      ? 'ഉദാഹരണത്തിന്: ഡ്രോൺ ഷൂട്ടിന്റെ സമയം മാറ്റണം / എയർപോർട്ട് പിക്ക് അപ്പ് കാറിന്റെ സമയം...'
                      : 'e.g. Please update drone coverage timing / Airport pickup cab timing...'
                  }
                  value={newRequestNote}
                  onChange={(e) => setNewRequestNote(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingRequest || !newRequestNote.trim()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isMl ? 'ആക്സസ് റിക്വസ്റ്റ് അയക്കുക' : 'Send Request to Studio'}</span>
                  </button>
                </div>
              </form>

              {/* TIMELINE OF REQUESTS */}
              <div className="space-y-3">
                {accessRequests.map((req, idx) => (
                  <div
                    key={req.id || idx}
                    className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                          {isMl ? req.titleMl || req.title : req.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                          {req.status}
                        </span>
                      </div>
                      {req.notes && (
                        <p className="text-xs text-stone-600 pl-4">{req.notes}</p>
                      )}
                      <p className="text-[10px] text-stone-400 pl-4">
                        {new Date(req.requestedAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-xl">
                        {isMl ? 'സ്റ്റുഡിയോക്ക് ലഭ്യമാക്കിയിട്ടുണ്ട്' : 'Synced with Studio'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Studio Helpline Banner */}
              <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    {isMl ? 'സ്റ്റുഡിയോ ഹെൽപ്പ് ലൈൻ' : 'Studio Concierge Helpline'}
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {isMl
                      ? 'വിവാഹ തയ്യാറെടുപ്പുകൾ സംബന്ധിച്ച ഏത് സംശയങ്ങൾക്കും നേരിട്ട് ബന്ധപ്പെടാം.'
                      : 'Call or WhatsApp the studio directly for real-time quotation assistance.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${studioContact.phone}`}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs shadow-xs transition"
                  >
                    {isMl ? 'കോൾ ചെയ്യുക' : 'Call Studio'}
                  </a>
                  <a
                    href={`https://wa.me/${(studioContact.whatsapp || studioContact.phone).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FOOTER */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isMl
                ? 'നിങ്ങളുടെ ഡാറ്റ ഈ ഇമെയിൽ ഐഡിയിൽ സുരക്ഷിതമായി എൻക്രിപ്റ്റ് ചെയ്തിരിക്കുന്നു.'
                : 'All your bills, extra packages, and flight records are secure and bound to this Email.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition cursor-pointer self-end sm:self-auto"
          >
            {isMl ? 'ഡാഷ്ബോർഡ് ക്ലോസ് ചെയ്യുക' : 'Done & Close'}
          </button>
        </div>
      </div>

      {/* WhatsApp Share Modal with Attached PDF */}
      {shareWhatsAppLead && (
        <WhatsAppShareModal
          isOpen={!!shareWhatsAppLead}
          onClose={() => setShareWhatsAppLead(null)}
          lead={shareWhatsAppLead}
          userRole="customer"
          studioContact={studioContact}
          onDownloadPdf={() => onViewPdf(shareWhatsAppLead)}
          language={language}
        />
      )}
    </div>
  );
};
