// @ts-nocheck
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { storage, db } from './firebase';
import { CustomerLead } from '@/types';

/**
 * Uploads a generated PDF Blob directly to Firebase Cloud Storage.
 * Saves the resulting public download URL to the lead's Firestore record.
 * 
 * Returns the public download URL, or null if upload fails.
 */
export async function uploadQuotationPdfToCloud(
  pdfBlob: Blob,
  lead: CustomerLead,
  fileName: string
): Promise<string | null> {
  const quoteNo = lead.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const safeQuoteNo = quoteNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  const safeFileName = (fileName || `${safeQuoteNo}.pdf`).replace(/[^a-zA-Z0-9-_\.]/g, '_');
  const storagePath = `quotations/${safeQuoteNo}/${safeFileName}`;

  try {
    const storageRef = ref(storage, storagePath);
    const metadata = {
      contentType: 'application/pdf',
      customMetadata: {
        quoteNo,
        clientName: lead.name || '',
        clientPhone: lead.phone || '',
        uploadedAt: new Date().toISOString(),
      },
    };

    // Prevent hanging if network/Firebase rules block upload
    const uploadPromise = uploadBytes(storageRef, pdfBlob, metadata);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase upload timeout')), 4000)
    );
    const snapshot = (await Promise.race([uploadPromise, timeoutPromise])) as any;
    const downloadUrl = await getDownloadURL(snapshot.ref);

    // Save pdfUrl to Firestore lead document
    if (lead.id) {
      try {
        const leadDocRef = doc(db, 'leads', lead.id);
        await updateDoc(leadDocRef, {
          pdfUrl: downloadUrl,
          pdfFileName: safeFileName,
          pdfUploadedAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        try {
          const leadDocRef = doc(db, 'leads', lead.id);
          await setDoc(
            leadDocRef,
            {
              pdfUrl: downloadUrl,
              pdfFileName: safeFileName,
              pdfUploadedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (mergeErr) {
          console.warn('Firestore pdfUrl update note:', mergeErr);
        }
      }
    }

    // Sync to local storage leads if running in browser
    if (typeof window !== 'undefined') {
      try {
        const savedRaw = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
        if (savedRaw) {
          const localList: CustomerLead[] = JSON.parse(savedRaw);
          const updated = localList.map((item) => {
            if (item.id === lead.id || (lead.id && item.id === quoteNo)) {
              return { ...item, pdfUrl: downloadUrl, pdfFileName: safeFileName };
            }
            return item;
          });
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(updated));
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(updated));
        }
      } catch (lsErr) {
        console.warn('LocalStorage lead update note:', lsErr);
      }
    }

    return downloadUrl;
  } catch (err: any) {
    console.warn('Firebase Cloud Storage PDF upload error:', err?.message || err);
    return null;
  }
}

/**
 * Generates the online web viewer link for this quotation.
 */
export function getOnlineQuotationUrl(lead: CustomerLead): string {
  const quoteNo = lead.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    return `${origin}/quote/${encodeURIComponent(quoteNo)}`;
  }
  
  return `https://frameluweddings.web.app/quote/${encodeURIComponent(quoteNo)}`;
}
