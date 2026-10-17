// @ts-nocheck
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  PriceRates,
  StudioContactConfig,
  PromoOffer,
  HighlightBoard,
  CustomPrintItem,
  OtherServicePackage,
  ServiceCategory,
  GalleryProject,
  CustomerLead,
  CouponCode,
  StudioUser,
  PhotoshootConfig,
} from '@/types';

// Deep sanitize object to remove any undefined values before writing to Firestore
export const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj
      .map(sanitizeForFirestore)
      .filter((v) => v !== undefined);
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      const sanitized = sanitizeForFirestore(value);
      if (sanitized !== undefined) {
        clean[key] = sanitized;
      }
    }
  }
  return clean;
};

// ==========================================
// 1. STUDIO CONTACT SETTINGS
// ==========================================
export const subscribeStudioContact = (
  onData: (data: StudioContactConfig) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'studio_contact');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StudioContactConfig;
          onData(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('framlu_wedding_contact', JSON.stringify(data));
            localStorage.setItem('lumina_wedding_contact', JSON.stringify(data));
          }
        }
      },
      (err) => {
        console.warn('Firestore studio contact subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeStudioContact failed:', err);
    return () => {};
  }
};

export const saveStudioContactToCloud = async (data: StudioContactConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_contact', JSON.stringify(data));
    localStorage.setItem('lumina_wedding_contact', JSON.stringify(data));
  }
  try {
    const docRef = doc(db, 'settings', 'studio_contact');
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save studio contact to Firestore:', err);
    return false;
  }
};

// ==========================================
// 2. PRICE RATES
// ==========================================
export const subscribePriceRates = (onData: (data: PriceRates) => void) => {
  try {
    const docRef = doc(db, 'settings', 'price_rates');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as PriceRates;
          onData(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('framlu_wedding_rates', JSON.stringify(data));
            localStorage.setItem('lumina_wedding_rates', JSON.stringify(data));
          }
        }
      },
      (err) => {
        console.warn('Firestore price rates subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribePriceRates failed:', err);
    return () => {};
  }
};

export const savePriceRatesToCloud = async (data: PriceRates) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_rates', JSON.stringify(data));
    localStorage.setItem('lumina_wedding_rates', JSON.stringify(data));
  }
  try {
    const docRef = doc(db, 'settings', 'price_rates');
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save rates to Firestore:', err);
    return false;
  }
};

// ==========================================
// 3. CUSTOM PRINTS
// ==========================================
export const subscribeCustomPrints = (
  onData: (items: CustomPrintItem[]) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'custom_prints');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            onData(data.items);
            if (typeof window !== 'undefined') {
              localStorage.setItem(
                'framlu_wedding_custom_prints',
                JSON.stringify(data.items)
              );
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore custom prints subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeCustomPrints failed:', err);
    return () => {};
  }
};

export const saveCustomPrintsToCloud = async (items: CustomPrintItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      'framlu_wedding_custom_prints',
      JSON.stringify(items)
    );
  }
  try {
    const docRef = doc(db, 'settings', 'custom_prints');
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to save custom prints to Firestore:', err);
    return false;
  }
};

// ==========================================
// 4. OFFERS
// ==========================================
export const subscribePromoOffers = (onData: (items: PromoOffer[]) => void) => {
  try {
    const docRef = doc(db, 'settings', 'promo_offers');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            onData(data.items);
            if (typeof window !== 'undefined') {
              localStorage.setItem('framlu_wedding_offers', JSON.stringify(data.items));
              localStorage.setItem('lumina_wedding_offers', JSON.stringify(data.items));
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore offers subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribePromoOffers failed:', err);
    return () => {};
  }
};

export const savePromoOffersToCloud = async (items: PromoOffer[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_offers', JSON.stringify(items));
    localStorage.setItem('lumina_wedding_offers', JSON.stringify(items));
  }
  try {
    const docRef = doc(db, 'settings', 'promo_offers');
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to save promo offers to Firestore:', err);
    return false;
  }
};

// ==========================================
// 5. HIGHLIGHT BOARDS / POPULAR PLANS
// ==========================================
export const subscribeHighlightBoards = (
  onData: (items: HighlightBoard[]) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'highlight_boards');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            onData(data.items);
            if (typeof window !== 'undefined') {
              localStorage.setItem('framlu_wedding_boards', JSON.stringify(data.items));
              localStorage.setItem('lumina_wedding_boards', JSON.stringify(data.items));
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore boards subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeHighlightBoards failed:', err);
    return () => {};
  }
};

export const saveHighlightBoardsToCloud = async (items: HighlightBoard[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_boards', JSON.stringify(items));
    localStorage.setItem('lumina_wedding_boards', JSON.stringify(items));
  }
  try {
    const docRef = doc(db, 'settings', 'highlight_boards');
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to save highlight boards to Firestore:', err);
    return false;
  }
};

// ==========================================
// 6. OTHER SERVICES (FOOD/CATERING, DECOR, MAKEUP, CARS, ETC.)
// ==========================================
export const subscribeOtherServices = (
  onData: (items: OtherServicePackage[]) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'other_services');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            onData(data.items);
            if (typeof window !== 'undefined') {
              localStorage.setItem('framlu_other_services', JSON.stringify(data.items));
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore other services subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeOtherServices failed:', err);
    return () => {};
  }
};

export const saveOtherServicesToCloud = async (items: OtherServicePackage[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_other_services', JSON.stringify(items));
    localStorage.setItem('framlu_wedding_other_services', JSON.stringify(items));
  }
  try {
    const docRef = doc(db, 'settings', 'other_services');
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to save other services to Firestore:', err);
    return false;
  }
};

// ==========================================
// 6B. SERVICE CATEGORIES
// ==========================================
export const subscribeServiceCategories = (
  onData: (items: ServiceCategory[]) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'service_categories');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            onData(data.items);
            if (typeof window !== 'undefined') {
              localStorage.setItem('framlu_service_categories', JSON.stringify(data.items));
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore service categories subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeServiceCategories failed:', err);
    return () => {};
  }
};

export const saveServiceCategoriesToCloud = async (items: ServiceCategory[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_service_categories', JSON.stringify(items));
  }
  try {
    const docRef = doc(db, 'settings', 'service_categories');
    await setDoc(docRef, { items, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to save service categories to Firestore:', err);
    return false;
  }
};

// ==========================================
// 6C. GALLERY SHOWCASE PROJECTS
// ==========================================
export const subscribeGalleryProjects = (
  onData: (projects: GalleryProject[]) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'gallery_projects');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.projects)) {
            onData(data.projects);
            if (typeof window !== 'undefined') {
              localStorage.setItem('framlu_gallery_projects', JSON.stringify(data.projects));
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore gallery projects subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeGalleryProjects failed:', err);
    return () => {};
  }
};

export const saveGalleryProjectsToCloud = async (projects: GalleryProject[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_gallery_projects', JSON.stringify(projects));
  }
  try {
    const docRef = doc(db, 'settings', 'gallery_projects');
    await setDoc(docRef, { projects, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to save gallery projects to Firestore:', err);
    return false;
  }
};

// ==========================================
// 7. CUSTOMER LEADS & CRM
// ==========================================
export const subscribeCustomerLeads = (
  onData: (leads: CustomerLead[]) => void
) => {
  try {
    const colRef = collection(db, 'leads');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const cloudLeads: CustomerLead[] = [];
        snapshot.forEach((d) => {
          cloudLeads.push({ id: d.id, ...(d.data() as any) });
        });

        // Merge with local storage leads so offline/local items are never lost if cloud is empty
        let mergedLeads = [...cloudLeads];
        if (typeof window !== 'undefined') {
          try {
            const savedRaw = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
            if (savedRaw) {
              const localList: CustomerLead[] = JSON.parse(savedRaw);
              localList.forEach((localLead) => {
                if (localLead.id && !mergedLeads.some((m) => m.id === localLead.id)) {
                  mergedLeads.push(localLead);
                  // Background sync to cloud
                  const docRef = doc(db, 'leads', localLead.id);
                  setDoc(docRef, sanitizeForFirestore(localLead), { merge: true }).catch(() => {});
                }
              });
            }
          } catch (e) {}
        }

        // Sort newest first
        mergedLeads.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        onData(mergedLeads);
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(mergedLeads));
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(mergedLeads));
        }
      },
      (err) => {
        console.warn('Firestore leads subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeCustomerLeads failed:', err);
    return () => {};
  }
};

export const saveLeadToCloud = async (lead: CustomerLead) => {
  const leadId = lead.id || `FWC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const ownerName = lead.ownerName || lead.createdByName || lead.name || '';
  const ownerEmail = lead.ownerEmail || lead.createdByEmail || lead.userEmail || lead.email || '';

  const cleanLead = sanitizeForFirestore({
    ...lead,
    id: leadId,
    name: lead.name || ownerName,
    email: lead.email || ownerEmail,
    ownerName,
    ownerEmail,
    createdByName: lead.createdByName || ownerName,
    createdByEmail: lead.createdByEmail || ownerEmail,
    createdAt: lead.createdAt || new Date().toISOString(),
  });

  // Always update localStorage immediately for instant UI responsiveness
  if (typeof window !== 'undefined') {
    try {
      const savedRaw = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      let currentLeads: CustomerLead[] = savedRaw ? JSON.parse(savedRaw) : [];
      const exists = currentLeads.some((l) => l.id === leadId);
      currentLeads = exists ? currentLeads.map((l) => (l.id === leadId ? cleanLead : l)) : [cleanLead, ...currentLeads];
      localStorage.setItem('framlu_wedding_leads', JSON.stringify(currentLeads));
      localStorage.setItem('lumina_wedding_leads', JSON.stringify(currentLeads));
    } catch (e) {
      console.warn('Local lead caching error:', e);
    }
  }

  try {
    const docRef = doc(db, 'leads', leadId);
    await setDoc(docRef, cleanLead, { merge: true });
    return leadId;
  } catch (err) {
    console.error('Failed to save lead to Firestore:', err);
    return leadId;
  }
};

export const deleteLeadFromCloud = async (leadId: string) => {
  try {
    const docRef = doc(db, 'leads', leadId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Failed to delete lead from Firestore:', err);
    return false;
  }
};

export const bulkDeleteLeadsFromCloud = async (leadIds: string[]) => {
  try {
    const batch = writeBatch(db);
    for (const id of leadIds) {
      batch.delete(doc(db, 'leads', id));
    }
    await batch.commit();
    return true;
  } catch (err) {
    console.error('Failed to bulk delete leads from Firestore:', err);
    return false;
  }
};

// ==========================================
// 10. COUPON CODES
// ==========================================
export const subscribeCoupons = (onData: (data: CouponCode[]) => void) => {
  try {
    const docRef = doc(db, 'settings', 'coupon_codes');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const list = (snapshot.data()?.items || []) as CouponCode[];
          onData(list);
          if (typeof window !== 'undefined') {
            localStorage.setItem('framlu_wedding_coupons', JSON.stringify(list));
          }
        }
      },
      (err) => {
        console.warn('Firestore coupons subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeCoupons failed:', err);
    return () => {};
  }
};

export const saveCouponsToCloud = async (coupons: CouponCode[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_coupons', JSON.stringify(coupons));
  }
  try {
    const docRef = doc(db, 'settings', 'coupon_codes');
    await setDoc(docRef, { items: coupons, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save coupons to Firestore:', err);
    return false;
  }
};

// ==========================================
// 11. STUDIO PARTNER USERS
// ==========================================
export const subscribeStudioPartners = (onData: (data: StudioUser[]) => void) => {
  try {
    const colRef = collection(db, 'studio_partners');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: StudioUser[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as StudioUser);
        });
        onData(list);
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_studio_partners_cache', JSON.stringify(list));
        }
      },
      (err) => {
        console.warn('Firestore studio partners subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeStudioPartners failed:', err);
    return () => {};
  }
};

export const saveStudioPartnerToCloud = async (partner: StudioUser) => {
  const cleanEmail = (partner.email || '').toLowerCase().trim();
  const partnerId = partner.id || (cleanEmail
    ? `STUDIO-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
    : `STUDIO-${partner.phone.replace(/[^0-9]/g, '')}`);

  const loginCount = (typeof partner.loginCount === 'number' && partner.loginCount > 0)
    ? partner.loginCount
    : 1;

  const cleanPartner = sanitizeForFirestore({
    ...partner,
    id: partnerId,
    email: cleanEmail,
    role: 'studio',
    status: 'active',
    loginCount,
    lastLoginAt: partner.lastLoginAt || new Date().toISOString(),
    registeredAt: partner.registeredAt || new Date().toISOString(),
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('wedding_studio_user', JSON.stringify(cleanPartner));
    localStorage.setItem('framlu_studio_partner', JSON.stringify(cleanPartner));
    if (cleanEmail) localStorage.setItem(`wedding_studio_${cleanEmail}`, JSON.stringify(cleanPartner));
    try {
      const cached = localStorage.getItem('framlu_studio_partners_cache');
      let list: StudioUser[] = cached ? JSON.parse(cached) : [];
      const exists = list.some((s) => s.id === partnerId || (cleanEmail && s.email?.toLowerCase().trim() === cleanEmail));
      list = exists ? list.map((s) => (s.id === partnerId || (cleanEmail && s.email?.toLowerCase().trim() === cleanEmail) ? cleanPartner : s)) : [cleanPartner, ...list];
      localStorage.setItem('framlu_studio_partners_cache', JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const docRef = doc(db, 'studio_partners', partnerId);
    await setDoc(docRef, cleanPartner, { merge: true });
    return cleanPartner;
  } catch (err) {
    console.error('Failed to save studio partner to Firestore:', err);
    return cleanPartner;
  }
};

export const deleteStudioPartnerFromCloud = async (partnerIdOrEmail: string): Promise<boolean> => {
  if (!partnerIdOrEmail) return false;
  const raw = partnerIdOrEmail.trim();
  const clean = raw.toLowerCase();

  const candidateIds = new Set<string>();
  candidateIds.add(raw);
  candidateIds.add(clean);
  if (clean.includes('@')) {
    candidateIds.add(`STUDIO-${clean.replace(/[^a-z0-9]/g, '_')}`);
    candidateIds.add(`STUDIO-${clean}`);
    candidateIds.add(clean.split('@')[0]);
  }
  if (clean.startsWith('studio-')) {
    const after = clean.slice(7);
    candidateIds.add(`STUDIO-${after}`);
    candidateIds.add(`STUDIO-${after.replace(/[^a-z0-9]/g, '_')}`);
  }
  const cleanPhone = raw.replace(/\D/g, '');
  if (cleanPhone) {
    candidateIds.add(`STUDIO-${cleanPhone}`);
    candidateIds.add(`STUDIO-${cleanPhone.slice(-10)}`);
  }

  // Clear local caches
  if (typeof window !== 'undefined') {
    candidateIds.forEach((id) => {
      localStorage.removeItem(`wedding_studio_${id}`);
      localStorage.removeItem(`wedding_studio_${id.toLowerCase()}`);
    });
    localStorage.removeItem('wedding_studio_user');
    localStorage.removeItem('framlu_studio_partner');
    const cachedPartners = localStorage.getItem('framlu_studio_partners_cache');
    if (cachedPartners) {
      try {
        const list = JSON.parse(cachedPartners);
        const filtered = list.filter((p: any) => {
          const pId = p.id || '';
          const pEmail = (p.email || '').toLowerCase().trim();
          const pPhone = (p.phone || '').replace(/\D/g, '');
          if (candidateIds.has(pId) || candidateIds.has(pId.toLowerCase())) return false;
          if (clean.includes('@') && pEmail === clean) return false;
          if (cleanPhone && (pPhone === cleanPhone || pPhone.endsWith(cleanPhone.slice(-10)))) return false;
          return true;
        });
        localStorage.setItem('framlu_studio_partners_cache', JSON.stringify(filtered));
      } catch (e) {}
    }
    const currentSessionRaw = localStorage.getItem('lfb_user_session');
    if (currentSessionRaw) {
      try {
        const sess = JSON.parse(currentSessionRaw);
        if (
          sess.email?.toLowerCase().trim() === clean ||
          candidateIds.has(sess.userId) ||
          sess.phone?.replace(/\D/g, '') === cleanPhone
        ) {
          localStorage.removeItem('lfb_user_session');
        }
      } catch (e) {}
    }
  }

  // Delete matching docs from Firestore
  for (const docId of candidateIds) {
    try {
      const docRef = doc(db, 'studio_partners', docId);
      await deleteDoc(docRef);
    } catch (err) {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('framlu_user_deleted', {
        detail: { id: raw, email: clean, phone: cleanPhone },
      })
    );
  }
  return true;
};

export const getStudioPartnerByEmail = async (email: string): Promise<StudioUser | null> => {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const docId = cleanEmail.startsWith('studio-')
    ? cleanEmail.toUpperCase()
    : `STUDIO-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  // 1. Fast local cache lookup
  if (typeof window !== 'undefined') {
    try {
      const cachedPartners = localStorage.getItem('framlu_studio_partners_cache');
      if (cachedPartners) {
        const list = JSON.parse(cachedPartners);
        const match = list.find((s: any) => s.email?.toLowerCase().trim() === cleanEmail || s.id === docId);
        if (match && match.name && match.status !== 'deleted') return match;
      }
      const cachedSpecific = localStorage.getItem(`wedding_studio_${cleanEmail}`);
      if (cachedSpecific) {
        const parsed = JSON.parse(cachedSpecific);
        if (parsed && parsed.status !== 'deleted') return parsed;
      }
      const singleStudio = localStorage.getItem('framlu_studio_partner') || localStorage.getItem('wedding_studio_user');
      if (singleStudio) {
        const parsed = JSON.parse(singleStudio);
        if (parsed && parsed.email?.toLowerCase().trim() === cleanEmail && parsed.status !== 'deleted') return parsed;
      }
      // Check leads cache for studio branding
      const cachedLeads = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      if (cachedLeads) {
        const lList = JSON.parse(cachedLeads);
        const found = lList.find((l: any) =>
          l.studioBranding &&
          (l.studioBranding.email?.toLowerCase().trim() === cleanEmail ||
           (l.ownerEmail && l.ownerEmail.toLowerCase().trim() === cleanEmail && l.createdByRole === 'studio'))
        );
        if (found && found.studioBranding) {
          return {
            id: docId,
            studioName: found.studioBranding.studioName || found.studioBranding.name || 'Studio Partner',
            ownerName: found.studioBranding.ownerName || found.ownerName || 'Studio Owner',
            phone: found.studioBranding.phone || found.phone || '',
            email: cleanEmail,
            address: found.studioBranding.address || 'Kerala',
            place: found.studioBranding.place || 'Kayamkulam',
            role: 'studio',
            status: 'active',
          };
        }
      }
    } catch (e) {}
  }

  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
    const fetchPromise = getDoc(doc(db, 'studio_partners', docId)).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StudioUser;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`wedding_studio_${cleanEmail}`, JSON.stringify(data));
        }
        return data;
      }
      return null;
    });

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    if (result) return result;
  } catch (err) {
    console.warn('getStudioPartnerByEmail Firestore note:', err);
  }

  return null;
};

// ==========================================
// 12. PHOTOSHOOT CATEGORIES & CONFIGS (Requirement 2)
// ==========================================
export const subscribePhotoshoots = (
  onData: (shoots: PhotoshootConfig[]) => void
) => {
  try {
    const docRef = doc(db, 'settings', 'photoshoot_packages');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.items)) {
            onData(data.items);
            if (typeof window !== 'undefined') {
              localStorage.setItem('framlu_wedding_photoshoots', JSON.stringify(data.items));
            }
          }
        }
      },
      (err) => {
        console.warn('Firestore photoshoots subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribePhotoshoots failed:', err);
    return () => {};
  }
};

export const savePhotoshootsToCloud = async (shoots: PhotoshootConfig[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_photoshoots', JSON.stringify(shoots));
  }
  try {
    const docRef = doc(db, 'settings', 'photoshoot_packages');
    await setDoc(docRef, { items: shoots, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save photoshoot packages to Firestore:', err);
    return false;
  }
};

// ==========================================
// 13. CUSTOMER ACCOUNTS / USERS & AUTH (Requirement 2 & 3)
// ==========================================
export const subscribeCustomerUsers = (onData: (users: CustomerUser[]) => void) => {
  try {
    const colRef = collection(db, 'customer_users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const cloudUsers: CustomerUser[] = [];
        snapshot.forEach((d) => {
          cloudUsers.push({ ...d.data(), id: d.id } as CustomerUser);
        });

        // Merge with local cache so newly logged in user on client is never lost
        let mergedUsers = [...cloudUsers];
        if (typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem('framlu_customer_users_cache');
            if (cached) {
              const localList: CustomerUser[] = JSON.parse(cached);
              localList.forEach((localUser) => {
                const uEmail = (localUser.email || '').toLowerCase().trim();
                const uId = localUser.id;
                if (!mergedUsers.some((m) => (uId && m.id === uId) || (uEmail && m.email?.toLowerCase().trim() === uEmail))) {
                  mergedUsers.push(localUser);
                }
              });
            }
          } catch (e) {}
        }

        onData(mergedUsers);
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_customer_users_cache', JSON.stringify(mergedUsers));
        }
      },
      (err) => {
        console.warn('Firestore customer users subscription note:', err.message);
      }
    );
  } catch (err) {
    console.warn('Firestore subscribeCustomerUsers failed:', err);
    return () => {};
  }
};

export const saveCustomerUserToCloud = async (user: CustomerUser): Promise<CustomerUser> => {
  const cleanEmail = (user.email || '').toLowerCase().trim();
  const cleanPhone = (user.phone || '').replace(/\D/g, '');
  const cleanUsername = (user.username || user.userId || (cleanEmail ? cleanEmail.split('@')[0] : (cleanPhone ? `user_${cleanPhone.slice(-4)}` : 'user'))).toLowerCase().trim();
  const userId = user.id || (cleanEmail
    ? `CUST-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
    : `CUST-${cleanUsername.replace(/[^a-z0-9]/g, '_')}`);

  const loginCount = (typeof user.loginCount === 'number' && user.loginCount > 0)
    ? user.loginCount
    : 1;

  const cleanUser: CustomerUser = sanitizeForFirestore({
    ...user,
    id: userId,
    userId: cleanUsername || user.userId || (cleanEmail ? cleanEmail.split('@')[0] : `user_${cleanPhone.slice(-4)}`),
    email: cleanEmail,
    username: cleanUsername,
    role: 'customer',
    status: 'active',
    loginCount,
    lastLoginAt: user.lastLoginAt || new Date().toISOString(),
    registeredAt: user.registeredAt || new Date().toISOString(),
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_user', JSON.stringify(cleanUser));
    if (cleanEmail) localStorage.setItem(`cust_user_${cleanEmail}`, JSON.stringify(cleanUser));
    if (cleanUsername) localStorage.setItem(`cust_user_${cleanUsername}`, JSON.stringify(cleanUser));
    try {
      const cached = localStorage.getItem('framlu_customer_users_cache');
      let list: CustomerUser[] = cached ? JSON.parse(cached) : [];
      const exists = list.some((u) => u.id === userId || (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail));
      list = exists ? list.map((u) => (u.id === userId || (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail) ? cleanUser : u)) : [cleanUser, ...list];
      localStorage.setItem('framlu_customer_users_cache', JSON.stringify(list));
    } catch (e) {}
  }

  try {
    const docRef = doc(db, 'customer_users', userId);
    await setDoc(docRef, cleanUser, { merge: true });
    return cleanUser;
  } catch (err) {
    console.error('Failed to save customer user to Firestore:', err);
    return cleanUser;
  }
};

export const deleteCustomerUserFromCloud = async (docIdOrEmail: string): Promise<boolean> => {
  if (!docIdOrEmail) return false;
  const raw = docIdOrEmail.trim();
  const clean = raw.toLowerCase();

  const candidateIds = new Set<string>();
  candidateIds.add(raw);
  candidateIds.add(clean);
  if (clean.includes('@')) {
    candidateIds.add(`CUST-${clean.replace(/[^a-z0-9]/g, '_')}`);
    candidateIds.add(`CUST-${clean}`);
    candidateIds.add(clean.split('@')[0]);
  }
  if (clean.startsWith('cust-')) {
    const after = clean.slice(5);
    candidateIds.add(`CUST-${after}`);
    candidateIds.add(`CUST-${after.replace(/[^a-z0-9]/g, '_')}`);
  }
  const cleanPhone = raw.replace(/\D/g, '');
  if (cleanPhone) {
    candidateIds.add(`CUST-${cleanPhone}`);
    candidateIds.add(`CUST-${cleanPhone.slice(-10)}`);
  }

  // Clear local caches
  if (typeof window !== 'undefined') {
    candidateIds.forEach((id) => {
      localStorage.removeItem(`cust_user_${id}`);
      localStorage.removeItem(`cust_user_${id.toLowerCase()}`);
    });
    localStorage.removeItem('framlu_wedding_user');
    localStorage.removeItem('lumina_wedding_user');
    const cachedUsers = localStorage.getItem('framlu_customer_users_cache');
    if (cachedUsers) {
      try {
        const list = JSON.parse(cachedUsers);
        const filtered = list.filter((u: any) => {
          const uId = u.id || '';
          const uEmail = (u.email || '').toLowerCase().trim();
          const uPhone = (u.phone || '').replace(/\D/g, '');
          if (candidateIds.has(uId) || candidateIds.has(uId.toLowerCase())) return false;
          if (clean.includes('@') && uEmail === clean) return false;
          if (cleanPhone && (uPhone === cleanPhone || uPhone.endsWith(cleanPhone.slice(-10)))) return false;
          return true;
        });
        localStorage.setItem('framlu_customer_users_cache', JSON.stringify(filtered));
      } catch (e) {}
    }
    const currentSessionRaw = localStorage.getItem('lfb_user_session');
    if (currentSessionRaw) {
      try {
        const sess = JSON.parse(currentSessionRaw);
        if (
          sess.email?.toLowerCase().trim() === clean ||
          candidateIds.has(sess.userId) ||
          sess.phone?.replace(/\D/g, '') === cleanPhone
        ) {
          localStorage.removeItem('lfb_user_session');
        }
      } catch (e) {}
    }
  }

  // Delete matching docs from Firestore
  for (const docId of candidateIds) {
    try {
      const docRef = doc(db, 'customer_users', docId);
      await deleteDoc(docRef);
    } catch (err) {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('framlu_user_deleted', {
        detail: { id: raw, email: clean, phone: cleanPhone },
      })
    );
  }
  return true;
};

export const bulkDeleteUsersFromCloud = async (
  usersToDelete: Array<{ id: string; role: 'customer' | 'studio'; email?: string; userId?: string; phone?: string }>
): Promise<boolean> => {
  try {
    for (const u of usersToDelete) {
      if (u.role === 'studio') {
        await deleteStudioPartnerFromCloud(u.id);
        if (u.email) await deleteStudioPartnerFromCloud(u.email);
        if (u.phone) await deleteStudioPartnerFromCloud(u.phone);
      } else {
        await deleteCustomerUserFromCloud(u.id);
        if (u.email) await deleteCustomerUserFromCloud(u.email);
        if (u.phone) await deleteCustomerUserFromCloud(u.phone);
      }
    }
    return true;
  } catch (err) {
    console.error('Failed to bulk delete users from Firestore:', err);
    return false;
  }
};

export const getCustomerUserByIdentifier = async (identifier: string): Promise<CustomerUser | null> => {
  if (!identifier) return null;
  const clean = identifier.toLowerCase().trim();
  const cleanDigits = identifier.replace(/\D/g, '');
  const emailDocId = clean.startsWith('cust-')
    ? clean.toUpperCase()
    : `CUST-${clean.replace(/[^a-z0-9]/g, '_')}`;

  // 1. Fast local cache lookup across all cached registered customers
  if (typeof window !== 'undefined') {
    try {
      const cachedUsersRaw = localStorage.getItem('framlu_customer_users_cache');
      if (cachedUsersRaw) {
        const list = JSON.parse(cachedUsersRaw);
        const match = list.find((u: any) =>
          u.id === emailDocId ||
          (u.email && u.email.toLowerCase().trim() === clean) ||
          (cleanDigits.length >= 10 && (u.phone || '').replace(/\D/g, '').slice(-10) === cleanDigits.slice(-10)) ||
          (u.username && u.username.toLowerCase().trim() === clean) ||
          (u.userId && u.userId.toLowerCase().trim() === clean)
        );
        if (match && match.name && match.status !== 'deleted') return match;
      }
      const specific = localStorage.getItem(`cust_user_${clean}`);
      if (specific) {
        const parsed = JSON.parse(specific);
        if (parsed && parsed.status !== 'deleted') return parsed;
      }
      const singleCust = localStorage.getItem('framlu_wedding_user') || localStorage.getItem('lumina_wedding_user');
      if (singleCust) {
        const parsed = JSON.parse(singleCust);
        if (
          parsed &&
          parsed.status !== 'deleted' &&
          (parsed.email?.toLowerCase().trim() === clean ||
            (cleanDigits.length >= 10 && (parsed.phone || '').replace(/\D/g, '').slice(-10) === cleanDigits.slice(-10)) ||
            parsed.username?.toLowerCase().trim() === clean)
        ) {
          return parsed;
        }
      }
      // Check leads cache for customer info
      const cachedLeads = localStorage.getItem('framlu_wedding_leads') || localStorage.getItem('lumina_wedding_leads');
      if (cachedLeads) {
        const lList = JSON.parse(cachedLeads);
        const found = lList.find((l: any) =>
          (l.email && l.email.toLowerCase().trim() === clean) ||
          (l.ownerEmail && l.ownerEmail.toLowerCase().trim() === clean) ||
          (l.createdByEmail && l.createdByEmail.toLowerCase().trim() === clean) ||
          (l.userEmail && l.userEmail.toLowerCase().trim() === clean) ||
          (cleanDigits.length >= 10 && (l.phone || '').replace(/\D/g, '').slice(-10) === cleanDigits.slice(-10))
        );
        if (found && (found.name || found.ownerName)) {
          return {
            id: emailDocId,
            name: found.ownerName || found.name,
            email: clean.includes('@') ? clean : (found.email || ''),
            phone: found.phone || cleanDigits,
            address: found.address || found.venueLocation || 'Kerala',
            place: found.place || 'കായംകുളം',
            registeredAt: found.createdAt || new Date().toISOString(),
            role: 'customer',
            status: 'active',
          };
        }
      }
    } catch (e) {}
  }

  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));

    const fetchDoc = getDoc(doc(db, 'customer_users', emailDocId)).then(async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CustomerUser;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`cust_user_${clean}`, JSON.stringify(data));
        }
        return data;
      }
      return null;
    });

    const result = await Promise.race([fetchDoc, timeoutPromise]);
    if (result) return result;
  } catch (err) {
    console.warn('getCustomerUserByIdentifier error:', err);
  }

  return null;
};

// Record every user login in Firestore & increment login count
export const recordUserLogin = async (
  session: {
    role: 'customer' | 'studio';
    name: string;
    userId: string;
    phone: string;
    email?: string;
    address?: string;
    place?: string;
    studioName?: string;
    authMethod?: string;
  }
) => {
  try {
    const nowIso = new Date().toISOString();
    const cleanEmail = (session.email || '').toLowerCase().trim();
    const cleanPhone = (session.phone || '').replace(/\D/g, '');

    if (session.role === 'studio') {
      const existing = cleanEmail ? await getStudioPartnerByEmail(cleanEmail) : (cleanPhone ? await getStudioPartnerByEmail(cleanPhone) : null);
      const count = (existing?.loginCount || 0) + 1;
      const stId = existing?.id || (cleanEmail ? `STUDIO-${cleanEmail.replace(/[^a-z0-9]/g, '_')}` : `STUDIO-${cleanPhone || 'partner'}`);
      const studioToSave: StudioUser = {
        ...(existing || {}),
        id: stId,
        studioName: session.studioName || existing?.studioName || session.name || 'Studio Partner',
        ownerName: session.name || existing?.ownerName || 'Studio Owner',
        phone: cleanPhone || existing?.phone || '',
        email: cleanEmail || existing?.email || '',
        address: session.address || existing?.address || 'Kerala',
        place: session.place || existing?.place || 'കായംകുളം',
        registeredAt: existing?.registeredAt || nowIso,
        lastLoginAt: nowIso,
        loginCount: count,
        role: 'studio',
        status: 'active',
        authMethod: session.authMethod || existing?.authMethod || (cleanEmail ? 'google' : 'phone'),
      };
      await saveStudioPartnerToCloud(studioToSave);
      return studioToSave;
    } else {
      const existing = cleanEmail ? await getCustomerUserByIdentifier(cleanEmail) : (cleanPhone ? await getCustomerUserByIdentifier(cleanPhone) : null);
      const count = (existing?.loginCount || 0) + 1;
      const custId = existing?.id || (cleanEmail ? `CUST-${cleanEmail.replace(/[^a-z0-9]/g, '_')}` : `CUST-${cleanPhone || session.userId || 'user'}`);
      const custToSave: CustomerUser = {
        ...(existing || {}),
        id: custId,
        name: session.name || existing?.name || 'Customer User',
        phone: cleanPhone || existing?.phone || '',
        email: cleanEmail || existing?.email || '',
        username: session.userId || existing?.username || (cleanEmail ? cleanEmail.split('@')[0] : `user_${cleanPhone.slice(-4)}`),
        address: session.address || existing?.address || 'Kerala',
        place: session.place || existing?.place || 'കായംകുളം',
        registeredAt: existing?.registeredAt || nowIso,
        lastLoginAt: nowIso,
        loginCount: count,
        role: 'customer',
        status: 'active',
        authMethod: session.authMethod || existing?.authMethod || (cleanEmail ? 'google' : 'phone'),
      };
      await saveCustomerUserToCloud(custToSave);
      return custToSave;
    }
  } catch (err) {
    console.warn('recordUserLogin error:', err);
    return null;
  }
};

export const updateCustomerUserPassword = async (
  emailOrUsername: string,
  newPassword: string
): Promise<boolean> => {
  if (!emailOrUsername || !newPassword) return false;
  const clean = emailOrUsername.toLowerCase().trim();
  const existing = await getCustomerUserByIdentifier(clean);
  const targetEmail = existing?.email || (clean.includes('@') ? clean : `${clean}@framelu.com`);
  const docId = `CUST-${targetEmail.toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;

  try {
    const docRef = doc(db, 'customer_users', docId);
    await setDoc(
      docRef,
      {
        password: newPassword,
        lastPasswordResetAt: new Date().toISOString(),
      },
      { merge: true }
    );
    if (typeof window !== 'undefined') {
      const updatedUser = { ...(existing || {}), password: newPassword };
      localStorage.setItem(`cust_user_${targetEmail}`, JSON.stringify(updatedUser));
      localStorage.setItem(`cust_user_${clean}`, JSON.stringify(updatedUser));
      localStorage.setItem('framlu_wedding_user', JSON.stringify(updatedUser));
    }
    return true;
  } catch (err) {
    console.error('Failed to update password in Firestore:', err);
    return false;
  }
};


