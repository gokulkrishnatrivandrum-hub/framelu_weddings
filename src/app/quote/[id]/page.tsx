// @ts-nocheck
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CustomerLead, StudioContactConfig } from '@/types';
import { DEFAULT_STUDIO_CONTACT } from '@/constants/defaults';
import {
  FileText,
  Download,
  Calendar,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  Building2,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PublicQuotePage() {
  const params = useParams();
  const rawId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : '';
  const quoteId = decodeURIComponent(rawId);

  const [lead, setLead] = useState<CustomerLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studioContact, setStudioContact] = useState<StudioContactConfig>(DEFAULT_STUDIO_CONTACT);

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      setError('Quotation ID is missing.');
      return;
    }

    const fetchQuote = async () => {
      try {
        setLoading(true);
        // 1. Try fetching from Firestore leads collection
        const docRef = doc(db, 'leads', quoteId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setLead(snapshot.data() as CustomerLead);
        } else {
          // Check localStorage as fallback if viewer is on same machine
          if (typeof window !== 'undefined') {
            const savedRaw = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
            if (savedRaw) {
              const list: CustomerLead[] = JSON.parse(savedRaw);
              const found = list.find((item) => item.id === quoteId);
              if (found) {
                setLead(found);
                setLoading(false);
                return;
              }
            }
          }
          setError('Quotation not found. Please verify the link or contact our studio.');
        }

        // Try fetching studio contact
        try {
          const contactSnap = await getDoc(doc(db, 'settings', 'studio_contact'));
          if (contactSnap.exists()) {
            setStudioContact(contactSnap.data() as StudioContactConfig);
          }
        } catch {
          // Keep defaults
        }
      } catch (err: any) {
        console.error('Error fetching quotation:', err);
        setError('Unable to load quotation details at this moment.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
        <h2 className="text-lg font-bold">Loading Official Quotation...</h2>
        <p className="text-stone-400 text-xs mt-1">Reference: #{quoteId}</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-white text-center">
        <div className="max-w-md w-full p-6 bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Quotation Not Found</h2>
          <p className="text-stone-400 text-xs mb-6 leading-relaxed">
            {error || 'This proposal may have expired or the link is invalid.'}
          </p>
          <a
            href={`https://wa.me/${(studioContact.whatsapp || '916238747722').replace(/\D/g, '')}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact Studio on WhatsApp</span>
          </a>
        </div>
      </div>
    );
  }

  const brandName = lead.studioBranding?.studioName || 'FRAMELU EVENT PLANNER';
  const totalAmount = lead.grandTotal || lead.totalPrice || 0;
  const advance = Math.round(totalAmount * 0.25);
  const onShoot = Math.round(totalAmount * 0.5);
  const delivery = totalAmount - advance - onShoot;

  const handleDownloadPdf = () => {
    if (lead.pdfUrl) {
      window.open(lead.pdfUrl, '_blank');
    } else {
      alert('PDF is being prepared. Please contact studio directly or check WhatsApp.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-500 uppercase flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Verified Official Quotation</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {brandName.toUpperCase()}
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                Photography, Cinematography & Event Storytelling
              </p>
            </div>
            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold">
                #{quoteId}
              </span>
              <p className="text-[11px] text-stone-500 mt-1">
                Issued: {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Client & Event Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Client Details
              </span>
              <div className="flex items-center gap-2 text-stone-200 text-sm font-bold">
                <User className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lead.name}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                <span>{lead.phone}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-800/50 border border-stone-700/50 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Event Logistics
              </span>
              <div className="flex items-center gap-2 text-stone-200 text-sm font-bold">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{lead.weddingDate || 'Date to be confirmed'}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0" />
                <span>{lead.venueLocation || lead.place || 'Kerala, India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Card */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/30 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>Investment & Milestone Breakdown</span>
            </h2>
            <span className="text-[11px] font-bold text-stone-400">18% GST Included</span>
          </div>

          <div className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-400 block">Total Quotation Value</span>
              <span className="text-3xl font-black text-amber-400 tracking-tight">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            {lead.pdfUrl && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Document</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-bold">1. Advance Booking (25%)</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                ₹{advance.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-400 mt-1 block">Locks Crew & Dates</span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-bold">2. On Shoot Day (50%)</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                ₹{onShoot.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-400 mt-1 block">Production Stage</span>
            </div>
            <div className="p-3.5 rounded-xl bg-stone-800/40 border border-stone-800">
              <span className="text-[10px] text-stone-400 block font-bold">3. Final Delivery (25%)</span>
              <span className="text-base font-bold text-white mt-0.5 block">
                ₹{delivery.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-stone-400 mt-1 block">Upon Album & Video Review</span>
            </div>
          </div>
        </div>

        {/* Download & Action Footer */}
        <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-white">Have questions regarding this quotation?</h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Contact our team directly on WhatsApp or call our support line.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`https://wa.me/${(studioContact.whatsapp || '916238747722').replace(/\D/g, '')}?text=${encodeURIComponent(
                `Hello ${brandName}, I am reviewing my wedding quotation (#${quoteId}) and would like to confirm dates.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </a>
            {lead.pdfUrl && (
              <a
                href={lead.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open PDF</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
