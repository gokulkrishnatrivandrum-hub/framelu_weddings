'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CustomerLead,
  SideSelection,
  EventCrewConfig,
  EventId,
  DeliverablesConfig,
  StudioContactConfig,
  CustomPrintItem,
  SelectedOtherService,
  CouponCode,
  StudioUser,
} from '@/types';
import { CalculationResult } from '@/utils/calculator';
import { KERALA_EVENTS, DEFAULT_CUSTOM_PRINTS } from '@/constants/defaults';
import { WhatsAppShareModal } from '@/components/WhatsAppShareModal';
import {
  Printer,
  Share2,
  X,
  Camera,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  ArrowLeft,
  Video,
  Sparkles,
  Plane,
  Tv,
  BookOpen,
  Film,
  Gift,
  CreditCard,
  FileText,
  Download,
  Loader2,
  Copy,
  Check,
  Send,
  ExternalLink,
  Tag,
  Building2,
} from 'lucide-react';

interface PdfQuotationViewProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CustomerLead;
  side: SideSelection;
  calculation: CalculationResult;
  studioContact?: StudioContactConfig;
  language?: 'en' | 'ml';
  groomEvents?: Record<EventId, EventCrewConfig>;
  brideEvents?: Record<EventId, EventCrewConfig>;
  deliverables?: DeliverablesConfig;
  customPrintItems?: CustomPrintItem[];
  selectedServices?: SelectedOtherService[];
  appliedCoupon?: CouponCode | null;
  studioUser?: StudioUser | null;
}

export const PdfQuotationView: React.FC<PdfQuotationViewProps> = ({
  isOpen,
  onClose,
  lead,
  side = lead.side || 'both',
  calculation,
  studioContact = {
    phone: '+91 6238747722',
    whatsapp: '916238747722',
    destination: 'കായംകുളം, ആലപ്പുഴ, കേരളം',
    email: 'frameluweddings@gmail.com',
  },
  language = 'en',
  groomEvents = lead.groomEvents,
  brideEvents = lead.brideEvents,
  deliverables = lead.deliverables,
  customPrintItems = DEFAULT_CUSTOM_PRINTS,
  selectedServices = lead.selectedServices || [],
  appliedCoupon,
  studioUser,
}) => {

  const isMl = language === 'ml';

  const [isDownloading, setIsDownloading] = useState(false);
  const [showPostDownloadModal, setShowPostDownloadModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(studioContact.email || 'framluweddings@gmail.com');
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Ensure pure print mode when quotation modal is active
  React.useEffect(() => {
    if (!isOpen) {
      document.body.classList.remove('is-printing-quotation');
      return;
    }

    document.body.classList.add('is-printing-quotation');
    return () => {
      document.body.classList.remove('is-printing-quotation');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const quoteNo = lead.id || `LFB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const quoteDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    document.body.classList.add('is-printing-quotation');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('is-printing-quotation');
    }, 1500);
  };

  const isStandalone = lead.leadType === 'standalone_photoshoot' && !!lead.photoshootDetails;
  const shootDetails = isStandalone ? lead.photoshootDetails : undefined;

  // Financial calculations with coupon code discounts (Requirement 3)
  const baseSubtotal = isStandalone
    ? (shootDetails?.totalPrice || lead.totalPrice || calculation.totalPrice || 0)
    : (calculation.totalPrice || lead.totalPrice || 0);

  const couponDiscountPercentage = appliedCoupon?.discountPercentage || 0;
  const couponDiscountAmount = couponDiscountPercentage > 0
    ? Math.round((baseSubtotal * couponDiscountPercentage) / 100)
    : 0;
  const discountedSubtotal = Math.max(0, baseSubtotal - couponDiscountAmount);
  const taxRate = 0.18;
  const taxAmount = Math.round(discountedSubtotal * taxRate);
  const grandTotalWithTax = discountedSubtotal + taxAmount;

  // Milestone splits based on net grand total
  const advanceAmount = Math.round(grandTotalWithTax * 0.25);
  const shootCompleteAmount = Math.round(grandTotalWithTax * 0.50);
  const finalDeliveryAmount = grandTotalWithTax - advanceAmount - shootCompleteAmount;

  // Dynamic Studio Partner Branding vs Default Framelu Wedding Planner
  const displayBrandName = studioUser?.studioName
    ? studioUser.studioName.toUpperCase()
    : 'LEFT FRAME BLUE WEDDING';
  const displaySubheader = isStandalone
    ? (shootDetails?.titleMl ? `${shootDetails.titleMl} (${shootDetails.titleEn || ''})` : isMl ? 'പ്രൊഫഷണൽ ഫോട്ടോഷൂട്ട് എസ്റ്റിമേറ്റ്' : 'Professional Photoshoot & Cinema Estimate')
    : studioUser?.studioName
    ? (isMl ? 'പ്രൊഫഷണൽ വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫിയും ഫിലിംസും' : 'Professional Wedding Photography, Cinematography & Keepsake Albums')
    : (isMl ? 'പ്രീമിയം വെഡ്ഡിംഗ് ഫോട്ടോഗ്രാഫിയും ഫിലിംസും' : 'Premium Wedding Photography, Cinematography & Keepsake Albums');
  const displayLocation = studioUser?.place || studioUser?.address || studioContact.destination;
  const displayPhone = studioUser?.phone || studioContact.phone || '+91 6238747722';
  const displayEmail = studioUser?.email || studioContact.email || 'framluweddings@gmail.com';
  const displaySignatory = studioUser?.studioName || 'LEFT FRAME BLUE WEDDING';
  const targetWhatsappNumber = studioContact.whatsapp || '916238747722';

  const getSideName = (s: SideSelection) => {
    if (s === 'groom') return 'Groom Side Photography & Film Coverage';
    if (s === 'bride') return 'Bride Side Photography & Film Coverage';
    return 'Dual Side Complete Wedding Coverage (Groom & Bride Combined)';
  };

  const getAlbumCoverTitle = (type?: string) => {
    switch (type) {
      case 'normal':
        return 'Normal Cover';
      case 'premium':
        return 'Premium Cover';
      case 'extra_premium':
        return 'Extra Premium Cover';
      case 'leather':
        return 'Leather Cover';
      case 'glass':
        return 'Glass Cover';
      case 'full_glass':
        return 'Full Glass Cover';
      case 'acrylic_cover':
        return 'Glass Cover';
      case 'matt':
        return 'Normal Cover';
      case 'glossy':
        return 'Premium Cover';
      case 'metallic':
        return 'Extra Premium Cover';
      case 'feather_touch':
        return 'Leather Cover';
      case 'velvet_box':
        return 'Full Glass Cover';
      default:
        return (type ? type.replace(/_/g, ' ') : 'Normal') + ' Cover';
    }
  };

  // Compile summary of active events
  const activeGroomList = groomEvents
    ? KERALA_EVENTS.filter((e) => groomEvents[e.id]?.enabled).map((e) => e.nameEn)
    : [];
  const activeBrideList = brideEvents
    ? KERALA_EVENTS.filter((e) => brideEvents[e.id]?.enabled).map((e) => e.nameEn)
    : [];

  // WhatsApp Message (Requirement 5)
  const whatsappMessage = isStandalone
    ? encodeURIComponent(
        `*${displayBrandName} - PHOTOSHOOT ENQUIRY*\n` +
        `Hello ${displayBrandName},\nI have generated an official quote (${quoteNo}) for my photoshoot.\n\n` +
        `*Customer:* ${lead.name}\n` +
        `*Phone:* ${lead.phone}\n` +
        `*Package:* ${shootDetails?.titleEn || lead.notes || 'Photoshoot'}\n` +
        `*Date:* ${shootDetails?.date || lead.weddingDate || 'TBD'}\n` +
        `*Location:* ${shootDetails?.venue || lead.venueLocation || lead.place || 'Kerala'}\n` +
        `*Duration:* ${shootDetails?.sessionHours || 4} Hours (${shootDetails?.locationType || 'Studio'})\n` +
        (shootDetails?.crew?.reelsCount ? `*Reels:* ${shootDetails.crew.reelsCount} Reels\n` : '') +
        (shootDetails?.deliverables?.gradedPhotosCount ? `*Graded Photos:* ${shootDetails.deliverables.gradedPhotosCount} Photos\n` : '') +
        (appliedCoupon ? `*Coupon Applied:* ${appliedCoupon.code} (${couponDiscountPercentage}% OFF)\n` : '') +
        `\n*Total Estimate (with 18% Tax):* ₹${grandTotalWithTax.toLocaleString('en-IN')}\n` +
        `• Advance (25%): ₹${advanceAmount.toLocaleString('en-IN')}\n` +
        `• On Shoot Day (50%): ₹${shootCompleteAmount.toLocaleString('en-IN')}\n` +
        `• Final Delivery (25%): ₹${finalDeliveryAmount.toLocaleString('en-IN')}\n\n` +
        `Please confirm crew availability for my shoot date. Thank you!`
      )
    : encodeURIComponent(
        `*${displayBrandName} - QUOTATION ENQUIRY*\n` +
        `Hello ${displayBrandName},\nI have generated an official quote (${quoteNo}) for my wedding.\n\n` +
        `*Customer:* ${lead.name}\n` +
        `*Phone:* ${lead.phone}\n` +
        `*Date:* ${lead.weddingDate || 'TBD'}\n` +
        `*Venue:* ${lead.venueLocation || lead.place || lead.address || 'Kerala'}\n` +
        `*Coverage Scope:* ${getSideName(side)}\n` +
        (activeGroomList.length > 0 ? `*Groom Events:* ${activeGroomList.join(', ')}\n` : '') +
        (activeBrideList.length > 0 ? `*Bride Events:* ${activeBrideList.join(', ')}\n` : '') +
        (appliedCoupon ? `*Coupon Applied:* ${appliedCoupon.code} (${couponDiscountPercentage}% OFF)\n` : '') +
        `\n*Total Estimate (with 18% Tax):* ₹${grandTotalWithTax.toLocaleString('en-IN')}\n` +
        `• Advance (25%): ₹${advanceAmount.toLocaleString('en-IN')}\n` +
        `• On Shoot Completion (50%): ₹${shootCompleteAmount.toLocaleString('en-IN')}\n` +
        `• Final Delivery (25%): ₹${finalDeliveryAmount.toLocaleString('en-IN')}\n\n` +
        `Please confirm crew availability for my wedding date. Thank you!`
      );

  // Email Subject & Body
  const emailSubject = `${displayBrandName} Quotation Enquiry - ${lead.name} (${quoteNo})`;
  const emailBody = 
`Dear ${displayBrandName} Team,

I have customized an official quotation for my wedding photography & videography. Please find my quotation summary details below:

==================================================
QUOTATION SUMMARY
==================================================
• Quotation Reference: ${quoteNo}
• Quotation Date: ${quoteDate}
• Customer Name: ${lead.name}
• Contact Phone: ${lead.phone}
${lead.email ? `• Customer Email: ${lead.email}\n` : ''}• Wedding Date: ${lead.weddingDate || 'To Be Confirmed'}
• Venue / Location: ${lead.venueLocation || lead.place || lead.address || 'Kerala'}
• Coverage Scope: ${getSideName(side)}

==================================================
CEREMONIES & EVENTS INCLUDED
==================================================
${activeGroomList.length > 0 ? `• Groom Events: ${activeGroomList.join(', ')}\n` : ''}${activeBrideList.length > 0 ? `• Bride Events: ${activeBrideList.join(', ')}\n` : ''}
==================================================
DELIVERABLES & ALBUMS
==================================================
• Video Resolution: ${deliverables?.videoQuality === '4k' ? '4K Ultra HD' : 'Full HD 1080p'}
${deliverables?.fullLengthVideo ? '• Full Length Traditional Video: Included\n' : ''}${deliverables?.highlightVideo ? '• Cinematic Highlight Video (3-5 Mins): Included\n' : ''}${deliverables?.teaserVideo ? '• Cinematic Teaser Promo: Included\n' : ''}${deliverables?.reelsCount ? `• Instagram Reels: ${deliverables.reelsCount} Reels\n` : ''}${deliverables?.mainAlbumsCount ? `• Main Wedding Albums: ${deliverables.mainAlbumsCount} (${deliverables.mainAlbumSheets} Sheets, ${getAlbumCoverTitle(deliverables.albumPaperType)})\n` : ''}${deliverables?.penDriveCount ? `• USB 3.0 Pen Drives: ${deliverables.penDriveCount}\n` : ''}
==================================================
FINANCIAL ESTIMATE
==================================================
• Package Base Subtotal: ₹${baseSubtotal.toLocaleString('en-IN')}
${appliedCoupon ? `• Coupon Discount (${appliedCoupon.code} - ${couponDiscountPercentage}%): -₹${couponDiscountAmount.toLocaleString('en-IN')}\n• Subtotal After Discount: ₹${discountedSubtotal.toLocaleString('en-IN')}\n` : ''}• GST (18% Tax): ₹${taxAmount.toLocaleString('en-IN')}
• Net Grand Total: ₹${grandTotalWithTax.toLocaleString('en-IN')}

PAYMENT SCHEDULE (MILESTONES):
• 1. Advance Booking (25%): ₹${advanceAmount.toLocaleString('en-IN')}
• 2. On Shoot Completion (50%): ₹${shootCompleteAmount.toLocaleString('en-IN')}
• 3. Final Handover (25%): ₹${finalDeliveryAmount.toLocaleString('en-IN')}

I have downloaded the official PDF quotation document. Kindly verify the crew availability for my event date and revert with confirmation.

Thank you,
${lead.name}
Phone: ${lead.phone}
Email: ${lead.email || 'N/A'}`;

  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // High-definition Vector-Grade PDF Generator with Precision Margins & Smart Anti-Cut Pagination
  const handleDownloadPdf = async () => {
    const docElement = document.getElementById('printable-quotation-doc');
    if (!docElement) {
      window.print();
      return;
    }

    setIsDownloading(true);
    try {
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      // Capture rendered DOM as ultra HD image
      const imgData = await toPng(docElement, {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        style: {
          margin: '0',
          boxShadow: 'none',
          border: 'none',
          borderRadius: '0',
        },
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Standard printing margins on all sides (consistent with professional proposals)
      const marginX = 12; // 12mm left & right margins
      const marginTop = 12; // 12mm top margin on page 1
      const marginBottom = 14; // 14mm bottom margin
      const printableWidth = pdfWidth - marginX * 2; // 186mm
      const headerHeight = 9; // 9mm for running header on page 2+
      const printableHeightPage1 = pdfHeight - marginTop - marginBottom; // 271mm
      const contentTopPage2 = marginTop + headerHeight; // 21mm
      const printableHeightPage2 = pdfHeight - contentTopPage2 - marginBottom; // 262mm

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
      });

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const totalRenderHeight = (imgHeight * printableWidth) / imgWidth;

      // Draw original image onto full-size canvas for pixel inspection & slicing
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = imgWidth;
      sourceCanvas.height = imgHeight;
      const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
      if (!sourceCtx) throw new Error('Could not get canvas context');
      sourceCtx.drawImage(img, 0, 0);

      // Helper function: Scan for a horizontal row of pixels that is completely white / free of dark text & borders
      const findCleanCutY = (idealY: number, minY: number): number => {
        const scanStart = Math.min(Math.round(idealY), imgHeight - 1);
        const scanEnd = Math.max(Math.round(minY), 0);
        let bestY = scanStart;
        let minDarkPixels = Infinity;

        // Scan backwards from ideal cut position upwards
        for (let y = scanStart; y >= scanEnd; y -= 2) {
          const rowData = sourceCtx.getImageData(0, y, imgWidth, 1).data;
          let darkCount = 0;
          // Sample every 4th pixel for speed
          for (let x = 0; x < imgWidth; x += 4) {
            const idx = x * 4;
            const r = rowData[idx];
            const g = rowData[idx + 1];
            const b = rowData[idx + 2];
            const a = rowData[idx + 3];
            // If pixel is not white / light background (i.e. has text, icons or borders)
            if (a > 180 && (r < 240 || g < 240 || b < 240)) {
              darkCount++;
            }
          }
          if (darkCount === 0) {
            // Found a 100% clean white space row!
            return y;
          }
          if (darkCount < minDarkPixels) {
            minDarkPixels = darkCount;
            bestY = y;
          }
        }
        return bestY;
      };

      // Case 1: Fits directly on a single page at 100% scale
      if (totalRenderHeight <= printableHeightPage1) {
        pdf.addImage(imgData, 'PNG', marginX, marginTop, printableWidth, totalRenderHeight, undefined, 'FAST');
        // Running footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 140, 130);
        pdf.setDrawColor(220, 215, 210);
        pdf.setLineWidth(0.2);
        pdf.line(marginX, pdfHeight - marginBottom + 2, pdfWidth - marginX, pdfHeight - marginBottom + 2);
        pdf.text(`Page 1 of 1 • Tel: ${displayPhone}`, marginX, pdfHeight - marginBottom + 7);
        pdf.text(`Official Proposal • Valid for 30 Days`, pdfWidth - marginX, pdfHeight - marginBottom + 7, { align: 'right' });
      }
      // Case 2: Just slightly overflows (within 15%) - auto-fit cleanly to 1 page so it never awkwardly spills 2 lines to page 2!
      else if (totalRenderHeight <= printableHeightPage1 * 1.15) {
        const fitScale = printableHeightPage1 / totalRenderHeight;
        const scaledWidth = printableWidth * fitScale;
        const scaledHeight = totalRenderHeight * fitScale;
        const offsetX = marginX + (printableWidth - scaledWidth) / 2;
        pdf.addImage(imgData, 'PNG', offsetX, marginTop, scaledWidth, scaledHeight, undefined, 'FAST');
        // Running footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 140, 130);
        pdf.setDrawColor(220, 215, 210);
        pdf.setLineWidth(0.2);
        pdf.line(marginX, pdfHeight - marginBottom + 2, pdfWidth - marginX, pdfHeight - marginBottom + 2);
        pdf.text(`Page 1 of 1 • Tel: ${displayPhone}`, marginX, pdfHeight - marginBottom + 7);
        pdf.text(`Official Proposal • Valid for 30 Days`, pdfWidth - marginX, pdfHeight - marginBottom + 7, { align: 'right' });
      }
      // Case 3: Genuine multi-page proposal - smart anti-cut boundary detection & slice calculation
      else {
        // Collect all atomic cards/sections from the DOM that must never be sliced in half
        const docRect = docElement.getBoundingClientRect();
        const scaleY = imgHeight / docElement.offsetHeight;

        const avoidNodes = Array.from(
          docElement.querySelectorAll<HTMLElement>(
            '.pdf-section, .break-inside-avoid, [data-pdf-block], .pdf-ceremony-item, .pdf-service-item, #printable-quotation-doc > div'
          )
        );

        const avoidRanges = avoidNodes
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              top: (r.top - docRect.top) * scaleY,
              bottom: (r.bottom - docRect.top) * scaleY,
              height: r.height * scaleY,
            };
          })
          .filter((rg) => rg.height > 10)
          .sort((a, b) => a.top - b.top);

        // Pre-compute slices so that no element is cut and total page count is exact
        const slices: { startY: number; endY: number; isFirstPage: boolean }[] = [];
        let currentY = 0;

        while (currentY < imgHeight - 15) {
          const isFirst = slices.length === 0;
          const availHeightMm = isFirst ? printableHeightPage1 : printableHeightPage2;
          const maxCanvasPageHeight = (imgWidth * availHeightMm) / printableWidth;
          const remainingHeight = imgHeight - currentY;

          if (remainingHeight <= maxCanvasPageHeight) {
            slices.push({ startY: currentY, endY: imgHeight, isFirstPage: isFirst });
            break;
          }

          const targetCutY = currentY + maxCanvasPageHeight;
          let idealCutY = targetCutY;

          // Check if any element straddles targetCutY (starts before targetCutY and ends after targetCutY)
          for (const range of avoidRanges) {
            if (range.top < targetCutY - 10 && range.bottom > targetCutY + 10) {
              // Only move cut point upwards if it leaves a reasonable amount on current page (>30%)
              if (range.top > currentY + maxCanvasPageHeight * 0.3) {
                idealCutY = Math.min(idealCutY, range.top);
              }
            }
          }

          // Scan for a 100% clean white space row at or above idealCutY
          const cleanCutY = findCleanCutY(
            idealCutY,
            currentY + maxCanvasPageHeight * 0.3
          );

          // Safety check: ensure forward progress
          const finalCutY = cleanCutY > currentY + 50 ? cleanCutY : targetCutY;

          slices.push({ startY: currentY, endY: finalCutY, isFirstPage: isFirst });
          currentY = finalCutY;
        }

        const totalPages = slices.length;
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = imgWidth;
        const sliceCtx = sliceCanvas.getContext('2d');

        for (let i = 0; i < slices.length; i++) {
          const slice = slices[i];
          const pageNum = i + 1;
          const sliceHeight = slice.endY - slice.startY;

          if (pageNum > 1) {
            pdf.addPage();
          }

          if (sliceCtx && sliceHeight > 0) {
            sliceCanvas.height = sliceHeight;
            sliceCtx.clearRect(0, 0, imgWidth, sliceHeight);
            sliceCtx.drawImage(
              img,
              0,
              slice.startY,
              imgWidth,
              sliceHeight,
              0,
              0,
              imgWidth,
              sliceHeight
            );

            const sliceData = sliceCanvas.toDataURL('image/png');
            const sliceRenderHeight = (sliceHeight * printableWidth) / imgWidth;
            const contentTop = slice.isFirstPage ? marginTop : contentTopPage2;

            // Running header on page 2+
            if (pageNum > 1) {
              pdf.setFontSize(8);
              pdf.setTextColor(120, 113, 108);
              pdf.text(`${displayBrandName} • Official Proposal (${quoteNo})`, marginX, marginTop + 3);
              pdf.setDrawColor(220, 215, 210);
              pdf.setLineWidth(0.2);
              pdf.line(marginX, marginTop + 5.5, pdfWidth - marginX, marginTop + 5.5);
            }

            // Clean, uncut content slice placed strictly within page margins
            pdf.addImage(sliceData, 'PNG', marginX, contentTop, printableWidth, sliceRenderHeight, undefined, 'FAST');

            // Running footer with page numbers and margin
            pdf.setFontSize(8);
            pdf.setTextColor(150, 140, 130);
            pdf.setDrawColor(220, 215, 210);
            pdf.setLineWidth(0.2);
            pdf.line(marginX, pdfHeight - marginBottom + 2, pdfWidth - marginX, pdfHeight - marginBottom + 2);
            pdf.text(`Page ${pageNum} of ${totalPages} • Tel: ${displayPhone}`, marginX, pdfHeight - marginBottom + 7);
            pdf.text(`Official Proposal • Valid for 30 Days`, pdfWidth - marginX, pdfHeight - marginBottom + 7, { align: 'right' });
          }
        }
      }

      const safeBrand = (studioUser?.studioName || 'Framelu').replace(/[^a-zA-Z0-9-_]/g, '_');
      const safeQuote = quoteNo.replace(/[^a-zA-Z0-9-_]/g, '_');
      const safeName = (lead.name || 'Customer').replace(/[^a-zA-Z0-9-_]/g, '_');
      pdf.save(`${safeBrand}_Quotation_${safeQuote}_${safeName}.pdf`);

      setIsDownloading(false);
      setShowPostDownloadModal(true);
    } catch (primaryErr) {
      console.warn('html-to-image export error, trying fallback:', primaryErr);
      try {
        // Fallback to html2canvas if html-to-image is unsupported
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');
        const canvas = await html2canvas(docElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const marginX = 12;
        const marginTop = 12;
        const marginBottom = 14;
        const printableWidth = pdfWidth - marginX * 2;
        const printableHeight = pdfHeight - marginTop - marginBottom;
        const canvasRatio = canvas.height / canvas.width;
        let renderWidth = printableWidth;
        let renderHeight = printableWidth * canvasRatio;
        if (renderHeight > printableHeight) {
          renderHeight = printableHeight;
          renderWidth = printableHeight / canvasRatio;
        }
        const xOffset = marginX + Math.max(0, (printableWidth - renderWidth) / 2);
        const yOffset = marginTop;
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
        const safeBrand = (studioUser?.studioName || 'Framelu').replace(/[^a-zA-Z0-9-_]/g, '_');
        const safeQuote = quoteNo.replace(/[^a-zA-Z0-9-_]/g, '_');
        const safeName = (lead.name || 'Customer').replace(/[^a-zA-Z0-9-_]/g, '_');
        pdf.save(`${safeBrand}_Quotation_${safeQuote}_${safeName}.pdf`);
        setIsDownloading(false);
        setShowPostDownloadModal(true);
      } catch (err) {
        console.error('All direct PDF exports failed, falling back to window.print:', err);
        setIsDownloading(false);
        window.print();
      }
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div
      id="quotation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="quotation-modal-card"
        className="bg-stone-100 rounded-3xl max-w-4xl w-full shadow-2xl relative border border-stone-300 my-4 flex flex-col max-h-[94vh] overflow-hidden"
      >
        {/* Floating Top Header Toolbar (Hidden in Print) */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-2.5 p-3.5 sm:px-6 bg-stone-900 text-white border-b border-stone-800 print:hidden z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold transition"
              title="Back to Customizer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← {isMl ? 'ബാക്ക് & എഡിറ്റ് ചെയ്യുക' : 'Back & Edit Package'}</span>
            </button>
            <span className="hidden md:inline-block text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Official Quotation Preview
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition shadow-sm"
              title="Download high-resolution official PDF"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isMl ? 'ഡൗൺലോഡ് ചെയ്യുന്നു...' : 'Generating HD PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isMl ? 'ഡൗൺലോഡ് PDF' : 'Download PDF'}</span>
                </>
              )}
            </button>

            {/* WhatsApp Enquiry Button */}
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
              title="Send enquiry with quotation via WhatsApp"
            >
              <Share2 className="w-4 h-4" />
              <span>{isMl ? 'WhatsApp വഴി അയക്കുക' : 'WhatsApp Share'}</span>
            </button>

            {/* Email Enquiry Button */}
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition shadow-sm"
              title="Send quotation enquiry via email"
            >
              <Mail className="w-4 h-4" />
              <span>{isMl ? 'ഇമെയിൽ അയക്കുക' : 'Email to Studio'}</span>
            </button>

            {/* Print Fallback Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold py-2 px-2.5 rounded-xl text-xs transition border border-stone-700"
              title="Print via browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isMl ? 'പ്രിന്റ്' : 'Print'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div
          id="quotation-modal-scroll"
          className="flex-1 overflow-y-auto p-3 sm:p-6 bg-stone-200/60 text-stone-900 print:bg-white print:overflow-visible print:p-0"
        >
          <div id="printable-quotation" className="max-w-3xl mx-auto space-y-6">
            {/* ========================================================= */}
            {/* UNIFIED MASTER PROPOSAL DOCUMENT (PRECISION ALIGNMENT)   */}
            {/* ========================================================= */}
            <div
              id="printable-quotation-doc"
              className="pdf-page bg-white max-w-[800px] w-full mx-auto p-5 sm:p-7 rounded-2xl border border-stone-300 shadow-md text-stone-900 space-y-3 relative print:border-none print:shadow-none print:p-0 print:m-0"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              }}
            >
              {/* 1. Official Header & Letterhead */}
              <div className="pdf-section break-inside-avoid flex flex-col sm:flex-row justify-between items-start gap-4 pb-3.5 border-b-2 border-stone-900">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-700 text-white flex items-center justify-center font-black shadow-md shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 leading-tight uppercase">
                        {displayBrandName}
                      </h1>
                      <p className="text-[11px] font-semibold text-stone-600 whitespace-nowrap">
                        {displaySubheader}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 mt-2 leading-relaxed">
                    {displayLocation} • Phone: <span className="font-semibold text-stone-700">{displayPhone}</span> • Email: <span className="font-semibold text-stone-700">{displayEmail}</span>
                  </p>
                </div>

                {/* Proposal Reference Box */}
                <div className="w-full sm:w-56 shrink-0 bg-stone-50 border border-stone-200/90 rounded-xl p-2.5 sm:text-right shadow-2xs">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100/70 border border-amber-300/60 text-[9px] font-black text-amber-900 uppercase tracking-wider mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {isMl ? 'ഔദ്യോഗിക കൊട്ടേഷൻ' : 'OFFICIAL ESTIMATE PROPOSAL'}
                  </div>
                  <p className="text-sm font-black text-stone-900 font-sans tracking-normal mt-0.5">{quoteNo}</p>
                  <p className="text-[10px] text-stone-600 mt-0.5">
                    Date: <span className="font-semibold text-stone-900">{quoteDate}</span>
                  </p>
                  <p className="text-[9px] text-stone-400 mt-0.5">Validity: 30 Days from Issue</p>
                </div>
              </div>

              {/* 2. Client Profile & Wedding Event Scope (Balanced Key-Value Grid) */}
              <div className="pdf-section break-inside-avoid grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#faf9f6] rounded-xl p-3 border border-stone-200 text-xs">
                {/* Left: Client Profile */}
                <div className="sm:border-r border-stone-200 sm:pr-3 space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                    {isMl ? 'ഉപഭോക്താവിന്റെ വിവരങ്ങൾ' : 'CLIENT PROFILE'}
                  </span>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-14 text-stone-400 font-semibold text-[10px] uppercase">Name:</span>
                      <span className="font-bold text-stone-900 text-xs">{lead.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-14 text-stone-400 font-semibold text-[10px] uppercase">Phone:</span>
                      <span className="font-semibold text-stone-800">{lead.phone}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center">
                        <span className="w-14 text-stone-400 font-semibold text-[10px] uppercase">Email:</span>
                        <span className="text-stone-700">{lead.email}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="w-14 text-stone-400 font-semibold text-[10px] uppercase">Place:</span>
                      <span className="text-stone-700">{lead.address || lead.place || 'Kerala'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Event Scope / Photoshoot Scope */}
                <div className="sm:pl-1 space-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block mb-1">
                    {isMl ? (isStandalone ? 'ഫോട്ടോഷൂട്ട് വിവരങ്ങൾ' : 'കവറേജ് വിവരങ്ങൾ') : (isStandalone ? 'PHOTOSHOOT SCOPE' : 'WEDDING EVENT SCOPE')}
                  </span>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex items-center">
                      <span className="w-24 text-stone-400 font-semibold text-[10px] uppercase">
                        {isStandalone ? 'Shoot Date:' : 'Event Date:'}
                      </span>
                      <span className="font-bold text-stone-900 text-xs">
                        {shootDetails?.date || lead.weddingDate || 'To Be Confirmed'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-stone-400 font-semibold text-[10px] uppercase">
                        {isStandalone ? 'Shoot Venue:' : 'Primary Venue:'}
                      </span>
                      <span className="font-semibold text-stone-800">
                        {shootDetails?.venueLocation || lead.venueLocation || lead.place || 'Local Venue'}
                      </span>
                    </div>
                    <div className="flex items-center pt-0.5">
                      <span className="w-24 text-stone-400 font-semibold text-[10px] uppercase">
                        {isStandalone ? 'Package:' : 'Scope Type:'}
                      </span>
                      <span className="font-extrabold text-amber-900 text-[10px] bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300">
                        {isStandalone ? (shootDetails?.title || 'Photoshoot Package') : getSideName(side)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {isStandalone ? (
                /* STANDALONE PHOTOSHOOT PROPOSAL */
                <div className="pdf-section break-inside-avoid space-y-3">
                  {/* 1. Photoshoot Hero / Overview Banner Card */}
                  <div className="border border-amber-200 bg-gradient-to-r from-amber-50/70 via-stone-50 to-amber-50/40 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
                    {shootDetails?.imageUrl && (
                      <img
                        src={shootDetails.imageUrl}
                        alt={shootDetails.title || 'Photoshoot'}
                        className="w-full sm:w-28 h-24 object-cover rounded-lg border border-stone-200 shrink-0 shadow-xs"
                      />
                    )}
                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white shadow-2xs">
                          {shootDetails?.tag || 'Exclusive Photoshoot'}
                        </span>
                        <span className="text-[11px] font-bold text-stone-500">
                          {shootDetails?.hours ? `${shootDetails.hours} Hours Coverage` : 'Standard Coverage'}
                        </span>
                        <span className="text-[11px] font-bold text-stone-500">
                          • {shootDetails?.locationType || 'Single Location'}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-stone-900">
                        {shootDetails?.title || 'Standalone Photography & Videography Package'}
                      </h3>
                      {shootDetails?.description && (
                        <p className="text-xs text-stone-600 line-clamp-2">
                          {shootDetails.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Photography & Videography Crew Coverage */}
                  <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-amber-600 text-white px-3.5 py-1.5 flex items-center justify-between font-extrabold text-xs">
                      <div className="flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{isMl ? '1. ക്രൂ കവറേജ് & ഉപകരണങ്ങൾ' : '1. Photography Crew & Technical Coverage'}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                        On-Location Production
                      </span>
                    </div>

                    <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 text-xs">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                          Photography Crew
                        </span>
                        <p className="text-[11px] text-stone-700 font-semibold">
                          • {shootDetails?.crew?.photographers || 1} Professional Photographer(s)
                        </p>
                        <p className="text-[10px] text-stone-500">
                          Full frame high-resolution digital cameras & prime prime lenses
                        </p>
                      </div>

                      <div className="pt-2 sm:pt-0 sm:pl-3 space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                          Videography & Reels
                        </span>
                        <p className="text-[11px] text-stone-700 font-semibold">
                          • {(shootDetails?.crew?.videographers || 0) > 0 ? `${shootDetails?.crew?.videographers} Cinematic Videographer(s)` : 'No Videographer (Photo Only)'}
                        </p>
                        {(shootDetails?.crew?.reelsCount || shootDetails?.deliverables?.reelsCount || deliverables?.reelsCount || 0) > 0 && (
                          <p className="text-[11px] text-purple-900 font-bold">
                            • {shootDetails?.crew?.reelsCount || shootDetails?.deliverables?.reelsCount || deliverables?.reelsCount} Viral Instagram Reels
                          </p>
                        )}
                      </div>

                      <div className="pt-2 sm:pt-0 sm:pl-3 space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                          Special Equipment & Aerial
                        </span>
                        {shootDetails?.crew?.drone ? (
                          <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300">
                            4K Aerial Drone Included
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400">Ground Level Coverage</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3. Output Deliverables & Master Files */}
                  <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                    <div className="bg-stone-800 text-white px-3.5 py-1.5 flex items-center justify-between font-extrabold text-xs">
                      <div className="flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isMl ? '2. ഡെലിവറി ചെയ്യുന്നവ' : '2. Output Deliverables & Master Files'}</span>
                      </div>
                      <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                        Final Delivery
                      </span>
                    </div>

                    <div className="p-3 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 text-xs">
                      {/* Col 1: Photos & Color Grading */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                          Photos & Color Grading
                        </span>
                        <div className="space-y-1 text-[11px] text-stone-700">
                          <div className="p-1.5 rounded-md bg-amber-50 border border-amber-200">
                            <span className="text-[10px] font-bold text-amber-900 uppercase block">Graded Photos</span>
                            <span className="text-sm font-black text-amber-950">
                              {shootDetails?.deliverables?.gradedPhotosCount || shootDetails?.gradedPhotosCount || deliverables?.gradedPhotosCount || 100} Photos
                            </span>
                            <p className="text-[9px] text-amber-800 leading-tight mt-0.5">
                              {isMl ? 'കളർ ഗ്രേഡ് ചെയ്ത് ഫിനിഷ് ചെയ്ത ഹൈ-റെസ് ചിത്രങ്ങൾ' : 'Master retouching & signature cinematic color grading'}
                            </p>
                          </div>
                          <p className="text-[10px] text-stone-500">• All original raw/unedited high-res photos delivered via Cloud Drive</p>
                        </div>
                      </div>

                      {/* Col 2: Video Production */}
                      <div className="pt-2 sm:pt-0 sm:pl-3 space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                          Video Deliverables
                        </span>
                        <div className="space-y-0.5 text-[11px] text-stone-700">
                          <p>• Resolution: <strong className="text-stone-900">{shootDetails?.deliverables?.videoQuality === '4k' || deliverables?.videoQuality === '4k' ? '4K Ultra HD' : 'Full HD 1080p'}</strong></p>
                          {(shootDetails?.deliverables?.teaserVideo ?? deliverables?.teaserVideo) && <p>• Cinematic Teaser / Highlight Promo</p>}
                          {(shootDetails?.deliverables?.fullLengthVideo ?? deliverables?.fullLengthVideo) && <p>• Full Length Event Video Film</p>}
                          {((shootDetails?.deliverables?.reelsCount || deliverables?.reelsCount || 0) > 0) && (
                            <p>• {shootDetails?.deliverables?.reelsCount || deliverables?.reelsCount} Cinematic Vertical Reels (9:16)</p>
                          )}
                          {!shootDetails?.deliverables?.teaserVideo && !shootDetails?.deliverables?.fullLengthVideo && !shootDetails?.crew?.videographers && (
                            <p className="text-stone-400 italic">Photography Only Package</p>
                          )}
                        </div>
                      </div>

                      {/* Col 3: Keepsakes & Album */}
                      <div className="pt-2 sm:pt-0 sm:pl-3 space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                          Keepsakes & Album
                        </span>
                        <div className="space-y-0.5 text-[11px] text-stone-700">
                          {(shootDetails?.deliverables?.mainAlbumsCount || deliverables?.mainAlbumsCount || 0) > 0 ? (
                            <>
                              <p>• Album: <strong className="text-stone-900">{shootDetails?.deliverables?.mainAlbumsCount || deliverables?.mainAlbumsCount} Book(s)</strong></p>
                              <p>• Pages: <strong className="text-stone-900">{shootDetails?.deliverables?.mainAlbumSheets || deliverables?.mainAlbumSheets || 30} Sheets</strong></p>
                              <p>• Cover: <strong className="capitalize text-stone-900">{getAlbumCoverTitle(shootDetails?.deliverables?.albumPaperType || deliverables?.albumPaperType || 'matte')}</strong></p>
                            </>
                          ) : (
                            <p className="text-stone-400">• Digital Master Files Delivery</p>
                          )}
                          {(shootDetails?.deliverables?.frames_8x12 || deliverables?.frames_8x12 || 0) > 0 && (
                            <p>• 8x12 Frame: {shootDetails?.deliverables?.frames_8x12 || deliverables?.frames_8x12} Nos</p>
                          )}
                          {(shootDetails?.deliverables?.frames_18x12 || deliverables?.frames_18x12 || 0) > 0 && (
                            <p>• 12x18 Frame: {shootDetails?.deliverables?.frames_18x12 || deliverables?.frames_18x12} Nos</p>
                          )}
                          {(shootDetails?.deliverables?.frames_15x20 || deliverables?.frames_15x20 || 0) > 0 && (
                            <p>• 15x20 Canvas Frame: {shootDetails?.deliverables?.frames_15x20 || deliverables?.frames_15x20} Nos</p>
                          )}
                          {(shootDetails?.deliverables?.penDriveCount || deliverables?.penDriveCount || 0) > 0 && (
                            <p>• USB 3.0 Pen Drive: {shootDetails?.deliverables?.penDriveCount || deliverables?.penDriveCount} Nos</p>
                          )}
                          {(shootDetails?.deliverables?.penDriveBoxCount || deliverables?.penDriveBoxCount || 0) > 0 && (
                            <p>• Wooden Keepsake Box: {shootDetails?.deliverables?.penDriveBoxCount || deliverables?.penDriveBoxCount} Nos</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Inclusions & Features */}
                  {shootDetails?.features && shootDetails.features.length > 0 && (
                    <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="bg-stone-100 px-3.5 py-1.5 flex items-center justify-between font-bold text-xs text-stone-800">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-amber-600" />
                          <span>{isMl ? 'പ്രത്യേകതകൾ & ആനുകൂല്യങ്ങൾ' : 'Package Inclusions & Key Highlights'}</span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-stone-700">
                        {shootDetails.features.map((feat: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Check className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* REGULAR WEDDING CEREMONIES & DELIVERABLES VIEW */
                <>
                  {/* 3. Ceremonies & Tabular Crew Allocation (Structured Table) */}
                  <div className="pdf-section break-inside-avoid space-y-2.5">
                    {/* GROOM SIDE SECTION */}
                    {(side === 'groom' || side === 'both') && groomEvents && (
                      <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                        <div className="bg-amber-600 text-white px-3.5 py-1.5 flex items-center justify-between font-extrabold text-xs">
                          <div className="flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5" />
                            <span>1. Groom Side Ceremonies & Crew Allocation</span>
                          </div>
                          <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                            {KERALA_EVENTS.filter((e) => groomEvents[e.id]?.enabled).length} Events
                          </span>
                        </div>

                        <div className="divide-y divide-stone-200 bg-white">
                          {KERALA_EVENTS.filter((e) => groomEvents[e.id]?.enabled).map((evt) => {
                            const cfg = groomEvents[evt.id];
                            return (
                              <div key={evt.id} className="pdf-ceremony-item p-2.5 text-xs">
                                <div className="flex justify-between items-center mb-1 pb-1 border-b border-stone-100">
                                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                                    {isMl ? evt.nameMl : evt.nameEn}
                                  </span>
                                  <span className="text-[11px] text-stone-500 font-medium">
                                    {cfg.date ? `Date: ${cfg.date}` : ''} {cfg.venue ? `• Venue: ${cfg.venue}` : ''}
                                  </span>
                                </div>

                                {/* 3 Tabular Aligned Columns */}
                                <div className="grid grid-cols-3 gap-2 text-[11px] bg-[#fbfaf8] p-2 rounded-lg border border-stone-200/80">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Photography Crew</span>
                                    <div className="text-stone-800">
                                      Traditional: <strong className="text-stone-900">{cfg.traditionalPhotographers || 0} {cfg.traditionalPhotographers > 1 ? `(${cfg.traditionalPhotographers} Cameras)` : ''}</strong>
                                    </div>
                                    {cfg.candidPhotographers > 0 && (
                                      <div className="text-rose-800">
                                        Candid: <strong className="text-rose-950 font-bold">{cfg.candidPhotographers} {cfg.candidPhotographers > 1 ? `(${cfg.candidPhotographers} Cameras)` : ''}</strong>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-0.5 border-l border-stone-200/80 pl-2.5">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Videography Crew</span>
                                    <div className="text-stone-800">
                                      Traditional: <strong className="text-stone-900">{cfg.traditionalVideographers || 0} {cfg.traditionalVideographers > 1 ? `(${cfg.traditionalVideographers} Cameras)` : ''}</strong>
                                    </div>
                                    {cfg.candidVideographers > 0 && (
                                      <div className="text-purple-800">
                                        Cinematic: <strong className="text-purple-950 font-bold">{cfg.candidVideographers} {cfg.candidVideographers > 1 ? `(${cfg.candidVideographers} Cameras)` : ''}</strong>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-0.5 border-l border-stone-200/80 pl-2.5">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Special Coverage</span>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {cfg.drone && <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">4K Drone</span>}
                                      {cfg.auditoriumLive && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-300">Hall LED Live</span>}
                                      {cfg.youtubeLive && <span className="text-[10px] font-bold bg-red-100 text-red-900 px-1.5 py-0.5 rounded border border-red-300">YouTube Live</span>}
                                      {cfg.photoLivePrinting && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">Live Print</span>}
                                      {!cfg.drone && !cfg.auditoriumLive && !cfg.youtubeLive && !cfg.photoLivePrinting && (
                                        <span className="text-stone-400 text-[10px]">Standard Coverage</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* BRIDE SIDE SECTION */}
                    {(side === 'bride' || side === 'both') && brideEvents && (
                      <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                        <div className="bg-rosewood-600 text-white px-3.5 py-1.5 flex items-center justify-between font-extrabold text-xs">
                          <div className="flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5" />
                            <span>2. Bride Side Ceremonies & Crew Allocation</span>
                          </div>
                          <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                            {KERALA_EVENTS.filter((e) => brideEvents[e.id]?.enabled).length} Events
                          </span>
                        </div>

                        <div className="divide-y divide-stone-200 bg-white">
                          {KERALA_EVENTS.filter((e) => brideEvents[e.id]?.enabled).map((evt) => {
                            const cfg = brideEvents[evt.id];
                            return (
                              <div key={evt.id} className="pdf-ceremony-item p-2.5 text-xs">
                                <div className="flex justify-between items-center mb-1 pb-1 border-b border-stone-100">
                                  <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rosewood-600 shrink-0"></span>
                                    {isMl ? evt.nameMl : evt.nameEn}
                                  </span>
                                  <span className="text-[11px] text-stone-500 font-medium">
                                    {cfg.date ? `Date: ${cfg.date}` : ''} {cfg.venue ? `• Venue: ${cfg.venue}` : ''}
                                  </span>
                                </div>

                                {/* 3 Tabular Aligned Columns */}
                                <div className="grid grid-cols-3 gap-2 text-[11px] bg-[#fbfaf8] p-2 rounded-lg border border-stone-200/80">
                                  <div className="space-y-0.5">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Photography Crew</span>
                                    <div className="text-stone-800">
                                      Traditional: <strong className="text-stone-900">{cfg.traditionalPhotographers || 0} {cfg.traditionalPhotographers > 1 ? `(${cfg.traditionalPhotographers} Cameras)` : ''}</strong>
                                    </div>
                                    {cfg.candidPhotographers > 0 && (
                                      <div className="text-rose-800">
                                        Candid: <strong className="text-rose-950 font-bold">{cfg.candidPhotographers} {cfg.candidPhotographers > 1 ? `(${cfg.candidPhotographers} Cameras)` : ''}</strong>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-0.5 border-l border-stone-200/80 pl-2.5">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Videography Crew</span>
                                    <div className="text-stone-800">
                                      Traditional: <strong className="text-stone-900">{cfg.traditionalVideographers || 0} {cfg.traditionalVideographers > 1 ? `(${cfg.traditionalVideographers} Cameras)` : ''}</strong>
                                    </div>
                                    {cfg.candidVideographers > 0 && (
                                      <div className="text-purple-800">
                                        Cinematic: <strong className="text-purple-950 font-bold">{cfg.candidVideographers} {cfg.candidVideographers > 1 ? `(${cfg.candidVideographers} Cameras)` : ''}</strong>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-0.5 border-l border-stone-200/80 pl-2.5">
                                    <span className="text-[9px] font-black text-stone-400 uppercase tracking-wider block">Special Coverage</span>
                                    <div className="flex flex-wrap gap-1 pt-0.5">
                                      {cfg.drone && <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">4K Drone</span>}
                                      {cfg.auditoriumLive && <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-1.5 py-0.5 rounded border border-indigo-300">Hall LED Live</span>}
                                      {cfg.youtubeLive && <span className="text-[10px] font-bold bg-red-100 text-red-900 px-1.5 py-0.5 rounded border border-red-300">YouTube Live</span>}
                                      {cfg.photoLivePrinting && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-300">Live Print</span>}
                                      {!cfg.drone && !cfg.auditoriumLive && !cfg.youtubeLive && !cfg.photoLivePrinting && (
                                        <span className="text-stone-400 text-[10px]">Standard Coverage</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Output Deliverables & Keepsakes (3 Aligned Columns) */}
                  {deliverables && (
                    <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="bg-stone-800 text-white px-3.5 py-1.5 flex items-center justify-between font-extrabold text-xs">
                        <div className="flex items-center gap-2">
                          <Film className="w-3.5 h-3.5 text-amber-400" />
                          <span>3. Output Deliverables & Production Keepsakes</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                          Master Quality
                        </span>
                      </div>

                      <div className="p-2.5 bg-white text-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
                        {/* Col 1: Video Deliverables */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                            Video Production
                          </span>
                          <div className="space-y-0.5 text-[11px] text-stone-700">
                            <p>• Resolution: <strong className="text-stone-900">{deliverables.videoQuality === '4k' ? '4K Ultra HD' : 'Full HD 1080p'}</strong></p>
                            {deliverables.fullLengthVideo && <p>• Full Length Traditional Video</p>}
                            {deliverables.highlightVideo && <p>• Cinematic Highlight (3-5 Mins)</p>}
                            {deliverables.teaserVideo && <p>• Cinematic Teaser Promo</p>}
                            {deliverables.reelsCount > 0 && <p>• {deliverables.reelsCount} Instagram Viral Reels</p>}
                          </div>
                        </div>

                        {/* Col 2: Photos & Albums */}
                        <div className="pt-2 sm:pt-0 sm:pl-3 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                            Photos & Albums
                          </span>
                          <div className="space-y-0.5 text-[11px] text-stone-700">
                            <p>• Color Graded Photos: <strong className="text-stone-900">{deliverables.gradedPhotosCount ?? 100} Photos</strong></p>
                            {deliverables.mainAlbumsCount > 0 ? (
                              <>
                                <p>• Main Albums: <strong className="text-stone-900">{deliverables.mainAlbumsCount} Nos</strong></p>
                                <p>• Sheets/Pages: <strong className="text-stone-900">{deliverables.mainAlbumSheets} Sheets</strong></p>
                                <p>• Album Cover: <strong className="capitalize text-stone-900">{getAlbumCoverTitle(deliverables.albumPaperType)}</strong></p>
                              </>
                            ) : (
                              <p className="text-stone-400">Digital Deliverables Only</p>
                            )}
                          </div>
                        </div>

                        {/* Col 3: Keepsakes & Frames */}
                        <div className="pt-2 sm:pt-0 sm:pl-3 space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                            Frames & Keepsakes
                          </span>
                          <div className="space-y-0.5 text-[11px] text-stone-700">
                            {deliverables.frames_8x12 > 0 && <p>• 8x12 Frame: {deliverables.frames_8x12} Nos</p>}
                            {deliverables.frames_18x12 > 0 && <p>• 18x12 Frame: {deliverables.frames_18x12} Nos</p>}
                            {deliverables.frames_15x20 > 0 && <p>• 15x20 Canvas: {deliverables.frames_15x20} Nos</p>}
                            {deliverables.penDriveCount > 0 && <p>• USB 3.0 Pen Drives: {deliverables.penDriveCount} Nos</p>}
                            {deliverables.penDriveBoxCount > 0 && <p>• Wooden Keepsake Boxes: {deliverables.penDriveBoxCount} Nos</p>}
                            {deliverables.miniAlbumsCount > 0 && <p>• Mini Albums: {deliverables.miniAlbumsCount} Nos</p>}
                            {customPrintItems?.map((it) => {
                              const count = deliverables.customPrintCounts?.[it.id] ?? (deliverables as any)[it.id] ?? 0;
                              if (!count || count <= 0) return null;
                              return (
                                <p key={it.id}>• {it.nameEn}: {count} {it.unitName || 'Nos'}</p>
                              );
                            })}
                            {!deliverables.frames_8x12 &&
                              !deliverables.frames_18x12 &&
                              !deliverables.frames_15x20 &&
                              !deliverables.penDriveCount &&
                              !deliverables.penDriveBoxCount &&
                              !deliverables.miniAlbumsCount &&
                              (!deliverables.customPrintCounts ||
                                Object.values(deliverables.customPrintCounts).every((v) => !v)) && (
                                <p className="text-stone-400">Standard Cloud Delivery</p>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Other Wedding Services (Food / Catering, Stage Decor, Makeup, Cars, etc.) */}
                  {selectedServices && selectedServices.length > 0 && (
                    <div className="pdf-section break-inside-avoid border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="bg-stone-800 text-white px-3.5 py-1.5 flex items-center justify-between font-extrabold text-xs">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>4. Other Wedding Services & Event Arrangements</span>
                        </div>
                        <span className="text-[10px] font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                          {selectedServices.length} Services Selected
                        </span>
                      </div>

                      <div className="p-2.5 bg-white text-xs divide-y divide-stone-100">
                        {selectedServices.map((svc, i) => (
                          <div key={i} className="pdf-service-item py-2 flex justify-between items-start text-[11px]">
                            <div>
                              <span className="font-bold text-stone-900 block">
                                {svc.title} ({svc.titleMl})
                              </span>
                              <div className="flex flex-wrap gap-2 text-[10px] text-stone-600 mt-0.5">
                                {svc.guestCount ? (
                                  <span className="font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Guest Count: {svc.guestCount} Persons
                                  </span>
                                ) : null}
                                {svc.cardCount ? (
                                  <span className="font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Total Cards: {svc.cardCount} Nos
                                  </span>
                                ) : null}
                                {svc.customSelections && svc.customSelections.length > 0 && (
                                  <span className="text-stone-500">
                                    Inclusions: {svc.customSelections.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-black text-stone-900 shrink-0 ml-3 tabular-nums">
                              ₹{svc.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 5. Commercial Summary & Divided Payment Milestones (2 Aligned Columns) */}
              <div data-pdf-block="atomic" className="pdf-section break-inside-avoid grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t-2 border-stone-900">

                {/* Left: Payment Milestones */}
                <div className="bg-[#faf9f6] p-2.5 rounded-xl border border-stone-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-900 font-extrabold text-xs uppercase tracking-wider">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isMl ? 'പേയ്മെന്റ് ഘട്ടങ്ങൾ' : 'Payment Schedule (Milestones)'}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900 block text-[11px]">1. Advance Booking (25%)</span>
                        <span className="text-[9px] text-stone-400">Upon confirmation to reserve dates</span>
                      </div>
                      <span className="font-extrabold text-xs text-stone-900 tabular-nums">
                        ₹{advanceAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900 block text-[11px]">2. On Shoot Completion (50%)</span>
                        <span className="text-[9px] text-stone-400">After all ceremonies conclude</span>
                      </div>
                      <span className="font-extrabold text-xs text-stone-900 tabular-nums">
                        ₹{shootCompleteAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      <div>
                        <span className="font-bold text-stone-900 block text-[11px]">3. Final Handover (25%)</span>
                        <span className="text-[9px] text-stone-400">Upon handover of albums & master films</span>
                      </div>
                      <span className="font-extrabold text-xs text-stone-900 tabular-nums">
                        ₹{finalDeliveryAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Commercial Summary */}
                <div className="flex flex-col justify-between space-y-1.5">
                  <div className="bg-[#faf9f6] p-2.5 rounded-xl border border-stone-200 space-y-1 text-xs">
                    <div className="flex justify-between text-stone-600 text-[11px]">
                      <span>Package Base Subtotal:</span>
                      <span className="font-bold text-stone-900 tabular-nums">₹{baseSubtotal.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                        <span>Coupon Discount ({appliedCoupon.code} - {appliedCoupon.discountPercentage}%):</span>
                        <span className="font-bold tabular-nums">-₹{couponDiscountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {appliedCoupon && couponDiscountAmount > 0 && (
                      <div className="flex justify-between text-stone-600 text-[11px]">
                        <span>Subtotal After Discount:</span>
                        <span className="font-bold text-stone-900 tabular-nums">₹{discountedSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-600 text-[11px]">
                      <span>Goods & Services Tax (GST 18%):</span>
                      <span className="font-bold text-stone-900 tabular-nums">₹{taxAmount.toLocaleString('en-IN')}</span>
                    </div>

                    {/* Net Grand Total Banner */}
                    <div className="pt-1.5 border-t-2 border-stone-900 flex justify-between items-baseline font-black">
                      <span className="text-xs font-black text-stone-900">Grand Total (Incl. Tax):</span>
                      <span className="text-lg sm:text-xl text-amber-700 tabular-nums font-extrabold">
                        ₹{grandTotalWithTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Studio Contact info */}
                  <div className="p-2 bg-amber-50/80 border border-amber-200/90 rounded-lg text-[10px] text-amber-950 flex justify-between items-center">
                    <span className="font-bold">{displayBrandName}:</span>
                    <span>Tel: {displayPhone} • WhatsApp: +{studioContact.whatsapp}</span>
                  </div>
                </div>
              </div>

              {/* 6. Terms & Conditions and Formal Signatures */}
              <div data-pdf-block="atomic" className="pdf-section break-inside-avoid pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Terms */}
                <div className="text-[9px] text-stone-500 space-y-0.5">
                  <p className="font-bold text-stone-700 uppercase tracking-wider text-[9px]">Terms & Conditions:</p>
                  <p>1. Dates strictly reserved upon receipt of the 25% booking advance.</p>
                  <p>2. Final album layout proof shared digitally for approval before print.</p>
                  <p>3. Travel/stay outside studio radius reimbursed as per actuals.</p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 text-center text-xs text-stone-500 pt-1">
                  <div>
                    <p className="font-bold text-stone-800 text-[10px]">Customer Acceptance</p>
                    <div className="mt-4 border-b border-stone-300 w-3/4 mx-auto"></div>
                    <p className="mt-1 text-[9px] font-medium text-stone-600">({lead.name})</p>
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 text-[10px] uppercase truncate px-1">{displayBrandName}</p>
                    <div className="mt-4 border-b border-stone-300 w-3/4 mx-auto"></div>
                    <p className="mt-1 text-[9px] font-bold text-amber-800">{displaySignatory}</p>
                  </div>
                </div>
              </div>

              {/* Document Footer */}
              <div data-pdf-block="atomic" className="pdf-section break-inside-avoid pt-2 mt-auto border-t border-stone-200 flex justify-between items-center text-[9px] text-stone-400 font-semibold tracking-wider uppercase">
                <span className="truncate max-w-[60%]">{displayBrandName} • OFFICIAL ESTIMATE PROPOSAL</span>
                <span>ALL-INCLUSIVE PROPOSAL • {quoteNo}</span>
              </div>
            </div>

            {/* Interactive Enquiry CTA Banner (Hidden in Print) */}
            <div className="pt-6 border-t-2 border-amber-500/20 bg-amber-50/70 p-4 sm:p-5 rounded-2xl border border-amber-200 text-center space-y-3 print:hidden shadow-xs">
              <div className="flex items-center justify-center gap-2 text-amber-950 font-black text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{isMl ? 'ഈ കൊട്ടേഷൻ കമ്പനിയിലേക്ക് അയച്ച് തീയതി ബുക്കിംഗ് ഉറപ്പാക്കാം' : 'Enquire directly with Framelu Wedding Company'}</span>
              </div>
              <p className="text-xs text-stone-600 max-w-xl mx-auto leading-relaxed">
                {isMl
                  ? 'ഡൗൺലോഡ് ചെയ്ത പിഡിഎഫ് കൊട്ടേഷൻ വാട്സാപ്പിലോ ഇമെയിലിലോ കമ്പനിക്ക് അയച്ച് തീയതി ലഭ്യതയും ക്രൂ അലോക്കേഷനും ഉറപ്പുവരുത്തുക.'
                  : 'Download your official PDF or immediately enquire with the company via WhatsApp or Email to confirm date & crew availability.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{isMl ? 'PDF ഡൗൺലോഡ് ചെയ്യുക' : 'Download Quotation PDF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(true)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isMl ? 'WhatsApp വഴി അയക്കുക' : 'Send via WhatsApp'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEmailModal(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isMl ? 'ഇമെയിൽ എൻക്വയറി' : 'Email Enquiry to Company'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Post-Download Prompt Modal */}
      {showPostDownloadModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center relative">
            <button
              onClick={() => setShowPostDownloadModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-stone-900">
              {isMl ? 'PDF വിജയകരമായി ഡൗൺലോഡ് ചെയ്തു!' : 'Quotation PDF Downloaded!'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 leading-relaxed">
              {isMl
                ? 'നിങ്ങളുടെ കൊട്ടേഷൻ PDF ഡിവൈസിൽ സേവ് ആയിട്ടുണ്ട്. ഈ കൊട്ടേഷൻ കമ്പനിയിലേക്ക് അയച്ച് തീയതി ലഭ്യതയും ക്രൂവും ഉടൻ ഉറപ്പാക്കുക.'
                : 'Your quotation PDF has been downloaded. You can now send this quotation to Framelu Event Planner via WhatsApp or Email to confirm crew availability.'}
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowPostDownloadModal(false);
                  setShowWhatsAppModal(true);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{isMl ? 'WhatsApp വഴി അയക്കുക' : 'Send via WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPostDownloadModal(false);
                  setShowEmailModal(true);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>{isMl ? 'ഇമെയിൽ വഴി കമ്പനിക്ക് അയക്കുക' : 'Send via Email to Studio'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPostDownloadModal(false)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-xs transition"
              >
                {isMl ? 'ശരി, പൂർത്തിയായി' : 'Done / Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Enquiry Dialog Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-fade-in print:hidden">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] flex flex-col overflow-hidden text-left">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900">
                    {isMl ? 'ഇമെയിൽ എൻക്വയറി അയക്കുക' : 'Email Quotation Enquiry'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {isMl ? 'കമ്പനിയിലേക്ക് ഔദ്യോഗികമായി ഇമെയിൽ അയക്കാം' : 'Send quote details to company email'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowEmailModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 text-xs text-stone-700 pr-1">
              {/* Recipient Email Input */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isMl ? 'സ്വീകർത്താവിന്റെ ഇമെയിൽ വിലാസം (Recipient Email):' : 'Recipient Email Address:'}
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="company@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm font-semibold text-stone-900 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  {isMl ? 'സ്റ്റുഡിയോ ഇമെയിലിലേക്ക് നേരിട്ട് അയക്കാം അല്ലെങ്കിൽ മറ്റൊരു ഇമെയിലിലേക്ക് മാറ്റാം.' : 'Studio email is set by default. You can change this to any email.'}
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {isMl ? 'ഇമെയിൽ വിഷയം (Subject):' : 'Email Subject:'}
                </label>
                <input
                  type="text"
                  readOnly
                  value={emailSubject}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-stone-100 cursor-not-allowed"
                />
              </div>

              {/* Email Content Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-800">
                    {isMl ? 'ഇമെയിൽ ഉള്ളടക്കം (Preview Message):' : 'Enquiry Email Message Body:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{isMl ? 'കോപ്പി ചെയ്തു!' : 'Copied!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isMl ? 'ടെക്സ്റ്റ് കോപ്പി ചെയ്യുക' : 'Copy Text'}</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={emailBody}
                  className="w-full p-3 rounded-xl border border-stone-200 text-[11px] font-mono text-stone-800 bg-stone-50 leading-relaxed resize-none focus:outline-none"
                />
              </div>

              {/* Tip regarding attaching PDF */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    {isMl ? 'ഡൗൺലോഡ് ചെയ്ത PDF ഫയൽ അറ്റാച്ച് ചെയ്യുക:' : 'Attach Downloaded PDF Quotation:'}
                  </span>
                  <span>
                    {isMl
                      ? 'നിങ്ങൾ ഇപ്പോൾ ഡൗൺലോഡ് ചെയ്ത official PDF ഫയൽ നിങ്ങളുടെ മെയിൽ ആപ്പിൽ അറ്റാച്ച് ചെയ്ത് കമ്പനിക്ക് അയക്കുക.'
                      : 'Please attach the quotation PDF file you just downloaded to your email message.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 shrink-0 flex flex-col sm:flex-row items-center gap-2.5">
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{isMl ? 'മെയിൽ ആപ്പിൽ തുറക്കുക (Gmail / Mail)' : 'Open in Email Client'}</span>
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? (isMl ? 'കോപ്പി ചെയ്തു!' : 'Copied!') : (isMl ? 'വിവരങ്ങൾ കോപ്പി ചെയ്യുക' : 'Copy All Text')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal (Requirement 4) */}
      <WhatsAppShareModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        lead={lead}
        calculation={calculation}
        userRole={studioUser ? 'studio' : 'customer'}
        studioContact={studioContact}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloading}
        language={language}
      />
    </div>
  );
};

