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

  const brandName = lead.studioBranding?.studioName || 'FRAMELU WEDDING COMPANY';
  const quoteNo = lead.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
      return await generateMasterPdfFromElement(
        docElement,
        brandName,
        quoteNo,
        lead.name,
        studioContact.phone || '+91 6238747722'
      );
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

/**
 * Captures the exact DOM of #printable-quotation-doc and generates
 * the official High-Res multi-page PDF with anti-cut smart slicing.
 */
export async function generateMasterPdfFromElement(
  docElement: HTMLElement,
  brandName: string,
  quoteNo: string,
  customerName: string,
  displayPhone: string
): Promise<GeneratedPdfResult> {
  const { jsPDF } = await import('jspdf');
  const { toPng } = await import('html-to-image');

  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const imgData = await toPng(docElement, {
    pixelRatio: 2.4,
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

  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = imgWidth;
  sourceCanvas.height = imgHeight;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceCtx) throw new Error('Could not get canvas context');
  sourceCtx.drawImage(img, 0, 0);

  const findCleanCutY = (idealY: number, minY: number): number => {
    const scanStart = Math.min(Math.round(idealY), imgHeight - 1);
    const scanEnd = Math.max(Math.round(minY), 0);
    let bestY = scanStart;
    let minDarkPixels = Infinity;

    for (let y = scanStart; y >= scanEnd; y -= 2) {
      const rowData = sourceCtx.getImageData(0, y, imgWidth, 1).data;
      let darkCount = 0;
      for (let x = 0; x < imgWidth; x += 4) {
        const idx = x * 4;
        const r = rowData[idx];
        const g = rowData[idx + 1];
        const b = rowData[idx + 2];
        const a = rowData[idx + 3];
        if (a > 180 && (r < 240 || g < 240 || b < 240)) {
          darkCount++;
        }
      }
      if (darkCount === 0) return y;
      if (darkCount < minDarkPixels) {
        minDarkPixels = darkCount;
        bestY = y;
      }
    }
    return bestY;
  };

  if (totalRenderHeight <= printableHeightPage1) {
    pdf.addImage(imgData, 'PNG', marginX, marginTop, printableWidth, totalRenderHeight, undefined, 'FAST');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 140, 130);
    pdf.setDrawColor(220, 215, 210);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, pdfHeight - marginBottom + 2, pdfWidth - marginX, pdfHeight - marginBottom + 2);
    pdf.text(`Page 1 of 1 • Tel: ${displayPhone}`, marginX, pdfHeight - marginBottom + 7);
    pdf.text(`Official Proposal • Valid for 30 Days`, pdfWidth - marginX, pdfHeight - marginBottom + 7, { align: 'right' });
  } else if (totalRenderHeight <= printableHeightPage1 * 1.15) {
    const fitScale = printableHeightPage1 / totalRenderHeight;
    const scaledWidth = printableWidth * fitScale;
    const scaledHeight = totalRenderHeight * fitScale;
    const offsetX = marginX + (printableWidth - scaledWidth) / 2;
    pdf.addImage(imgData, 'PNG', offsetX, marginTop, scaledWidth, scaledHeight, undefined, 'FAST');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 140, 130);
    pdf.setDrawColor(220, 215, 210);
    pdf.setLineWidth(0.2);
    pdf.line(marginX, pdfHeight - marginBottom + 2, pdfWidth - marginX, pdfHeight - marginBottom + 2);
    pdf.text(`Page 1 of 1 • Tel: ${displayPhone}`, marginX, pdfHeight - marginBottom + 7);
    pdf.text(`Official Proposal • Valid for 30 Days`, pdfWidth - marginX, pdfHeight - marginBottom + 7, { align: 'right' });
  } else {
    const docRect = docElement.getBoundingClientRect();
    const scaleY = imgHeight / (docElement.offsetHeight || 1);

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

      for (const range of avoidRanges) {
        if (range.top < targetCutY - 10 && range.bottom > targetCutY + 10) {
          if (range.top > currentY + maxCanvasPageHeight * 0.3) {
            idealCutY = Math.min(idealCutY, range.top);
          }
        }
      }

      const cleanCutY = findCleanCutY(
        idealCutY,
        currentY + maxCanvasPageHeight * 0.3
      );
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

        if (pageNum > 1) {
          pdf.setFontSize(8);
          pdf.setTextColor(120, 113, 108);
          pdf.text(`${brandName} • Official Proposal (${quoteNo})`, marginX, marginTop + 3);
          pdf.setDrawColor(220, 215, 210);
          pdf.setLineWidth(0.2);
          pdf.line(marginX, marginTop + 5.5, pdfWidth - marginX, marginTop + 5.5);
        }

        pdf.addImage(sliceData, 'PNG', marginX, contentTop, printableWidth, sliceRenderHeight, undefined, 'FAST');

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

  const safeBrand = (brandName || 'Framelu_wedding_Company').replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeQuote = quoteNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeName = (customerName || 'Customer').replace(/[^a-zA-Z0-9-_]/g, '_');
  const fileName = `${safeBrand}_Quotation_${safeQuote}_${safeName}.pdf`;

  const blob = pdf.output('blob');
  const file = new File([blob], fileName, { type: 'application/pdf' });
  return { blob, file, fileName };
}
