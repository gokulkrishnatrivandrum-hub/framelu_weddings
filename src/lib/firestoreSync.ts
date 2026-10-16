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
        const leads: CustomerLead[] = [];
        snapshot.forEach((d) => {
          leads.push({ id: d.id, ...(d.data() as any) });
        });
        // Sort newest first
        leads.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        onData(leads);
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_wedding_leads', JSON.stringify(leads));
          localStorage.setItem('lumina_wedding_leads', JSON.stringify(leads));
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
  const cleanLead = {
    ...lead,
    id: leadId,
    createdAt: lead.createdAt || new Date().toISOString(),
  };

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
  const partnerId = cleanEmail
    ? `STUDIO-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
    : (partner.id || `STUDIO-${partner.phone.replace(/[^0-9]/g, '')}`);

  const cleanPartner = {
    ...partner,
    id: partnerId,
    email: cleanEmail,
    registeredAt: partner.registeredAt || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('wedding_studio_user', JSON.stringify(cleanPartner));
    localStorage.setItem(`wedding_studio_${cleanEmail}`, JSON.stringify(cleanPartner));
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

export const getStudioPartnerByEmail = async (email: string): Promise<StudioUser | null> => {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();
  const docId = `STUDIO-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  // Check localStorage first for instant 0ms speed
  if (typeof window !== 'undefined') {
    const cachedSpecific = localStorage.getItem(`wedding_studio_${cleanEmail}`);
    if (cachedSpecific) {
      try {
        return JSON.parse(cachedSpecific);
      } catch (e) {}
    }
    const cachedPartners = localStorage.getItem('framlu_studio_partners_cache');
    if (cachedPartners) {
      try {
        const list = JSON.parse(cachedPartners);
        const found = list.find((p: any) => p.email?.toLowerCase().trim() === cleanEmail);
        if (found) return found;
      } catch (e) {}
    }
  }

  try {
    // 1200ms timeout so login NEVER freezes or blocks the user
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));
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
    return result;
  } catch (err) {
    console.warn('getStudioPartnerByEmail Firestore note:', err);
    return null;
  }
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
        const list: CustomerUser[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as CustomerUser);
        });
        onData(list);
        if (typeof window !== 'undefined') {
          localStorage.setItem('framlu_customer_users_cache', JSON.stringify(list));
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
  const cleanUsername = (user.username || (cleanEmail ? cleanEmail.split('@')[0] : '')).toLowerCase().trim();
  const userId = cleanEmail
    ? `CUST-${cleanEmail.replace(/[^a-z0-9]/g, '_')}`
    : `CUST-${cleanUsername.replace(/[^a-z0-9]/g, '_')}`;

  const cleanUser: CustomerUser = {
    ...user,
    id: userId,
    userId: cleanUsername || user.userId || cleanEmail.split('@')[0],
    email: cleanEmail,
    username: cleanUsername,
    registeredAt: user.registeredAt || new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('framlu_wedding_user', JSON.stringify(cleanUser));
    if (cleanEmail) localStorage.setItem(`cust_user_${cleanEmail}`, JSON.stringify(cleanUser));
    if (cleanUsername) localStorage.setItem(`cust_user_${cleanUsername}`, JSON.stringify(cleanUser));
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

export const getCustomerUserByIdentifier = async (identifier: string): Promise<CustomerUser | null> => {
  if (!identifier) return null;
  const clean = identifier.toLowerCase().trim();
  const emailDocId = `CUST-${clean.replace(/[^a-z0-9]/g, '_')}`;

  // Check localStorage first for instant 0ms speed
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(`cust_user_${clean}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    const savedUserRaw = localStorage.getItem('framlu_wedding_user');
    if (savedUserRaw) {
      try {
        const u = JSON.parse(savedUserRaw);
        if (
          u.email?.toLowerCase().trim() === clean ||
          u.username?.toLowerCase().trim() === clean ||
          u.userId?.toLowerCase().trim() === clean
        ) {
          return u;
        }
      } catch (e) {}
    }
    const cachedUsers = localStorage.getItem('framlu_customer_users_cache');
    if (cachedUsers) {
      try {
        const list = JSON.parse(cachedUsers);
        const found = list.find((u: any) =>
          u.email?.toLowerCase().trim() === clean ||
          u.username?.toLowerCase().trim() === clean ||
          u.userId?.toLowerCase().trim() === clean ||
          (u.phone && u.phone.replace(/\D/g, '') === clean.replace(/\D/g, ''))
        );
        if (found) return found;
      } catch (e) {}
    }
  }

  try {
    // 1200ms timeout so UI never freezes
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1200));

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

    // Check cached list fallback
    if (typeof window !== 'undefined') {
      const cachedUsers = localStorage.getItem('framlu_customer_users_cache');
      if (cachedUsers) {
        try {
          const list = JSON.parse(cachedUsers);
          const found = list.find((u: any) =>
            u.email?.toLowerCase().trim() === clean ||
            u.username?.toLowerCase().trim() === clean ||
            u.userId?.toLowerCase().trim() === clean
          );
          if (found) return found;
        } catch (e) {}
      }
    }

    return null;
  } catch (err) {
    console.warn('getCustomerUserByIdentifier error:', err);
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


