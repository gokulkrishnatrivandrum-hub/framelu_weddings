import { CustomerLead, StudioContactConfig } from '@/types';
import { CalculationResult } from '@/utils/calculator';
import { KERALA_EVENTS } from '@/constants/defaults';

export interface GeneratedPdfResult {
  blob: Blob;
  file: File;
  fileName: string;
  dataUrl?: string;
}

/**
 * Generate a high-quality PDF Blob and File for a Customer Quotation.
 * If the quotation DOM node (#printable-quotation-doc) is rendered, captures high-res images.
 * Otherwise, synthesizes an official vector-grade A4 PDF proposal directly using jsPDF.
 */
export async function generateQuotationPdfBlob(
  lead: CustomerLead,
  studioContact: StudioContactConfig,
  calculation?: CalculationResult
): Promise<GeneratedPdfResult> {
  const { jsPDF } = await import('jspdf');

  const brandName = lead.studioBranding?.studioName || 'FRAMELU WEDDINGS & EVENTS';
  const quoteNo = lead.id || `LFB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const safeBrand = brandName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeQuote = quoteNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeName = (lead.name || 'Customer').replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileName = `${safeBrand}_Quotation_${safeQuote}_${safeName}.pdf`;

  const totalAmount = lead.grandTotal || lead.totalPrice || calculation?.totalPrice || 0;
  const baseSubtotal = lead.totalPrice || Math.round(totalAmount / 1.18);
  const taxAmount = lead.taxAmount || Math.round(totalAmount - baseSubtotal);
  const advance = Math.round(totalAmount * 0.25);
  const onShoot = Math.round(totalAmount * 0.5);
  const delivery = totalAmount - advance - onShoot;

  // 1. Try DOM capture if printable document is mounted
  const docElement = typeof document !== 'undefined' ? document.getElementById('printable-quotation-doc') : null;
  if (docElement && docElement.offsetHeight > 100) {
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const { toPng } = await import('html-to-image');
      const imgData = await toPng(docElement, {
        pixelRatio: 2.2,
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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const marginX = 10;
      const marginY = 10;
      const printWidth = pdfWidth - marginX * 2;

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
      });

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      const totalMmHeight = (imgHeight * printWidth) / imgWidth;
      const availMmPage = pdfHeight - marginY * 2;

      let remainingMm = totalMmHeight;
      let startY = 0;
      let page = 1;

      while (remainingMm > 0) {
        if (page > 1) pdf.addPage();
        const renderHeight = Math.min(remainingMm, availMmPage);

        // Canvas slice
        const canvas = document.createElement('canvas');
        canvas.width = imgWidth;
        canvas.height = (renderHeight * imgWidth) / printWidth;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            img,
            0,
            (startY * imgWidth) / printWidth,
            imgWidth,
            canvas.height,
            0,
            0,
            imgWidth,
            canvas.height
          );
          const sliceData = canvas.toDataURL('image/png');
          pdf.addImage(sliceData, 'PNG', marginX, marginY, printWidth, renderHeight, undefined, 'FAST');
        }

        // Running page footer
        pdf.setFontSize(8);
        pdf.setTextColor(150, 140, 130);
        pdf.text(
          `${brandName} • Official Quotation (${quoteNo}) • Valid for 30 Days`,
          marginX,
          pdfHeight - 4
        );
        pdf.text(
          `Page ${page}`,
          pdfWidth - marginX,
          pdfHeight - 4,
          { align: 'right' }
        );

        remainingMm -= availMmPage;
        startY += availMmPage;
        page++;
      }

      const blob = pdf.output('blob');
      const file = new File([blob], fileName, { type: 'application/pdf' });
      return { blob, file, fileName };
    } catch (domErr) {
      console.warn('DOM capture failed, falling back to direct vector PDF:', domErr);
    }
  }

  // 2. Direct Pure-Vector PDF Generation
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner Background
  doc.setFillColor(28, 25, 23); // Stone 900
  doc.rect(0, 0, pageWidth, 32, 'F');

  // Gold accent line
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(0, 32, pageWidth, 1.5, 'F');

  // Studio Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(brandName.toUpperCase(), margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(214, 211, 209);
  doc.text('OFFICIAL WEDDING PHOTOGRAPHY & CINEMA PROPOSAL', margin, 18);
  doc.text(
    `Tel: ${studioContact.phone || '+91 6238747722'}  |  WhatsApp: +${studioContact.whatsapp || '916238747722'}  |  ${studioContact.destination || 'Kerala, India'}`,
    margin,
    24
  );

  // Quote Meta Top Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.text(`QUOTE NO: #${quoteNo}`, pageWidth - margin, 13, { align: 'right' });

  const dateStr = new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(231, 229, 228);
  doc.text(`Date of Issue: ${dateStr}`, pageWidth - margin, 19, { align: 'right' });
  doc.text(`Status: Confirmed Estimate`, pageWidth - margin, 24, { align: 'right' });

  let curY = 42;

  // Client Information Box
  doc.setFillColor(250, 250, 249);
  doc.roundedRect(margin, curY, contentWidth, 26, 2, 2, 'F');
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(margin, curY, contentWidth, 26, 2, 2, 'D');

  doc.setTextColor(120, 113, 108);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLIENT DETAILS', margin + 4, curY + 6);
  doc.text('WEDDING & EVENT DETAILS', margin + (contentWidth / 2) + 4, curY + 6);

  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(lead.name || 'Valued Client', margin + 4, curY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(68, 64, 60);
  doc.text(`Phone: ${lead.phone || 'N/A'}`, margin + 4, curY + 17);
  if (lead.email) doc.text(`Email: ${lead.email}`, margin + 4, curY + 22);

  const col2X = margin + (contentWidth / 2) + 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(28, 25, 23);
  doc.text(`Date: ${lead.weddingDate || 'To be decided'}`, col2X, curY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(68, 64, 60);
  doc.text(`Venue: ${lead.venueLocation || lead.place || 'Kerala'}`, col2X, curY + 17);
  const scopeStr =
    lead.side === 'groom' ? 'Groom Side Coverage' : lead.side === 'bride' ? 'Bride Side Coverage' : 'Both Sides (Groom & Bride)';
  doc.text(`Scope: ${scopeStr}`, col2X, curY + 22);

  curY += 32;

  // Ceremonies & Crew Coverage Section
  doc.setFillColor(245, 245, 244);
  doc.rect(margin, curY, contentWidth, 7, 'F');
  doc.setDrawColor(214, 211, 209);
  doc.line(margin, curY + 7, pageWidth - margin, curY + 7);

  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('EVENT CEREMONIES & SHOOT CREW DEPLOYMENT', margin + 3, curY + 5);

  curY += 11;

  const renderCrewItem = (title: string, crewList: string[]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(180, 83, 9);
    doc.text(`• ${title}:`, margin + 3, curY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(41, 37, 36);
    const crewText = crewList.length > 0 ? crewList.join(' | ') : 'Standard Photo & Video Coverage';
    const splitCrew = doc.splitTextToSize(crewText, contentWidth - 45);
    doc.text(splitCrew, margin + 40, curY);
    curY += Math.max(splitCrew.length * 4.5, 5.5);
  };

  let hasEvents = false;

  if (lead.groomEvents) {
    const activeGroom = KERALA_EVENTS.filter((e) => lead.groomEvents?.[e.id]?.enabled);
    if (activeGroom.length > 0) {
      hasEvents = true;
      activeGroom.forEach((evt) => {
        const cfg = lead.groomEvents?.[evt.id];
        const crew: string[] = [];
        if (cfg?.traditionalPhotographers) crew.push(`${cfg.traditionalPhotographers} Traditional Photo`);
        if (cfg?.traditionalVideographers) crew.push(`${cfg.traditionalVideographers} Traditional Video`);
        if (cfg?.candidPhotographers) crew.push(`${cfg.candidPhotographers} Candid Photo`);
        if (cfg?.candidVideographers) crew.push(`${cfg.candidVideographers} Cinematic Video`);
        if (cfg?.drone) crew.push('4K Drone Aerial');
        if (cfg?.youtubeLive) crew.push('YouTube Live');
        renderCrewItem(`Groom ${evt.nameEn}`, crew);
      });
    }
  }

  if (lead.brideEvents) {
    const activeBride = KERALA_EVENTS.filter((e) => lead.brideEvents?.[e.id]?.enabled);
    if (activeBride.length > 0) {
      hasEvents = true;
      activeBride.forEach((evt) => {
        const cfg = lead.brideEvents?.[evt.id];
        const crew: string[] = [];
        if (cfg?.traditionalPhotographers) crew.push(`${cfg.traditionalPhotographers} Traditional Photo`);
        if (cfg?.traditionalVideographers) crew.push(`${cfg.traditionalVideographers} Traditional Video`);
        if (cfg?.candidPhotographers) crew.push(`${cfg.candidPhotographers} Candid Photo`);
        if (cfg?.candidVideographers) crew.push(`${cfg.candidVideographers} Cinematic Video`);
        if (cfg?.drone) crew.push('4K Drone Aerial');
        if (cfg?.youtubeLive) crew.push('YouTube Live');
        renderCrewItem(`Bride ${evt.nameEn}`, crew);
      });
    }
  }

  if (!hasEvents) {
    renderCrewItem('Full Wedding Coverage', ['2 Candid Photographers', '2 Cinematic Videographers', '1 4K Drone Pilot']);
  }

  curY += 4;

  // Deliverables & Keepsakes
  doc.setFillColor(245, 245, 244);
  doc.rect(margin, curY, contentWidth, 7, 'F');
  doc.setDrawColor(214, 211, 209);
  doc.line(margin, curY + 7, pageWidth - margin, curY + 7);

  doc.setTextColor(28, 25, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('DELIVERABLES, ALBUMS & CINEMA EDITS', margin + 3, curY + 5);

  curY += 10;

  const d = lead.deliverables;
  const deliverableItems: string[] = [];
  if (d?.mainAlbumsCount) {
    deliverableItems.push(`${d.mainAlbumsCount} Main Premium Wedding Albums (${d.mainAlbumSheets || 35} Sheets)`);
  } else {
    deliverableItems.push('1 Signature Luxury Photobook Album (35 Premium Sheets)');
  }
  if (d?.videoQuality) {
    deliverableItems.push(d.videoQuality === '4k' ? 'Ultra HD 4K Cinema Delivery' : 'Full HD 1080p Cinema Delivery');
  }
  if (d?.highlightVideo) deliverableItems.push('Cinematic Wedding Highlight Film (3-5 mins)');
  if (d?.fullLengthVideo) deliverableItems.push('Full Length Traditional Wedding Film');
  if (d?.reelsCount) deliverableItems.push(`${d.reelsCount} Fast Delivery Instagram Reels`);
  if (d?.frames_18x12 || d?.frames_15x20) deliverableItems.push('Master Large Wall Portrait Frame');

  deliverableItems.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(41, 37, 36);
    doc.text(`✓  ${item}`, margin + 5, curY);
    curY += 4.5;
  });

  curY += 4;

  // Financial Summary Box
  doc.setFillColor(254, 243, 199); // Amber 100
  doc.roundedRect(margin, curY, contentWidth, 38, 2, 2, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, curY, contentWidth, 38, 2, 2, 'D');

  doc.setTextColor(146, 64, 14); // Amber 800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('FINANCIAL ESTIMATE & PAYMENT SCHEDULE', margin + 4, curY + 6);

  // Financial Breakdown Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(69, 26, 3);

  doc.text('Package Base Subtotal:', margin + 4, curY + 13);
  doc.text(`₹${baseSubtotal.toLocaleString('en-IN')}`, margin + 65, curY + 13);

  doc.text('Applicable GST (18%):', margin + 4, curY + 18);
  doc.text(`₹${taxAmount.toLocaleString('en-IN')}`, margin + 65, curY + 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(180, 83, 9);
  doc.text('TOTAL QUOTATION (All-inclusive):', margin + 4, curY + 26);
  doc.text(`₹${totalAmount.toLocaleString('en-IN')}`, margin + 75, curY + 26);

  // Payment Schedule on right side of amber card
  const payRightX = margin + 105;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('MILESTONE SCHEDULE:', payRightX, curY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`1. Advance to Reserve Date (25%): ₹${advance.toLocaleString('en-IN')}`, payRightX, curY + 17);
  doc.text(`2. On Wedding Shoot Completion (50%): ₹${onShoot.toLocaleString('en-IN')}`, payRightX, curY + 22);
  doc.text(`3. On Album & Final Film Delivery (25%): ₹${delivery.toLocaleString('en-IN')}`, payRightX, curY + 27);

  curY += 44;

  // Terms & Signoff Footer
  doc.setTextColor(120, 113, 108);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('TERMS & NOTES:', margin, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(
    '• Quotation validity: 30 days from date of issue. Dates are subject to availability until advance booking is received.',
    margin,
    curY + 4
  );
  doc.text(
    '• Travel & accommodation outside standard studio coverage area to be provided or billed at actual cost.',
    margin,
    curY + 8
  );

  // Footer line
  doc.setDrawColor(214, 211, 209);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  doc.text(brandName, margin, pageHeight - 7);

  doc.setFont('helvetica', 'normal');
  doc.text(
    `Tel: ${studioContact.phone || '+91 6238747722'}  •  WhatsApp: +${studioContact.whatsapp || '916238747722'}`,
    pageWidth - margin,
    pageHeight - 7,
    { align: 'right' }
  );

  const blob = doc.output('blob');
  const file = new File([blob], fileName, { type: 'application/pdf' });
  return { blob, file, fileName };
}

/**
 * Triggers direct browser download of the PDF blob
 */
export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Checks if the Web Share API supports sharing files
 */
export function canShareFiles(file?: File): boolean {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) {
    return false;
  }
  if (file) {
    try {
      return navigator.canShare({ files: [file] });
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Share PDF file and text message via native OS Share Sheet (WhatsApp, etc.)
 */
export async function shareQuotationPdfWithNativeSheet(
  file: File,
  message: string,
  title: string
): Promise<boolean> {
  if (!canShareFiles(file)) return false;
  try {
    await navigator.share({
      title,
      text: message,
      files: [file],
    });
    return true;
  } catch (err: any) {
    if (err?.name === 'AbortError') return true; // User simply closed the share sheet
    console.warn('Native share error:', err);
    return false;
  }
}
